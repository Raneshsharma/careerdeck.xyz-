import type { YahooFinanceResult, ResearchEnvelope } from "./types";
import { withRetry } from "./retry";
import { ResearchCache } from "./cache";
import { ResearchLogger } from "./logger";

const SOURCE = "yahoo";

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

async function fetchYahooData(companyName: string): Promise<YahooFinanceResult | null> {
  const q = encodeURIComponent(companyName.trim());
  const searchRes = await fetchWithTimeout(
    `https://query1.finance.yahoo.com/v1/finance/search?q=${q}&quotesCount=1&newsCount=0`,
    8000,
  );
  if (!searchRes.ok) throw new Error(`Yahoo Search returned ${searchRes.status}`);
  const searchData = await searchRes.json();
  const quote = searchData.quotes?.[0];
  const symbol = quote?.symbol;
  if (!symbol) return null;

  const modules = ["assetProfile", "summaryDetail", "defaultKeyStatistics", "financialData"].join(",");
  const summaryRes = await fetchWithTimeout(
    `https://query1.finance.yahoo.com/v11/finance/quoteSummary/${symbol}?modules=${modules}`,
    8000,
  );
  if (!summaryRes.ok) throw new Error(`Yahoo Summary returned ${summaryRes.status}`);
  const summaryData = await summaryRes.json();
  const result = summaryData.quoteSummary?.result?.[0];
  if (!result) return null;

  const profile = result.assetProfile || {};
  return {
    symbol,
    exchange: quote?.exchange ?? null,
    assetProfile: {
      longBusinessSummary: profile.longBusinessSummary,
      sector: profile.sector,
      industry: profile.industry,
      website: profile.website,
      fullTimeEmployees: profile.fullTimeEmployees,
      country: profile.country,
      city: profile.city,
    },
    summaryDetail: buildFmt(raw(result.summaryDetail)),
    keyStatistics: buildFmt(raw(result.defaultKeyStatistics)),
    financialData: buildFmt(raw(result.financialData)),
  };
}

function raw(obj: unknown): Record<string, { fmt?: string; raw?: number }> {
  return (obj ?? {}) as Record<string, { fmt?: string; raw?: number }>;
}

function buildFmt(obj: Record<string, { fmt?: string; raw?: number }>): Record<string, { fmt?: string; raw?: number }> {
  return obj;
}

export async function researchYahoo(
  companyName: string,
): Promise<ResearchEnvelope<YahooFinanceResult>> {
  const cacheKey = ResearchCache.buildKey(companyName, SOURCE);
  const cached = await ResearchCache.get(cacheKey);
  if (cached) {
    ResearchLogger.cacheHit(SOURCE, companyName);
    return cached as ResearchEnvelope<YahooFinanceResult>;
  }

  const { logStart, startTime } = ResearchLogger.start(SOURCE, companyName);

  try {
    const data = await withRetry(() => fetchYahooData(companyName), {
      maxAttempts: 3,
      baseDelayMs: 1000,
    });

    const durationMs = Date.now() - startTime;
    const envelope: ResearchEnvelope<YahooFinanceResult> = {
      source: SOURCE,
      success: data !== null,
      fetchedAt: new Date().toISOString(),
      cached: false,
      durationMs,
      data,
      error: data === null ? "No Yahoo Finance data found" : null,
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
