import type { CompanyKnowledgeBase } from "../knowledge/types";
import type { ExtractedNewsArticle } from "../extractors/types";

export const SECTION_ID = "interviewQuestions";

const SYSTEM_PROMPT = `You are a Strategic Interview Intelligence Analyst generating interview questions.
Your output becomes part of an interview preparation dossier for MBA students and professionals.

RULES:
- Use ONLY the verified facts provided in the knowledge base below.
- Questions must demonstrate strategic thinking and show knowledge of the company.
- Never ask generic questions that could apply to any company.
- Each question must reference a specific verified fact, trend, or insight from the knowledge base or news.
- Write questions in conversational, natural language that a candidate can actually use.
- Each question should show genuine curiosity and insight.`;

export function buildPrompt(
  knowledge: CompanyKnowledgeBase,
  companyName: string,
  role?: string | undefined,
): { systemPrompt: string; userPrompt: string } {
  const verified = JSON.stringify(knowledge, null, 2);

  const newsSummary = knowledge.news
    ? knowledge.news.slice(0, 5).map((a: ExtractedNewsArticle) => `- ${a.title}`).join("\n")
    : "No recent news.";

  const roleText = role ? `The candidate is interviewing for: ${role}` : "No specific role provided.";

  return {
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: `Generate 5 high-value interview questions for a candidate interviewing at ${companyName}.

${roleText}

RECENT NEWS:
${newsSummary}

FULL KNOWLEDGE BASE:
${verified}

REQUIREMENTS:
- Exactly 5 questions
- Each question must reference a specific fact, trend, business segment, product, or news event from the knowledge base
- Questions should demonstrate strategic insight — not just surface-level curiosity
- Write in natural, conversational language (e.g., "I noticed X; how is the team thinking about Y?")
- Questions should help the candidate stand out

OUTPUT:
## Bonus: The 5 Highest-Value Questions

1. [Question — include what verified fact or insight it references]
2. ...
3. ...
4. ...
5. ...

Return ONLY this section. No preamble, no closing remarks.`,
  };
}
