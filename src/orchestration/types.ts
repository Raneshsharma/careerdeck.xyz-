export type Persona = "mba" | "recruiter" | "consultant" | "founder" | "investor";

export type ReportType = "full" | "executive-summary" | "interview-prep" | "mba-case" | "custom";

export type OutputFormat = "markdown" | "json" | "structured";

export interface OrchestrationRequest {
  companyName: string;
  role?: string;
  jobDescription?: string;
  reportType: ReportType;
  persona: Persona;
  sections?: string[];
  outputFormat: OutputFormat;
  refreshSources?: boolean;
}

export interface OrchestrationResult {
  requestId: string;
  companyName: string;
  generatedAt: string;
  reportType: ReportType;
  persona: Persona;
  sections: Record<string, string>;
  reviewedSections: Record<string, string>;
  explainability: ReportExplainability;
  formatted: FormattedOutput;
  health: PipelineHealth;
  metadata: {
    totalDurationMs: number;
    researchDurationMs: number;
    generationDurationMs: number;
    reviewDurationMs: number;
    cacheHits: number;
    cacheMisses: number;
    apiCalls: number;
    llmCalls: number;
    promptVersion: string;
    knowledgeVersion: Record<string, string>;
    evaluationScores: Record<string, number>;
  };
}

export interface ReportExplainability {
  sections: Record<string, SectionProvenance>;
  overallConfidence: number;
  sourcesUsed: string[];
}

export interface SectionProvenance {
  sectionId: string;
  sectionName: string;
  knowledgeDomains: string[];
  sources: string[];
  confidence: number;
  lastVerified: string;
  keyFacts: Array<{
    fact: string;
    value: string;
    source: string;
    confidence: number;
  }>;
}

export interface FormattedOutput {
  format: OutputFormat;
  content: string | Record<string, unknown>;
}

export interface PipelineHealth {
  status: "healthy" | "degraded" | "down";
  layers: Record<string, LayerHealth>;
  overall: {
    uptime: number;
    successRate: number;
    avgLatencyMs: number;
  };
}

export interface LayerHealth {
  status: "healthy" | "degraded" | "down";
  lastCheck: string;
  details: string;
}

export const SECTION_MAP: Record<string, string> = {
  companyOverview: "## 1. Company in One Minute",
  whyExists: "## 2. Why It Exists",
  businessModel: "## 3. Business Model",
  products: "## 4. Products & Services",
  journey: "## 5. Company Journey",
  industry: "## 6. Industry Overview",
  competitors: "## 7. Competitor Analysis",
  moat: "## 8. Competitive Advantage (Moat)",
  financials: "## 9. Financial Health",
  strategy: "## 10. Strategic Priorities",
  culture: "## 11. Culture & Work Style",
  employeeInsights: "## 12. Employee Insights",
  interviewQuestions: "## Bonus: The 5 Highest-Value Questions",
};

export const PERSONA_INTROS: Record<Persona, string> = {
  mba: "# Interview Preparation Dossier\n\n*Generated for MBA-level interview preparation.*\n\n",
  recruiter: "# Company Intelligence Brief\n\n*Prepared for recruitment evaluation.*\n\n",
  consultant: "# Strategic Business Analysis\n\n*Prepared for consulting engagement.*\n\n",
  founder: "# Competitive Intelligence Report\n\n*Prepared for business strategy.*\n\n",
  investor: "# Investment Research Brief\n\n*Prepared for investment analysis.*\n\n",
};

export const REPORT_SECTIONS: Record<ReportType, string[]> = {
  full: [
    "companyOverview", "whyExists", "businessModel", "products",
    "journey", "industry", "competitors", "moat", "financials",
    "strategy", "culture", "employeeInsights", "interviewQuestions",
  ],
  "executive-summary": [
    "companyOverview", "businessModel", "financials", "strategy",
  ],
  "interview-prep": [
    "companyOverview", "whyExists", "businessModel", "industry",
    "competitors", "culture", "interviewQuestions",
  ],
  "mba-case": [
    "companyOverview", "whyExists", "businessModel", "products",
    "journey", "industry", "competitors", "moat", "financials",
    "strategy",
  ],
  custom: [],
};
