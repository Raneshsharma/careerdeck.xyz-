import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { buildCompanyPrompt } from "@/lib/prompt-company";
import { buildRolePrompt } from "@/lib/prompt-role";
import { buildJDPrompt } from "@/lib/prompt-jd";
import { buildNewsPrompt } from "@/lib/prompt-news";
import { extractCompanyFacts } from "@/lib/extract-facts-structured";
import {
  fetchCompanyNews,
  researchCompany,
  researchRole,
} from "@/lib/research";
import { tryAcquire, release, cancel } from "@/lib/rate-limiter";
import {
  FREE_MONTHLY_LIMIT,
  getGenerationsThisMonth,
  getProfile,
  recordGeneration,
} from "@/lib/generation-limits";

export const maxDuration = 300;

// ─── Career Intelligence AI System Prompt ───────────────────────────────

const SYSTEM_PROMPT = `You are Career Intelligence AI.

Your purpose is to help MBA students, graduate students, and early-career professionals understand companies, roles, job descriptions, and current business developments in a practical, interview-focused manner.

You do not function as a general chatbot. You function as a career intelligence platform.

CRITICAL: When real data is provided in the prompt (financials, market share, competitor data, salary ranges, industry metrics), you MUST use those exact numbers. Cite them. Do not replace them with generic estimates. Numbers are the difference between sounding informed and sounding generic.

OUTPUT PRINCIPLES:
Every output should answer: Why does this matter? What should the candidate learn? How can this help in interviews? What business insight does this provide?

INTERVIEW INTELLIGENCE:
Whenever possible, generate interview talking points backed by specific numbers, smart questions candidates can ask, likely interview questions, and business insights candidates can discuss.

ANALYSIS DEPTH:
Prioritize Insight, Implication, and Actionability over Raw facts, Long descriptions, and Generic summaries. Always explain "What does this mean?"

FINAL GOAL:
The user should finish reading and be able to explain the company confidently, explain the role confidently, understand the job description, discuss recent company developments, perform better in interviews, and make informed career decisions.`;

// ─── LLM Provider handlers ─────────────────────────────────────────────

async function streamOpenAI(messages, model, apiKey, signal) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages, temperature: 0.3, max_tokens: 16384, stream: true }),
    signal,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${err}`);
  }
  return res.body;
}

async function streamOpenRouter(messages, model, apiKey, signal) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://interview-ready.vercel.app",
      "X-Title": "Interview Ready",
    },
    body: JSON.stringify({ model, messages, temperature: 0.3, max_tokens: 16384, stream: true }),
    signal,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter error ${res.status}: ${err}`);
  }
  return res.body;
}

async function streamAnthropic(messages, model, apiKey, signal) {
  const systemMsg = messages.find((m) => m.role === "system")?.content || "";
  const chatMessages = messages.filter((m) => m.role !== "system");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      system: systemMsg,
      messages: chatMessages.map((m) => ({ role: m.role, content: m.content })),
      temperature: 0.3,
      max_tokens: 16384,
      stream: true,
    }),
    signal,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic error ${res.status}: ${err}`);
  }
  return res.body;
}

// ─── SSE helpers ────────────────────────────────────────────────────────

function createSSEEmitter() {
  const encoder = new TextEncoder();
  let controller;
  const stream = new ReadableStream({ start(c) { controller = c; } });
  function emit(type, data) {
    const payload = `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
    controller.enqueue(encoder.encode(payload));
  }
  function close() { controller.close(); }
  function error(msg) { emit("error", { message: msg }); close(); }
  return { stream, emit, close, error };
}

function startHeartbeat(emitter) {
  let stopped = false;
  const interval = setInterval(() => {
    if (stopped) return;
    try { emitter.emit("heartbeat", {}); } catch { stopped = true; clearInterval(interval); }
  }, 5000);
  setTimeout(() => {
    if (!stopped) {
      try { emitter.emit("heartbeat", {}); } catch { stopped = true; clearInterval(interval); }
    }
  }, 2000);
  return () => { stopped = true; clearInterval(interval); };
}

