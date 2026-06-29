import type { ResearchEnvelope } from "./types";
import { withRetry } from "./retry";
import { ResearchCache } from "./cache";
import { ResearchLogger } from "./logger";

const SOURCE = "googleNewsRss";

interface GoogleNewsRssItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  snippet: string;
}

export interface GoogleNewsRssResult {
  items: GoogleNewsRssItem[];
}

async function fetchRssData(companyName: string): Promise<GoogleNewsRssResult | null> {
  const q = encodeURIComponent(companyName.trim());
  const url = `https://news.google.com/rss/search?q=${q}+when:1m&hl=en-US&gl=US&ceid=US:en`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    const xml = await res.text();

    const items: GoogleNewsRssItem[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match;

    while ((match = itemRegex.exec(xml)) !== null) {
      const itemXml = match[1];
      const title = extractTag(itemXml, "title");
      const link = extractTag(itemXml, "link");
      const pubDate = extractTag(itemXml, "pubDate");
      const sourceMatch = /<source[^>]*>([^<]*)<\/source>/i.exec(itemXml);
      const source = sourceMatch ? sourceMatch[1] : "";

      const snippetMatch = /<description[^>]*>([^<]*)<\/description>/i.exec(itemXml);
      let snippet = snippetMatch ? decodeHtml(snippetMatch[1]) : "";
      snippet = snippet.replace(/<[^>]*>/g, "").trim();

      if (title && title !== companyName) {
        items.push({ title, link, pubDate, source, snippet: snippet.slice(0, 500) });
      }
      if (items.length >= 15) break;
    }

    return items.length > 0 ? { items } : null;
  } finally {
    clearTimeout(timer);
  }
}

function extractTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([^\\]]*)\\]\\]><\\/${tag}>|<${tag}[^>]*>([^<]*)<\\/${tag}>`, "i");
  const m = regex.exec(xml);
  return m ? (m[1] || m[2] || "").trim() : "";
}

function decodeHtml(html: string): string {
  return html
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

export async function researchGoogleNewsRss(
  companyName: string,
): Promise<ResearchEnvelope<GoogleNewsRssResult>> {
  const cacheKey = ResearchCache.buildKey(companyName, SOURCE);
  const cached = await ResearchCache.get(cacheKey);
  if (cached) {
    ResearchLogger.cacheHit(SOURCE, companyName);
    return cached as ResearchEnvelope<GoogleNewsRssResult>;
  }

  const { logStart, startTime } = ResearchLogger.start(SOURCE, companyName);

  try {
    const data = await withRetry(() => fetchRssData(companyName), {
      maxAttempts: 2,
      baseDelayMs: 1000,
    });

    const durationMs = Date.now() - startTime;
    const envelope: ResearchEnvelope<GoogleNewsRssResult> = {
      source: SOURCE,
      success: data !== null && data.items.length > 0,
      fetchedAt: new Date().toISOString(),
      cached: false,
      durationMs,
      data,
      error: data === null ? "No news found via RSS" : null,
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
