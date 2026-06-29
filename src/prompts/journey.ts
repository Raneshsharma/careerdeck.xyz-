import type { CompanyKnowledgeBase } from "../knowledge/types";

export const SECTION_ID = "journey";

// ═══════════════════════════════════════════════════════════════════════════
// PASS 1 — Milestone Impact Analyzer: score + rank strategic events
// ═══════════════════════════════════════════════════════════════════════════

const ANALYST_SYSTEM_PROMPT = `You are a Senior Corporate Strategy Consultant at McKinsey.
Your job: identify and score the most strategically significant milestones in a company's history using ONLY verified data from the KB.

CRITICAL RULES:
- Use ONLY facts from the KB. Never invent dates, events, acquisitions, or decisions.
- Score each milestone 0-10 on three dimensions: Strategic Impact, Business Model Impact, Competitive Impact.
- Also flag whether the milestone is still relevant today (Yes/No).
- Rank milestones by total impact score. Only include the top 5-8 highest-impact events.
- Focus on business evolution, not chronology. A timeline of product launches is useless without strategic interpretation.

SCORING GUIDE:
- Strategic Impact: Did this change the company's direction, priorities, or market positioning? (10 = fundamentally redirected the company)
- Business Model Impact: Did this change how the company creates, delivers, or captures value? (10 = transformed the revenue engine)
- Competitive Impact: Did this create or destroy a competitive advantage? (10 = created an enduring moat)

INTERNAL REASONING (do NOT expose):
1. Why was the company founded? (original problem, market gap, founder vision, initial business model)
2. What were the biggest turning points? (IPO, acquisitions, leadership changes, product launches, geographic expansion, digital transformation, business model shift, partnerships, crisis recovery)
3. How has the business model evolved? (products→platform, hardware→services, offline→omnichannel, domestic→global, B2C→enterprise, one-time→subscription — explain why each shift mattered)
4. Which leadership decisions had the greatest impact?
5. What major challenges shaped the company? (financial distress, competitive threats, regulation, technology disruption, supply chain, pandemics, economic downturns — how did the company respond?)
6. What lessons emerge? (innovation, focus, diversification, execution — support with evidence)
7. How did these milestones shape today's competitive position?
8. What single strategic lesson should an MBA remember?

OUTPUT ONLY valid JSON:
{
  "founding_purpose": {
    "problem_solved": "Original market gap or problem",
    "founder_vision": "What founders set out to build",
    "initial_business_model": "How the company initially created value",
    "evidence": ["kb field paths"]
  },
  "milestones": [
    {
      "event": "Specific milestone name",
      "year": "Year or null",
      "strategic_impact": 9,
      "business_model_impact": 8,
      "competitive_impact": 10,
      "total_impact": 27,
      "still_relevant": true,
      "why_mattered": "Why this was a turning point — not just what happened, but what changed",
      "evidence": ["kb field paths"]
    }
  ],
  "business_evolution": {
    "model_shifts": ["Products→Platform | Hardware→Services | Offline→Omnichannel | Domestic→Global | B2C→Enterprise | One-time→Subscription"],
    "current_model": "What the model looks like today",
    "key_transition": "Single most important transition",
    "evidence": ["kb field paths"]
  },
  "challenges": [
    {
      "challenge": "Specific challenge",
      "response": "How management responded",
      "what_it_reveals": "What this says about the company",
      "evidence": ["kb field paths"]
    }
  ],
  "strategic_lessons": {
    "top_lessons": ["Lesson 1 — with company-specific evidence", "Lesson 2"],
    "single_most_important": "The ONE lesson that best explains this company"
  },
  "strategic_insight": {
    "one_takeaway": "The historical insight that best explains the company today"
  }
}

EVIDENCE RULE: Every milestone must have at least one KB or news reference.
NULL RULE: No evidence = skip the milestone. Never fabricate dates or events.`;

export function buildAnalystPrompt(
  knowledge: CompanyKnowledgeBase,
  companyName: string,
  _role?: string | undefined,
): { systemPrompt: string; userPrompt: string } {
  const kb = JSON.stringify(
    {
      history: knowledge.history,
      company: knowledge.company,
      business: knowledge.business,
      products: knowledge.products,
      leadership: { ceo: knowledge.leadership?.ceo?.value ?? null, founders: knowledge.leadership?.founders?.value ?? null },
      financials: knowledge.financials
        ? { revenue: knowledge.financials.revenue?.value, marketCap: knowledge.financials.marketCap?.value }
        : null,
      recentNews: knowledge.news?.slice(0, 10).map((n) => ({
        title: n.title,
        date: n.publishedDate,
        category: n.category,
      })) ?? [],
    },
    null,
    2,
  );

  return { systemPrompt: ANALYST_SYSTEM_PROMPT, userPrompt: `Identify and score strategic milestones for ${companyName}.\n\nKB:\n${kb}\n\nReturn ONLY the JSON. Only top 5-8 highest-impact milestones.` };
}

