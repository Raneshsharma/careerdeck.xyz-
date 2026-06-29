import type { CompanyKnowledgeBase } from "../knowledge/types";
import type { ExtractedNewsArticle } from "../extractors/types";

export const SECTION_ID = "interviewQuestions";

// ═══════════════════════════════════════════════════════════════════════════
// PASS 1 — Question Architect: extract strategic hooks from KB
// ═══════════════════════════════════════════════════════════════════════════

const ANALYST_SYSTEM_PROMPT = `You are a McKinsey Career Coach. Your job: identify the 5 most strategically potent topics for interview questions, using ONLY verified facts from the KB.

Each question topic must be anchored to a specific verified fact, trend, news event, or business attribute from the KB. Generic questions that could apply to any company are useless.

For each question topic, extract:
- The specific KB fact it references
- Why this topic demonstrates strategic thinking
- What answer the candidate is trying to elicit

OUTPUT ONLY valid JSON:
{
  "question_topics": [
    {
      "rank": 1,
      "topic": "One-sentence topic description",
      "fact_reference": "Specific fact from KB that the question draws on",
      "kb_evidence": ["kb field paths"],
      "why_strategic": "Why this question shows deep company understanding",
      "what_it_elicits": "What kind of answer this question is designed to surface"
    }
  ]
}

RULES:
- Exactly 5 topics, ranked by strategic value.
- Each must reference a DIFFERENT domain (financials, strategy, products, industry, leadership, news, competitive position, business model — avoid repeating the same domain).
- News-based questions are high-value — use recent events when available.
- Questions should feel conversational, not like a test. "I noticed X; how is the team thinking about Y?" tone.
- Never fabricate facts. If a domain has no data, skip it and use another.`;

export function buildAnalystPrompt(
  knowledge: CompanyKnowledgeBase,
  companyName: string,
  role?: string | undefined,
): { systemPrompt: string; userPrompt: string } {
  const newsSummary = knowledge.news?.slice(0, 5).map((a: ExtractedNewsArticle) => `${a.title} (${a.publishedDate || "?"}) — ${a.category || ""}`).join("\n") ?? "";
  const roleText = role ? `Target role: ${role}.` : "";

  const kb = JSON.stringify(
    {
      company: knowledge.company,
      leadership: knowledge.leadership,
      financials: knowledge.financials
        ? { revenue: knowledge.financials.revenue?.value, marketCap: knowledge.financials.marketCap?.value, industry: knowledge.financials.industry?.value, sector: knowledge.financials.sector?.value }
        : null,
      business: knowledge.business,
      products: knowledge.products,
      history: knowledge.history,
      mission: knowledge.mission,
      news: newsSummary,
    },
    null,
    2,
  );

  return { systemPrompt: ANALYST_SYSTEM_PROMPT, userPrompt: `Identify 5 strategic question topics for a candidate interviewing at ${companyName}.\n${roleText}\n\nKB:\n${kb}\n\nReturn ONLY the JSON with exactly 5 topics, each from a different domain.` };
}

// ═══════════════════════════════════════════════════════════════════════════
// PASS 2 — Executive Writer: question topics → conversational questions
// ═══════════════════════════════════════════════════════════════════════════

const WRITER_SYSTEM_PROMPT = `You are a McKinsey Career Coach. Turn 5 strategic question topics into polished, conversational interview questions.

RULES:
- Each question must incorporate the specific fact or insight from the topic.
- Write in NATURAL, conversational language. "I noticed X; how is the team thinking about Y?" — not "Can you explain your company's approach to Z?"
- Each question should feel like it flows naturally in conversation with an executive or hiring manager.
- Number questions 1-5. No preamble, no closing.
- Questions must NOT sound generic. If the question could be asked at any other company, rewrite it.
- Each question should include a brief parenthetical noting what fact or insight it's based on (e.g. "based on the Q3 earnings call").

STRUCTURE:
## Bonus: The 5 Highest-Value Questions

1. [Question] *(References [specific fact/insight])*
2. [Question] *(References [specific fact/insight])*
...
5. [Question] *(References [specific fact/insight])*

QUALITY CHECK: ✓ 5 questions ✓ Each from different domain ✓ Each references specific KB fact ✓ Conversational tone ✓ Would impress a hiring manager ✓ Not generic
Output only the polished markdown.`;

export function buildWriterPrompt(analysis: Record<string, unknown>, companyName: string, role?: string | undefined): { systemPrompt: string; userPrompt: string } {
  const rc = role ? `Target role: ${role}.` : "";
  return { systemPrompt: WRITER_SYSTEM_PROMPT, userPrompt: `Write 5 interview questions for ${companyName}.\n${rc}\n\nTOPICS:\n${JSON.stringify(analysis, null, 2)}\n\nPolished, conversational, company-specific.` };
}

// ═══════════════════════════════════════════════════════════════════════════
// Legacy fallback
// ═══════════════════════════════════════════════════════════════════════════

const LEGACY_SYSTEM_PROMPT = `You are a McKinsey Career Coach writing interview questions for MBA candidates.

RULES:
1. Use ONLY verified facts from KB.
2. Exactly 5 questions. Each from a different domain (financials, strategy, products, industry, news, leadership, competitive position).
3. Each question must reference a specific KB fact or news event.
4. Conversational tone: "I noticed X; how is the team thinking about Y?"
5. Include parenthetical note of what fact each question references.
6. No generic questions. If it could be asked at any company, rewrite.

STRUCTURE:
## Bonus: The 5 Highest-Value Questions

1. [Question] *(References [specific fact])*
...
5. [Question] *(References [specific fact])*

Output only the polished markdown.`;

export function buildPrompt(knowledge: CompanyKnowledgeBase, companyName: string, role?: string | undefined): { systemPrompt: string; userPrompt: string } {
  const roleText = role ? `Target role: ${role}.` : "";
  const newsSummary = knowledge.news?.slice(0, 5).map((a: ExtractedNewsArticle) => `- ${a.title}`).join("\n") ?? "";
  return { systemPrompt: LEGACY_SYSTEM_PROMPT, userPrompt: `${roleText}\n\nKB:\n${JSON.stringify(knowledge, null, 2)}\n\n${newsSummary ? 'RECENT NEWS:\n' + newsSummary : ''}\n\nGenerate 5 interview questions for ${companyName}.` };
}
