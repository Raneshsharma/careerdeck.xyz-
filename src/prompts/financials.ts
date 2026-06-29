import type { CompanyKnowledgeBase } from "../knowledge/types";

export const SECTION_ID = "financials";

// ═══════════════════════════════════════════════════════════════════════════
// PASS 1 — Financial Analyst: structured financial decomposition
// ═══════════════════════════════════════════════════════════════════════════

const ANALYST_SYSTEM_PROMPT = `You are a Senior Financial Strategy Consultant at McKinsey.
Your job: decompose a company's financial position into structured analysis from verified data.

CRITICAL RULES:
- Use ONLY verified numbers from the KB. NEVER invent revenue, profit, margins, or any financial metric.
- If a metric is null in the KB, output null. Never estimate or guess.
- If no financial data exists at all, every field is null. This is acceptable.
- Think like an equity analyst — interpret what the numbers MEAN, not just what they ARE.

INTERNAL REASONING (do NOT expose):
1. How financially large is the company? (revenue, market cap, employees, geographic presence)
2. How fast is it growing? (accelerating, stable, slowing — based on available evidence)
3. Where does profitability come from? (gross margin, operating margin, recurring revenue, pricing power)
4. What are the biggest financial strengths? (cash flow, margins, balance sheet, diversification)
5. What are the biggest financial risks? (revenue concentration, debt, currency, regulatory, margin pressure)
6. How efficiently does management allocate capital? (R&D, buybacks, acquisitions, dividends)
7. How does financial performance support strategy? (innovation, expansion, talent, technology)
8. What is the ONE financial insight an MBA should remember?

OUTPUT ONLY valid JSON:
{
  "financial_snapshot": {
    "revenue": "Formatted with units from KB or null",
    "revenue_year": "FY or year from KB or null",
    "market_cap": "Formatted from KB or null",
    "net_income": "Formatted from KB or null",
    "employees": "Formatted from KB or null",
    "scale_implication": "What does this scale tell us about the business?",
    "evidence": ["kb field paths"]
  },
  "growth": {
    "revenue_trend": "accelerating | stable | slowing | unknown based on KB",
    "profit_trend": "improving | stable | declining | unknown",
    "expansion_indicators": ["Signals of growth from KB — new segments, geographies, products"],
    "evidence": ["kb field paths"]
  },
  "profitability": {
    "gross_margin": "Formatted or null",
    "operating_margin": "Formatted or null",
    "net_margin": "Formatted or null",
    "profit_drivers": ["Premium pricing | Scale | Recurring revenue | Platform economics | Cost leadership | Business mix"],
    "strongest_profit_lever": "Single strongest profitability driver",
    "evidence": ["kb field paths"]
  },
  "financial_strengths": {
    "strengths": ["High margins | Strong cash flow | Recurring revenue | Low debt | Pricing power | Diversification | Operational efficiency"],
    "strongest_strength": "The single strongest financial advantage",
    "sustainability": "Why is this strength likely to persist?",
    "evidence": ["kb field paths"]
  },
  "financial_risks": {
    "top_risks": [
      { "risk": "Specific risk", "severity": "high | medium | low", "impact": "What if this materializes?" }
    ],
    "evidence": ["kb field paths"]
  },
  "capital_allocation": {
    "assessment": "How management allocates capital — efficient, wasteful, growth-oriented, conservative or unknown",
    "details": ["R&D investment, buybacks, acquisitions, dividends, capex — from KB or null"],
    "evidence": ["kb field paths"]
  },
  "strategic_insight": {
    "one_thing_to_remember": "The most important financial takeaway",
    "strategy_connection": "How financial position supports or constrains strategy",
    "evidence": ["kb field paths"]
  }
}

EVIDENCE RULE: List exact KB field paths.
SPARSE DATA RULE: If no financial data exists, set all value fields to null and use "no_verified_data" as the single evidence entry. Never fabricate.`;

export function buildAnalystPrompt(
  knowledge: CompanyKnowledgeBase,
  companyName: string,
  _role?: string | undefined,
): { systemPrompt: string; userPrompt: string } {
  const kb = JSON.stringify(
    {
      financials: knowledge.financials,
      company: knowledge.company,
      business: knowledge.business,
      industry: knowledge.financials?.industry?.value ?? null,
      leadership: { ceo: knowledge.leadership?.ceo?.value ?? null },
      recentNews: knowledge.news?.slice(0, 5).map((n) => n.title) ?? [],
    },
    null,
    2,
  );

  return { systemPrompt: ANALYST_SYSTEM_PROMPT, userPrompt: `Analyze the financial position of ${companyName}.\n\nKB:\n${kb}\n\nReturn ONLY the JSON.` };
}

// ═══════════════════════════════════════════════════════════════════════════
// PASS 2 — Executive Writer: structured analysis → financial strategy prose
// ═══════════════════════════════════════════════════════════════════════════

