import type { ResearchEnvelope } from "./types";
import { withRetry } from "./retry";
import { ResearchCache } from "./cache";
import { ResearchLogger } from "./logger";

const SOURCE = "secEdgar";

export interface SecEdgarFiling {
  formType: string;
  companyName: string;
  cik: string;
  filingDate: string;
  description: string;
  url: string;
}

export interface SecEdgarResult {
  cik: string;
  ticker: string;
  filings: SecEdgarFiling[];
  latest10K?: {
    url: string;
    filingDate: string;
  };
  latest10Q?: {
    url: string;
    filingDate: string;
  };
}

async function findCik(ticker: string): Promise<string | null> {
  const url = `https://efts.sec.gov/LATEST/search-index?q=${encodeURIComponent(ticker)}&dateRange=custom&startdt=2020-01-01&enddt=2030-12-31&limit=1`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    const data = await res.json();
    const cik = data?.hits?.hits?.[0]?._source?.ciks?.[0];
    return cik ? cik.toString().padStart(10, "0") : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchFilings(cik: string): Promise<SecEdgarFiling[]> {
  const url = `https://efts.sec.gov/LATEST/search-index?q=cik:%22${cik}%22&dateRange=custom&startdt=2023-01-01&enddt=2030-12-31&limit=20`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return [];
    const data = await res.json();
    const hits = data?.hits?.hits ?? [];
    return hits.map((h: Record<string, unknown>) => {
      const src = h._source as Record<string, unknown>;
      return {
        formType: String(src.form ?? ""),
        companyName: String(src.company_name ?? ""),
        cik: String(Array.isArray(src.ciks) ? src.ciks[0] : cik),
        filingDate: String(src.file_date ?? ""),
        description: String(src.description ?? "").slice(0, 300),
        url: `https://www.sec.gov${src.url ?? ""}`,
      };
    }).filter((f: SecEdgarFiling) => f.formType && f.formType !== " ");
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

export async function researchSecEdgar(
  companyName: string,
  ticker?: string | null,
): Promise<ResearchEnvelope<SecEdgarResult>> {
  const cacheKey = ResearchCache.buildKey(`${companyName}_${ticker ?? ""}`, SOURCE);
  const cached = await ResearchCache.get(cacheKey);
  if (cached) {
    ResearchLogger.cacheHit(SOURCE, companyName);
    return cached as ResearchEnvelope<SecEdgarResult>;
  }

  const { logStart, startTime } = ResearchLogger.start(SOURCE, companyName);

  try {
    const searchKey = ticker || companyName;
    const cik = await withRetry(() => findCik(searchKey), { maxAttempts: 2, baseDelayMs: 1000 });
    if (!cik) throw new Error("CIK not found");

    const filings = await fetchFilings(cik);

    const form10K = filings.find((f) => f.formType === "10-K");
    const form10Q = filings.find((f) => f.formType === "10-Q");

    const result: SecEdgarResult = {
      cik,
      ticker: ticker || "",
      filings,
      latest10K: form10K ? { url: form10K.url, filingDate: form10K.filingDate } : undefined,
      latest10Q: form10Q ? { url: form10Q.url, filingDate: form10Q.filingDate } : undefined,
    };

    const durationMs = Date.now() - startTime;
    const envelope: ResearchEnvelope<SecEdgarResult> = {
      source: SOURCE,
      success: true,
      fetchedAt: new Date().toISOString(),
      cached: false,
      durationMs,
      data: result,
      error: null,
    };

    ResearchLogger.end(logStart, startTime, true, JSON.stringify(result).length);
    await ResearchCache.set(cacheKey, envelope, SOURCE);

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
