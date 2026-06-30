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

async function fetchGoogleResults(companyName: string, queryOverride?: string[]): Promise<GoogleSearchResult> {
  const apiKey = process.env.GOOGLE_CSE_API_KEY;
  const cx = process.env.GOOGLE_CSE_ID;
  const serpApiKey = process.env.SERP_API_KEY;

  if (!apiKey && !cx && !serpApiKey) {
    throw new Error("Neither Google CSE keys nor SerpAPI key is configured");
  }

  const queries = queryOverride || [
    `${companyName} official website`,
    `${companyName} investor relations`,
    `${companyName} annual report`,
    `${companyName} CEO letter strategic priorities goals`,
    `${companyName} investor presentation priorities strategy`,
    `${companyName} leadership team`,
    `${companyName} mission about us`,
  ];

  const allItems: GoogleSearchResult["items"] = [];
  const seen = new Set<string>();

  for (const q of queries) {
    let url: string;
    let isSerp = false;
    let data = null;
    let success = false;

    if (serpApiKey) {
      try {
        url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(q)}&api_key=${serpApiKey}&num=3`;
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
        console.warn("[google] SerpAPI query failed, trying Google CSE fallback:", err.message);
      }
    }

    if (!success && apiKey && cx) {
      try {
        url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(q)}&num=3`;
        const res = await fetchWithTimeout(url);
        if (res.ok) {
          data = await res.json();
          isSerp = false;
          success = true;
        }
      } catch (err) {
        console.warn("[google] Google CSE fallback failed:", err.message);
      }
    }

    if (!success || !data) continue;

    if (isSerp) {
      const results = data.organic_results ?? [];
      for (const item of results) {
        if (item.link && !seen.has(item.link)) {
          seen.add(item.link);
          allItems.push({
            title: item.title ?? "",
            link: item.link ?? "",
            snippet: item.snippet ?? item.snippet_highlighted ?? "",
          });
        }
      }
    } else {
      for (const item of (data.items ?? [])) {
        if (item.link && !seen.has(item.link)) {
          seen.add(item.link);
          allItems.push({
            title: item.title ?? "",
            link: item.link ?? "",
            snippet: item.snippet ?? "",
          });
        }
      }
    }
  }

  return { items: allItems };
}

export async function researchGoogleCSE(
  companyName: string,
  queryOverride?: string[],
): Promise<ResearchEnvelope<GoogleSearchResult>> {
  const cacheSuffix = queryOverride ? `_custom_${queryOverride.length}` : "";
  const cacheKey = ResearchCache.buildKey(companyName + cacheSuffix, SOURCE);
  const cached = await ResearchCache.get(cacheKey);
  if (cached) {
    ResearchLogger.cacheHit(SOURCE, companyName + cacheSuffix);
    return cached as ResearchEnvelope<GoogleSearchResult>;
  }

  const { logStart, startTime } = ResearchLogger.start(SOURCE, companyName + cacheSuffix);

  try {
    const data = await withRetry(() => fetchGoogleResults(companyName, queryOverride), {
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