// ─── Stream processing ──────────────────────────────────────────────────

async function processOpenAIStream(body, emitter) {
  const decoder = new TextDecoder();
  const reader = body.getReader();
  let buffer = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        // Flush remaining buffer before exit
        if (buffer.trim()) {
          const lines = buffer.split("\n");
          for (const line of lines) {
            if (!line.startsWith("data: ") || line.includes("[DONE]")) continue;
            const data = line.slice(6).trim();
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) emitter.emit("chunk", { content });
            } catch { /* skip */ }
          }
        }
        break;
      }
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (data === "[DONE]") { emitter.emit("done", {}); return; }
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) emitter.emit("chunk", { content });
        } catch { /* skip */ }
      }
    }
  } catch (e) { emitter.error(e.message); return; }
  emitter.emit("done", {});
}

async function processAnthropicStream(body, emitter) {
  const decoder = new TextDecoder();
  const reader = body.getReader();
  let buffer = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        if (buffer.trim()) {
          const lines = buffer.split("\n");
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === "content_block_delta") {
                const content = parsed.delta?.text;
                if (content) emitter.emit("chunk", { content });
              }
            } catch { /* skip */ }
          }
        }
        break;
      }
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (data === "[DONE]") { emitter.emit("done", {}); return; }
        try {
          const parsed = JSON.parse(data);
          if (parsed.type === "content_block_delta") {
            const content = parsed.delta?.text;
            if (content) emitter.emit("chunk", { content });
          }
        } catch { /* skip */ }
      }
    }
  } catch (e) { emitter.error(e.message); return; }
  emitter.emit("done", {});
}

// ─── Helper: format research data for prompt injection ──────────────────

function formatResearchSnippets(data) {
  if (!data || !data.data || data.data.length === 0) return "";
  return data.data
    .map((d) => `  - "${d.snippet}" [source: ${d.source}]`)
    .join("\n");
}

function buildResearchInjection(research) {
  if (!research) return "";

  let text = "\nRESEARCH DATA (verified by SerpAPI — use these EXACT numbers, cite them):\n";

  if (research.financials?.data?.length) {
    const top = research.financials.data.slice(0, 2);
    text += "\nFinancial (revenue, profit, growth, market cap):\n";
    text += top.map((d) => `  - ${d.snippet} [${d.source}]`).join("\n") + "\n";
  }

  if (research.competitors?.data?.length) {
    const top = research.competitors.data.slice(0, 2);
    text += "\nCompetitors & Market Share:\n";
    text += top.map((d) => `  - ${d.snippet} [${d.source}]`).join("\n") + "\n";
  }

  if (research.industry?.data?.length) {
    const top = research.industry.data.slice(0, 2);
    text += "\nIndustry (market size, growth rates):\n";
    text += top.map((d) => `  - ${d.snippet} [${d.source}]`).join("\n") + "\n";
  }

  if (research.profile?.data?.length) {
    const top = research.profile.data.slice(0, 2);
    text += "\nCompany Profile (founding, CEO, employees):\n";
    text += top.map((d) => `  - ${d.snippet} [${d.source}]`).join("\n") + "\n";
  }

  return text;
}

function buildSalaryInjection(salaryData) {
  if (!salaryData || !salaryData.data || salaryData.data.length === 0) return "";

  const top = salaryData.data.slice(0, 2);
  let text = "\nSALARY & COMPENSATION DATA (verified — CITE SPECIFIC NUMBERS):\n";
  text += top.map((d) => `  - ${d.snippet} [${d.source}]`).join("\n") + "\n";
  return text;
}

function buildPlainText(research, news) {
  const parts = [];
  if (research?.financials?.data?.length) {
    parts.push(...research.financials.data.map((d) => d.snippet));
  }
  if (research?.competitors?.data?.length) {
    parts.push(...research.competitors.data.map((d) => d.snippet));
  }
  if (research?.industry?.data?.length) {
    parts.push(...research.industry.data.map((d) => d.snippet));
  }
  if (research?.profile?.data?.length) {
    parts.push(...research.profile.data.map((d) => d.snippet));
  }
  if (Array.isArray(news)) {
    parts.push(...news.map((d) => `${d.title}: ${d.snippet}`));
  }
  return parts.join("\n\n");
}

