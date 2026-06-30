import type { GoogleFinanceResult, ResearchEnvelope } from "./types";
import { withRetry } from "./retry";
import { ResearchCache } from "./cache";
import { ResearchLogger } from "./logger";

const SOURCE = "google_finance";

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

function resolveGoogleFinanceQuery(symbol: string, yahooExchange: string | null): { ticker: string; exchange: string } {
  const parts = symbol.split(".");
  const ticker = parts[0];
  let exchange = "";

  if (parts.length > 1) {
    const ext = parts[1].toUpperCase();
    if (ext === "NS") exchange = "NSE";
    else if (ext === "BO") exchange = "BSE";
    else if (ext === "L") exchange = "LON";
    else if (ext === "TO") exchange = "TSE";
  }

  if (!exchange && yahooExchange) {
    const ex = yahooExchange.toUpperCase();
    if (ex === "NMS" || ex === "NCM" || ex === "NGM") exchange = "NASDAQ";
    else if (ex === "NYQ" || ex === "ASE") exchange = "NYSE";
    else if (ex === "NSE") exchange = "NSE";
    else if (ex === "BSE") exchange = "BSE";
  }

  if (!exchange) {
    exchange = "NASDAQ";
  }

  return { ticker, exchange };
}

async function fetchGoogleFinanceData(companyName: string): Promise<GoogleFinanceResult | null> {
  const serpApiKey = process.env.SERP_API_KEY;
  if (!serpApiKey) {
    throw new Error("SerpAPI key is not configured");
  }

  // 1. Resolve ticker symbol from Yahoo Finance search first
  let ticker = companyName;
  let exchange = "NASDAQ";

  try {
    const searchRes = await fetchWithTimeout(
      `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(companyName)}&quotesCount=1&newsCount=0`,
      6000,
    );
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      const quote = searchData.quotes?.[0];
      if (quote?.symbol) {
        const resolved = resolveGoogleFinanceQuery(quote.symbol, quote.exchange ?? null);
        ticker = resolved.ticker;
        exchange = resolved.exchange;
      }
    }
  } catch (err) {
    console.warn("[google_finance] Ticker resolution failed, falling back to name:", err);
  }

  // 2. Query SerpAPI Google Finance Engine
  const url = `https://serpapi.com/search.json?engine=google_finance&q=${encodeURIComponent(ticker + ":" + exchange)}&api_key=${serpApiKey}`;
  const res = await fetchWithTimeout(url, 10000);
  if (!res.ok) {
    throw new Error(`SerpAPI Google Finance returned status ${res.status}`);
  }

  const data = await res.json();
  if (data.error) {
    throw new Error(`SerpAPI error: ${data.error}`);
  }

  return {
    summary: data.summary,
    financials: data.financials,
  };
}

export async function researchGoogleFinance(
  companyName: string,
): Promise<ResearchEnvelope<GoogleFinanceResult>> {
  const cacheKey = ResearchCache.buildKey(companyName, SOURCE);
  const cached = await ResearchCache.get(cacheKey);
  if (cached) {
    ResearchLogger.cacheHit(SOURCE, companyName);
    return cached as ResearchEnvelope<GoogleFinanceResult>;
  }

  const { logStart, startTime } = ResearchLogger.start(SOURCE, companyName);

  try {
    const data = await withRetry(() => fetchGoogleFinanceData(companyName), {
      maxAttempts: 3,
      baseDelayMs: 1000,
    });

    const durationMs = Date.now() - startTime;
    const envelope: ResearchEnvelope<GoogleFinanceResult> = {
      source: SOURCE,
      success: data !== null,
      fetchedAt: new Date().toISOString(),
      cached: false,
      durationMs,
      data,
      error: data === null ? "No Google Finance data found" : null,
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
