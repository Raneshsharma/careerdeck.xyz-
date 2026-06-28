import "server-only";

async function extractFacts(text, systemMessage) {
  if (!text || !text.trim()) return [];

  const provider = process.env.LLM_PROVIDER || "openai";
  const isOpenRouter = provider === "openrouter";
  const isGemini = provider === "gemini";

  let endpoint, apiKey, model;

  if (isGemini) {
    model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
    apiKey = process.env.GEMINI_API_KEY;
    endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  } else if (isOpenRouter) {
    endpoint = "https://openrouter.ai/api/v1/chat/completions";
    apiKey = process.env.OPENROUTER_API_KEY;
    model = process.env.OPENROUTER_MODEL || "google/gemini-2.0-flash";
  } else {
    endpoint = "https://api.openai.com/v1/chat/completions";
    apiKey = process.env.OPENAI_API_KEY;
    model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  }

  if (!apiKey) {
    console.error(`Fact extraction: no API key for provider ${provider}`);
    return [];
  }

  let res;
  if (isGemini) {
    res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: systemMessage + "\n\nText:\n" + text }] }],
        generationConfig: { temperature: 0, maxOutputTokens: 2048 },
      }),
    });
  } else {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    };
    if (isOpenRouter) {
      headers["HTTP-Referer"] = process.env.NEXT_PUBLIC_SITE_URL || "https://careerdeck.xyz";
      headers["X-Title"] = "CareerDeck";
    }

    const body = {
      model,
      temperature: 0,
      max_tokens: 2048,
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: text },
      ],
    };
    if (!isOpenRouter || model.includes("gpt")) {
      body.response_format = { type: "json_object" };
    }

    res = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
  }

  if (!res.ok) {
    console.error("Fact extraction API error:", await res.text());
    return [];
  }

  const data = await res.json();
  let content;
  if (isGemini) {
    content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  } else {
    content = data.choices?.[0]?.message?.content;
  }

  if (content) {
    const match = content.match(/\{[\s\S]*\}/);
    if (match) content = match[0];
  }

  try {
    const parsed = JSON.parse(content);
    return parsed?.facts || [];
  } catch (e) {
    console.error("Fact extraction JSON parse error:", content);
    return [];
  }
}

export async function extractCompanyFacts(text) {
  return extractFacts(text,
    `Extract concrete facts from the following text. The text may include raw research data, JSON, or prose. Find all numbers, dates, names, and specific claims. Output ONLY a valid JSON object with this exact structure: { "facts": ["fact1", "fact2", ...] }. If the text is hard to read, do your best to pull out any factual statements. If you absolutely cannot find any facts, return { "facts": [] }.`
  );
}

export async function extractRoleFacts(text) {
  return extractFacts(text,
    `Extract concrete facts about the job role from the following text. Output ONLY a valid JSON object: { "facts": ["fact1", "fact2", ...] }.
    Facts should include: responsibilities, required skills, typical tools, compensation ranges, KPIs, common interview questions, and career progression steps. If the text contains no role-specific data, return { "facts": [] }.`
  );
}

export async function extractJDFacts(text) {
  return extractFacts(text,
    `Extract concrete facts from the following Job Description and research text. Output ONLY a valid JSON object: { "facts": ["fact1", "fact2", ...] }.
    Facts should include: must-have requirements, nice-to-have skills, core responsibilities, reporting structure, key projects mentioned, and any specific company context (revenue, industry, competitors). If absolutely no facts exist, return { "facts": [] }.`
  );
}

export async function extractNewsFacts(text) {
  return extractFacts(text,
    `Extract concrete facts from the following news articles and research text. Output ONLY a valid JSON object: { "facts": ["fact1", "fact2", ...] }.
    Facts should include: headlines, key events, dates, strategic implications, and potential interview angles. If absolutely no facts exist, return { "facts": [] }.`
  );
}
