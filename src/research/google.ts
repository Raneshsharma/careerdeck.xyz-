import type { GoogleSearchResult, ResearchEnvelope } from "./types";
import { withRetry } from "./retry";
import { ResearchCache } from "./cache";
import { ResearchLogger } from "./logger";

const SOURCE = "google";

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

async function fetchGoogleResults(companyName: string): Promise<GoogleSearchResult> {
  const apiKey = process.env.GOOGLE_CSE_API_KEY;
  const cx = process.env.GOOGLE_CSE_ID;
  if (!apiKey || !cx) throw new Error("Google CSE API key or ID not configured");

  const queries = [
    `${companyName} official website`,
    `${companyName} investor relations`,
    `${companyName} annual report`,
    `${companyName} leadership team`,
    `${companyName} mission about us`,
  ];

  const allItems: GoogleSearchResult["items"] = [];
  const seen = new Set<string>();

  for (const q of queries) {
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(q)}&num=3`;
    const res = await fetchWithTimeout(url);
    if (!res.ok) continue;
    const data = await res.json();
    for (const item of (data.items ?? [])) {
      if (!seen.has(item.link)) {
        seen.add(item.link);
        allItems.push({
          title: item.title ?? "",
          link: item.link ?? "",
          snippet: item.snippet ?? "",
        });
      }
    }
  }

  return { items: allItems };
}

export async function researchGoogleCSE(
  companyName: string,
): Promise<ResearchEnvelope<GoogleSearchResult>> {
  const cacheKey = ResearchCache.buildKey(companyName, SOURCE);
  const cached = await ResearchCache.get(cacheKey);
  if (cached) {
    ResearchLogger.cacheHit(SOURCE, companyName);
    return cached as ResearchEnvelope<GoogleSearchResult>;
  }

  const { logStart, startTime } = ResearchLogger.start(SOURCE, companyName);

  try {
    const data = await withRetry(() => fetchGoogleResults(companyName), {
      maxAttempts: 3,
      baseDelayMs: 1000,
    });

    const durationMs = Date.now() - startTime;
    const envelope: ResearchEnvelope<GoogleSearchResult> = {
      source: SOURCE,
      success: data.items.length > 0,
      fetchedAt: new Date().toISOString(),
      cached: false,
      durationMs,
      data: data.items.length > 0 ? data : null,
      error: data.items.length === 0 ? "No Google search results found" : null,
    };

    ResearchLogger.end(logStart, startTime, data.items.length > 0, JSON.stringify(data).length);
    if (data.items.length > 0) {
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
