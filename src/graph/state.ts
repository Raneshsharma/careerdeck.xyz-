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
  GoogleNewsRssResult,
  SecEdgarResult,
  GoogleFinanceResult,
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
import type { CompetitorIntelligence } from "./nodes/competitorIntelligence";

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
  googleFinance: GoogleFinanceResult | null;
  gnews: GNewsResult | null;
  duckduckgo: DuckDuckGoResult | null;
  googleNewsRss: GoogleNewsRssResult | null;
  secEdgar: SecEdgarResult | null;
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

export interface RoleFacts {
  role_name: string;
  job_family: string;
  department: string | null;
  reports_to: string | null;
  team_size: string | null;
  core_objective: string | null;
  daily_work: string[];
  weekly_work: string[];
  monthly_work: string[];
  role_operating_system: {
    inputs: string[];
    decisions: string[];
    execution: string[];
    metrics: string[];
    feedback: string[];
    iteration: string[];
  };
  business_impact_graph: {
    activity: string;
    output: string;
    department_kpi: string;
    business_kpi: string;
    financial_impact: string;
  };
  decision_intelligence: {
    owns: string[];
    influences: string[];
    approves: string[];
    escalates: string[];
    typical_tradeoffs: string[];
  };
  typical_business_problems: Array<{
    problem: string;
    why_it_matters: string;
    impacted_kpi: string;
  }>;
  stakeholders: Array<{
    stakeholder: string;
    influence: string;
    frequency: string;
    goal: string;
    conflict: string;
  }>;
  cross_functional_collaboration: Array<{
    department: string;
    needs_and_incentives: string;
    common_friction_point: string;
  }>;
  north_star_metrics: string[];
  kpis: string[];
  competency_framework: Array<{
    competency: string;
    beginner: string;
    intermediate: string;
    advanced: string;
  }>;
  tools: Array<{
    tool: string;
    why_used: string;
    frequency: string;
    ai_alternative: string;
  }>;
  skills: string[];
  projects: Array<{
    project: string;
    objective: string;
    stakeholders: string[];
    deliverables: string[];
    success_metrics: string[];
  }>;
  success_profile: string[];
  maturity_model: Array<{
    level: string;
    focus: string;
    capabilities: string[];
  }>;
  productivity_intelligence: {
    ai_assistance: string[];
    automation_opportunities: string[];
    human_only_strengths: string[];
  };
  career_path: Array<{
    stage: string;
    timeframe: string;
    skills_required: string[];
    projects_expected: string[];
    promotion_signals: string[];
    salary_growth: string;
  }>;
  salary: {
    range: string;
    currency: string;
    incentives: string;
  };
  interview: {
    questions: Array<{ question: string; type: string; framework: string }>;
    pitfalls: string[];
  };
  business_vocabulary: Array<{
    term: string;
    definition: string;
    example_usage: string;
  }>;
  functional_priorities: Array<{
    pillar: string;
    description: string;
    framework_used: string;
  }>;
  company_specific: Record<string, any>;
}

export interface JDFacts {
  role: string;
  company: string;
  department: string | null;
  seniority: string;
  location: string;
  employment_type: string;
  must_have_skills: string[];
  good_to_have_skills: string[];
  responsibilities: Array<{
    responsibility: string;
    why_it_exists: string;
    business_kpi: string;
    failure_mode: string;
    stakeholders: string[];
  }>;
  tools: string[];
  business_problems: Array<{
    problem: string;
    inferred_cause: string;
    impacted_metric: string;
  }>;
  stakeholders: Array<{
    stakeholder: string;
    influence: string;
    frequency: string;
    goal: string;
  }>;
  success_metrics: string[];
  hidden_expectations: Array<{
    phrase: string;
    true_meaning: string;
    implication: string;
  }>;
  keywords: string[];
  ats_keywords: Array<{
    keyword: string;
    frequency: number;
    importance: string;
  }>;
  resume_keywords: string[];
  hiring_signals: Array<{
    signal_type: string;
    evidence: string;
    implication: string;
  }>;
  culture_signals: string[];
  interview_signals: Array<{
    question_type: string;
    predicted_question: string;
    why_likely: string;
  }>;
  star_blueprints: Array<{
    responsibility: string;
    situation: string;
    task: string;
    action: string;
    result: string;
  }>;
  red_flags: Array<{
    phrase: string;
    interpretation: string;
    risk_level: string;
  }>;
  fit_dimensions: Array<{
    dimension: string;
    importance: string;
    signals_from_jd: string;
  }>;
  expectations_30_60_90: {
    day_30: string[];
    day_60: string[];
    day_90: string[];
  };
  confidence: Record<string, string>;
}

