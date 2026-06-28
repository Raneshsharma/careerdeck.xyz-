import type {
  WebsiteDiscoveryResult,
  WebsitePagesResult,
  WebsitePage,
  ResearchEnvelope,
  GoogleSearchResult,
} from "./types";
import { ResearchCache } from "./cache";
import { ResearchLogger } from "./logger";

const SOURCE_DISCOVERY = "website_discovery";
const SOURCE_PAGES = "website_pages";

async function fetchWithTimeout(url: string, timeoutMs = 5000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "CareerDeck/1.0" },
    });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

const NON_OFFICIAL_DOMAINS = new Set([
  "wikipedia.org",
  "linkedin.com",
  "crunchbase.com",
  "bloomberg.com",
  "reuters.com",
  "glassdoor.com",
  "indeed.com",
  "zoominfo.com",
  "owler.com",
  "pitchbook.com",
  "youtube.com",
  "twitter.com",
  "facebook.com",
  "instagram.com",
]);

function isLikelyOfficial(url: string, companyName: string): boolean {
  const lower = url.toLowerCase();
  const companyLower = companyName.toLowerCase();
  for (const blocked of NON_OFFICIAL_DOMAINS) {
    if (lower.includes(blocked)) return false;
  }
  const hostMatch = lower.match(/https?:\/\/([^/]+)/);
  if (!hostMatch) return false;
  const host = hostMatch[1].replace(/^www\./, "");
  const companySlug = companyLower.replace(/[^a-z0-9-]/g, "");
  if (host.includes(companySlug)) return true;
  const companyWords = companyLower.split(/\s+/);
  const matchesWords = companyWords.filter((w) => host.includes(w));
  if (matchesWords.length >= Math.ceil(companyWords.length / 2)) return true;
  return false;
}

const PATHS_TO_FETCH = [
  { path: "", label: "homepage" },
  { path: "about", label: "about-us" },
  { path: "about-us", label: "about-us" },
  { path: "leadership", label: "leadership" },
  { path: "team", label: "leadership" },
  { path: "investors", label: "investor-relations" },
  { path: "investor-relations", label: "investor-relations" },
  { path: "mission", label: "mission" },
  { path: "vision", label: "vision" },
  { path: "products", label: "products" },
];

export async function discoverCompanyWebsite(
  googleData: GoogleSearchResult["items"],
  companyName: string,
): Promise<ResearchEnvelope<WebsiteDiscoveryResult>> {
  const cacheKey = ResearchCache.buildKey(companyName, SOURCE_DISCOVERY);
  const cached = await ResearchCache.get(cacheKey);
  if (cached) {
    ResearchLogger.cacheHit(SOURCE_DISCOVERY, companyName);
    return cached as ResearchEnvelope<WebsiteDiscoveryResult>;
  }

  const { logStart, startTime } = ResearchLogger.start(SOURCE_DISCOVERY, companyName);

  try {
    const candidates = googleData
      .map((item) => ({
        url: item.link,
        title: item.title,
        official: isLikelyOfficial(item.link, companyName),
      }))
      .filter((c) => c.url);

    const official = candidates.find((c) => c.official);
    const selected = official ?? candidates[0];

    if (!selected) {
      const durationMs = Date.now() - startTime;
      return {
        source: SOURCE_DISCOVERY,
        success: false,
        fetchedAt: new Date().toISOString(),
        cached: false,
        durationMs,
        data: null,
        error: "No website URL found in search results",
      };
    }

    const confidenceScore = official ? 90 : candidates.length > 0 ? 50 : 10;

    const data: WebsiteDiscoveryResult = {
      url: selected.url,
      confidenceScore,
    };

    const durationMs = Date.now() - startTime;
    const envelope: ResearchEnvelope<WebsiteDiscoveryResult> = {
      source: SOURCE_DISCOVERY,
      success: true,
      fetchedAt: new Date().toISOString(),
      cached: false,
      durationMs,
      data,
      error: null,
    };

    ResearchLogger.end(logStart, startTime, true, JSON.stringify(data).length);
    await ResearchCache.set(cacheKey, envelope, SOURCE_DISCOVERY);

    return envelope;
  } catch (e) {
    const durationMs = Date.now() - startTime;
    const message = e instanceof Error ? e.message : String(e);
    ResearchLogger.error(SOURCE_DISCOVERY, companyName, message, durationMs);

    return {
      source: SOURCE_DISCOVERY,
      success: false,
      fetchedAt: new Date().toISOString(),
      cached: false,
      durationMs,
      data: null,
      error: message,
    };
  }
}

export async function fetchCompanyWebsite(
  discoveryResult: WebsiteDiscoveryResult,
  companyName: string,
): Promise<ResearchEnvelope<WebsitePagesResult>> {
  const cacheKey = ResearchCache.buildKey(companyName, SOURCE_PAGES);
  const cached = await ResearchCache.get(cacheKey);
  if (cached) {
    ResearchLogger.cacheHit(SOURCE_PAGES, companyName);
    return cached as ResearchEnvelope<WebsitePagesResult>;
  }

  const { logStart, startTime } = ResearchLogger.start(SOURCE_PAGES, companyName);

  try {
    const baseUrl = discoveryResult.url;
    if (!baseUrl.endsWith("/")) {
      discoveryResult.url += "/";
    }
    const base = discoveryResult.url;

    const pages: WebsitePage[] = [];
    const seen = new Set<string>();

    for (const { path, label } of PATHS_TO_FETCH) {
      if (seen.has(path)) continue;
      seen.add(path);

      try {
        const pageUrl = `${base}${path}`;
        const res = await fetchWithTimeout(pageUrl);
        if (res.ok) {
          const html = await res.text();
          pages.push({ path: path || "/", html, statusCode: res.status });
        }
      } catch {
        // Skip unreachable pages
      }
    }

    if (pages.length === 0) {
      const durationMs = Date.now() - startTime;
      return {
        source: SOURCE_PAGES,
        success: false,
        fetchedAt: new Date().toISOString(),
        cached: false,
        durationMs,
        data: null,
        error: "No website pages could be fetched",
      };
    }

    const combinedSize = pages.reduce((sum, p) => sum + p.html.length, 0);
    const data: WebsitePagesResult = { baseUrl: discoveryResult.url, pages };

    const durationMs = Date.now() - startTime;
    const envelope: ResearchEnvelope<WebsitePagesResult> = {
      source: SOURCE_PAGES,
      success: true,
      fetchedAt: new Date().toISOString(),
      cached: false,
      durationMs,
      data,
      error: null,
    };

    ResearchLogger.end(logStart, startTime, true, combinedSize);
    await ResearchCache.set(cacheKey, envelope, SOURCE_PAGES);

    return envelope;
  } catch (e) {
    const durationMs = Date.now() - startTime;
    const message = e instanceof Error ? e.message : String(e);
    ResearchLogger.error(SOURCE_PAGES, companyName, message, durationMs);

    return {
      source: SOURCE_PAGES,
      success: false,
      fetchedAt: new Date().toISOString(),
      cached: false,
      durationMs,
      data: null,
      error: message,
    };
  }
}
