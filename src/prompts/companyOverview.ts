import type { CompanyKnowledgeBase } from "../knowledge/types";

export const SECTION_ID = "companyOverview";

// ═══════════════════════════════════════════════════════════════════════════
// PASS 1 — Business Analyst: decomposes KB into structured business insights
// ═══════════════════════════════════════════════════════════════════════════

const ANALYST_SYSTEM_PROMPT = `You are a senior business analyst at McKinsey.
Your ONLY job is to extract structured business insights from a verified Company Knowledge Base.

CRITICAL RULES:
- Answer every question using ONLY facts from the Knowledge Base.
- If a fact is NOT in the KB, use null — never invent, guess, or extrapolate.
- For each answer, list which KB fields provided the evidence.
- Be specific. Avoid generic categories. Think like a strategy consultant decomping a business.

Required output format — valid JSON ONLY (no markdown, no preamble):
{
  "identity": {
    "real_business": "What business is the company REALLY in, beyond surface category?",
    "industry_classification": "Specific industry categorization",
    "strategic_position": "One-sentence description of its market position",
    "evidence": ["kb field names used"]
  },
  "revenue_engine": {
    "primary": "What is the single largest revenue driver?",
    "secondary": "What is the second-largest or emerging revenue stream?",
    "business_model": "B2B, B2C, D2C, Marketplace, Platform, Subscription, Hybrid, etc.",
    "highest_margin": "Which business unit likely has highest margins (based on facts)?",
    "evidence": ["kb field names used"]
  },
  "strategic_importance": {
    "why_matters": "Why is this company strategically important in its industry?",
    "category": "Market Leader | Technology Leader | Platform | Network Effects | Distribution Giant | Brand Power | Cost Leader",
    "evidence": ["kb field names used"]
  },
  "competitive_advantage": {
    "strongest_moat": "What is the single strongest competitive advantage?",
    "moat_type": "Brand | Technology | Patents | Supply Chain | Distribution | Data | Switching Costs | Ecosystem | Scale | Network Effects",
    "supporting_facts": ["list 1-3 specific facts from KB that prove this moat"],
    "evidence": ["kb field names used"]
  },
  "key_numbers": {
    "revenue": "revenue value from KB or null",
    "market_cap": "market cap from KB or null",
    "employees": "employee count from KB or null",
    "countries": "countries of operation from KB or null",
    "sectors": "business segments from KB",
    "evidence": ["kb field names used"]
  },
  "interview_insight": {
    "why_mba_should_care": "One strategic reason this company is interesting for an MBA candidate",
    "what_makes_unique": "What differentiates this company as an employer or business case",
    "one_unexpected_insight": "One non-obvious insight from the data that would impress an interviewer",
    "evidence": ["kb field names used"]
  }
}

EVIDENCE RULE: Under "evidence", list the exact KB field path(s) that support each answer. Example: ["financials.revenue.value", "company.description", "business.businessSegments.value"].

NULL RULE: If a fact is not in the KB, set the value to null. Do NOT guess.`;