export interface NewsFacts {
  // ── Core facts (Fact Layer) ───────────────────────────────────────────
  headline: string;
  company: string;
  industry: string;
  category: string;  // e.g. "Acquisition", "Earnings", "Layoffs", "Product Launch", "Leadership Change"
  date: string;
  summary: string;
  sources: string[];

  // ── Business Reasoning (Business Layer) ──────────────────────────────
  business_problem: string;
  business_opportunity: string;
  root_cause: string;
  strategic_priority: string;
  business_impact: {
    winners: string[];
    losers: string[];
    revenue_effect: string;
    margin_effect: string;
    operational_effect: string;
    customer_effect: string;
  };
  financial_effect: {
    revenue_impact: string;
    margin_impact: string;
    stock_signal: string;
    cash_position: string;
    investment_risk: string;
  };
  industry_impact: {
    competitor_reactions: string[];
    industry_trend: string;
    ripple_effects: string[];
  };
  customer_impact: string[];
  employee_impact: {
    hiring_signal: string;
    layoff_risk: string;
    skills_in_demand: string[];
    culture_change: string;
  };
  role_impact: Array<{
    role_family: string;
    impact: string;
    opportunity: string;
  }>;

  // ── Intelligence Scores ───────────────────────────────────────────────
  importance_score: number;  // 1-10
  freshness: string;         // "Breaking" | "24 Hours" | "This Week" | "This Month" | "Historical"
  interview_relevance: string; // "Highly Likely" | "Likely" | "Low"
  career_relevance: Array<{
    role_family: string;
    relevance: string;
    reason: string;
  }>;

  // ── Career Layer ─────────────────────────────────────────────────────
  interview_talking_points: Array<{
    opinion: string;
    reasoning: string;
    confidence: string;
  }>;
  risks: Array<{
    risk: string;
    likelihood: string;
    mitigation: string;
  }>;
  opportunities: Array<{
    opportunity: string;
    timeframe: string;
    who_benefits: string;
  }>;
  predictions: Array<{
    prediction: string;
    timeframe: string;
    confidence: string;  // "High" | "Medium" | "Low"
    rationale: string;
  }>;
  candidate_action_plan: Array<{
    action: string;
    why: string;
    priority: string;
  }>;
  confidence: Record<string, string>;
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

