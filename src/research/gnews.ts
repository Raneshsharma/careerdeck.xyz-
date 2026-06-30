import type { GNewsResult, ResearchEnvelope } from "./types";
import { withRetry } from "./retry";
import { ResearchCache } from "./cache";
import { ResearchLogger } from "./logger";

const SOURCE = "gnews";

async function fetchWithTimeout(url: string, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchGNewsData(companyName: string): Promise<GNewsResult | null> {
  const apiKey = process.env.GNEWS_API_KEY;
  const serpApiKey = process.env.SERP_API_KEY;

  if (!apiKey && !serpApiKey) {
    throw new Error("Neither GNEWS_API_KEY nor SERP_API_KEY is configured");
  }

  const q = encodeURIComponent(companyName.trim());
  let url: string;
  let isSerp = false;
  let data = null;
  let success = false;

  if (serpApiKey) {
    try {
      url = `https://serpapi.com/search.json?engine=google_news&q=${q}&api_key=${serpApiKey}`;
      const res = await fetchWithTimeout(url);
      if (res.ok) {
        const json = await res.json();
        if (!json.error) {
          data = json;
          isSerp = true;
          success = true;
        }
      }
    } catch (err) {
      console.warn("[gnews] SerpAPI Google News query failed, trying GNews fallback:", err.message);
    }
  }

  if (!success && apiKey) {
    try {
      url = `https://gnews.io/api/v4/search?q=${q}&lang=en&max=10&token=${apiKey}`;
      const res = await fetchWithTimeout(url);
      if (res.ok) {
        data = await res.json();
        isSerp = false;
        success = true;
      }
    } catch (err) {
      console.warn("[gnews] GNews fallback query failed:", err.message);
    }
  }

  if (!success || !data) {
    throw new Error("News search failed: neither SerpAPI nor GNews queries succeeded");
  }

  if (isSerp) {
    const results = data.news_results ?? [];
    if (results.length === 0) return null;
    return {
      articles: results.map((a: Record<string, unknown>) => ({
        title: String(a.title ?? ""),
        description: String(a.snippet ?? a.title ?? ""),
        url: String(a.link ?? ""),
        publishedAt: String(a.date ?? ""),
        source: {
          name: String((a.source as Record<string, unknown>)?.name ?? ""),
          url: "",
        },
      })),
    };
  } else {
    if (!data.articles || data.articles.length === 0) return null;
    return {
      articles: data.articles.map((a: Record<string, unknown>) => ({
        title: String(a.title ?? ""),
        description: String(a.description ?? ""),
        url: String(a.url ?? ""),
        publishedAt: String(a.publishedAt ?? ""),
        source: {
          name: String(((a.source as Record<string, unknown>)?.name) ?? ""),
          url: String(((a.source as Record<string, unknown>)?.url) ?? ""),
        },
      })),
    };
  }
}

export async function researchGNews(
  companyName: string,
): Promise<ResearchEnvelope<GNewsResult>> {
  const cacheKey = ResearchCache.buildKey(companyName, SOURCE);
  const cached = await ResearchCache.get(cacheKey);
  if (cached) {
    ResearchLogger.cacheHit(SOURCE, companyName);
    return cached as ResearchEnvelope<GNewsResult>;
  }

  const { logStart, startTime } = ResearchLogger.start(SOURCE, companyName);

  try {
    const data = await withRetry(() => fetchGNewsData(companyName), {
      maxAttempts: 3,
      baseDelayMs: 1000,
    });

    const durationMs = Date.now() - startTime;
    const envelope: ResearchEnvelope<GNewsResult> = {
      source: SOURCE,
      success: data !== null,
      fetchedAt: new Date().toISOString(),
      cached: false,
      durationMs,
      data,
      error: data === null ? "No news found" : null,
    };

    ResearchLogger.end(logStart, startTime, data !== null, JSON.stringify(data).length);
    if (data !== null) {
      await ResearchCache.set(cacheKey, envelope, SOURCE);
    }

    return envelope;
  } catch (e) {
    const durationMs = Date.now() - startTime;
    const message = e instanceof Error ? e.message : String(e);
    ResearchLogger.error(SOURCE, companyName, message, durationMs);

    return {
      source: SOURCE,
      success: false,
      fetchedAt: new Date().toISOString(),
      cached: false,
      durationMs,
      data: null,
      error: message,
    };
  }
}
