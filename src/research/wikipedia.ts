import type { WikipediaResult, ResearchEnvelope } from "./types";
import { withRetry } from "./retry";
import { ResearchCache } from "./cache";
import { ResearchLogger } from "./logger";

const SOURCE = "wikipedia";

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

async function fetchWikipediaData(companyName: string): Promise<WikipediaResult | null> {
  const q = encodeURIComponent(companyName.trim());

  const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${q}&limit=3&format=json&origin=*`;
  const searchRes = await fetchWithTimeout(searchUrl);
  const searchData = await searchRes.json();
  const titles: string[] = searchData[1];
  if (!titles || titles.length === 0) return null;

  const bestTitle =
    titles.find((t) => t.toLowerCase().includes(companyName.toLowerCase())) || titles[0];

  const params = new URLSearchParams({
    action: "query",
    prop: "extracts",
    exintro: "1",
    explaintext: "1",
    titles: bestTitle,
    format: "json",
    origin: "*",
  });
  const extractRes = await fetchWithTimeout(
    `https://en.wikipedia.org/w/api.php?${params.toString()}`,
  );
  const extractData = await extractRes.json();
  const pages = extractData.query?.pages;
  if (!pages) return null;
  const pageEntry = Object.values(pages)[0] as { extract?: string; title?: string; pageid?: number };
  if (!pageEntry?.extract) return null;

  return {
    title: pageEntry.title || bestTitle,
    extract: pageEntry.extract,
    url: `https://en.wikipedia.org/wiki/${encodeURIComponent(String(pageEntry.title || bestTitle))}`,
    pageId: pageEntry.pageid ?? 0,
  };
}

export async function researchWikipedia(companyName: string): Promise<ResearchEnvelope<WikipediaResult>> {
  const cacheKey = ResearchCache.buildKey(companyName, SOURCE);
  const cached = await ResearchCache.get(cacheKey);
  if (cached) {
    ResearchLogger.cacheHit(SOURCE, companyName);
    return cached as ResearchEnvelope<WikipediaResult>;
  }

  const { logStart, startTime } = ResearchLogger.start(SOURCE, companyName);

  try {
    const data = await withRetry(() => fetchWikipediaData(companyName), {
      maxAttempts: 3,
      baseDelayMs: 1000,
    });

    const durationMs = Date.now() - startTime;
    const envelope: ResearchEnvelope<WikipediaResult> = {
      source: SOURCE,
      success: data !== null,
      fetchedAt: new Date().toISOString(),
      cached: false,
      durationMs,
      data,
      error: data === null ? "No Wikipedia data found" : null,
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
