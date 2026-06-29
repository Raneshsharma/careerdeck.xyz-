import type { CompanyKnowledgeBase } from "../knowledge/types";

export const SECTION_ID = "interviewPlaybook";

const ANALYST_SYSTEM_PROMPT = `You are a McKinsey Career Coach preparing a role-specific interview playbook. Use ONLY verified facts from the KB.

CRITICAL RULES:
- Do NOT suggest weaknesses or risks based on unverified competitive dimensions (e.g. assuming a lack of brand or scale). The playbook must ONLY base interview recommendations and red flags on verified facts, not on inferred negatives due to missing KB data.
- If a dimension is unverified in the KB, do not list it as a weakness for the candidate to address.

If a role is provided, tailor the playbook to that role. If not, create a general MBA-interview playbook.

OUTPUT ONLY valid JSON:
{
  "role_context": "Role being targeted or 'General MBA'",
  "likely_interview_topics": ["5 topics the candidate will likely be asked about, based on company profile"],
  "key_facts_to_know": ["10 specific facts from KB the candidate MUST know"],
  "questions_to_ask": ["5 strategic questions that demonstrate deep company understanding"],
  "culture_signals": ["3 things to emphasize that show cultural fit"],
  "red_flags_to_avoid": ["3 things NOT to say or do"],
  "preparation_priorities": ["Top 3 things to focus on in the week before the interview"],
  "one_unfair_advantage": "One insight most candidates won't have, based on KB analysis"
}

Use ONLY facts from the KB. Never fabricate. If absent, use null.`;

export function buildAnalystPrompt(k: CompanyKnowledgeBase, companyName: string, role?: string): { systemPrompt: string; userPrompt: string } {
  const rc = role ? `Target Role: ${role}.` : "General MBA interview — no specific role.";
  return { systemPrompt: ANALYST_SYSTEM_PROMPT, userPrompt: `Build an interview playbook for ${companyName}.\n${rc}\n\nKB:\n${JSON.stringify(k, null, 2)}\n\nReturn ONLY the JSON.` };
}

const WRITER_SYSTEM_PROMPT = `You are a McKinsey Career Coach writing an interview playbook. Turn structured analysis into actionable interview preparation content.

RULES:
- Actionable, specific, company-true. No generic interview advice.
- Every recommendation must trace back to a specific fact about the company.
- Write like you're coaching someone 48 hours before their interview.

STRUCTURE:
## Interview Playbook

Likely Topics → Key Facts to Know (numbered, each with context) → Strategic Questions (numbered, each explaining WHY it's powerful) → Culture Signals → Red Flags → 48-Hour Plan → Unfair Advantage.

No bullet points in prose sections. Output only polished markdown.`;

export function buildWriterPrompt(a: Record<string, unknown>, companyName: string, role?: string): { systemPrompt: string; userPrompt: string } {
  const rc = role ? `Target Role: ${role}.` : "";
  return { systemPrompt: WRITER_SYSTEM_PROMPT, userPrompt: `Write the Interview Playbook for ${companyName}.\n${rc}\n\nANALYSIS:\n${JSON.stringify(a, null, 2)}` };
}

export function buildPrompt(k: CompanyKnowledgeBase, companyName: string, role?: string): { systemPrompt: string; userPrompt: string } {
  const rc = role ? `Target Role: ${role}.` : "";
  return { systemPrompt: WRITER_SYSTEM_PROMPT, userPrompt: `Write the Interview Playbook for ${companyName}.\n${rc}\n\nKB:\n${JSON.stringify(k, null, 2)}` };
}
