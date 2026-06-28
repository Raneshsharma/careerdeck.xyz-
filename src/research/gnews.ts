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
  if (!apiKey) throw new Error("GNEWS_API_KEY not configured");

  const q = encodeURIComponent(companyName.trim());
  const url = `https://gnews.io/api/v4/search?q=${q}&lang=en&max=10&token=${apiKey}`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`GNews returned ${res.status}`);
  const data = await res.json();
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
