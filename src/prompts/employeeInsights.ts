import type { CompanyKnowledgeBase } from "../knowledge/types";

export const SECTION_ID = "employeeInsights";

// ═══════════════════════════════════════════════════════════════════════════
// PASS 1 — Employee Experience Analyst: extract employee sentiment data
// ═══════════════════════════════════════════════════════════════════════════

const ANALYST_SYSTEM_PROMPT = `You are an Organizational Strategy Consultant at McKinsey.
Your job: analyze the employee experience at a company using ONLY verified data from the KB.

CRITICAL RULES:
- Praise themes, rating, and frustration themes: consume the actual rating, ratingConfidence, sourceCounts, pros, cons, and culture summary listed in the "employeeInsights" field of the KB.
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
    "rating": "4.2/5 or null",
    "ratingConfidence": 0.85,
    "sourceCounts": 12000,
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
      employeeInsights: (knowledge as any).employeeInsights || null,
      careersValues: (knowledge as any).careersValues || [],
      leadershipPrinciples: (knowledge as any).leadershipPrinciples || [],
      interviewExperiences: (knowledge as any).interviewExperiences || [],
      workStyleTrends: (knowledge as any).workStyleTrends || [],
      recentNews: knowledge.news?.slice(0, 5).map((n) => n.title) ?? [],
    },
    null,
    2,
  );
  return {
    systemPrompt: ANALYST_SYSTEM_PROMPT,
    userPrompt: `Analyze the employee experience and organizational culture of ${companyName}.\n\nKB:\n${kb}\n\nReturn ONLY the JSON.`,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// PASS 2 — Executive Writer: structured analysis → strategic employee insights
// ═══════════════════════════════════════════════════════════════════════════

const WRITER_SYSTEM_PROMPT = `You are a Senior McKinsey Organizational Strategy Consultant writing an employee insights and culture analysis for candidates.
You receive a structured employee experience analysis (JSON). Write a strategic briefing from it.

RULES:
1. Under employee experience, praise themes, and frustrations: consume the actual rating (e.g. 4.2/5), ratingConfidence, sourceCounts, pros, cons, and culture summary listed in the JSON.
2. AGGREGATE AND WEIGHT SENTIMENT: Explicitly state the review counts/volume (sourceCounts) and rating. Qualify statements with confidence weights based on ratingConfidence (e.g. high confidence 0.8+ indicates high consistency across thousands of reviews; low confidence indicates limited observations).
3. Focus on what employees actually experience (rigor, compensation, growth, balance, bureaucracy) vs. corporate PR fluff.
4. No bullet points. Use structured paragraphs.
5. If no employee data exists at all, output the standard disclaimer and end with: "**Executive Insight:** [takeaway]".

STRUCTURE:
## 12. Employee Insights

[Para 1 — Culture & Employee Experience (3-4 sentences)]: Aggregate rating and confidence-weighted sentiment analysis. Qualify pros/cons based on review counts and consistency. Contrast employee reality with corporate values.
[Para 2 — Career Growth & Compensation (3-4 sentences)]: Opportunities for advancement, typical trajectory, training, compensation competitiveness, and career speed.
[Para 3 — Work Style & Interview Intelligence (3-4 sentences)]: Demands, work-life balance, typical candidates who thrive vs struggle, common interview experiences, and interview tips. Connect to candidate role if specified.
[Para 4 — Strategic Takeaway (1-2 sentences)]: Single most important takeaway. End the section with this bolded line: **Executive Insight:** [one-sentence strategic takeaway].`;

export function buildWriterPrompt(
  analysis: Record<string, unknown>,
  companyName: string,
  _role?: string | undefined,
): { systemPrompt: string; userPrompt: string } {
  const rc = _role ? `Candidate role: ${_role}. Connect the strategic advice to this role.` : "";
  return {
    systemPrompt: WRITER_SYSTEM_PROMPT,
    userPrompt: `Write the Employee Insights & Culture analysis for ${companyName}.\n\nANALYSIS:\n${JSON.stringify(analysis, null, 2)}\n${rc}\n\nConsultant prose — no bullet points.`,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Legacy fallback
// ═══════════════════════════════════════════════════════════════════════════

const LEGACY_SYSTEM_PROMPT = `You are a McKinsey Organizational Strategy Consultant writing an employee experience assessment for MBA candidates.

RULES:
1. Use ONLY verified facts from KB. Never fabricate employee sentiment.
2. Write objectively — what employees actually experience, not what the company claims.
3. No bullet points. No HR fluff.
4. CONFIDENCE THRESHOLD FOR EMPLOYEE SENTIMENT: When describing employee sentiment, concerns, or praise, do NOT state them as absolute facts. You MUST explicitly qualify their prevalence.
5. If no data, clear disclaimer then end with "**Executive Insight:** [insight]".
6. No generic statements.

STRUCTURE:
## 12. Employee Insights
[Para 1: Employee experience — praise + frustration themes, qualified by source frequency and confidence]
[Para 2: Career growth + compensation — if data exists, qualified by source frequency]
[Para 3: Work-life + who thrives + interview insight + Role Connection, qualified by source frequency]

SELF-EVALUATION (internal): all dimensions 9+/10 or rewrite once.
Output only the polished markdown.`;

export function buildPrompt(knowledge: CompanyKnowledgeBase, companyName: string, _role?: string | undefined): { systemPrompt: string; userPrompt: string } {
  const roleLine = _role ? `Candidate interviewing for: ${_role}.` : "";
  return { systemPrompt: LEGACY_SYSTEM_PROMPT, userPrompt: `${roleLine}\n\nKB:\n${JSON.stringify(knowledge, null, 2)}\n\nGenerate the "Employee Insights" section for ${companyName}.` };
}
