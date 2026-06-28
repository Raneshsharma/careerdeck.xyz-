import type { MergedExtractedFacts } from "../extractors/types";
import type { ProvenancedValue, ProvenancedList } from "./types";
import {
  cleanText,
  cleanTitle,
  normalizeUrl,
  normalizeDate,
  normalizeNumber,
  normalizeCurrency,
  normalizeCountry,
  deduplicateList,
} from "./normalizer";

export const SOURCE_PRIORITY: Record<string, number> = {
  website: 6,
  investor_relations: 5,
  annual_report: 5,
  yahoo: 4,
  wikipedia: 3,
  gnews: 2,
  duckduckgo: 1,
};

const now = new Date().toISOString();

function defaultPv<T>(value: T, sources: string[]): ProvenancedValue<T> {
  return {
    value,
    sources: [...new Set(sources)],
    confidence: 0.5,
    last_verified: now,
  };
}

function defaultPl(value: string[], sources: string[]): ProvenancedList {
  return {
    value,
    sources: [...new Set(sources)],
    confidence: 0.5,
    last_verified: now,
  };
}

interface Candidate<T = string | null> {
  value: T;
  source: string;
}

interface CandidateList {
  items: string[];
  source: string;
}

function resolveSingleValue(
  candidates: Candidate<string | null>[],
): { value: string | null; sources: string[] } {
  const valid = candidates.filter((c) => c.value != null) as Array<{ value: string; source: string }>;

  if (valid.length === 0) return { value: null, sources: [] };

  valid.sort(
    (a, b) =>
      (SOURCE_PRIORITY[b.source] ?? 0) - (SOURCE_PRIORITY[a.source] ?? 0),
  );

  const best = valid[0];
  const allSources = [...new Set(valid.map((c) => c.source))];
  return { value: cleanText(best.value) ?? null, sources: allSources };
}

function resolveNumberValue(
  candidates: Candidate<number | null>[],
): { value: number | null; sources: string[] } {
  const valid = candidates.filter((c) => c.value != null) as Array<{ value: number; source: string }>;

  if (valid.length === 0) return { value: null, sources: [] };

  valid.sort(
    (a, b) =>
      (SOURCE_PRIORITY[b.source] ?? 0) - (SOURCE_PRIORITY[a.source] ?? 0),
  );

  return { value: valid[0].value, sources: [...new Set(valid.map((c) => c.source))] };
}

function resolveList(candidates: CandidateList[]): { value: string[]; sources: string[] } {
  const allItems: string[] = [];
  const allSources: string[] = [];

  candidates.sort(
    (a, b) =>
      (SOURCE_PRIORITY[b.source] ?? 0) - (SOURCE_PRIORITY[a.source] ?? 0),
  );

  for (const c of candidates) {
    if (c.items.length > 0) {
      for (const item of c.items) {
        const cleaned = cleanText(item);
        if (cleaned) allItems.push(cleaned);
      }
      allSources.push(c.source);
    }
  }

  return { value: deduplicateList(allItems), sources: [...new Set(allSources)] };
}

export interface RawResolvedFacts {
  company: {
    name: ProvenancedValue;
    industry: ProvenancedValue;
    description: ProvenancedValue;
  };
  leadership: {
    ceo: ProvenancedValue;
    founders: ProvenancedList;
    executives: ProvenancedList;
  };
  history: {
    founded: ProvenancedValue;
  };
  products: {
    items: ProvenancedList;
    brands: ProvenancedList;
  };
  business: {
    businessSegments: ProvenancedList;
    subsidiaries: ProvenancedList;
    parentCompany: ProvenancedValue;
    countries: ProvenancedList;
  };
  financials: {
    revenue: ProvenancedValue<number | null>;
    revenueCurrency: ProvenancedValue;
    marketCap: ProvenancedValue<number | null>;
    marketCapCurrency: ProvenancedValue;
    employees: ProvenancedValue<number | null>;
    sector: ProvenancedValue;
    industry: ProvenancedValue;
    country: ProvenancedValue;
    currency: ProvenancedValue;
    exchange: ProvenancedValue;
    ticker: ProvenancedValue;
    profitMargin: ProvenancedValue<number | null>;
    operatingMargin: ProvenancedValue<number | null>;
    grossMargin: ProvenancedValue<number | null>;
    beta: ProvenancedValue<number | null>;
    trailingPE: ProvenancedValue<number | null>;
    currentPrice: ProvenancedValue<number | null>;
    fiftyTwoWeekHigh: ProvenancedValue<number | null>;
    fiftyTwoWeekLow: ProvenancedValue<number | null>;
  };
  mission: {
    mission: ProvenancedValue;
    vision: ProvenancedValue;
    values: ProvenancedList;
  };
  website: {
    officialWebsite: ProvenancedValue;
    aboutPage: ProvenancedValue;
    investorRelations: ProvenancedValue;
    annualReport: ProvenancedValue;
    leadership: ProvenancedValue;
    sustainability: ProvenancedValue;
    careers: ProvenancedValue;
    wikipedia: ProvenancedValue;
    yahooFinance: ProvenancedValue;
    metaDescription: ProvenancedValue;
    ogTitle: ProvenancedValue;
    ogDescription: ProvenancedValue;
    ogImage: ProvenancedValue;
  };
}

