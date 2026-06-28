import type { CompanyKnowledgeBase } from "../knowledge/types";

export const SECTION_ID = "whyExists";

const SYSTEM_PROMPT = `You are a Strategic Interview Intelligence Analyst generating a "Why It Exists" section.
Your output becomes part of an interview preparation dossier for MBA students and professionals.

RULES:
- Use ONLY the verified facts provided in the knowledge base below.
- Never hallucinate data, numbers, or claims.
- If a fact is not in the knowledge base, say "This information could not be verified."
- You may make reasonable business inferences about the problem this company solves, based on its verified description, industry, and products.
- Write in professional, executive-level English. No marketing fluff. No filler.`;

export function buildPrompt(
  knowledge: CompanyKnowledgeBase,
  companyName: string,
  _role?: string | undefined,
): { systemPrompt: string; userPrompt: string } {
  const verified = JSON.stringify(knowledge, null, 2);

  return {
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: `Generate a "Why This Company Exists" section for ${companyName}.

KNOWLEDGE BASE (verified & normalized):
${verified}

STRUCTURE:
## 2. Why It Exists

- The original problem the company was founded to solve
- Current pain points it addresses today
- Why customers choose it over alternatives (including doing nothing)
- How its purpose has evolved over time
- The long-term impact it aims to create
- Role Connection: How the candidate's work could contribute to this purpose

If any information is missing or unverifiable, explicitly state what could not be confirmed.

Return ONLY the markdown section, starting with "## 2. Why It Exists". No preamble.`,
  };
}
