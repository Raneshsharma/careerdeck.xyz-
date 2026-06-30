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

// Two-pass prompts removed for single-pass optimization

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
7. End with "**Executive Insight:** [one-sentence insight]".

STRUCTURE:
## Bonus: The 5 Highest-Value Questions

1. [Question] *(References [specific fact])*
...
5. [Question] *(References [specific fact])*

**Executive Insight:** [...]

Output only the polished markdown.`;

export function buildPrompt(knowledge: CompanyKnowledgeBase, companyName: string, role?: string | undefined): { systemPrompt: string; userPrompt: string } {
  const roleText = role ? `Target role: ${role}.` : "";
  const newsSummary = knowledge.news?.slice(0, 5).map((a: ExtractedNewsArticle) => `- ${a.title}`).join("\n") ?? "";
  return { systemPrompt: LEGACY_SYSTEM_PROMPT, userPrompt: `${roleText}\n\nKB:\n${JSON.stringify(knowledge, null, 2)}\n\n${newsSummary ? 'RECENT NEWS:\n' + newsSummary : ''}\n\nGenerate 5 interview questions for ${companyName}.` };
}
