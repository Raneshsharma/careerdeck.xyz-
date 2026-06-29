export interface ResearchEnvelope<T = unknown> {
  source: string;
  success: boolean;
  fetchedAt: string;
  cached: boolean;
  durationMs: number;
  data: T | null;
  error: string | null;
}

export interface WikipediaResult {
  title: string;
  extract: string;
  url: string;
  pageId: number;
}

export interface GoogleSearchResult {
  items: Array<{
    title: string;
    link: string;
    snippet: string;
  }>;
}

export interface WebsiteDiscoveryResult {
  url: string;
  confidenceScore: number;
}

export interface WebsitePage {
  path: string;
  html: string;
  statusCode: number;
}

export interface WebsitePagesResult {
  baseUrl: string;
  pages: WebsitePage[];
}

export interface YahooFinanceResult {
  symbol: string;
  assetProfile: {
    longBusinessSummary?: string;
    sector?: string;
    industry?: string;
    website?: string;
    fullTimeEmployees?: number;
    country?: string;
    city?: string;
  };
  summaryDetail: Record<string, { fmt?: string; raw?: number }>;
  keyStatistics: Record<string, { fmt?: string; raw?: number }>;
  financialData: Record<string, { fmt?: string; raw?: number }>;
}

export interface GNewsResult {
  articles: Array<{
    title: string;
    description: string;
    url: string;
    publishedAt: string;
    source: { name: string; url: string };
  }>;
}

export interface DuckDuckGoResult {
  abstractText: string;
  abstractUrl: string | null;
  relatedTopics: string[];
  heading: string;
}

export interface GoogleNewsRssItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  snippet: string;
}

export interface GoogleNewsRssResult {
  items: GoogleNewsRssItem[];
}

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
  latest10K?: { url: string; filingDate: string };
  latest10Q?: { url: string; filingDate: string };
}