// ─── Route handler ──────────────────────────────────────────────────────

export async function POST(request) {
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  let acquired = false;

  try {
    // ── Auth check ──
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return Response.json({ error: "Sign in required" }, { status: 401 });
    }

    // ── Generation limit check ──
    const isAdmin = session.user.email === "raneshsharma33@gmail.com";
    if (!isAdmin) {
      const profile = await getProfile(session.user.id).catch(() => null);
      const planLimit = profile?.plan_tier === "free" ? FREE_MONTHLY_LIMIT : 9999;
      const usedThisMonth = await getGenerationsThisMonth(session.user.id).catch(() => 0);
      if (usedThisMonth >= planLimit) {
        return Response.json(
          { error: "You've used all generations for this month. Upgrade coming soon." },
          { status: 403 },
        );
      }
    }

    // ── Rate limit check ──
    const limit = tryAcquire(request);
    if (!limit.allowed) {
      return Response.json({ error: limit.reason }, { status: 429 });
    }
    acquired = true;

    const { dossierType, companyName, role, jobDescription } = await request.json();

    const cName = sanitize(companyName || "");
    const rName = sanitize(role || "");
    const jd = sanitize(jobDescription || "");
    const dosType = dossierType || "company";

    // Validation
    switch (dosType) {
      case "company":
        if (!cName) return Response.json({ error: "Company name is required" }, { status: 400 });
        if (cName.length > 100) return Response.json({ error: "Company name must be ≤100 characters" }, { status: 400 });
        break;
      case "role":
        if (!rName) return Response.json({ error: "Role title is required" }, { status: 400 });
        if (rName.length > 100) return Response.json({ error: "Role title must be ≤100 characters" }, { status: 400 });
        break;
      case "jd":
        if (!cName) return Response.json({ error: "Company name is required" }, { status: 400 });
        if (cName.length > 100) return Response.json({ error: "Company name must be ≤100 characters" }, { status: 400 });
        if (!rName) return Response.json({ error: "Role title is required" }, { status: 400 });
        if (rName.length > 100) return Response.json({ error: "Role title must be ≤100 characters" }, { status: 400 });
        if (jd.length < 200) return Response.json({ error: "JD must be at least 200 characters" }, { status: 400 });
        if (jd.length > 10000) return Response.json({ error: "JD must be ≤10,000 characters" }, { status: 400 });
        break;
      case "news":
        if (!cName) return Response.json({ error: "Company name is required" }, { status: 400 });
        if (cName.length > 100) return Response.json({ error: "Company name must be ≤100 characters" }, { status: 400 });
        break;
      default:
        return Response.json({ error: `Unknown dossier type: ${dosType}` }, { status: 400 });
    }

    // Run research in parallel: company research + news + optional salary
    const daysBack = dosType === "news" ? 30 : 180;

    let companyResearch = null;
    let roleResearch = null;
    let newsData = null;

    if (cName && (dosType === "company" || dosType === "jd" || dosType === "news")) {
      const [research, news] = await Promise.all([
        researchCompany(cName).catch(() => null),
        fetchCompanyNews(cName, daysBack).catch(() => null),
      ]);
      companyResearch = research;
      newsData = news;
    } else if (cName && dosType === "role") {
      // Only fetch news for role with company context
      newsData = await fetchCompanyNews(cName, daysBack).catch(() => null);
    }

    if (rName) {
      roleResearch = await researchRole(rName, cName || "").catch(() => null);
    }

    // Build prompt
    const researchInjection = buildResearchInjection(companyResearch);
    const salaryInjection = buildSalaryInjection(roleResearch?.salary);

    let userPrompt;
    switch (dosType) {
      case "company":
        const researchText = buildPlainText(companyResearch, newsData);
        const { facts } = await extractCompanyFacts(researchText);
        const factList = facts.map((f) => `- ${f}`).join("\n");
        console.log("===== EXTRACTED FACTS =====");
        console.log(factList);
        console.log("===========================");
        userPrompt = buildCompanyPrompt(cName, factList, rName, jd);
        console.log("===== USER PROMPT =====");
        console.log(userPrompt);
        console.log("=======================");
        break;
      case "role":
        userPrompt = buildRolePrompt(rName, cName || "", roleResearch, jd, "");
        break;
      case "jd":
        userPrompt = buildJDPrompt(cName, rName, jd, newsData, companyResearch);
        break;
      case "news":
        userPrompt = buildNewsPrompt(cName, rName || "", newsData, companyResearch);
        break;
      default:
        userPrompt = buildCompanyPrompt(cName, newsData, companyResearch);
    }

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ];

    // Provider setup
    const provider = process.env.LLM_PROVIDER || "openai";
    let streamFn, model, apiKey, procFn;

    switch (provider) {
      case "openrouter":
        apiKey = process.env.OPENROUTER_API_KEY;
        model = process.env.OPENROUTER_MODEL || "openai/gpt-4o";
        if (!apiKey) return Response.json({ error: "OPENROUTER_API_KEY not configured" }, { status: 500 });
        streamFn = (s) => streamOpenRouter(messages, model, apiKey, s);
        procFn = processOpenAIStream;
        break;
      case "anthropic":
        apiKey = process.env.ANTHROPIC_API_KEY;
        model = process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022";
        if (!apiKey) return Response.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
        streamFn = (s) => streamAnthropic(messages, model, apiKey, s);
        procFn = processAnthropicStream;
        break;
      case "openai":
      default:
        apiKey = process.env.OPENAI_API_KEY;
        model = process.env.OPENAI_MODEL || "gpt-4o";
        if (!apiKey) return Response.json({ error: "OPENAI_API_KEY not configured" }, { status: 500 });
        streamFn = (s) => streamOpenAI(messages, model, apiKey, s);
        procFn = processOpenAIStream;
        break;
    }

    const emitter = createSSEEmitter();
    const { stream } = emitter;
    const stopHeartbeat = startHeartbeat(emitter);

    // Record generation before streaming to close race window
    const genId = await recordGeneration(session.user.id, dosType, cName, rName);
    if (genId) {
      try { emitter.emit("gen-id", { id: genId }); } catch {}
    }

    const abort = new AbortController();
    streamFn(abort.signal)
      .then((body) => procFn(body, emitter))
      .then(() => {
        try { emitter.close(); } catch {}
        release(request, false);
      })
      .catch((e) => {
        if (e.name !== "AbortError") {
          console.error("LLM stream error:", e.message);
          emitter.emit("error", { message: e.message });
          try { emitter.close(); } catch {}
          release(request, true);
        } else {
          try { emitter.close(); } catch {}
        }
      })
      .finally(() => stopHeartbeat());

    // Emit research status
    const totalSnippets =
      (companyResearch?.financials?.snippetCount || 0) +
      (companyResearch?.competitors?.snippetCount || 0) +
      (companyResearch?.industry?.snippetCount || 0) +
      (companyResearch?.profile?.snippetCount || 0) +
      (newsData?.length || 0);
    if (totalSnippets > 0) {
      try { emitter.emit("news-status", { count: totalSnippets, daysBack }); } catch {}
    }

    request.signal.addEventListener("abort", () => {
      abort.abort();
      cancel(request);
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (e) {
    console.error("Route handler error:", e.message, e.stack);
    if (acquired) release(request, true);
    return Response.json(
      { error: e.message || "Internal server error" },
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// ─── Sanitize user input to prevent prompt injection ────────────────────

function sanitize(str) {
  const trimmed = (str || "").trim();
  // Strip common prompt injection patterns
  return trimmed
    .replace(/ignore (all )?(previous|above|prior) instructions?/gi, "[filtered]")
    .replace(/system:\s*/gi, "[filtered]")
    .replace(/<\|im_start\|>/gi, "[filtered]")
    .replace(/<\|im_end\|>/gi, "[filtered]")
    .slice(0, 10000); // hard cap per field
}
