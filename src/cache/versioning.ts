import type {
  ExtractedCompany,
  ExtractedUrls,
  ExtractedWebsite,
  ExtractedFinancials,
  ExtractedNewsArticle,
  ExtractedDuckDuckGo,
  MergedExtractedFacts,
} from "../extractors/types";
import type { CompanyKnowledgeBase } from "../knowledge/types";
import type {
  ResearchEnvelope,
  WikipediaResult,
  GoogleSearchResult,
  YahooFinanceResult,
  GNewsResult,
  DuckDuckGoResult,
  WebsiteDiscoveryResult,
  WebsitePagesResult,
} from "../research/types";

/**
 * Domain-level version hashes for incremental regeneration.
 * Each domain is versioned independently so only affected sections regenerate.
 */
export interface DomainVersions {
  company: string;
  leadership: string;
  financials: string;
  products: string;
  industry: string;
  culture: string;
  news: string;
  mission: string;
  business: string;
  history: string;
}

const encoder = new TextEncoder();

async function sha256(text: string): Promise<string> {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const hash = await crypto.subtle.digest("SHA-256", encoder.encode(text));
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .slice(0, 16);
  }

  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const chr = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, "0").slice(0, 16);
}

function stableString(obj: unknown): string {
  if (obj === null || obj === undefined) return "null";
  if (typeof obj === "string") return `"${obj}"`;
  if (typeof obj === "number") return String(obj);
  if (typeof obj === "boolean") return String(obj);
  if (Array.isArray(obj)) {
    return `[${obj.map(stableString).join(",")}]`;
  }
  if (typeof obj === "object") {
    const keys = Object.keys(obj).sort();
    return `{${keys.map((k) => `"${k}":${stableString((obj as Record<string, unknown>)[k])}`).join(",")}}`;
  }
  return String(obj);
}

export async function computeDomainVersions(
  extracted: MergedExtractedFacts,
): Promise<DomainVersions> {
  return {
    company: await sha256(
      stableString({
        name: extracted.company.name,
        description: extracted.company.description,
        headquarters: extracted.company.headquarters,
        founded: extracted.company.founded,
        website: extracted.company.website,
      }),
    ),
    leadership: await sha256(
      stableString({
        ceo: extracted.leadership.ceo,
        executives: extracted.leadership.executives,
      }),
    ),
    financials: await sha256(stableString(extracted.financials)),
    products: await sha256(
      stableString({
        items: extracted.products.items,
        brands: extracted.products.brands,
        segments: extracted.products.businessSegments,
      }),
    ),
    industry: await sha256(
      stableString({
        industry: extracted.financials.industry ?? extracted.company.industry,
        sector: extracted.financials.sector,
      }),
    ),
    culture: await sha256(
      stableString({
        mission: extracted.website.metaDescription,
        values: extracted.website.ogTitle,
      }),
    ),
    news: await sha256(
      stableString(
        extracted.news.map((n) => ({
          title: n.title,
          date: n.publishedDate,
          source: n.source,
        })),
      ),
    ),
    mission: await sha256(
      stableString({
        metaDescription: extracted.website.metaDescription,
        ogTitle: extracted.website.ogTitle,
        ogDescription: extracted.website.ogDescription,
      }),
    ),
    business: await sha256(
      stableString({
        segments: extracted.products.businessSegments,
        subsidiaries: extracted.history.subsidiaries,
        parent: extracted.company.parentCompany,
        countries: extracted.financials.country,
      }),
    ),
    history: await sha256(
      stableString({
        founded: extracted.history.founded,
        founders: extracted.history.founders,
      }),
    ),
  };
}

export type { MergedExtractedFacts };
export type { CompanyKnowledgeBase };
export type {
  ExtractedCompany,
  ExtractedUrls,
  ExtractedWebsite,
  ExtractedFinancials,
  ExtractedNewsArticle,
  ExtractedDuckDuckGo,
};
export type {
  ResearchEnvelope,
  WikipediaResult,
  GoogleSearchResult,
  YahooFinanceResult,
  GNewsResult,
  DuckDuckGoResult,
  WebsiteDiscoveryResult,
  WebsitePagesResult,
};
