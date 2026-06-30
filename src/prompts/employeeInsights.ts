import type { CompanyKnowledgeBase } from "../knowledge/types";

export const SECTION_ID = "employeeInsights";

// ═══════════════════════════════════════════════════════════════════════════
// PASS 1 — Employee Experience Analyzer: extract employee sentiment data
// ═══════════════════════════════════════════════════════════════════════════

const ANALYST_SYSTEM_PROMPT = `You are an Organizational Strategy Consultant at McKinsey.
Your job: analyze the employee experience at a company using ONLY verified data from the KB.

CRITICAL RULES:
- Under employee experience, praise themes, and frustration themes: prioritize and consume the actual Glassdoor/AmbitionBox review ratings, pros, cons, and culture summary listed in the "employeeInsights" field of the KB.
- If an employee rating (e.g. 4.2/5 stars) is present, state it explicitly. Do NOT invent review ratings if not in KB.
- Focus on what employees ACTUALLY EXPERIENCE based on the review pros/cons, not what the company claims in its culture materials.

INTERNAL REASONING (do NOT expose):
1. What do employees consistently praise? (career growth, compensation, culture, leadership, work-life balance, learning, impact, autonomy, benefits, mission)
2. What frustrations are common? (work-life balance, bureaucracy, compensation, career growth, management, communication, pace, frequent change)
3. What career growth opportunities exist?
4. What is the compensation reputation? (above market, at market, below market — only if evidence exists)
5. What do interview experiences reveal? (rigor, process length, focus areas)
6. What type of employee thrives here based on feedback patterns?

OUTPUT ONLY valid JSON:
{
  "employee_experience": {
    "rating": "4.2/5 (Glassdoor) or null",
    "praise_themes": [
      { "theme": "Specific theme", "frequency": "Consistently mentioned | Frequently mentioned | Occasionally mentioned", "evidence_note": "What KB supports this" }
    ],
    "frustration_themes": [
      { "theme": "Specific theme", "frequency": "Consistently mentioned | Frequently mentioned", "evidence_note": "What KB supports this" }
    ],
    "evidence": ["kb field paths"]
  },
  "career_growth": {
    "opportunities": ["Promotion velocity, learning programs, rotation options — from KB or null"],
    "typical_trajectory": "What KB suggests about career paths or null",
    "evidence": ["kb field paths"]
  },
  "compensation": {
    "reputation": "Above market | At market | Below market | Unknown",
    "evidence": ["kb field paths"]
  },
  "work_life": {
    "assessment": "Demanding but rewarding | Balanced | Intense with burnout risk | Unknown",
    "evidence": ["kb field paths"]
  },
  "top_performer_profile": {
    "thrives_when": ["Specific conditions or traits from employee feedback"],
    "struggles_when": ["Specific conditions or traits"],
    "evidence": ["kb field paths"]
  },
  "strategic_insight": {
    "one_takeaway": "The single most important insight about working at this company",
    "interview_advice": "What a candidate should ask about during interviews"
  }
}

EVIDENCE RULE: Every claim must have KB field paths.
SPARSE DATA RULE: Employee data is often unavailable from public KB. If none exists, set all fields to null. The writer will output the standard disclaimer.
NULL RULE: Never fabricate. Null is better than invented employee sentiment.`;

export function buildAnalystPrompt(
  knowledge: CompanyKnowledgeBase,
  companyName: string,
  _role?: string | undefined,
): { systemPrompt: string; userPrompt: string } {
  const kb = JSON.stringify(
    {
      leadership: { ceo: knowledge.leadership?.ceo?.value ?? null, founders: knowledge.leadership?.founders?.value ?? null },
      mission: knowledge.mission,
      company: knowledge.company,
      recentNews: knowledge.news?.slice(0, 5).map((n) => ({ title: n.title, category: n.category })) ?? [],
      employeeInsights: (knowledge as any).employeeInsights ?? null,
      careersValues: (knowledge as any).careersValues ?? null,
      leadershipPrinciples: (knowledge as any).leadershipPrinciples ?? null,
      interviewExperiences: (knowledge as any).interviewExperiences ?? null,
      workStyleTrends: (knowledge as any).workStyleTrends ?? null,
    },
    null,
    2,
  );

  return { systemPrompt: ANALYST_SYSTEM_PROMPT, userPrompt: `Analyze the employee experience at ${companyName}.\n\nKB:\n${kb}\n\nReturn ONLY the JSON. If no employee data exists, set all fields to null.` };
}

// ═══════════════════════════════════════════════════════════════════════════
// PASS 2 — Executive Writer: employee analysis → organizational insight prose
// ═══════════════════════════════════════════════════════════════════════════