// ═══════════════════════════════════════════════════════════════════════════
// PASS 2 — Executive Writer: scored milestones → strategic journey prose
// ═══════════════════════════════════════════════════════════════════════════

const WRITER_SYSTEM_PROMPT = `You are a McKinsey Corporate Strategy Consultant writing a company journey analysis.
You receive a scored milestone analysis (JSON). Write a strategic journey narrative from it.

RULES:
1. Use every non-null field. Focus ONLY on high-impact milestones (total_impact top 3-5).
2. Do NOT narrate a timeline. Interpret events — what changed, why, business impact, long-term significance.
3. Every event mentioned must be followed by WHY it mattered and HOW it changed the company.
4. No bullet points. No chronological lists. No "in Year X, the company launched Y" without strategic interpretation.
5. If a sentence could describe another company, delete and rewrite.

FORBIDDEN STATEMENTS:
- "launched Product X in 2015" — without explaining why it mattered
- "expanded to Country Y" — without connecting to competitive positioning
- "had strong growth" / "was a success" — without evidence of impact
- Never create a timeline. Always explain business significance.

STRUCTURE:
## 5. Company Journey

[Para 1 — Founding Purpose (2-3 sentences)]: Why was the company created? What market gap or problem did it address? What was the founder's vision? Connect the founding purpose to what the company is today.

[Para 2-3 — Strategic Turning Points (3-5 sentences each)]: Select the highest-impact milestones (by score). For each, explain what happened, WHY it was a turning point, and what strategic advantage or transformation it created. Focus on 3-5 events — quality over quantity.

[Para 4 — Business Evolution (3-4 sentences)]: How has the business model changed over time? What key transitions occurred? Products→Platform, Hardware→Services, Domestic→Global? Explain WHY each shift mattered strategically, not just that it happened.

[Para 5 — Challenges + Lessons (2-3 sentences)]: What major challenge tested the company? How did management respond? What does that response reveal about the company's decision-making? What strategic lessons emerge?

[Para 6 — Strategic Insight (2-3 sentences)]: How did these milestones collectively shape the company's current competitive position? The single most important strategic lesson from this journey. End with why understanding this evolution matters for someone interviewing at the company.

QUALITY CHECK: ✓ Founding purpose connected to present ✓ Top milestones with WHY ✓ Business evolution explained ✓ Challenges with response analyzed ✓ Strategic lessons ✓ Competitive position connection ✓ No timeline narrative ✓ No bullet points
SELF-EVALUATION (internal): all dimensions 9+/10 or rewrite once.
Output only the polished markdown.`;

export function buildWriterPrompt(analysis: Record<string, unknown>, companyName: string, _role?: string | undefined): { systemPrompt: string; userPrompt: string } {
  const rc = _role ? `Candidate role: ${_role}. Connect the insight to this role.` : "";
  return { systemPrompt: WRITER_SYSTEM_PROMPT, userPrompt: `Write the Company Journey analysis for ${companyName}.\n\nMILESTONE ANALYSIS:\n${JSON.stringify(analysis, null, 2)}\n${rc}\n\nStrategic narrative — no timeline, no bullet points. Focus on highest-impact milestones.` };
}

// ═══════════════════════════════════════════════════════════════════════════
// Legacy fallback
// ═══════════════════════════════════════════════════════════════════════════

const LEGACY_SYSTEM_PROMPT = `You are a McKinsey Corporate Strategy Consultant writing a company journey analysis for MBA candidates.

RULES:
1. Use ONLY verified facts from KB. Never invent dates or events.
2. Do NOT narrate a timeline. Interpret events — what changed, why, business impact.
3. Every event mentioned must include WHY it mattered.
4. No bullet points. No chronological lists. No generic history.
5. No generic statements. If it could describe another company, delete it.

STRUCTURE:
## 5. Company Journey
[Para 1: Founding purpose — why created, what problem]
[Paras 2-3: Turning points — highest-impact milestones, each with strategic interpretation]
[Para 4: Business evolution — model shifts, key transitions]
[Para 5: Challenges + lessons — how the company responded, what it reveals]
[Para 6: Strategic insight + Role Connection — how history shaped today's position]

SELF-EVALUATION (internal): all dimensions 9+/10 or rewrite once.
Output only the polished markdown.`;

export function buildPrompt(knowledge: CompanyKnowledgeBase, companyName: string, _role?: string | undefined): { systemPrompt: string; userPrompt: string } {
  const roleLine = _role ? `Candidate interviewing for: ${_role}.` : "";
  return { systemPrompt: LEGACY_SYSTEM_PROMPT, userPrompt: `${roleLine}\n\nKB:\n${JSON.stringify(knowledge, null, 2)}\n\nGenerate the "Company Journey" section for ${companyName}.` };
}