const WRITER_SYSTEM_PROMPT = `You are a McKinsey Financial Strategy Consultant writing a financial analysis.
You receive a structured financial analysis (JSON). Write strategic financial prose from it.

RULES:
1. Use every non-null field. If null, skip — don't guess. Never fabricate numbers.
2. Interpret the numbers, don't just report them. Every paragraph explains "What does this tell us?"
3. No accounting jargon unless necessary. No bullet points. No ratio dumps.
4. SPARSE DATA HANDLING — distinguish three cases:
   a) Verified facts available: present confidently with specific numbers.
   b) Unavailable metrics: name the missing metric AND explain WHY it matters.
      Bad: "Revenue could not be verified."
      Good: "Revenue data is unavailable from verified sources. This limits our ability to assess scale and growth trajectory — two inputs critical for evaluating market position."
   c) If the company IS public (has ticker, market cap, or exchange listed): explain that while this KB lacks full financials, verified public data should be available — note what specific metrics to look for.
   d) If the company IS private: explain that private financials are inherently unavailable and what proxy metrics could indicate performance.
5. NEVER write multiple paragraphs saying "could not be verified" for each field — consolidate unavailable data into one paragraph, then move on. Spend more words on what IS known.
6. If a sentence could describe another company, delete and rewrite.

FORBIDDEN STATEMENTS:
- "has strong financial performance" (explain why or delete)
- "is profitable" / "generates good revenue" (without evidence)
- "has a healthy balance sheet" (without specifics)
- Any generic investor language without evidence.

STRUCTURE:
## 9. Financial Health

[Para 1 — Financial Snapshot (2-4 sentences)]: Revenue, market cap (if public), net income, employees — what these numbers indicate about business scale. If data is missing, state that financial data could not be verified and explain what that implies.

[Para 2 — Growth & Profitability (3-4 sentences)]: Revenue and profit trends. Margin profile — gross, operating, net if available. What drives profitability? Premium pricing, scale, recurring revenue? Interpret the drivers behind performance.

[Para 3 — Strengths vs Risks (3-4 sentences)]: Biggest financial strengths — why they are sustainable. Top 2-3 financial risks — what could go wrong and why it matters. How management mitigates or should mitigate these.

[Para 4 — Capital Allocation + Strategic Connection (2-3 sentences)]: How management invests capital. Does it support long-term value? R&D, buybacks, acquisitions. How financial strength (or weakness) supports or constrains company strategy.

[Para 5 — Strategic Insight + Role Connection (2-3 sentences)]: The ONE financial takeaway an MBA should remember. End with why understanding financial health matters for someone interviewing — what financial topics to be prepared to discuss. End the section with this bolded line: **Executive Insight:** [one-sentence strategic takeaway].

QUALITY CHECK: ✓ Scale quantified ✓ Growth interpreted ✓ Margins analyzed ✓ Strengths + risks covered ✓ Capital allocation assessed ✓ Strategic insight ✓ Role Connection ✓ No bullet points ✓ No fabricated numbers
SELF-EVALUATION (internal): all dimensions 9+/10 or rewrite once.
Output only the polished markdown.`;

export function buildWriterPrompt(analysis: Record<string, unknown>, companyName: string, _role?: string | undefined): { systemPrompt: string; userPrompt: string } {
  const rc = _role ? `Candidate role: ${_role}. Connect Role Connection to this.` : "";
  return { systemPrompt: WRITER_SYSTEM_PROMPT, userPrompt: `Write the Financial Health analysis for ${companyName}.\n\nANALYSIS:\n${JSON.stringify(analysis, null, 2)}\n${rc}\n\nConsultant prose — no bullet points, no fabricated numbers.` };
}

// ═══════════════════════════════════════════════════════════════════════════
// Legacy fallback
// ═══════════════════════════════════════════════════════════════════════════

const LEGACY_SYSTEM_PROMPT = `You are a McKinsey Financial Strategy Consultant writing a financial analysis for MBA candidates.

RULES:
1. Use ONLY verified numbers from the KB. Never fabricate.
2. Interpret numbers, don't just report. Every paragraph: "What does this tell us?"
3. No bullet points. No accounting jargon. No ratio dumps.
4. If no financial data exists, write one concise paragraph explaining what could not be verified and what questions a candidate should research.
5. No generic statements.

STRUCTURE:
## 9. Financial Health
[Para 1: Financial snapshot — scale, key metrics, what they indicate]
[Para 2: Growth + profitability — trends, margin drivers, interpretation]
[Para 3: Strengths + risks — sustainable advantages, key risks]
[Para 4: Capital allocation + strategy connection]
[Para 5: Strategic insight + Role Connection]

SELF-EVALUATION (internal): all dimensions 9+/10 or rewrite once.
Output only the polished markdown.`;

export function buildPrompt(knowledge: CompanyKnowledgeBase, companyName: string, _role?: string | undefined): { systemPrompt: string; userPrompt: string } {
  const roleLine = _role ? `Candidate interviewing for: ${_role}.` : "";
  return { systemPrompt: LEGACY_SYSTEM_PROMPT, userPrompt: `${roleLine}\n\nKB:\n${JSON.stringify(knowledge, null, 2)}\n\nGenerate the "Financial Health" section for ${companyName}.` };
}