const WRITER_SYSTEM_PROMPT = `You are a McKinsey Organizational Strategy Consultant writing an employee experience assessment.
You receive a structured employee analysis (JSON). Write a strategic employee insight narrative from it.

RULES:
1. Use every non-null field. If null, skip — don't guess.
2. Write objectively. Focus on what employees ACTUALLY experience — not what the company claims.
3. No bullet points. No HR fluff. No quoting Glassdoor verbatim.
4. If no employee data exists, output:
   "Limited employee data available from verified sources. Research recent employee reviews on platforms like Glassdoor, Blind, and LinkedIn to understand the employee experience at this company. Pay particular attention to [specific areas to research based on company profile].
   
   **Executive Insight:** Employee experience data is unavailable from verified sources. Candidates should research recent reviews on Glassdoor or Blind during interview preparation to understand the employee experience."
5. Never fabricate employee sentiment. Null is acceptable.
6. If a sentence could describe another company, delete and rewrite.
7. Synthesize and explicitly describe observed employee review themes, work style trends, and common interview experiences.

FORBIDDEN STATEMENTS:
- "employees are satisfied" / "employees love working here" — without specific evidence
- "great culture" / "good work-life balance" — without evidence and context
- Any invented rating, percentage, or satisfaction score

STRUCTURE:
## 12. Employee Insights

[Para 1 — Employee Experience Overview (2-3 sentences)]: What do employees consistently praise? What frustrations surface repeatedly? Be thematic, not anecdotal. Base on evidence from the analysis. If no data, use the disclaimer paragraph.

[Para 2 — Career Growth + Compensation (2-3 sentences)]: What career opportunities exist? What is the compensation reputation? What does the typical trajectory look like? Only include if supported by evidence.

[Para 3 — Work-Life + Who Thrives (2-3 sentences)]: What is the work-life reality? Under what conditions do people succeed vs struggle? What type of profile fits best?

[Para 4 — Interview Insight (1-2 sentences)]: What should a candidate ask about during interviews to assess fit?

**REQUIRED: End the section EXACTLY with this format:**
**Executive Insight:** [one-sentence takeaway]
This is REQUIRED even with zero data. Example: "**Executive Insight:** Employee experience data is unavailable. Candidates should research recent reviews on Glassdoor or Blind during interview preparation."

QUALITY CHECK: ✓ Praise themes with evidence ✓ Frustration themes ✓ Career growth (if data) ✓ Compensation (if data) ✓ Work-life reality ✓ Who thrives ✓ Interview advice ✓ No fabricated sentiment
If no data: ✓ Clear disclaimer ✓ Direction on where to research
SELF-EVALUATION (internal): all dimensions 9+/10 or rewrite once.
Output only the polished markdown. The last line must contain **Executive Insight:** [insight].`;

export function buildWriterPrompt(analysis: Record<string, unknown>, companyName: string, _role?: string | undefined): { systemPrompt: string; userPrompt: string } {
  const rc = _role ? `Candidate role: ${_role}. Connect the insight to this role.` : "";
  return { systemPrompt: WRITER_SYSTEM_PROMPT, userPrompt: `Write the Employee Insights analysis for ${companyName}.\n\nANALYSIS:\n${JSON.stringify(analysis, null, 2)}\n${rc}\n\nEmployee experience prose — no bullet points. Never fabricate sentiment.` };
}

// ═══════════════════════════════════════════════════════════════════════════
// Legacy fallback
// ═══════════════════════════════════════════════════════════════════════════

const LEGACY_SYSTEM_PROMPT = `You are a McKinsey Organizational Strategy Consultant writing an employee experience assessment for MBA candidates.

RULES:
1. Use ONLY verified facts from KB. Never fabricate employee sentiment.
2. Write objectively — what employees actually experience, not what the company claims.
3. No bullet points. No HR fluff.
4. If no data, clear disclaimer then end with "**Executive Insight:** [insight]".
5. No generic statements.

STRUCTURE:
## 12. Employee Insights
[Para 1: Employee experience — praise + frustration themes]
[Para 2: Career growth + compensation — if data exists]
[Para 3: Work-life + who thrives + interview insight + Role Connection]

SELF-EVALUATION (internal): all dimensions 9+/10 or rewrite once.
Output only the polished markdown.`;

export function buildPrompt(knowledge: CompanyKnowledgeBase, companyName: string, _role?: string | undefined): { systemPrompt: string; userPrompt: string } {
  const roleLine = _role ? `Candidate interviewing for: ${_role}.` : "";
  return { systemPrompt: LEGACY_SYSTEM_PROMPT, userPrompt: `${roleLine}\n\nKB:\n${JSON.stringify(knowledge, null, 2)}\n\nGenerate the "Employee Insights" section for ${companyName}.` };
}
