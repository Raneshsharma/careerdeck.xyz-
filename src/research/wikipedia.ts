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

function cleanWikipediaSearchQuery(name: string): string {
  return name
    .replace(/\b(gmbh|limited|ltd|inc|co|corp|corporation|private|pvt|plc|sa|ag)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchWikipediaData(companyName: string): Promise<WikipediaResult | null> {
  const cleanName = cleanWikipediaSearchQuery(companyName);
  const queries = [companyName.trim()];
  if (cleanName && cleanName.toLowerCase() !== companyName.toLowerCase()) {
    queries.push(cleanName);
  }
  const firstWord = cleanName.split(" ")[0];
  if (firstWord && firstWord.toLowerCase() !== cleanName.toLowerCase() && firstWord.length > 2) {
    queries.push(firstWord);
  }

  const uniqueQueries = Array.from(new Set(queries.filter(Boolean)));

  for (const q of uniqueQueries) {
    try {
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(q)}&limit=3&format=json&origin=*`;
      const searchRes = await fetchWithTimeout(searchUrl);
      if (!searchRes.ok) continue;
      const searchData = await searchRes.json();
      const titles: string[] = searchData[1];
      if (!titles || titles.length === 0) continue;

      const bestTitle =
        titles.find((t) => t.toLowerCase().includes(q.toLowerCase())) || titles[0];

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
      if (!extractRes.ok) continue;
      const extractData = await extractRes.json();
      const pages = extractData.query?.pages;
      if (!pages) continue;
      const pageEntry = Object.values(pages)[0] as { extract?: string; title?: string; pageid?: number };
      if (!pageEntry?.extract) continue;

      return {
        title: pageEntry.title || bestTitle,
        extract: pageEntry.extract,
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(String(pageEntry.title || bestTitle))}`,
        pageId: pageEntry.pageid ?? 0,
      };
    } catch (err) {
      console.warn(`[wikipedia] Query "${q}" failed:`, err.message);
    }
  }

  return null;
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