  researchGoogleFinance: Annotation<ResearchEnvelope<GoogleFinanceResult> | null>({
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

  // ── Final report quality ─────────────────────────────────────────────────
  reportQuality: Annotation<number>({
    reducer: (_previous, next) => next ?? _previous,
    default: () => 0,
  }),

  reportIssues: Annotation<Array<Record<string, unknown>>>({
    reducer: (_previous, next) => next ?? _previous,
    default: () => [],
  }),

  // ── Internal section scores (not exposed to user) ────────────────────────
  sectionScores: Annotation<Record<string, Record<string, number>>>({
    reducer: (previous, next) => ({ ...previous, ...next }),
    default: () => ({}),
  }),

  // ── Data Enrichment sources ─────────────────────────────────────────────
  researchGoogleNewsRss: Annotation<ResearchEnvelope<GoogleNewsRssResult> | null>({
    reducer: (_previous, next) => next ?? _previous,
    default: () => null,
  }),

  researchSecEdgar: Annotation<ResearchEnvelope<SecEdgarResult> | null>({
    reducer: (_previous, next) => next ?? _previous,
    default: () => null,
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

  // ── Competitor Intelligence (researched profiles of named competitors) ───
  competitorIntelligence: Annotation<CompetitorIntelligence | null>({
    reducer: (_previous, next) => next ?? _previous,
    default: () => null,
  }),

  // ── Cache metadata (metrics collected during execution) ──────────────────
  cacheMetadata: Annotation<CacheMetrics | null>({
    reducer: (_previous, next) => next ?? _previous,
    default: () => null,
  }),

  // ── Validation attempts (for self-healing loop) ──────────────────────────
  validationAttempts: Annotation<number>({
    reducer: (previous, next) => next ?? previous,
    default: () => 0,
  }),

  // ── Error collection (append-only) ──────────────────────────────────────
  errors: Annotation<string[]>({
    reducer: (previous, next) => [...previous, ...next],
    default: () => [],
  }),

  // ── Role Intelligence facts graph ────────────────────────────────────────
  roleFacts: Annotation<RoleFacts | null>({
    reducer: (_previous, next) => next ?? _previous,
    default: () => null,
  }),

  // ── JD Intelligence facts graph ─────────────────────────────────────────
  jdFacts: Annotation<JDFacts | null>({
    reducer: (_previous, next) => next ?? _previous,
    default: () => null,
  }),

  // ── News Intelligence facts graph ──────────────────────────────────────
  newsFacts: Annotation<NewsFacts | null>({
    reducer: (_previous, next) => next ?? _previous,
    default: () => null,
  }),

  // ── Resume & Candidate Intelligence state ──────────────────────────────
  resumeText: Annotation<string | null>({
    reducer: (_previous, next) => next ?? _previous,
    default: () => null,
  }),

  resumeFacts: Annotation<any | null>({
    reducer: (_previous, next) => next ?? _previous,
    default: () => null,
  }),

  resumeIntelligence: Annotation<any | null>({
    reducer: (_previous, next) => next ?? _previous,
    default: () => null,
  }),

  matchingIntelligence: Annotation<any | null>({
    reducer: (_previous, next) => next ?? _previous,
    default: () => null,
  }),

  optimizationIntelligence: Annotation<any | null>({
    reducer: (_previous, next) => next ?? _previous,
    default: () => null,
  }),

  hiringIntelligence: Annotation<any | null>({
    reducer: (_previous, next) => next ?? _previous,
    default: () => null,
  }),

  careerIntelligence: Annotation<any | null>({
    reducer: (_previous, next) => next ?? _previous,
    default: () => null,
  }),

  // ── LinkedIn & Personal Brand Intelligence state ─────────────────────────
  linkedinText: Annotation<string | null>({
    reducer: (_previous, next) => next ?? _previous,
    default: () => null,
  }),

  linkedinIntelligence: Annotation<any | null>({
    reducer: (_previous, next) => next ?? _previous,
    default: () => null,
  }),

  brandIntelligence: Annotation<any | null>({
    reducer: (_previous, next) => next ?? _previous,
    default: () => null,
  }),

  recruiterIntelligence: Annotation<any | null>({
    reducer: (_previous, next) => next ?? _previous,
    default: () => null,
  }),

  linkedinOptimization: Annotation<any | null>({
    reducer: (_previous, next) => next ?? _previous,
    default: () => null,
  }),

  networkingCareerIntelligence: Annotation<any | null>({
    reducer: (_previous, next) => next ?? _previous,
    default: () => null,
  }),

  // ── Metadata / tracing ──────────────────────────────────────────────────
  startedAt: Annotation<string>(),

  completedAt: Annotation<string>(),
});

export type CompanyState = typeof CompanyStateAnnotation.State;
