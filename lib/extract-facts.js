export async function extractFacts(companyResearch, newsArticles) {
  const combinedText = [companyResearch, newsArticles].filter(Boolean).join('\n\n');
  if (!combinedText.trim()) return 'No facts available.';

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      temperature: 0,
      max_tokens: 1024,
      messages: [
        {
          role: 'system',
          content: `You are a precise fact extractor. Your job is to read the provided text and output ONLY a bullet list of concrete, verifiable facts.

RULES:
- Output ONLY the bullet list, no introduction, no summary.
- Each bullet must be a single, short factual phrase (e.g., "Founded in 2009", "Headquarters in San Francisco", "Revenue $5B in 2023").
- Do NOT include opinions, marketing fluff, or long sentences.
- If the text contains a specific number, date, or name, capture it exactly.
- If the text is empty or contains no factual data, output exactly: No facts available.`
        },
        { role: 'user', content: combinedText }
      ]
    })
  });

  if (!res.ok) {
    console.error('Fact extraction error:', await res.text().catch(() => 'Unknown'));
    return 'No facts available.';
  }

  const data = await res.json();
  return data.choices[0].message.content;
}
