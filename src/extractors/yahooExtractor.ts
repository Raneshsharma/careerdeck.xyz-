import type { YahooFinanceResult } from "../research/types";
import type { ExtractedFinancials } from "./types";

function parseRawNumber(value: { raw?: number; fmt?: string } | undefined): number | null {
  if (!value) return null;
  if (typeof value.raw === "number" && isFinite(value.raw)) {
    return value.raw;
  }
  if (value.fmt) {
    const parsed = parseFloat(value.fmt.replace(/[$,%£€¥₹]/g, "").replace(/,/g, ""));
    if (!isNaN(parsed) && isFinite(parsed)) return parsed;
  }
  return null;
}

function extractCurrencyCode(fmt: string | undefined): string | null {
  if (!fmt) return null;
  const codeMatch = fmt.match(/[A-Z]{3}/);
  if (codeMatch) return codeMatch[0];
  const symbolMap: Record<string, string> = { "$": "USD", "€": "EUR", "£": "GBP", "¥": "JPY", "₹": "INR" };
  const symbol = fmt.match(/[^\d\s.,BMTbmt%/]/);
  if (symbol && symbolMap[symbol[0]]) return symbolMap[symbol[0]];
  return null;
}

function parseMargin(value: { raw?: number; fmt?: string } | undefined): number | null {
  if (!value) return null;
  if (typeof value.raw === "number" && isFinite(value.raw)) {
    return value.raw;
  }
  if (value.fmt?.includes("%")) {
    const n = parseFloat(value.fmt.replace(/%/, ""));
    if (!isNaN(n)) return n / 100;
  }
  return null;
}

export function extractYahooFacts(result: YahooFinanceResult): ExtractedFinancials {
  const a = result.assetProfile;
  const f = result.financialData;
  const k = result.keyStatistics;

  return {
    revenue: parseRawNumber(f?.totalRevenue),
    revenueCurrency: extractCurrencyCode(f?.totalRevenue?.fmt),
    marketCap: parseRawNumber(k?.marketCap),
    marketCapCurrency: extractCurrencyCode(k?.marketCap?.fmt),
    employees: a?.fullTimeEmployees ?? null,
    sector: a?.sector ?? null,
    industry: a?.industry ?? null,
    ceo: a?.longBusinessSummary
      ? extractCEOFromSummary(a.longBusinessSummary)
      : null,
    country: a?.country ?? null,
    currency: f?.financialCurrency?.toString() ?? null,
    exchange: result.exchange,
    ticker: result.symbol,
    profitMargin: parseMargin(f?.profitMargins),
    operatingMargin: parseMargin(f?.operatingMargins),
    grossMargin: parseMargin(f?.grossMargins),
    beta: k?.beta?.raw ?? null,
    trailingPE: k?.trailingPE?.raw ?? null,
    fiftyTwoWeekHigh: k?.fiftyTwoWeekHigh?.raw ?? null,
    fiftyTwoWeekLow: k?.fiftyTwoWeekLow?.raw ?? null,
    currentPrice: parseRawNumber(f?.currentPrice),
  };
}

function extractCEOFromSummary(summary: string): string | null {
  const patterns = [
    /(?:is\s+(?:led|headed)\s+by\s+(?:CEO\s+)?)([\w\s.]+?)(?:\.|,|\s+and\s+serves)/i,
    /CEO\s+([\w\s.]+?)(?:,|\.|\s+is|\s+has)/i,
    /chief executive officer\s*[.,]*\s*([\w\s.]+?)(?:,|\.|\s+has)/i,
  ];
  for (const p of patterns) {
    const m = summary.match(p);
    if (m?.[1]) return m[1].trim();
  }
  return null;
}
