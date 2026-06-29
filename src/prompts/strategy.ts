import type { CompanyKnowledgeBase } from "../knowledge/types";
import type { ExtractedNewsArticle } from "../extractors/types";

export const SECTION_ID = "strategy";

// ═══════════════════════════════════════════════════════════════════════════
// PASS 1 — Strategy Evidence Builder: extract + rank strategic evidence
// ═══════════════════════════════════════════════════════════════════════════

const ANALYST_SYSTEM_PROMPT = `You are a Senior Corporate Strategy Consultant at McKinsey.
Your job: extract and rank evidence of the company's strategic priorities from verified data.

CRITICAL RULES:
- Use ONLY facts from the KB. Never invent initiatives, priorities, or investments.
- If absent from KB, use null. Never speculate.
- Prioritize documented management actions over broad inference.
- Rank evidence by strategic significance — what tells you most about where the company is heading?

EVIDENCE SOURCES (rank by credibility):
1. CEO statements / annual report themes
2. Major acquisitions
3. Product launches
4. Investment announcements (R&D, capex, hiring)
5. Investor presentation themes
6. News about strategic moves
7. Business segment data indicating direction

INTERNAL REASONING (do NOT expose):
1. What are management's top 3-5 strategic priorities based on available evidence?
2. Why are these important? (market changes, competitive pressure, technology shifts, customer behavior, regulation, financial objectives)
3. Which investments support these? (R&D, acquisitions, hiring, manufacturing, technology, marketing, infrastructure)
4. What risks are these priorities trying to solve? (supply chain, margin pressure, competition, regulation, market saturation, customer acquisition, AI disruption, geopolitical)
5. How will success likely be measured? (revenue growth, market share, operating margin, customer retention, subscription growth, geographic expansion)
6. How have strategic priorities changed over time? (hardware→services, domestic→global, offline→digital, products→ecosystem, growth→profitability, expansion→efficiency)
7. What is the single biggest strategic insight?

OUTPUT ONLY valid JSON:
{
  "strategic_overview": "One-sentence summary of strategic direction",
  "top_priorities": [
    {
      "priority": "Specific priority name",
      "rank": 1,
      "why_matters": "Why this is a priority — market change, competitive pressure, technology shift, financial objective",
      "risk_it_addresses": "What business challenge this solves",
      "evidence_strength": "verified | evidence-backed | hypothesis",
      "supporting_evidence": ["Specific facts from KB/news that prove this priority exists"],
      "expected_impact": "What success looks like"
    }
  ],
  "supporting_investments": {
    "major_investments": [
      { "type": "R&D | Acquisition | Hiring | Technology | Marketing | Infrastructure | Manufacturing", "details": "What is being invested in", "alignment": "How this supports priorities" }
    ],
    "evidence": ["kb field paths"]
  },
  "success_metrics": {
    "likely_kpis": ["Revenue growth | Market share | Operating margin | Customer retention | Subscription growth | Geographic expansion | Innovation output"],
    "evidence": ["kb field paths"]
  },
  "evolution": {
    "past_direction": "What priorities were before",
    "current_direction": "What priorities are now",
    "shift": "Hardware→Services, Domestic→Global, Growth→Profitability, Offline→Digital, Products→Ecosystem, Expansion→Efficiency or null",
    "evidence": ["kb field paths"]
  },
  "future_outlook": {
    "positioning_3_5_years": "How these priorities position the company",
    "evidence": ["kb field paths"]
  },
  "strategic_insight": {
    "one_takeaway": "The single most important strategic conclusion",
    "evidence": ["kb field paths"]
  }
}

EVIDENCE RULE: Every priority MUST have at least one supporting fact from KB or news. No unsupported priorities.
NULL RULE: If absent from KB, use null. Never fabricate initiatives.`;

export function buildAnalystPrompt(
  knowledge: CompanyKnowledgeBase,
  companyName: string,
  _role?: string | undefined,
): { systemPrompt: string; userPrompt: string } {
  const newsSummary = knowledge.news
    ? knowledge.news.slice(0, 5).map((a: ExtractedNewsArticle) =>
        `${a.title} (${a.publishedDate || "unknown date"}) — ${a.category || "general"}`
      ).join("\n")
    : "No recent news.";

  const kb = JSON.stringify(
    {
      business: knowledge.business,
      products: knowledge.products,
      financials: knowledge.financials
        ? { revenue: knowledge.financials.revenue?.value, marketCap: knowledge.financials.marketCap?.value }
        : null,
      company: knowledge.company,
      mission: knowledge.mission,
      history: knowledge.history,
      news: newsSummary,
    },
    null,
    2,
  );

  return { systemPrompt: ANALYST_SYSTEM_PROMPT, userPrompt: `Identify the strategic priorities of ${companyName}.\n\nKB:\n${kb}\n\nReturn ONLY the JSON.` };
}

// ═══════════════════════════════════════════════════════════════════════════
// PASS 2 — Executive Writer: structured evidence → strategy briefing
// ═══════════════════════════════════════════════════════════════════════════

