export async function GET() {
  const results = { ok: true, checks: {} };

  // Only test connectivity — don't leak provider/model names or key presence
  if (process.env.OPENAI_API_KEY) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch("https://api.openai.com/v1/models", {
        headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
        signal: controller.signal,
      });
      clearTimeout(timeout);
      results.checks.llm = res.ok ? "ok" : "error";
    } catch {
      results.checks.llm = "unreachable";
    }
  } else {
    results.checks.llm = "not_configured";
  }

  if (process.env.SERP_API_KEY) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(
        `https://serpapi.com/search?engine=google&q=test&num=1&api_key=${process.env.SERP_API_KEY}`,
        { signal: controller.signal }
      );
      clearTimeout(timeout);
      results.checks.research = res.ok ? "ok" : "error";
    } catch {
      results.checks.research = "unreachable";
    }
  } else {
    results.checks.research = "not_configured";
  }

  return Response.json(results);
}
