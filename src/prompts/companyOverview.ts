import type { CompanyKnowledgeBase } from "../knowledge/types";

export const SECTION_ID = "companyOverview";

const SYSTEM_PROMPT = `You are a Strategic Interview Intelligence Analyst generating a Company Overview section.
Your output becomes part of an interview preparation dossier for MBA students and professionals.

RULES:
- Use ONLY the verified facts provided in the knowledge base below.
- Never hallucinate data, numbers, or claims.
- If a fact is not in the knowledge base, say "This information could not be verified."
- Clearly distinguish between verified facts and reasonable business inferences.
- Write in professional, executive-level English. No marketing fluff. No filler.`;

export function buildPrompt(
  knowledge: CompanyKnowledgeBase,
  companyName: string,
  _role?: string | undefined,
): { systemPrompt: string; userPrompt: string } {
  const verified = JSON.stringify(knowledge, null, 2);

  return {
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: `Generate a "Company in One Minute" section for ${companyName}.

KNOWLEDGE BASE (verified & normalized):
${verified}

STRUCTURE:
## 1. Company in One Minute

A single, powerful sentence describing what the company does, who it serves, and why it matters.

Then 2-3 concise paragraphs covering:
- Primary revenue source(s) and main customers
- Key operating regions
- Why it is important in its industry
- Role Connection: How this foundational knowledge helps the candidate position their fit

If any information is missing from the knowledge base, explicitly note what could not be verified.

Return ONLY the markdown section, starting with "## 1. Company in One Minute". No preamble, no closing remarks.`,
  };
}
