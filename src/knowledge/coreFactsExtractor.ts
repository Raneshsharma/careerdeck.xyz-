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

  // Scale
  revenue: { value: number | null; currency: string | null; year: string | null };
  marketCap: { value: number | null; currency: string | null };
  employees: number | null;
  operatingCountries: number | null;

  // Revenue Engine
  primaryRevenueDriver: string | null;
  businessModel: string[];
  businessSegments: string[];

  // Products & Portfolio
  namedProducts: string[];
  namedBrands: string[];

  // Competitive Position
  brandStrength: { score: number | null; assessment: string };
  scaleAdvantage: { score: number | null; assessment: string };
  switchingCosts: { score: number | null; assessment: string };
  networkEffects: { score: number | null; assessment: string };
  moatSummary: string;

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
  const w = knowledge.website;

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
  const moatData = knowledge as unknown as Record<string, Record<string, { value?: unknown; sources?: string[]; confidence?: number }>>;
  const brandConfidence = Number(moatData?.competitive_advantage?.brand?.confidence ?? 0);
  const scaleConfidence = Number(moatData?.competitive_advantage?.scale?.confidence ?? 0);
  const switchConfidence = Number(moatData?.competitive_advantage?.switching_costs?.confidence ?? 0);
  const networkConfidence = Number(moatData?.competitive_advantage?.network_effects?.confidence ?? 0);

  const getBrandAssessment = (): string => {
    if (brandConfidence >= 0.8) return "Strong — consistently verified across multiple high-quality sources";
    if (brandConfidence >= 0.5) return "Moderate — supported by some evidence but not uniformly verified";
    if (brandConfidence > 0) return "Limited — weak evidence for brand claims";
    return "Unverified — no reliable evidence for brand strength claims";
  };

  return {
    companyName: c?.name?.value || "Unknown",
    industry: f?.industry?.value ?? c?.industry?.value ?? null,
    sector: f?.sector?.value ?? null,
    founded: h?.founded?.value ?? null,
    founders: (l?.founders?.value as string[]) ?? [],
    description: c?.description?.value ?? null,
    ceo: l?.ceo?.value ?? null,
    revenue: {
      value: f?.revenue?.value ?? null,
      currency: f?.revenueCurrency?.value ?? null,
      year: null,
    },
    marketCap: {
      value: f?.marketCap?.value ?? null,
      currency: f?.marketCapCurrency?.value ?? null,
    },
    employees: f?.employees?.value ?? null,
    operatingCountries: null,
    primaryRevenueDriver: null,
    businessModel: (b?.businessSegments?.value as string[]) ?? [],
    businessSegments: (b?.businessSegments?.value as string[]) ?? [],
    namedProducts: (p?.items?.value as string[]) ?? [],
    namedBrands: (p?.brands?.value as string[]) ?? [],
    brandStrength: { score: Math.round(brandConfidence * 10), assessment: getBrandAssessment() },
    scaleAdvantage: { score: Math.round(scaleConfidence * 10), assessment: scaleConfidence > 0.5 ? "Evidence of scale advantages exists" : "No strong evidence of scale moat" },
    switchingCosts: { score: Math.round(switchConfidence * 10), assessment: switchConfidence > 0.5 ? "Evidence of switching costs exists" : "No strong evidence of customer lock-in" },
    networkEffects: { score: Math.round(networkConfidence * 10), assessment: networkConfidence > 0.5 ? "Evidence of network effects exists" : "No strong evidence of network effects" },
    moatSummary: brandConfidence > 0.7 ? "Strong brand moat supported by evidence" : brandConfidence > 0.3 ? "Moderate brand evidence — claims should be tempered" : "Limited brand evidence — avoid strong brand claims",
    recentMilestones: (knowledge.news?.slice(0, 5)?.map((n: { title: string }) => n.title) ?? []),
    evidenceSources: [...sources],
    extractedAt: new Date().toISOString(),
  };
}
