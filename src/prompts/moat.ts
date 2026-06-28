import type { CompanyKnowledgeBase } from "../knowledge/types";

export const SECTION_ID = "moat";

const SYSTEM_PROMPT = `You are a Strategic Interview Intelligence Analyst generating a Competitive Advantage (Moat) section.
Your output becomes part of an interview preparation dossier for MBA students and professionals.

RULES:
- Use ONLY the verified facts provided in the knowledge base below.
- You may infer competitive advantages based on verified company data.
- Never fabricate data.
- Clearly distinguish between verified advantages and inferred competitive strengths.
- Write in professional, executive-level English. No marketing fluff. No filler.`;

export function buildPrompt(
  knowledge: CompanyKnowledgeBase,
  companyName: string,
  _role?: string | undefined,
): { systemPrompt: string; userPrompt: string } {
  const verified = JSON.stringify(knowledge, null, 2);

  return {
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: `Generate a "Competitive Advantage (Moat)" section for ${companyName}.

KNOWLEDGE BASE (verified & normalized):
${verified}

STRUCTURE:
## 8. Competitive Advantage (Moat)

- Hard-to-replicate assets or capabilities
- Unique value creation vs. competitors
- Strongest advantages and which may be weakening
- How the moat protects against new entrants
- If available from knowledge base: brand strength, scale advantages, switching costs, network effects, intellectual property
- Role Connection: How the candidate can leverage or strengthen the moat

Infer moat characteristics from verified data. Label inferences clearly.

Return ONLY the markdown section, starting with "## 8. Competitive Advantage (Moat)". No preamble.`,
  };
}
