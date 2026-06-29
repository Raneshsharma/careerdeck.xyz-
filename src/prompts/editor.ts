import type { CompanyKnowledgeBase } from "../knowledge/types";

const SYSTEM_PROMPT = `You are a Senior Editorial Reviewer at McKinsey. Your job: verify a generated dossier section against the Company Knowledge Base and improve it.

CRITICAL RULES:
- Use ONLY facts from the Knowledge Base. NEVER introduce new facts, data, or names.
- If a claim is NOT supported by any KB field, REMOVE IT.
- If the KB has null for a field (revenue, ceo, founded, market cap), do NOT include that data.

CORE FACTS CROSS-CHECK — before anything else, verify these core claims against the KB:
- Company identity: industry, sector, business description must match KB exactly.
- Leadership: CEO, founders must match KB. If null in KB, no claim about CEO/founders is valid.
- Financials: revenue, market cap, employees — must match KB values. If null, do NOT mention.
- Competitive position: brand strength, moat, market leadership claims must be supported by KB facts.
- Products: named products/segments must exist in KB.
- Dates: founding year, milestones, news events — must match KB exactly.

If you find any statement in the section that contradicts these core facts, REMOVE it immediately.

QUANTITATIVE ENFORCEMENT — this is the SINGLE most important rule:
- The section MUST contain minimum 3 specific numbers, named products, named segments, or specific dates from the KB.
- Replace EVERY vague adjective ("large", "growing", "strong", "significant", "high", "rapid", "substantial") with specific numbers from the KB.
- Bad: "operates in many cities" → MUST become: "operates in 800+ cities" (if KB has country/city count)
- Bad: "generates significant revenue" → MUST become: "generated $383.3B in revenue (FY2024)" (if KB has revenue)
- Bad: "has a large workforce" → MUST become: "employs 160,000+ people" (if KB has employee count)
- Bad: "was founded in the early 2000s" → MUST become: "founded in 2008" (if KB has founded year)
- Bad: "offers multiple products" → MUST become: "offers iPhone, Mac, iPad, Services, and Wearables" (if KB has named products)
- If KB has a number for ANY claim in the section, USE IT. Never use an adjective where a number exists.
- If the section has fewer than 3 specific numbers/named facts after your edit, rewrite it until it does.

CONFIDENCE-AWARE LANGUAGE:
- Claims directly supported by financial statements, annual reports, or verified Yahoo Finance data: state confidently.
- Claims inferred from company description, news, or Wikipedia: soften with "Evidence suggests..." or "Public data indicates..."
- Claims with NO KB support: REMOVE entirely. Do not soften — delete.

CONTRADICTION DETECTION (CRITICAL):
- Compare EVERY claim in this section against the CORE_FACTS provided below. If CORE_FACTS says brand is "unverified", NO section may claim "strong brand". Period.
- If this section contradicts another section ON ANY IMMUTABLE FACT (brand, revenue, leadership, moat, competitive position, founder, industry), flag and fix the contradiction. Use the core facts as the single source of truth.
- Example: if CORE_FACTS shows no brand data → remove "strong brand recognition" from this section.
- Example: if another section says "unverified brand" but this section says "brand leader" → fix this section to match the core facts AUTHORITATIVELY.

EXECUTIVE INSIGHT (MANDATORY):
- Every section MUST end with a bolded **Executive Insight:** line.
- Even if data is limited, add a meaningful insight: "**Executive Insight:** [one-sentence strategic takeaway about what the available data suggests]."
- If the section does not end with **Executive Insight:**, ADD IT. This is a hard requirement.

REVIEW CHECKLIST:
1. Accuracy: every factual claim matches the KB. Flag unsupported claims.
2. Completeness: are all available verified facts used?
3. Business Insight: does the section explain WHY this matters?
4. Quantitative: every paragraph includes at least one specific number or named fact from the KB.
5. Generic Content: remove statements that could apply to any company.
6. Hallucinations: flag any claim not supported by the KB.
7. Consistency: flag any claim that contradicts the cross-section summary.

RESPONSE FORMAT — output ONLY valid JSON:
{
  "revised_section": "the complete revised markdown section",
  "score": {
    "accuracy": 0, "completeness": 0, "clarity": 0,
    "business_insight": 0, "interview_relevance": 0,
    "quantitative_quality": 0, "overall": 0
  },
  "changes_made": ["specific change"],
  "issues_found": ["issue"],
  "contradictions_removed": ["claim that was removed due to conflict with KB or cross-section summary"]
}

Score each 0-10. overall = average rounded to 1 decimal.
Do not include any text outside the JSON.`;

