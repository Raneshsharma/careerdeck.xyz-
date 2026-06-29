import type { ExtractedNewsArticle } from "../extractors/types";

export interface ProvenancedValue<T = string | null> {
  value: T;
  sources: string[];
  confidence: number;
  last_verified: string;
}

export interface ProvenancedList {
  value: string[];
  sources: string[];
  confidence: number;
  last_verified: string;
}

export interface CompanyKnowledgeBase {
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
  news: ExtractedNewsArticle[];
  competitive_advantage: {
    brand: { confidence: number; assessment: string };
    scale: { confidence: number; assessment: string };
    switching_costs: { confidence: number; assessment: string };
    network_effects: { confidence: number; assessment: string };
  };
  metadata: {
    resolved_at: string;
    sources_used: string[];
    confidence: Record<string, number>;
  };
}
