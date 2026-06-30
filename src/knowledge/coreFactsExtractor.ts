import type { CompanyKnowledgeBase } from "./types";

/**
 * Core Facts Evidence Graph — immutable truths extracted from the KB.
 * Every section must respect these as authoritative. No section
 * may contradict a core fact without providing stronger evidence.
 */
export interface CoreFacts {
  // Identity
  companyName: string;
  industry: string | null;
  sector: string | null;
  founded: string | null;
  founders: string[];
  description: string | null;

  // Leadership
  ceo: string | null;

  // Scale & Financials
  revenue: { value: number | null; currency: string | null; year: string | null };
  revenueGrowth: string | null;
  netIncome: { value: number | null; currency: string | null } | null;
  ebitda: { value: number | null; currency: string | null } | null;
  freeCashFlow: { value: number | null; currency: string | null } | null;
  marketCap: { value: number | null; currency: string | null } | null;
  totalEquity: { value: number | null; currency: string | null } | null;
  investedCapital: { value: number | null; currency: string | null } | null;
  employees: number | null;
  operatingCountries: number | null;
  asOfTimestamp: string | null;

  // Computed Analytical Metrics
  computedMetrics: {
    ebitdaMargin: string | null;
    netMargin: string | null;
    fcfMargin: string | null;
    fcfConversion: string | null;
    fcfYield: string | null;
    roe: string | null;
    roic: string | null;
  } | null;

  // Revenue Engine
  primaryRevenueDriver: string | null;
  businessModel: string[];
  businessSegments: string[];

  // Products & Portfolio
  namedProducts: string[];
  namedBrands: string[];

  // Competitive Position (10 Economic Moat Categories)
  brandStrength: { score: number | null; assessment: string; rationale: string[] };
  scaleAdvantage: { score: number | null; assessment: string; rationale: string[] };
  switchingCosts: { score: number | null; assessment: string; rationale: string[] };
  networkEffects: { score: number | null; assessment: string; rationale: string[] };
  costAdvantage: { score: number | null; assessment: string; rationale: string[] };
  technology: { score: number | null; assessment: string; rationale: string[] };
  intellectualProperty: { score: number | null; assessment: string; rationale: string[] };
  distribution: { score: number | null; assessment: string; rationale: string[] };
  data: { score: number | null; assessment: string; rationale: string[] };
  regulatory: { score: number | null; assessment: string; rationale: string[] };
  moatSummary: string;

  // Strategic direction
  strategicPriorities: string[];
  strategicWeaknesses: string[];

  // Employee Intelligence
  employeeInsights: {
    rating: string | null;
    ratingConfidence: number | null;
    sourceCounts: number | null;
    pros: string[];
    cons: string[];
    cultureSummary: string | null;
  };
  careersValues: string[];
  leadershipPrinciples: string[];
  interviewExperiences: string[];
  workStyleTrends: string[];

  // Domain Terminology
  domainTerminology: string[];

  // News evidence
  recentMilestones: string[];

  // Sources
  evidenceSources: string[];
  extractedAt: string;
}

