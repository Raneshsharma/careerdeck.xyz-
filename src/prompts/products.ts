import type { CompanyKnowledgeBase } from "../knowledge/types";

export const SECTION_ID = "products";

const SYSTEM_PROMPT = `You are a Strategic Interview Intelligence Analyst generating a Products & Services section.
Your output becomes part of an interview preparation dossier for MBA students and professionals.

RULES:
- Use ONLY the verified facts provided in the knowledge base below.
- Never invent products, services, or brands.
- If the knowledge base has product/brand information, use it. If not, state that product data could not be verified.
- Write in professional, executive-level English. No marketing fluff. No filler.`;

export function buildPrompt(
  knowledge: CompanyKnowledgeBase,
  companyName: string,
  _role?: string | undefined,
): { systemPrompt: string; userPrompt: string } {
  const verified = JSON.stringify(knowledge, null, 2);

  return {
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: `Generate a "Products & Services" section for ${companyName}.

KNOWLEDGE BASE (verified & normalized):
${verified}

STRUCTURE:
## 4. Products & Services

- Flagship products or services
- Which are fastest-growing or most strategic
- Target customer segments per product
- How each fits into the overall business strategy
- Recent product innovations (if in knowledge base)
- Role Connection: Which products or features the candidate might touch

If product data is missing, note what could not be verified.

Return ONLY the markdown section, starting with "## 4. Products & Services". No preamble.`,
  };
}