export function buildEditorPrompt(
  knowledge: CompanyKnowledgeBase,
  sectionName: string,
  originalSection: string,
  companyName: string,
  crossSectionContext?: string,
  coreFactsSummary?: string,
): { systemPrompt: string; userPrompt: string } {
  const coreFacts = {
    identity: {
      industry: knowledge.financials?.industry?.value ?? knowledge.company?.industry?.value ?? null,
      sector: knowledge.financials?.sector?.value ?? null,
      description: knowledge.company?.description?.value ?? null,
      founded: knowledge.history?.founded?.value ?? null,
      founders: knowledge.leadership?.founders?.value ?? [],
      website: knowledge.website?.officialWebsite?.value ?? null,
    },
    leadership: {
      ceo: knowledge.leadership?.ceo?.value ?? null,
    },
    financials: {
      revenue: knowledge.financials?.revenue?.value ?? null,
      marketCap: knowledge.financials?.marketCap?.value ?? null,
      employees: knowledge.financials?.employees?.value ?? null,
      country: knowledge.financials?.country?.value ?? null,
    },
    products: {
      items: knowledge.products?.items?.value ?? [],
      brands: knowledge.products?.brands?.value ?? [],
      segments: knowledge.business?.businessSegments?.value ?? [],
    },
    competitive: {
      brandScore: null, // not directly in KB, infer from evidence
      scale: knowledge.financials?.marketCap?.value ? "public with market cap data" : "no scale data" as const,
    },
  };

  const kb = JSON.stringify(
    {
      CORE_FACTS: coreFacts,
      FULL_KB: {
        company: knowledge.company,
        financials: knowledge.financials,
        leadership: knowledge.leadership,
        history: knowledge.history,
        products: knowledge.products,
        business: knowledge.business,
        newsTitles: knowledge.news?.slice(0, 5).map((n: { title: string }) => n.title) ?? [],
      },
    },
    null,
    2,
  );

  const crossRef = crossSectionContext
    ? `\nCROSS-SECTION CONTEXT (what other sections say — check for contradictions):\n${crossSectionContext}`
    : "";
  const coreRef = coreFactsSummary
    ? `\nIMMUTABLE CORE FACTS (authoritative — NO section may contradict these):\n${coreFactsSummary}`
    : "";

  return {
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: `Review the "${sectionName}" section for ${companyName}.

KB (your ONLY source):
${kb}

ORIGINAL SECTION:
${originalSection}${crossRef}${coreRef}

STEPS:
1. Cross-check every factual claim in the section against CORE_FACTS above. Remove any contradiction.
2. Replace vague adjectives with specific numbers from the KB wherever possible.
3. Soften confidence for inferred claims, delete unsupported claims entirely.
4. Ensure the section explains WHY, not just WHAT.
5. BRAND CLAIM CHECK: If CORE_FACTS shows no brand data (brandStrength.score is 0 or assessment says "Unverified"), scan the section for ANY phrase about "strong brand", "brand recognition", "brand loyalty", "brand leader", "brand power", "well-known brand" — REMOVE all of them. No section may claim brand strength without evidence.

Return ONLY the JSON. No other text.`,
  };
}

export interface EditorResult {
  revised_section: string;
  score: {
    accuracy: number;
    completeness: number;
    clarity: number;
    business_insight: number;
    interview_relevance: number;
    quantitative_quality: number;
    overall: number;
  };
  changes_made: string[];
  issues_found: string[];
  contradictions_removed: string[];
}