export function resolveConflicts(facts: MergedExtractedFacts): RawResolvedFacts {
  const c = facts.company;
  const f = facts.financials;
  const h = facts.history;
  const l = facts.leadership;
  const s = facts.website;
  const u = facts.urls;

  // Industry
  const { value: industry, sources: industrySources } = resolveSingleValue([
    { value: f.industry, source: "yahoo" },
    { value: c.industry, source: "wikipedia" },
  ]);

  // CEO
  const { value: ceo, sources: ceoSources } = resolveSingleValue([
    { value: l.ceo, source: "yahoo" },
    { value: l.ceo, source: "wikipedia" },
  ]);

  // Founded
  const { value: founded, sources: foundedSources } = resolveSingleValue([
    { value: normalizeDate(h.founded), source: "wikipedia" },
    { value: normalizeDate(c.founded), source: "wikipedia" },
  ]);

  // Founders
  const founders = resolveList([
    { items: c.founders, source: "wikipedia" },
    { items: h.founders, source: "wikipedia" },
  ]);

  // Products
  const products = resolveList([
    { items: c.products, source: "wikipedia" },
    { items: facts.products.items, source: "wikipedia" },
  ]);

  // Brands
  const brands = resolveList([
    { items: facts.products.brands, source: "website" },
  ]);

  // Business segments
  const businessSegments = resolveList([
    { items: facts.products.businessSegments, source: "website" },
  ]);

  // Subsidiaries
  const subsidiaries = resolveList([
    { items: h.subsidiaries, source: "wikipedia" },
  ]);

  // Countries
  const countriesList: string[] = [];
  if (f.country) countriesList.push(normalizeCountry(f.country) ?? f.country);
  if (c.headquarters) {
    const parts = c.headquarters.split(",").map((p) => p.trim());
    if (parts.length > 0) countriesList.push(parts[parts.length - 1]);
  }
  const countrySources = [f.country ? "yahoo" : "", c.headquarters ? "wikipedia" : ""].filter(Boolean);
  const countries = defaultPl(deduplicateList(countriesList), countrySources);

  // Description
  const { value: descVal, sources: descSources } = resolveSingleValue([
    { value: c.description, source: "wikipedia" },
    { value: s.metaDescription, source: "website" },
    { value: s.ogDescription, source: "website" },
  ]);

  // Financials
  const revenue = resolveNumberValue([
    { value: normalizeNumber(f.revenue), source: "yahoo" },
  ]);

  const marketCap = resolveNumberValue([
    { value: normalizeNumber(f.marketCap), source: "yahoo" },
  ]);

  // URLs
  const websiteSrcs = (val: string | null | undefined, src: string): Candidate<string | null>[] =>
    val ? [{ value: normalizeUrl(val) ?? val, source: src }] : [];

  const officialWebsite = resolveSingleValue([
    ...websiteSrcs(u.officialWebsite, "website"),
    ...websiteSrcs(s.officialUrl, "website"),
    ...websiteSrcs(c.website, "wikipedia"),
  ]);

  const aboutPage = resolveSingleValue(websiteSrcs(u.aboutPage, "website"));
  const investorRelations = resolveSingleValue(websiteSrcs(u.investorRelations, "website"));
  const annualReport = resolveSingleValue(websiteSrcs(u.annualReport, "website"));
  const leadershipUrl = resolveSingleValue(websiteSrcs(u.leadership, "website"));
  const sustainability = resolveSingleValue(websiteSrcs(u.sustainability, "website"));
  const careers = resolveSingleValue(websiteSrcs(u.careers, "website"));
  const wikipediaUrl = resolveSingleValue(websiteSrcs(u.wikipedia, "wikipedia"));
  const yahooUrl = resolveSingleValue(websiteSrcs(u.yahooFinance, "yahoo"));

  // Website metadata
  const metaDescription = resolveSingleValue([
    { value: s.metaDescription, source: "website" },
  ]);
  const ogTitle = resolveSingleValue([{ value: s.ogTitle, source: "website" }]);
  const ogDescription = resolveSingleValue([{ value: s.ogDescription, source: "website" }]);
  const ogImage = resolveSingleValue([{ value: s.ogImage, source: "website" }]);

  // Mission & Vision from website paragraphs
  const pages = s.pages;
  const missionText = findMissionText(pages);
  const visionText = findVisionText(pages);

  const resolvedMission = defaultPv(
    missionText ? cleanText(missionText) : null,
    missionText ? ["website"] : [],
  );
  const resolvedVision = defaultPv(
    visionText ? cleanText(visionText) : null,
    visionText ? ["website"] : [],
  );

  return {
    company: {
      name: defaultPv(cleanTitle(c.name) || "Unknown", ["wikipedia"]),
      industry: defaultPv(industry, industrySources),
      description: defaultPv(descVal || "", descSources),
    },
    leadership: {
      ceo: defaultPv(ceo, ceoSources),
      founders: defaultPl(founders.value, founders.sources),
      executives: defaultPl(l.executives ?? [], ["website"]),
    },
    history: {
      founded: defaultPv(founded, foundedSources),
    },
    products: {
      items: defaultPl(products.value, products.sources),
      brands: defaultPl(brands.value, brands.sources),
    },
    business: {
      businessSegments: defaultPl(businessSegments.value, businessSegments.sources),
      subsidiaries: defaultPl(subsidiaries.value, subsidiaries.sources),
      parentCompany: defaultPv(
        cleanText(c.parentCompany),
        c.parentCompany ? ["wikipedia"] : [],
      ),
      countries: countries.value.length > 0 ? countries : defaultPl([], []),
    },
    financials: {
      revenue: defaultPv(revenue.value, revenue.sources),
      revenueCurrency: defaultPv(
        normalizeCurrency(f.revenueCurrency),
        f.revenueCurrency ? ["yahoo"] : [],
      ),
      marketCap: defaultPv(marketCap.value, marketCap.sources),
      marketCapCurrency: defaultPv(
        normalizeCurrency(f.marketCapCurrency),
        f.marketCapCurrency ? ["yahoo"] : [],
      ),
      employees: defaultPv(f.employees, f.employees ? ["yahoo"] : []),
      sector: defaultPv(cleanText(f.sector), f.sector ? ["yahoo"] : []),
      industry: defaultPv(cleanText(industry), industrySources),
      country: defaultPv(normalizeCountry(f.country), f.country ? ["yahoo"] : []),
      currency: defaultPv(normalizeCurrency(f.currency), f.currency ? ["yahoo"] : []),
      exchange: defaultPv(f.exchange, f.exchange ? ["yahoo"] : []),
      ticker: defaultPv(cleanText(f.ticker), f.ticker ? ["yahoo"] : []),
      profitMargin: defaultPv(f.profitMargin, f.profitMargin != null ? ["yahoo"] : []),
      operatingMargin: defaultPv(f.operatingMargin, f.operatingMargin != null ? ["yahoo"] : []),
      grossMargin: defaultPv(f.grossMargin, f.grossMargin != null ? ["yahoo"] : []),
      beta: defaultPv(f.beta, f.beta != null ? ["yahoo"] : []),
      trailingPE: defaultPv(f.trailingPE, f.trailingPE != null ? ["yahoo"] : []),
      currentPrice: defaultPv(f.currentPrice, f.currentPrice != null ? ["yahoo"] : []),
      fiftyTwoWeekHigh: defaultPv(f.fiftyTwoWeekHigh, f.fiftyTwoWeekHigh != null ? ["yahoo"] : []),
      fiftyTwoWeekLow: defaultPv(f.fiftyTwoWeekLow, f.fiftyTwoWeekLow != null ? ["yahoo"] : []),
    },
    mission: {
      mission: resolvedMission,
      vision: resolvedVision,
      values: defaultPl([], []),
    },
    website: {
      officialWebsite: defaultPv(officialWebsite.value, officialWebsite.sources),
      aboutPage: defaultPv(aboutPage.value, aboutPage.sources),
      investorRelations: defaultPv(investorRelations.value, investorRelations.sources),
      annualReport: defaultPv(annualReport.value, annualReport.sources),
      leadership: defaultPv(leadershipUrl.value, leadershipUrl.sources),
      sustainability: defaultPv(sustainability.value, sustainability.sources),
      careers: defaultPv(careers.value, careers.sources),
      wikipedia: defaultPv(wikipediaUrl.value, wikipediaUrl.sources),
      yahooFinance: defaultPv(yahooUrl.value, yahooUrl.sources),
      metaDescription: defaultPv(metaDescription.value, metaDescription.sources),
      ogTitle: defaultPv(ogTitle.value, ogTitle.sources),
      ogDescription: defaultPv(ogDescription.value, ogDescription.sources),
      ogImage: defaultPv(ogImage.value, ogImage.sources),
    },
  };
}

function findMissionText(
  pages: { homepage?: { paragraphs?: string[] } } | undefined,
): string | null {
  const paragraphs = pages?.homepage?.paragraphs;
  if (!paragraphs) return null;
  for (const p of paragraphs) {
    if (p.length > 20 && /\bmission\b/i.test(p)) return p;
  }
  return null;
}

function findVisionText(
  pages: { homepage?: { paragraphs?: string[] } } | undefined,
): string | null {
  const paragraphs = pages?.homepage?.paragraphs;
  if (!paragraphs) return null;
  for (const p of paragraphs) {
    if (p.length > 20 && /\bvision\b/i.test(p)) return p;
  }
  return null;
}
