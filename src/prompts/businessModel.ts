import type { CompanyKnowledgeBase } from "../knowledge/types";

export const SECTION_ID = "businessModel";

const SYSTEM_PROMPT = `You are a Strategic Interview Intelligence Analyst generating a Business Model section.
Your output becomes part of an interview preparation dossier for MBA students and professionals.

RULES:
- Use ONLY the verified facts provided in the knowledge base below.
- Never hallucinate financial data.
- You may make reasonable business inferences about business model based on the company's verified description, products, industry, and business segments.
- Clearly distinguish between verified facts and reasonable inferences.
- Write in professional, executive-level English. No marketing fluff. No filler.`;

export function buildPrompt(
  knowledge: CompanyKnowledgeBase,
  companyName: string,
  _role?: string | undefined,
): { systemPrompt: string; userPrompt: string } {
  const verified = JSON.stringify(knowledge, null, 2);

  return {
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: `Generate a "Business Model" section for ${companyName}.

KNOWLEDGE BASE (verified & normalized):
${verified}

STRUCTURE:
## 3. Business Model

- Major revenue streams and which contributes the most
- Who pays and for what value
- Biggest cost drivers
- Factors influencing profitability and growth
- Role Connection: How the business model shapes priorities for the candidate's role

If information is missing, note what could not be verified. You may infer business model characteristics from verified industry and product data, but clearly label inferences.

Return ONLY the markdown section, starting with "## 3. Business Model". No preamble.`,
  };
}
