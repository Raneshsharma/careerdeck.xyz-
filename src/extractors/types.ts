export interface ExtractedCompany {
  name: string;
  description: string;
  headquarters: string | null;
  founded: string | null;
  founders: string[];
  ceo: string | null;
  industry: string | null;
  parentCompany: string | null;
  subsidiaries: string[];
  products: string[];
  website: string | null;
}

export interface ExtractedUrls {
  officialWebsite: string | null;
  aboutPage: string | null;
  investorRelations: string | null;
  annualReport: string | null;
  leadership: string | null;
  sustainability: string | null;
  careers: string | null;
}

export interface ExtractedWebsitePage {
  path: string;
  textContent: string;
  metaDescription: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  ogUrl: string | null;
  jsonld: Record<string, unknown>[];
  headings: string[];
  paragraphs: string[];
  lists: string[][];
  links: Array<{ text: string; href: string }>;
}

export interface ExtractedWebsite {
  officialUrl: string;
  pages: Record<string, ExtractedWebsitePage>;
}

export interface ExtractedFinancials {
  revenue: number | null;
  revenueCurrency: string | null;
  marketCap: number | null;
  marketCapCurrency: string | null;
  employees: number | null;
  sector: string | null;
  industry: string | null;
  ceo: string | null;
  country: string | null;
  currency: string | null;
  exchange: string | null;
  ticker: string | null;
  profitMargin: number | null;
  operatingMargin: number | null;
  grossMargin: number | null;
  beta: number | null;
  trailingPE: number | null;
  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;
  currentPrice: number | null;
}

export interface ExtractedNewsArticle {
  title: string;
  publishedDate: string | null;
  source: string;
  url: string;
  category: string | null;
}

export interface ExtractedDuckDuckGo {
  description: string | null;
  officialWebsite: string | null;
  entityType: string | null;
}

export interface MergedExtractedFacts {
  company: {
    name: string;
    description: string;
    headquarters: string | null;
    founded: string | null;
    founders: string[];
    industry: string | null;
    parentCompany: string | null;
    products: string[];
    website: string | null;
  };
  website: {
    officialUrl: string | null;
    metaDescription: string | null;
    ogTitle: string | null;
    ogDescription: string | null;
    ogImage: string | null;
    pages?: {
      homepage?: { paragraphs?: string[] };
    };
  };
  leadership: {
    ceo: string | null;
    executives: string[];
  };
  products: {
    items: string[];
    businessSegments: string[];
    brands: string[];
  };
  financials: {
    revenue: number | null;
    revenueCurrency: string | null;
    marketCap: number | null;
    marketCapCurrency: string | null;
    employees: number | null;
    sector: string | null;
    industry: string | null;
    country: string | null;
    currency: string | null;
    exchange: string | null;
    ticker: string | null;
    profitMargin: number | null;
    operatingMargin: number | null;
    grossMargin: number | null;
    beta: number | null;
    trailingPE: number | null;
    currentPrice: number | null;
    fiftyTwoWeekHigh: number | null;
    fiftyTwoWeekLow: number | null;
  };
  history: {
    founded: string | null;
    founders: string[];
    subsidiaries: string[];
  };
  news: ExtractedNewsArticle[];
  urls: {
    officialWebsite: string | null;
    aboutPage: string | null;
    investorRelations: string | null;
    annualReport: string | null;
    leadership: string | null;
    sustainability: string | null;
    careers: string | null;
    wikipedia: string | null;
    yahooFinance: string | null;
  };
}
