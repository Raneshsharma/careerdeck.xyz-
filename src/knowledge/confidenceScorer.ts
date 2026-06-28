import type { ProvenancedValue, ProvenancedList, CompanyKnowledgeBase } from "./types";
import type { ExtractedNewsArticle } from "../extractors/types";
import { SOURCE_PRIORITY } from "./conflictResolver";
import type { RawResolvedFacts } from "./conflictResolver";

export interface SourceConfidence {
  overall: number;
  perField: Record<string, number>;
}

function fieldConfidence(
  value: unknown,
  sources: string[],
  isList = false,
): number {
  let score = 0;

  // Source priority: highest priority source contributes up to 0.4
  if (sources.length > 0) {
    const maxPriority = Math.max(
      ...sources.map((s) => SOURCE_PRIORITY[s] ?? 0),
    );
    score += (maxPriority / 6) * 0.4;
  }

  // Source agreement: more agreeing sources = higher confidence, up to 0.3
  if (sources.length >= 3) score += 0.3;
  else if (sources.length === 2) score += 0.2;
  else if (sources.length === 1) score += 0.1;

  // Data completeness: has actual value, up to 0.3
  if (value != null) {
    if (isList) {
      const arr = value as unknown[];
      if (arr.length > 5) score += 0.3;
      else if (arr.length > 0) score += 0.2;
    } else {
      const str = String(value);
      if (str.length > 10) score += 0.3;
      else if (str.length > 0) score += 0.2;
    }
  }

  return Math.min(1, Math.round(score * 100) / 100);
}

export function scoreConfidence(
  resolved: RawResolvedFacts,
  news: ExtractedNewsArticle[],
): CompanyKnowledgeBase {
  const now = new Date().toISOString();
  const perField: Record<string, number> = {};

  function pv<T>(field: ProvenancedValue<T>, isList?: boolean): ProvenancedValue<T> {
    const confidence = field.value != null
      ? fieldConfidence(field.value, field.sources, isList)
      : 0;
    return { ...field, confidence, last_verified: now };
  }

  function pl(field: ProvenancedList): ProvenancedList {
    const confidence = fieldConfidence(field.value, field.sources, true);
    return { ...field, confidence, last_verified: now };
  }

  const knowledge: CompanyKnowledgeBase = {
    company: {
      name: pv(resolved.company.name),
      industry: pv(resolved.company.industry),
      description: pv(resolved.company.description),
    },
    leadership: {
      ceo: pv(resolved.leadership.ceo),
      founders: pl(resolved.leadership.founders),
      executives: pl(resolved.leadership.executives),
    },
    history: {
      founded: pv(resolved.history.founded),
    },
    products: {
      items: pl(resolved.products.items),
      brands: pl(resolved.products.brands),
    },
    business: {
      businessSegments: pl(resolved.business.businessSegments),
      subsidiaries: pl(resolved.business.subsidiaries),
      parentCompany: pv(resolved.business.parentCompany),
      countries: pl(resolved.business.countries),
    },
    financials: {
      revenue: pv(resolved.financials.revenue),
      revenueCurrency: pv(resolved.financials.revenueCurrency),
      marketCap: pv(resolved.financials.marketCap),
      marketCapCurrency: pv(resolved.financials.marketCapCurrency),
      employees: pv(resolved.financials.employees),
      sector: pv(resolved.financials.sector),
      industry: pv(resolved.financials.industry),
      country: pv(resolved.financials.country),
      currency: pv(resolved.financials.currency),
      exchange: pv(resolved.financials.exchange),
      ticker: pv(resolved.financials.ticker),
      profitMargin: pv(resolved.financials.profitMargin),
      operatingMargin: pv(resolved.financials.operatingMargin),
      grossMargin: pv(resolved.financials.grossMargin),
      beta: pv(resolved.financials.beta),
      trailingPE: pv(resolved.financials.trailingPE),
      currentPrice: pv(resolved.financials.currentPrice),
      fiftyTwoWeekHigh: pv(resolved.financials.fiftyTwoWeekHigh),
      fiftyTwoWeekLow: pv(resolved.financials.fiftyTwoWeekLow),
    },
    mission: {
      mission: pv(resolved.mission.mission),
      vision: pv(resolved.mission.vision),
      values: pl(resolved.mission.values),
    },
    website: {
      officialWebsite: pv(resolved.website.officialWebsite),
      aboutPage: pv(resolved.website.aboutPage),
      investorRelations: pv(resolved.website.investorRelations),
      annualReport: pv(resolved.website.annualReport),
      leadership: pv(resolved.website.leadership),
      sustainability: pv(resolved.website.sustainability),
      careers: pv(resolved.website.careers),
      wikipedia: pv(resolved.website.wikipedia),
      yahooFinance: pv(resolved.website.yahooFinance),
      metaDescription: pv(resolved.website.metaDescription),
      ogTitle: pv(resolved.website.ogTitle),
      ogDescription: pv(resolved.website.ogDescription),
      ogImage: pv(resolved.website.ogImage),
    },
    news,
    metadata: {
      resolved_at: now,
      sources_used: [],
      confidence: {},
    },
  };

  // Collect all confidence scores
  function collectConf(path: string, field: ProvenancedValue<unknown> | ProvenancedList) {
    perField[path] = field.confidence;
  }

  collectConf("company.name", knowledge.company.name);
  collectConf("company.industry", knowledge.company.industry);
  collectConf("company.description", knowledge.company.description);
  collectConf("leadership.ceo", knowledge.leadership.ceo);
  collectConf("leadership.founders", knowledge.leadership.founders);
  collectConf("leadership.executives", knowledge.leadership.executives);
  collectConf("history.founded", knowledge.history.founded);
  collectConf("products.items", knowledge.products.items);
  collectConf("products.brands", knowledge.products.brands);
  collectConf("business.businessSegments", knowledge.business.businessSegments);
  collectConf("business.subsidiaries", knowledge.business.subsidiaries);
  collectConf("business.parentCompany", knowledge.business.parentCompany);
  collectConf("business.countries", knowledge.business.countries);
  collectConf("financials.revenue", knowledge.financials.revenue);
  collectConf("financials.marketCap", knowledge.financials.marketCap);
  collectConf("financials.employees", knowledge.financials.employees);
  collectConf("financials.ticker", knowledge.financials.ticker);
  collectConf("website.officialWebsite", knowledge.website.officialWebsite);
  collectConf("mission.mission", knowledge.mission.mission);
  collectConf("mission.vision", knowledge.mission.vision);

  // Compute overall confidence
  const scores = Object.values(perField).filter((s) => s > 0);
  const overall = scores.length > 0
    ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100
    : 0;

  // Sources used
  const allSources = new Set<string>();
  for (const field of [
    knowledge.company, knowledge.leadership, knowledge.financials,
    knowledge.website, knowledge.mission, knowledge.business,
    knowledge.history, knowledge.products,
  ] as Record<string, unknown>[]) {
    for (const val of Object.values(field)) {
      const pv = val as { sources?: string[] };
      if (pv.sources) {
        for (const s of pv.sources) allSources.add(s);
      }
    }
  }

  knowledge.metadata = {
    resolved_at: now,
    sources_used: [...allSources],
    confidence: { ...perField, overall },
  };

  return knowledge;
}
