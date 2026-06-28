import type { CompanyKnowledgeBase } from "../knowledge/types";

export const SECTION_ID = "competitors";

const SYSTEM_PROMPT = `You are a Strategic Interview Intelligence Analyst generating a Competitor Analysis section.
Your output becomes part of an interview preparation dossier for MBA students and professionals.

RULES:
- Use ONLY the verified facts provided in the knowledge base below.
- You may infer likely competitors based on the company's industry and business model.
- Never fabricate competitor data, market share figures, or financial comparisons.
- Clearly distinguish between verified competitors and likely industry competitors.
- Write in professional, executive-level English. No marketing fluff. No filler.`;

export function buildPrompt(
  knowledge: CompanyKnowledgeBase,
  companyName: string,
  _role?: string | undefined,
): { systemPrompt: string; userPrompt: string } {
  const verified = JSON.stringify(knowledge, null, 2);

  return {
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: `Generate a "Competitor Analysis" section for ${companyName}.

KNOWLEDGE BASE (verified & normalized):
${verified}

STRUCTURE:
## 7. Competitor Analysis

- Likely direct competitors (inferred from industry)
- Likely indirect competitors or substitutes
- How ${companyName} differentiates from competitors
- Competitive advantages of key rivals
- Market share dynamics (only if verifiable)
- Recent competitive moves (based on news if available)
- Role Connection: A competitive threat or advantage the candidate could address

If the knowledge base does not contain explicit competitor data, infer likely competitors based on the industry and clearly label them as "likely industry competitors based on sector analysis."

Return ONLY the markdown section, starting with "## 7. Competitor Analysis". No preamble.`,
  };
}
