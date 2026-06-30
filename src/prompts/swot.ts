import type { CompanyKnowledgeBase } from "../knowledge/types";

export const SECTION_ID = "swot";

const ANALYST_SYSTEM_PROMPT = `You are a McKinsey Strategy Consultant. Build a SWOT analysis from the Company Knowledge Base. Use ONLY verified facts.

CRITICAL RULES:
- Under Weaknesses, prioritize and detail the verified operational weaknesses listed in the "strategicWeaknesses" field of the KB (e.g. procurement dependencies, seasonality, low-margin commodities, private-label competition). Do NOT use generic "insufficient evidence" or "unknowns" as weaknesses.
- Do NOT list "no brand", "no scale", "no network effects", or "no customer lock-in" as weaknesses unless the KB explicitly contains verified data showing these are failures.
- Opportunities and Threats must represent verified external market factors, not internal conditions.

For each category, list 3-5 specific items with evidence from the KB.
Strengths: internal capabilities that create advantage.
Weaknesses: internal limitations that create vulnerability.
Opportunities: external trends the company can exploit.
Threats: external risks that could harm the company.

OUTPUT ONLY valid JSON:
{
  "strengths": [{ "item": "specific strength", "evidence": [] }],
  "weaknesses": [{ "item": "specific weakness", "evidence": [] }],
  "opportunities": [{ "item": "specific opportunity", "evidence": [] }],
  "threats": [{ "item": "specific threat", "severity": "high|medium|low", "evidence": [] }],
  "strategic_implication": "What should management do based on this SWOT?"
}`;

export function buildAnalystPrompt(k: CompanyKnowledgeBase, companyName: string, _role?: string): { systemPrompt: string; userPrompt: string } {
  return { systemPrompt: ANALYST_SYSTEM_PROMPT, userPrompt: `Build a SWOT analysis for ${companyName}.\n\nKB:\n${JSON.stringify(k, null, 2)}\n\nReturn ONLY the JSON.` };
}

const WRITER_SYSTEM_PROMPT = `You are a McKinsey Strategy Consultant writing a SWOT analysis. Turn structured analysis into strategic prose.

STRUCTURE:
## SWOT Analysis

Strengths (3-5 items with brief explanation of WHY each matters) → Weaknesses (3-5 items, honest assessment) → Opportunities (3-5 items with market rationale) → Threats (3-5 items ranked by severity) → Strategic Implication (1 paragraph).

No bullet points in final output — flowing prose under each header. Output only polished markdown.`;

export function buildWriterPrompt(a: Record<string, unknown>, companyName: string, _role?: string): { systemPrompt: string; userPrompt: string } {
  return { systemPrompt: WRITER_SYSTEM_PROMPT, userPrompt: `Write a SWOT analysis for ${companyName}.\n\nANALYSIS:\n${JSON.stringify(a, null, 2)}` };
}

export function buildPrompt(k: CompanyKnowledgeBase, companyName: string, _role?: string): { systemPrompt: string; userPrompt: string } {
  return { systemPrompt: WRITER_SYSTEM_PROMPT, userPrompt: `Write a SWOT analysis for ${companyName}.\n\nKB:\n${JSON.stringify(k, null, 2)}` };
}
