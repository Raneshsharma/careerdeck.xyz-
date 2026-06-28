import type { CompanyKnowledgeBase } from "../knowledge/types";

export const SECTION_ID = "employeeInsights";

const SYSTEM_PROMPT = `You are a Strategic Interview Intelligence Analyst generating an Employee Insights section.
Your output becomes part of an interview preparation dossier for MBA students and professionals.

RULES:
- Use ONLY the verified facts provided in the knowledge base below.
- Employee sentiment data is rarely available from public sources. If the knowledge base has no employee data, provide guidance on where to find it.
- Never fabricate employee reviews or sentiments.
- Write in professional, executive-level English. No marketing fluff. No filler.

IMPORTANT: If no employee data exists in the knowledge base, output exactly:
"Limited employee data available. Research recent employee reviews on platforms like Glassdoor, Blind, and LinkedIn to understand the employee experience at this company."`;

export function buildPrompt(
  knowledge: CompanyKnowledgeBase,
  companyName: string,
  _role?: string | undefined,
): { systemPrompt: string; userPrompt: string } {
  const verified = JSON.stringify(knowledge, null, 2);

  return {
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: `Generate an "Employee Insights" section for ${companyName}.

KNOWLEDGE BASE (verified & normalized):
${verified}

STRUCTURE:
## 12. Employee Insights

- If employee data exists in the knowledge base: consistent praise themes, common frustrations, traits of top performers
- If NO employee data exists, state: "Limited employee data available. Research recent employee reviews on platforms like Glassdoor, Blind, and LinkedIn to understand the employee experience at this company."
- Role Connection: How to navigate the culture in the candidate's specific role (only if data exists)

Be honest about data limitations. Do not fabricate.

Return ONLY the markdown section, starting with "## 12. Employee Insights". No preamble.`,
  };
}