export function extractCoreFacts(knowledge: CompanyKnowledgeBase): CoreFacts {
  const f = knowledge.financials || ({} as unknown as CompanyKnowledgeBase["financials"]);
  const c = knowledge.company;
  const l = knowledge.leadership;
  const p = knowledge.products;
  const b = knowledge.business;
  const h = knowledge.history;

  // Collect all evidence sources
  const sources = new Set<string>();
  const addSources = (field: { sources?: string[] } | undefined | null) => {
    if (field?.sources) for (const s of field.sources) sources.add(s);
  };

  addSources(f?.revenue as unknown as { sources?: string[] });
  addSources(f?.marketCap as unknown as { sources?: string[] });
  addSources(f?.industry as unknown as { sources?: string[] });
  addSources(c?.industry as unknown as { sources?: string[] });
  addSources(l?.ceo as unknown as { sources?: string[] });
  addSources(p?.items as unknown as { sources?: string[] });
  addSources(h?.founded as unknown as { sources?: string[] });

  // Moat assessment from provenanced values
  const moatData = knowledge as unknown as Record<string, Record<string, { confidence?: number; assessment?: string; rationale?: string[] }>>;
  const brandConfidence = Number(moatData?.competitive_advantage?.brand?.confidence ?? 0);
  const scaleConfidence = Number(moatData?.competitive_advantage?.scale?.confidence ?? 0);
  const switchConfidence = Number(moatData?.competitive_advantage?.switching_costs?.confidence ?? 0);
  const networkConfidence = Number(moatData?.competitive_advantage?.network_effects?.confidence ?? 0);
  const costConfidence = Number(moatData?.competitive_advantage?.cost_advantage?.confidence ?? 0);
  const techConfidence = Number(moatData?.competitive_advantage?.technology?.confidence ?? 0);
  const ipConfidence = Number(moatData?.competitive_advantage?.intellectual_property?.confidence ?? 0);
  const distConfidence = Number(moatData?.competitive_advantage?.distribution?.confidence ?? 0);
  const dataConfidence = Number(moatData?.competitive_advantage?.data?.confidence ?? 0);
  const regConfidence = Number(moatData?.competitive_advantage?.regulatory?.confidence ?? 0);

  const getBrandAssessment = (): string => {
    if (brandConfidence >= 0.8) return "Strong — consistently verified across multiple high-quality sources";
    if (brandConfidence >= 0.5) return "Moderate — supported by some evidence but not uniformly verified";
    if (brandConfidence > 0) return "Limited — weak evidence for brand claims";
    return "Unverified — no reliable evidence for brand strength claims";
  };

  // Mapped employee intelligence
  const employeeInsightsRaw = (knowledge as any).employeeInsights || {};

  return {
    companyName: c?.name?.value || "Unknown",
    industry: f?.industry?.value ?? c?.industry?.value ?? null,
    sector: f?.sector?.value ?? null,
    founded: h?.founded?.value ?? null,
    founders: (l?.founders?.value as string[]) ?? [],
    description: c?.description?.value ?? null,
    ceo: l?.ceo?.value ?? null,
    
    // Financials
    revenue: {
      value: f?.revenue?.value ?? null,
      currency: f?.revenueCurrency?.value ?? null,
      year: null,
    },
    revenueGrowth: (f as any).revenueGrowth?.value ?? null,
    netIncome: (f as any).netIncome ? { value: (f as any).netIncome.value, currency: (f as any).netIncome.currency } : null,
    ebitda: (f as any).ebitda ? { value: (f as any).ebitda.value, currency: (f as any).ebitda.currency } : null,
    freeCashFlow: (f as any).freeCashFlow ? { value: (f as any).freeCashFlow.value, currency: (f as any).freeCashFlow.currency } : null,
    marketCap: f?.marketCap?.value ? { value: f.marketCap.value, currency: f.marketCapCurrency?.value ?? null } : null,
    totalEquity: (f as any).totalEquity ? { value: (f as any).totalEquity.value, currency: (f as any).totalEquity.currency } : null,
    investedCapital: (f as any).investedCapital ? { value: (f as any).investedCapital.value, currency: (f as any).investedCapital.currency } : null,
    employees: f?.employees?.value ?? null,
    operatingCountries: null,
    asOfTimestamp: (knowledge as any).asOfTimestamp ?? null,

    // Computed Metrics mapping
    computedMetrics: (f as any).computedMetrics || null,

    primaryRevenueDriver: null,
    businessModel: (b?.businessSegments?.value as string[]) ?? [],
    businessSegments: (b?.businessSegments?.value as string[]) ?? [],
    namedProducts: (p?.items?.value as string[]) ?? [],
    namedBrands: (p?.brands?.value as string[]) ?? [],

    // Moat Categories Mapping
    brandStrength: {
      score: brandConfidence > 0 ? Math.round(brandConfidence * 10) : null,
      assessment: getBrandAssessment(),
      rationale: moatData?.competitive_advantage?.brand?.rationale ?? []
    },
    scaleAdvantage: {
      score: scaleConfidence > 0 ? Math.round(scaleConfidence * 10) : null,
      assessment: moatData?.competitive_advantage?.scale?.assessment ?? "Scale analysis",
      rationale: moatData?.competitive_advantage?.scale?.rationale ?? []
    },
    switchingCosts: {
      score: switchConfidence > 0 ? Math.round(switchConfidence * 10) : null,
      assessment: moatData?.competitive_advantage?.switching_costs?.assessment ?? "Switching costs analysis",
      rationale: moatData?.competitive_advantage?.switching_costs?.rationale ?? []
    },
    networkEffects: {
      score: networkConfidence > 0 ? Math.round(networkConfidence * 10) : null,
      assessment: moatData?.competitive_advantage?.network_effects?.assessment ?? "Network effects analysis",
      rationale: moatData?.competitive_advantage?.network_effects?.rationale ?? []
    },
    costAdvantage: {
      score: costConfidence > 0 ? Math.round(costConfidence * 10) : null,
      assessment: moatData?.competitive_advantage?.cost_advantage?.assessment ?? "Cost advantages",
      rationale: moatData?.competitive_advantage?.cost_advantage?.rationale ?? []
    },
    technology: {
      score: techConfidence > 0 ? Math.round(techConfidence * 10) : null,
      assessment: moatData?.competitive_advantage?.technology?.assessment ?? "Proprietary tech advantages",
      rationale: moatData?.competitive_advantage?.technology?.rationale ?? []
    },
    intellectualProperty: {
      score: ipConfidence > 0 ? Math.round(ipConfidence * 10) : null,
      assessment: moatData?.competitive_advantage?.intellectual_property?.assessment ?? "IP barrier analysis",
      rationale: moatData?.competitive_advantage?.intellectual_property?.rationale ?? []
    },
    distribution: {
      score: distConfidence > 0 ? Math.round(distConfidence * 10) : null,
      assessment: moatData?.competitive_advantage?.distribution?.assessment ?? "Distribution channels",
      rationale: moatData?.competitive_advantage?.distribution?.rationale ?? []
    },
    data: {
      score: dataConfidence > 0 ? Math.round(dataConfidence * 10) : null,
      assessment: moatData?.competitive_advantage?.data?.assessment ?? "Data feedback loops",
      rationale: moatData?.competitive_advantage?.data?.rationale ?? []
    },
    regulatory: {
      score: regConfidence > 0 ? Math.round(regConfidence * 10) : null,
      assessment: moatData?.competitive_advantage?.regulatory?.assessment ?? "Regulatory barriers",
      rationale: moatData?.competitive_advantage?.regulatory?.rationale ?? []
    },
    moatSummary: brandConfidence > 0.7 ? "Strong brand moat supported by evidence" : brandConfidence > 0.3 ? "Moderate brand evidence — claims should be tempered" : "Limited brand evidence — avoid strong brand claims",

    // Strategic Direction
    strategicPriorities: (knowledge as any).strategicPriorities ?? [],
    strategicWeaknesses: (knowledge as any).strategicWeaknesses ?? [],

    // Employee Insights
    employeeInsights: {
      rating: employeeInsightsRaw.rating ?? null,
      ratingConfidence: employeeInsightsRaw.ratingConfidence ?? null,
      sourceCounts: employeeInsightsRaw.sourceCounts ?? null,
      pros: employeeInsightsRaw.pros ?? [],
      cons: employeeInsightsRaw.cons ?? [],
      cultureSummary: employeeInsightsRaw.cultureSummary ?? null,
    },
    careersValues: (knowledge as any).careersValues ?? [],
    leadershipPrinciples: (knowledge as any).leadershipPrinciples ?? [],
    interviewExperiences: (knowledge as any).interviewExperiences ?? [],
    workStyleTrends: (knowledge as any).workStyleTrends ?? [],

    domainTerminology: (knowledge as any).domainTerminology ?? [],
    recentMilestones: (knowledge.news?.slice(0, 5)?.map((n: { title: string }) => n.title) ?? []),
    evidenceSources: [...sources],
    extractedAt: new Date().toISOString(),
  };
}
