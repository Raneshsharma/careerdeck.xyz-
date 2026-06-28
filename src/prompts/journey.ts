import type { CompanyKnowledgeBase } from "../knowledge/types";

export const SECTION_ID = "journey";

const SYSTEM_PROMPT = `You are a Strategic Interview Intelligence Analyst generating a Company Journey section.
Your output becomes part of an interview preparation dossier for MBA students and professionals.

RULES:
- Use ONLY the verified facts provided in the knowledge base below.
- Never hallucinate historical events, dates, or milestones.
- The founding year and founders come ONLY from the knowledge base.
- Write in professional, executive-level English. No marketing fluff. No filler.`;

export function buildPrompt(
  knowledge: CompanyKnowledgeBase,
  companyName: string,
  _role?: string | undefined,
): { systemPrompt: string; userPrompt: string } {
  const verified = JSON.stringify(knowledge, null, 2);

  return {
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: `Generate a "Company Journey" section for ${companyName}.

KNOWLEDGE BASE (verified & normalized):
${verified}

STRUCTURE:
## 5. Company Journey

- Founding story and founding year (if known)
- Key known milestones (from knowledge base)
- Major challenges or crises the company has faced
- How the business model or strategy has evolved
- Key events that shaped the company
- Role Connection: A historical lesson that influences current decision-making

If historical data is sparse, provide context from what IS available and note what timelines or events could not be verified.

Return ONLY the markdown section, starting with "## 5. Company Journey". No preamble.`,
  };
}