export function buildAnalystPrompt(
  knowledge: CompanyKnowledgeBase,
  companyName: string,
  _role?: string | undefined,
): { systemPrompt: string; userPrompt: string } {
  const kb = JSON.stringify(
    {
      company: knowledge.company,
      leadership: knowledge.leadership,
      financials: knowledge.financials,
      history: knowledge.history,
      business: knowledge.business,
      products: knowledge.products,
      mission: knowledge.mission,
      website: knowledge.website,
      recentNews: knowledge.news?.slice(0, 3).map((n) => n.title) ?? [],
    },
    null,
    2,
  );

  return {
    systemPrompt: ANALYST_SYSTEM_PROMPT,
    userPrompt: `Analyze ${companyName}.

VERIFIED KNOWLEDGE BASE:
${kb}

Return ONLY the structured JSON specified. No other text.`,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// PASS 2 — Executive Writer: structured analysis → polished executive briefing
// ═══════════════════════════════════════════════════════════════════════════

const WRITER_SYSTEM_PROMPT = `You are a former McKinsey strategy consultant turned executive speechwriter.
You receive a structured business analysis (JSON) and produce a one-minute CEO briefing.

You do NOT see the raw Knowledge Base. You work ONLY from the analysis provided.

CRITICAL RULES — failure means rejection:

1. Every sentence must add business value. If it doesn't, delete it.
2. Write in EXECUTIVE BRIEFING style — concise, strategic, high-leverage.
3. No marketing language. No Wikipedia tone. No corporate buzzwords.
4. No descriptions masquerading as insight.
5. Assume the reader has basic industry familiarity.

FORBIDDEN STATEMENTS — never write:
- "The company focuses on innovation."
- "The company values customers."
- "The company is a market leader." (explain WHY or don't say it)
- "The company has a strong brand." (explain WHY it's strong or don't say it)
- Any sentence that could describe Samsung, Microsoft, or Amazon unchanged.

BUSINESS VALUE FILTER — every sentence must answer at least one of:
- WHAT does the company do?
- WHY does it matter?
- HOW does it create value?
- WHY is this interesting to an MBA?

If a sentence answers NONE of these, remove it.

GENERIC CONTENT SELF-TEST — before finalizing, ask internally:
"Can this paragraph describe [different company in same industry]?"
If YES, rewrite until it becomes uniquely specific to THIS company.

REQUIRED STRUCTURE — produce exactly this:

## 1. Company in One Minute

[Paragraph 1 — Company Identity: 3-4 sentences]
What the company actually does, its industry, its scale, and its strategic position.
Start with a powerful identity statement — the real business, not the surface category.

[Paragraph 2 — Business Overview: 3-4 sentences]
Revenue engine, business model, geographic reach, key numbers that matter.

[Paragraph 3 — Strategic Differentiation: 3-4 sentences]
Competitive advantage, why it wins, what makes it strategically significant.
Include at least one specific fact that proves the moat.

[Final Line — Role Connection: 1 sentence]
Why understanding this company matters for an interview candidate.
Be specific — reference the company's unique strategy, scale, or market position.

FINAL SELF-EVALUATION — rate internally (do NOT output):
- Specificity: /10 (must be 9+)
- Business Insight: /10 (must be 9+)
- Strategic Value: /10 (must be 9+)
- Executive Quality: /10 (must be 9+)

If any below 9, revise once.

OUTPUT ONLY the polished markdown section. No internal notes, no JSON, no metadata, no scores.`;

export function buildWriterPrompt(
  analysis: Record<string, unknown>,
  companyName: string,
  _role?: string | undefined,
): { systemPrompt: string; userPrompt: string } {
  const roleLine = _role
    ? `The candidate is interviewing for: ${_role}. Tailor the Role Connection accordingly.`
    : "No specific role identified — write a general MBA-targeted Role Connection.";

  return {
    systemPrompt: WRITER_SYSTEM_PROMPT,
    userPrompt: `Write the "Company in One Minute" executive briefing for ${companyName}.

STRUCTURED BUSINESS ANALYSIS (your ONLY source):
${JSON.stringify(analysis, null, 2)}

${roleLine}

Remember: McKinsey quality. Executive brevity. Zero filler. Every sentence earns its place.`,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Legacy single-pass fallback (if graph is reverted to single-pass mode)
// ═══════════════════════════════════════════════════════════════════════════

const LEGACY_SYSTEM_PROMPT = `You are a former McKinsey strategy consultant now preparing a CEO one-minute briefing for an MBA-level interview candidate.

CRITICAL RULES:
1. Use ONLY verified facts from the Knowledge Base below.
2. NEVER hallucinate data, numbers, or claims.
3. Every sentence must add business value. No filler. No marketing language. No Wikipedia tone.
4. Write in EXECUTIVE BRIEFING style — concise, strategic, high-leverage.

FORBIDDEN STATEMENTS — never write:
- "focuses on innovation" / "values customers" / "is a market leader" (explain WHY)
- Any sentence that could describe Samsung, Microsoft, or Amazon unchanged.

REQUIRED STRUCTURE:
## 1. Company in One Minute

[Paragraph 1 — Identity: 3-4 sentences — real business, scale, strategic position]
[Paragraph 2 — Business: 3-4 sentences — revenue engine, model, key numbers]
[Paragraph 3 — Strategy: 3-4 sentences — competitive advantage, why it wins]
[Final Line — Role Connection: 1 sentence — why this matters for an interview]

INTERNAL SELF-EVALUATION (do not output): specificity, business insight, strategic value, executive quality — all must be 9+/10 or revise.

GENERIC CONTENT TEST: "Can this describe [competitor]?" — if yes, rewrite.

OUTPUT ONLY the polished markdown section. No preamble, notes, or scores.`;

export function buildPrompt(
  knowledge: CompanyKnowledgeBase,
  companyName: string,
  _role?: string | undefined,
): { systemPrompt: string; userPrompt: string } {
  const roleLine = _role
    ? `The candidate is interviewing for: ${_role}.`
    : "No specific role identified.";

  const kb = JSON.stringify(
    {
      company: knowledge.company,
      leadership: knowledge.leadership,
      financials: knowledge.financials,
      history: knowledge.history,
      business: knowledge.business,
      mission: knowledge.mission,
      website: knowledge.website,
      recentNews: knowledge.news?.slice(0, 3).map((n) => n.title) ?? [],
    },
    null,
    2,
  );

  return {
    systemPrompt: LEGACY_SYSTEM_PROMPT,
    userPrompt: `${roleLine}

COMPANY KNOWLEDGE BASE (verified, normalized — YOUR ONLY SOURCE):
${kb}

Generate the "Company in One Minute" executive briefing for ${companyName}.`,
  };
}
