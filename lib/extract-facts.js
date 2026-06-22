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
          content: `You are a precise fact extractor. Read the provided text and output a bullet list of every concrete fact you can find. Output ONLY bullets.

RULES:
- Each bullet must be one short phrase (e.g., "Founded in 2009", "Headquarters in San Francisco", "Revenue $5B in 2023").
- Include all numbers, dates, names, and specific claims.
- If the text is empty, output exactly: No facts available.
- Do not write any introduction or summary – just bullets.`
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
