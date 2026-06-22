export async function extractCompanyFacts(text) {
  if (!text || !text.trim()) return [];

  const systemMessage = `Extract concrete facts from the following text. The text may include raw research data, JSON, or prose. Find all numbers, dates, names, and specific claims. Output ONLY a valid JSON object with this exact structure: { "facts": ["fact1", "fact2", ...] }. If the text is hard to read, do your best to pull out any factual statements. If you absolutely cannot find any facts, return { "facts": [] }.`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      temperature: 0,
      max_tokens: 1024,
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
    return parsed.facts || [];
  } catch (e) {
    console.error("Fact extraction JSON parse error:", content);
    return [];
  }
}
