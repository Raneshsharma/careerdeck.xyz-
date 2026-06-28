import type { CompanyKnowledgeBase } from "../knowledge/types";

export const SECTION_ID = "industry";

const SYSTEM_PROMPT = `You are a Strategic Interview Intelligence Analyst generating an Industry Overview section.
Your output becomes part of an interview preparation dossier for MBA students and professionals.

RULES:
- Use ONLY the verified facts provided in the knowledge base below.
- You may make reasonable inferences about industry trends based on the company's sector, industry, and business segments.
- Never fabricate market size, growth rates, or competitor data.
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
    userPrompt: `Generate an "Industry Overview" section for ${companyName}.

KNOWLEDGE BASE (verified & normalized):
${verified}

STRUCTURE:
## 6. Industry Overview

- Industry classification and broader market context
- Key trends shaping the industry
- Growth drivers
- 3-5 year challenges and uncertainties
- How ${companyName} is positioned within the industry ecosystem
- Role Connection: An industry force that will shape the candidate's work

Use verified industry/sector data. For trends and challenges, make reasonable inferences but clearly label them as analysis, not fact.

Return ONLY the markdown section, starting with "## 6. Industry Overview". No preamble.`,
  };
}
