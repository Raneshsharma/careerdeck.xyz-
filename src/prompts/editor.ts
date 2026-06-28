import type { CompanyKnowledgeBase } from "../knowledge/types";

const SYSTEM_PROMPT = `You are a Senior Editorial Reviewer for an interview preparation dossier.
Your job: review a generated section, verify it against the Company Knowledge Base, and produce an improved final version.

CRITICAL RULES:
- You may ONLY use facts from the provided Knowledge Base.
- NEVER introduce new facts, data, names, or numbers not present in the Knowledge Base.
- If a claim in the original section is not supported by the Knowledge Base, REMOVE IT.
- If the Knowledge Base has null for a field (e.g., revenue, ceo, founded), do NOT include that data.
- Do NOT browse the internet, infer external data, or fabricate anything.

REVIEW CHECKLIST - check the original section for:
1. Accuracy: every factual claim matches the Knowledge Base. Flag unsupported claims.
2. Completeness: are all available verified facts used? What relevant data is unused?
3. Business Insight: does the section explain WHY this matters and WHAT it means?
4. Interview Relevance: would this help someone in an interview? Include Role Connection.
5. Generic Content: remove statements that could apply to any company without evidence.
6. Missing Information: explicitly note verified facts from the KB that were omitted.
7. Hallucinations: flag any claim not supported by the Knowledge Base.
8. Redundancy: remove repeated ideas or wasted words.
9. Clarity: is every sentence clear, direct, and useful?
10. Structure: does the section have a logical flow?

YOUR RESPONSE FORMAT - output ONLY valid JSON:
{
  "revised_section": "the complete revised markdown section",
  "score": {
    "accuracy": 0,
    "completeness": 0,
    "clarity": 0,
    "business_insight": 0,
    "interview_relevance": 0,
    "overall": 0
  },
  "changes_made": ["specific change 1", "specific change 2"],
  "issues_found": ["issue 1 if any", "issue 2 if any"]
}

Score each dimension 0-10. overall is the average rounded to 1 decimal.
revised_section must be the complete, ready-to-deliver markdown section.
Do not include any text outside the JSON.`;

export function buildEditorPrompt(
  knowledge: CompanyKnowledgeBase,
  sectionName: string,
  originalSection: string,
  companyName: string,
): { systemPrompt: string; userPrompt: string } {
  const kb = JSON.stringify(
    {
      company: knowledge.company,
      financials: knowledge.financials,
      leadership: knowledge.leadership,
      history: knowledge.history,
      products: knowledge.products,
      business: knowledge.business,
      mission: knowledge.mission,
      website: knowledge.website,
      newsTitles: knowledge.news?.slice(0, 5).map((n) => n.title) ?? [],
    },
    null,
    2,
  );

  return {
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: `Review and improve this "${sectionName}" section for ${companyName}.

COMPANY KNOWLEDGE BASE (verified facts — YOUR ONLY SOURCE):
${kb}

ORIGINAL SECTION:
${originalSection}

Review for accuracy, completeness, business insight, interview relevance, generic content, and hallucinations.
Remove any unsupported claims. Improve clarity and specificity.
Ensure a "Role Connection" is present.
Add any missing verified facts from the Knowledge Base.

Return ONLY the JSON described in the system prompt. No other text.`,
  };
}

export interface EditorResult {
  revised_section: string;
  score: {
    accuracy: number;
    completeness: number;
    clarity: number;
    business_insight: number;
    interview_relevance: number;
    overall: number;
  };
  changes_made: string[];
  issues_found: string[];
}
