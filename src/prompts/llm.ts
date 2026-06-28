type LLMProvider = "openai" | "openrouter" | "gemini" | "anthropic";

interface LLMConfig {
  provider: LLMProvider;
  model: string;
  apiKey: string;
  endpoint: string;
  headers: Record<string, string>;
}

function getConfig(): LLMConfig {
  const provider = (process.env.LLM_PROVIDER || "openai") as LLMProvider;

  let model: string;
  let apiKey: string;
  let endpoint: string;
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  switch (provider) {
    case "gemini": {
      apiKey = process.env.GEMINI_API_KEY || "";
      model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
      endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      break;
    }
    case "openrouter": {
      apiKey = process.env.OPENROUTER_API_KEY || "";
      model = process.env.OPENROUTER_MODEL || "openai/gpt-4o";
      endpoint = "https://openrouter.ai/api/v1/chat/completions";
      headers["Authorization"] = `Bearer ${apiKey}`;
      headers["HTTP-Referer"] = process.env.NEXT_PUBLIC_SITE_URL || "https://careerdeck.xyz";
      headers["X-Title"] = "CareerDeck";
      break;
    }
    case "anthropic": {
      apiKey = process.env.ANTHROPIC_API_KEY || "";
      model = process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022";
      endpoint = "https://api.anthropic.com/v1/messages";
      headers["x-api-key"] = apiKey;
      headers["anthropic-version"] = "2023-06-01";
      break;
    }
    case "openai":
    default: {
      apiKey = process.env.OPENAI_API_KEY || "";
      model = process.env.OPENAI_MODEL || "gpt-4o";
      endpoint = "https://api.openai.com/v1/chat/completions";
      headers["Authorization"] = `Bearer ${apiKey}`;
      break;
    }
  }

  if (!apiKey) {
    throw new Error(`No API key configured for provider: ${provider}`);
  }

  return { provider, model, apiKey: apiKey!, endpoint, headers };
}

async function callOpenAIOrRouter(
  endpoint: string,
  headers: Record<string, string>,
  model: string,
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 4096,
    }),
    signal: AbortSignal.timeout(60000),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "Unknown error");
    throw new Error(`LLM error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

async function callAnthropic(
  endpoint: string,
  headers: Record<string, string>,
  model: string,
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
      temperature: 0.3,
      max_tokens: 4096,
    }),
    signal: AbortSignal.timeout(60000),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "Unknown error");
    throw new Error(`Anthropic error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.content?.[0]?.text || "";
}

async function callGemini(
  endpoint: string,
  _headers: Record<string, string>,
  _model: string,
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  const body: Record<string, unknown> = {
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    generationConfig: { temperature: 0.3, maxOutputTokens: 4096 },
  };

  if (systemPrompt) {
    body.systemInstruction = { parts: [{ text: systemPrompt }] };
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(60000),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "Unknown error");
    throw new Error(`Gemini error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

export async function generateSection(
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  const config = getConfig();

  switch (config.provider) {
    case "gemini":
      return callGemini(config.endpoint, config.headers, config.model, systemPrompt, userPrompt);
    case "anthropic":
      return callAnthropic(config.endpoint, config.headers, config.model, systemPrompt, userPrompt);
    case "openrouter":
    case "openai":
    default:
      return callOpenAIOrRouter(config.endpoint, config.headers, config.model, systemPrompt, userPrompt);
  }
}
