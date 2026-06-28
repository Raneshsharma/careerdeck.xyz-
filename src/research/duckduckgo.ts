import type { DuckDuckGoResult, ResearchEnvelope } from "./types";
import { withRetry } from "./retry";
import { ResearchCache } from "./cache";
import { ResearchLogger } from "./logger";

const SOURCE = "duckduckgo";

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

interface DDApiResponse {
  AbstractText?: string;
  AbstractURL?: string;
  Heading?: string;
  RelatedTopics?: Array<{ Text?: string; FirstURL?: string }>;
}

async function fetchDuckDuckGoData(companyName: string): Promise<DuckDuckGoResult | null> {
  const q = encodeURIComponent(companyName.trim());
  const url = `https://api.duckduckgo.com/?q=${q}&format=json&no_html=1&skip_disambig=1`;
  const res = await fetchWithTimeout(url);
  const data: DDApiResponse = await res.json();

  const relatedTopics: string[] = [];
  if (Array.isArray(data.RelatedTopics)) {
    for (const topic of data.RelatedTopics) {
      if (topic.Text && !topic.Text.startsWith("Official site")) {
        relatedTopics.push(topic.Text);
      }
      if (relatedTopics.length >= 5) break;
    }
  }

  if (!data.AbstractText?.trim() && relatedTopics.length === 0) return null;

  return {
    abstractText: data.AbstractText ?? "",
    abstractUrl: data.AbstractURL ?? null,
    heading: data.Heading ?? companyName,
    relatedTopics,
  };
}

export async function researchDuckDuckGo(
  companyName: string,
): Promise<ResearchEnvelope<DuckDuckGoResult>> {
  const cacheKey = ResearchCache.buildKey(companyName, SOURCE);
  const cached = await ResearchCache.get(cacheKey);
  if (cached) {
    ResearchLogger.cacheHit(SOURCE, companyName);
    return cached as ResearchEnvelope<DuckDuckGoResult>;
  }

  const { logStart, startTime } = ResearchLogger.start(SOURCE, companyName);

  try {
    const data = await withRetry(() => fetchDuckDuckGoData(companyName), {
      maxAttempts: 3,
      baseDelayMs: 1000,
    });

    const durationMs = Date.now() - startTime;
    const envelope: ResearchEnvelope<DuckDuckGoResult> = {
      source: SOURCE,
      success: data !== null,
      fetchedAt: new Date().toISOString(),
      cached: false,
      durationMs,
      data,
      error: data === null ? "No DuckDuckGo results found" : null,
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
