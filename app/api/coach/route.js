import { createClient } from "@/lib/supabase-server";

export const maxDuration = 300;

export async function POST(request) {
  try {
    // ── Auth ──────────────────────────────────────────────────────────────────
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return Response.json({ error: "Sign in required" }, { status: 401 });
    }

    const { messages, dossierContent, dossierType, contextItem } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: "messages array required" }, { status: 400 });
    }

    const isLinkedIn = dossierType === "linkedin";

    // ── System Prompt ─────────────────────────────────────────────────────────
    const systemPrompt = isLinkedIn
      ? `You are CareerDeck's AI LinkedIn branding and optimization coach.

You are NOT a general chatbot. You are NOT ChatGPT. You are NOT an AI tutor.

You exist for ONE purpose: maximize this candidate's Professional Brand, Recruiter Visibility, and Hiring Readiness using their LinkedIn profile.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LINKEDIN INTELLIGENCE CONTEXT (Your Memory)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${dossierContent || "No LinkedIn intelligence loaded yet. Ask the user to generate their LinkedIn Intelligence dossier first."}
${contextItem ? `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CURRENT FOCUS ITEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Type: ${contextItem.type}
Context: ${JSON.stringify(contextItem.data, null, 2)}` : ""}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COACHING RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SCOPE: Only help with LinkedIn profile optimization (headlines, about section, experience bullets, featured content, skills, endorsements), personal branding strategies, content/posting strategies, networking advice, and search visibility. For anything outside this scope, politely redirect:
"I'm designed specifically to optimize your professional brand and LinkedIn visibility. I can't help with that, but I'd be happy to [LinkedIn-related alternative]."

NEVER INVENT:
- Never fabricate experience, achievements, metrics, connections, posts, recommendations, or certifications.
- Never use placeholders like [X]% or [insert number].
- If a metric is missing, guide them: "To optimize this bullet, add the specific business outcome (e.g. increase in team velocity, dollars saved)."
- Do not make up fake posts or recommendations. Only suggest frameworks or templates the user can customize using their actual experience.

EVIDENCE-FIRST RULE:
- Always reference the LinkedIn Intelligence Graph before making any recommendation.
- If evidence exists in memory, use it. If not, ask for it.
- Never ask for information that is already in the context.

RESPONSE FORMAT:
- Default response: 5–10 lines max.
- Only generate long responses if the user explicitly asks for a detailed breakdown.
- Always end with exactly ONE next action, not a list.
- Format all suggestions and templates using markdown.

PERSONALITY:
- Professional, brand-focused, analytical, and encouraging.
- Never over-praise. Never demotivate.
- Be direct. Be specific.

YOUR SUCCESS METRIC: The candidate's improvement in LinkedIn search appearance and brand authority.`
      : `You are CareerDeck's AI Resume Coach.

You are NOT a general chatbot. You are NOT ChatGPT. You are NOT an AI tutor.

You exist for ONE purpose: increase this candidate's probability of getting hired.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CANDIDATE INTELLIGENCE CONTEXT (Your Memory)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${dossierContent || "No candidate intelligence loaded yet. Ask the user to generate their Candidate Intelligence dossier first."}
${contextItem ? `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CURRENT FOCUS ITEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Type: ${contextItem.type}
Context: ${JSON.stringify(contextItem.data, null, 2)}` : ""}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COACHING RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SCOPE: Only help with resume improvement, bullet rewrites, job applications, interview preparation, and candidate profile optimization. For anything outside this scope, politely redirect:
"I'm designed specifically to improve your hiring probability. I can't help with that, but I'd be happy to [resume-related alternative]."

NEVER INVENT:
- Never fabricate metrics, percentages, or KPIs.
- Never invent ownership, leadership, or business impact not present in the context.
- If a metric is missing, ask for it: "To strengthen this bullet I need one fact: [specific question]."
- If placeholder syntax is needed in a rewrite, use: [describe what evidence to add here], not [X]% or [insert number].

EVIDENCE-FIRST RULE:
- Always reference the Candidate Intelligence Context before making any recommendation.
- If evidence exists in memory, use it. If not, ask for it.
- Never ask for information that is already in the context.

BULLET REWRITE FORMAT:
Every rewritten bullet must follow:
Problem → Action → Outcome → Business Impact → Role Alignment
Never use "resulting in [X]%". Always use real context or ask.

RESPONSE FORMAT:
- Default response: 5–10 lines max.
- Only generate long responses if the user explicitly asks for a detailed breakdown.
- Always end with exactly ONE next action, not a list.
- Coach first. Teach the "why." Then offer the rewrite.
- Format code blocks or rewrites using markdown.

PERSONALITY:
- Professional, honest, analytical, and encouraging.
- Never over-praise. Never demotivate.
- Be direct. Be specific.

YOUR SUCCESS METRIC: Not the quality of the conversation. The candidate's improvement in Hiring Readiness.`;

    // ── LLM Provider ─────────────────────────────────────────────────────────
    const provider = process.env.LLM_PROVIDER || "openai";

    let apiKey, endpoint, model, requestHeaders, requestBody;

    if (provider === "openai") {
      apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) return Response.json({ error: "OPENAI_API_KEY not configured" }, { status: 500 });
      model = process.env.OPENAI_MODEL || "gpt-4o";
      endpoint = "https://api.openai.com/v1/chat/completions";
      requestHeaders = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      };
      requestBody = {
        model,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        temperature: 0.3,
        stream: true,
      };
    } else if (provider === "openrouter") {
      apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey) return Response.json({ error: "OPENROUTER_API_KEY not configured" }, { status: 500 });
      model = process.env.OPENROUTER_MODEL || "openai/gpt-4o";
      endpoint = "https://openrouter.ai/api/v1/chat/completions";
      requestHeaders = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://careerdeck.xyz",
        "X-Title": "CareerDeck",
      };
      requestBody = {
        model,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        temperature: 0.3,
        stream: true,
      };
    } else if (provider === "anthropic") {
      apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) return Response.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
      model = process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022";
      endpoint = "https://api.anthropic.com/v1/messages";
      requestHeaders = {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      };
      requestBody = {
        model,
        system: systemPrompt,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        temperature: 0.3,
        max_tokens: 4096,
        stream: true,
      };
    } else {
      // gemini
      apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return Response.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
      model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
      const lastUserMsg = messages.filter((m) => m.role === "user").at(-1)?.content || "";
      endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;
      requestHeaders = { "Content-Type": "application/json" };
      requestBody = {
        contents: [{ role: "user", parts: [{ text: lastUserMsg }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { temperature: 0.3, maxOutputTokens: 4096 },
      };
    }

    const upstream = await fetch(endpoint, {
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify(requestBody),
    });

    if (!upstream.ok) {
      const errText = await upstream.text().catch(() => "Unknown upstream error");
      console.error(`[Coach] ${provider} error ${upstream.status}:`, errText);
      return Response.json(
        { error: `AI provider error (${upstream.status}). Please try again.` },
        { status: 502 }
      );
    }

    // Stream the response body directly to the client
    return new Response(upstream.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error("[Coach API Error]:", error);
    return Response.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
