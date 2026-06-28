import type { CompanyKnowledgeBase } from "../knowledge/types";
import type { ExtractedNewsArticle } from "../extractors/types";

export const SECTION_ID = "strategy";

const SYSTEM_PROMPT = `You are a Strategic Interview Intelligence Analyst generating a Strategic Priorities section.
Your output becomes part of an interview preparation dossier for MBA students and professionals.

RULES:
- Use ONLY the verified facts provided in the knowledge base below.
- You may infer strategic priorities based on verified data: business segments, recent news, products, financials.
- Never fabricate specific strategic initiatives or acquisitions unless in the knowledge base or news.
- Clearly distinguish between verified priorities and reasonable strategic inferences.
- Write in professional, executive-level English. No marketing fluff. No filler.`;

export function buildPrompt(
  knowledge: CompanyKnowledgeBase,
  companyName: string,
  _role?: string | undefined,
): { systemPrompt: string; userPrompt: string } {
  const verified = JSON.stringify(knowledge, null, 2);

  const newsSummary = knowledge.news
    ? knowledge.news.slice(0, 5).map((a: ExtractedNewsArticle) => `- ${a.title} (${a.publishedDate || "unknown date"})`).join("\n")
    : "No recent news available.";

  return {
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: `Generate a "Strategic Priorities" section for ${companyName}.

KNOWLEDGE BASE (verified & normalized):
${verified}

RECENT NEWS (for context on current strategic direction):
${newsSummary}

STRUCTURE:
## 10. Strategic Priorities

- Top 1-3 year priorities (inferred from business segments, products, and recent news)
- Where the company appears to be investing most heavily
- Key problems management is likely focused on
- Recent decisions, acquisitions, or announcements that signal strategic direction (if in news)
- How success in these priorities is likely measured
- Role Connection: How the candidate's role directly advances these priorities

Base strategic analysis on the verified data and news. Label inferences clearly.

Return ONLY the markdown section, starting with "## 10. Strategic Priorities". No preamble.`,
  };
}
