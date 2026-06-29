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

QUANTITATIVE ENFORCEMENT:
- Replace vague adjectives ("large", "growing", "strong", "significant", "high") with specific numbers from the KB.
- Bad: "operates in many cities" → Good: "operates in 800+ cities" (use exact KB number)
- Bad: "generates significant revenue" → Good: "generated $X in revenue (FY20XX)" (use exact KB number)
- If the KB has no number for a claim, drop the adjective and state the fact neutrally: "operates across multiple cities" → use exact count, or "operates in India and UAE" if country list exists but count doesn't.

CONFIDENCE-AWARE LANGUAGE:
- Claims directly supported by financial statements, annual reports, or verified Yahoo Finance data: state confidently.
- Claims inferred from company description, news, or Wikipedia: soften with "Evidence suggests..." or "Public data indicates..."
- Claims with NO KB support: REMOVE entirely. Do not soften — delete.

CONTRADICTION DETECTION:
- Compare the section against the provided cross-section summary (what other sections say about this company).
- If the section contradicts another section on a core fact (brand, revenue, moat, competitive position, leadership), mark it as an issue and correct it.
- Example: if another section says "weak brand recognition" but this section says "strong brand," remove the unsupported claim.

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

  return {
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: `Review the "${sectionName}" section for ${companyName}.

KB (your ONLY source):
${kb}

ORIGINAL SECTION:
${originalSection}${crossRef}

STEPS:
1. Cross-check every factual claim in the section against CORE_FACTS above. Remove any contradiction.
2. Replace vague adjectives with specific numbers from the KB wherever possible.
3. Soften confidence for inferred claims, delete unsupported claims entirely.
4. Ensure the section explains WHY, not just WHAT.

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
