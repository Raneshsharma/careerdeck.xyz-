import { Annotation } from "@langchain/langgraph";
import type {
  ResearchEnvelope,
  WikipediaResult,
  GoogleSearchResult,
  WebsiteDiscoveryResult,
  WebsitePagesResult,
  YahooFinanceResult,
  GNewsResult,
  DuckDuckGoResult,
} from "../research/types";
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
import type { RawResolvedFacts } from "../knowledge/conflictResolver";
import type { DomainVersions } from "../cache/versioning";
import type { CacheMetrics } from "../cache/metrics";
import type { CoreFacts } from "../knowledge/coreFactsExtractor";

/**
 * Shared state for the Company Dossier graph.
 * Designed to be extended as new sections are added.
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface AssembledResearch {
  wikipedia: WikipediaResult | null;
  google: GoogleSearchResult | null;
  website: {
    discovery: WebsiteDiscoveryResult | null;
    pages: WebsitePagesResult | null;
  };
  yahooFinance: YahooFinanceResult | null;
  gnews: GNewsResult | null;
  duckduckgo: DuckDuckGoResult | null;
}

export interface CompanyKnowledge {
  companyOverview?: string;
  whyExists?: string;
  businessModel?: string;
  rawResearch?: AssembledResearch;
  extractedFacts?: MergedExtractedFacts;
  resolvedFacts?: RawResolvedFacts;
  knowledgeBase?: CompanyKnowledgeBase;
}

export const CompanyStateAnnotation = Annotation.Root({
  // ── Raw inputs ──────────────────────────────────────────────────────────
  companyName: Annotation<string>(),

  role: Annotation<string | undefined>(),

  jobDescription: Annotation<string | undefined>(),

  dossierType: Annotation<"company" | "role" | "jd" | "news">(),

  // ── Validation ──────────────────────────────────────────────────────────
  validation: Annotation<ValidationResult>({
    reducer: (_previous, next) => next,
    default: () => ({ isValid: false, errors: [] }),
  }),

  // ── Normalization ───────────────────────────────────────────────────────
  normalizedCompanyName: Annotation<string>(),

  // ── Individual research envelopes ───────────────────────────────────────
  researchWikipedia: Annotation<ResearchEnvelope<WikipediaResult> | null>({
    reducer: (_previous, next) => next ?? _previous,
    default: () => null,
  }),

  researchGoogle: Annotation<ResearchEnvelope<GoogleSearchResult> | null>({
    reducer: (_previous, next) => next ?? _previous,
    default: () => null,
  }),

  researchDuckDuckGo: Annotation<ResearchEnvelope<DuckDuckGoResult> | null>({
    reducer: (_previous, next) => next ?? _previous,
    default: () => null,
  }),

  researchYahoo: Annotation<ResearchEnvelope<YahooFinanceResult> | null>({
    reducer: (_previous, next) => next ?? _previous,
    default: () => null,
  }),

  researchGNews: Annotation<ResearchEnvelope<GNewsResult> | null>({
    reducer: (_previous, next) => next ?? _previous,
    default: () => null,
  }),

  researchWebsiteDiscovery: Annotation<ResearchEnvelope<WebsiteDiscoveryResult> | null>({
    reducer: (_previous, next) => next ?? _previous,
    default: () => null,
  }),

  researchWebsitePages: Annotation<ResearchEnvelope<WebsitePagesResult> | null>({
    reducer: (_previous, next) => next ?? _previous,
    default: () => null,
  }),

  // ── Individual extraction outputs ───────────────────────────────────────
  extractedWikipedia: Annotation<ExtractedCompany | null>({
    reducer: (_previous, next) => next ?? _previous,
    default: () => null,
  }),

  extractedGoogle: Annotation<ExtractedUrls | null>({
    reducer: (_previous, next) => next ?? _previous,
    default: () => null,
  }),

  extractedWebsite: Annotation<ExtractedWebsite | null>({
    reducer: (_previous, next) => next ?? _previous,
    default: () => null,
  }),

  extractedYahoo: Annotation<ExtractedFinancials | null>({
    reducer: (_previous, next) => next ?? _previous,
    default: () => null,
  }),

  extractedGNews: Annotation<ExtractedNewsArticle[] | null>({
    reducer: (_previous, next) => next ?? _previous,
    default: () => null,
  }),

  extractedDuckDuckGo: Annotation<ExtractedDuckDuckGo | null>({
    reducer: (_previous, next) => next ?? _previous,
    default: () => null,
  }),

  // ── Built knowledge (deep merge) ────────────────────────────────────────
  knowledge: Annotation<CompanyKnowledge>({
    reducer: (previous, next) => ({ ...previous, ...next }),
    default: () => ({}),
  }),

  // ── Generated sections ───────────────────────────────────────────────────
  generatedSections: Annotation<Record<string, string>>({
    reducer: (previous, next) => ({ ...previous, ...next }),
    default: () => ({}),
  }),

  // ── Reviewed sections (after quality review) ─────────────────────────────
  reviewedSections: Annotation<Record<string, string>>({
    reducer: (previous, next) => ({ ...previous, ...next }),
    default: () => ({}),
  }),

  // ── Internal section scores (not exposed to user) ────────────────────────
  sectionScores: Annotation<Record<string, Record<string, number>>>({
    reducer: (previous, next) => ({ ...previous, ...next }),
    default: () => ({}),
  }),

  // ── Domain versioning (per-domain hashes for incremental regeneration) ───
  domainVersions: Annotation<DomainVersions | null>({
    reducer: (_previous, next) => next ?? _previous,
    default: () => null,
  }),

  // ── Core Facts Evidence Graph ────────────────────────────────────────────
  coreFacts: Annotation<CoreFacts | null>({
    reducer: (_previous, next) => next ?? _previous,
    default: () => null,
  }),

  // ── Cache metadata (metrics collected during execution) ──────────────────
  cacheMetadata: Annotation<CacheMetrics | null>({
    reducer: (_previous, next) => next ?? _previous,
    default: () => null,
  }),

  // ── Error collection (append-only) ──────────────────────────────────────
  errors: Annotation<string[]>({
    reducer: (previous, next) => [...previous, ...next],
    default: () => [],
  }),

  // ── Metadata / tracing ──────────────────────────────────────────────────
  startedAt: Annotation<string>(),

  completedAt: Annotation<string>(),
});

export type CompanyState = typeof CompanyStateAnnotation.State;