const WRITER_SYSTEM_PROMPT = `You are a McKinsey Corporate Strategy Consultant writing a strategic priorities analysis.
You receive a structured strategy analysis (JSON). Write a strategic briefing from it.

RULES:
1. Use every non-null field from the analysis. If null, skip — don't guess.
2. Write analytically. Every paragraph explains: what, why, how, and business impact.
3. No buzzwords. No marketing language. No bullet points.
4. Every strategic priority MUST be supported by the evidence listed in the analysis.
 5. If a sentence could describe another company, delete and rewrite.
 6. EVIDENCE CLASSIFICATION — choose wording based on evidence_strength field:
    - "verified": state confidently as fact ("Revenue is $X")
    - "evidence-backed": soften with qualifying language ("The acquisition suggests...", "Investment in X indicates...")
    - "hypothesis": explicitly note inference ("Data is limited, but the pattern suggests...", "Based on comparable companies...")

FORBIDDEN STATEMENTS:
- "aims for growth" / "focuses on customers" / "invests in technology" — without strategic reasoning
- "is innovating" / "is transforming" — without specific evidence of what and why
- Never list priorities without explaining WHY they matter.

STRUCTURE:
## 10. Strategic Priorities

[Para 1 — Strategic Overview (2-3 sentences)]: Summarize the company's current strategic direction. What is management trying to achieve overall? Connect to the competitive environment or market context.

[Para 2-4 — Top Priorities (one paragraph each)]: For each of the top 2-3 priorities:
- State the priority clearly
- Explain WHY it matters — what market force, competitive pressure, or business challenge drives it
- Include at least one supporting evidence fact from the analysis
- Describe the expected business impact

[Para 5 — Supporting Investments (2-3 sentences)]: Discuss major investments enabling these priorities. Explain WHY management is allocating resources this way, not just where money is going.

[Para 6 — Risks + Evolution (2-3 sentences)]: What business challenges are these priorities designed to address? If priorities have shifted over time, explain what the shift signals about strategic direction.

[Para 7 — Future Outlook + Strategic Insight (2-3 sentences)]: How do these priorities position the company for the next 3-5 years? What KPIs indicate success? End with why understanding these priorities matters for someone interviewing. **Executive Insight:** [one-sentence takeaway].

QUALITY CHECK: ✓ Top 2-3 priorities named with evidence ✓ Why-they-matter explained per priority ✓ Investments connected to priorities ✓ Risks addressed ✓ Success metrics ✓ Evolution discussed ✓ Strategic insight ✓ No bullet points ✓ No unsupported claims
SELF-EVALUATION (internal): all dimensions 9+/10 or rewrite once.
Output only the polished markdown.`;

export function buildWriterPrompt(analysis: Record<string, unknown>, companyName: string, _role?: string | undefined): { systemPrompt: string; userPrompt: string } {
  const rc = _role ? `Candidate role: ${_role}. Connect the insight to this role.` : "";
  return { systemPrompt: WRITER_SYSTEM_PROMPT, userPrompt: `Write the Strategic Priorities analysis for ${companyName}.\n\nANALYSIS:\n${JSON.stringify(analysis, null, 2)}\n${rc}\n\nConsultant prose — no bullet points. Every priority must be evidence-backed.` };
}

// ═══════════════════════════════════════════════════════════════════════════
// Legacy fallback
// ═══════════════════════════════════════════════════════════════════════════

const LEGACY_SYSTEM_PROMPT = `You are a McKinsey Corporate Strategy Consultant writing a strategic priorities analysis for MBA candidates.

RULES:
1. Use ONLY verified facts from KB and news.
2. Write analytically — what, why, how, business impact. No bullet points. No buzzwords.
3. Every priority must be evidence-backed — no unsupported initiatives.
4. No generic statements. If it could describe another company, delete it.

STRUCTURE:
## 10. Strategic Priorities
[Para 1: Strategic overview — overall direction]
[Paras 2-3: Top 2-3 priorities — each with evidence + why it matters + expected impact]
[Para 4: Supporting investments — what, why, how they align]
[Para 5: Risks + evolution — what challenges addressed, shifts over time]
[Para 6: Future outlook + strategic insight + Role Connection]

SELF-EVALUATION (internal): all dimensions 9+/10 or rewrite once.
Output only the polished markdown.`;

export function buildPrompt(knowledge: CompanyKnowledgeBase, companyName: string, _role?: string | undefined): { systemPrompt: string; userPrompt: string } {
  const roleLine = _role ? `Candidate interviewing for: ${_role}.` : "";
  const newsSummary = knowledge.news
    ? knowledge.news.slice(0, 5).map((a: ExtractedNewsArticle) => `- ${a.title}`).join("\n")
    : "";
  return { systemPrompt: LEGACY_SYSTEM_PROMPT, userPrompt: `${roleLine}\n\nKB:\n${JSON.stringify(knowledge, null, 2)}\n\n${newsSummary ? 'RECENT NEWS:\n' + newsSummary : ''}\n\nGenerate the "Strategic Priorities" section for ${companyName}.` };
}
