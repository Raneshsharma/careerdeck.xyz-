import "server-only";

async function extractFacts(text, systemMessage) {
  if (!text || !text.trim()) return [];

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0,
      max_tokens: 2048,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: text },
      ],
    }),
  });

  if (!res.ok) {
    console.error("Fact extraction API error:", await res.text());
    return [];
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;

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
