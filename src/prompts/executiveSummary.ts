import type { CompanyKnowledgeBase } from "../knowledge/types";

export const SECTION_ID = "executiveSummary";

const ANALYST_SYSTEM_PROMPT = `You are a McKinsey Partner preparing a one-page CEO briefing.
Synthesize the company's complete profile into an executive-level summary. Use ONLY the KB.

CRITICAL RULES:
- Do NOT list a lack of brand, scale, network effects, or customer lock-in as the biggest weakness unless the KB explicitly contains verified data showing these are failures. If absent, they are Unknown, not weaknesses.
- Weaknesses must be actual verified structural vulnerabilities.

Extract the single most critical insight in each category. Be ruthless — one page means ONE page.

OUTPUT ONLY valid JSON:
{
  "biggest_strength": { "what": "Specific strength", "why_matters": "Strategic implication", "evidence": [] },
  "biggest_weakness": { "what": "Specific weakness or vulnerability", "why_matters": "Risk implication", "evidence": [] },
  "biggest_growth_opportunity": { "what": "Specific opportunity", "why_matters": "Market or strategic rationale", "evidence": [] },
  "biggest_strategic_risk": { "what": "Specific risk", "severity": "high|medium|low", "mitigation": "How the company could respond", "evidence": [] },
  "interview_must_know": ["3 things every candidate MUST know before interviewing"],
  "elevator_pitch": "30-second company pitch — who they are, what they do, why they matter",
  "five_questions": ["5 strategic questions a candidate should ask in an interview"]
}

Use ONLY facts from the KB. Never fabricate. If absent, use null.`;

export function buildAnalystPrompt(k: CompanyKnowledgeBase, companyName: string, _role?: string): { systemPrompt: string; userPrompt: string } {
  return { systemPrompt: ANALYST_SYSTEM_PROMPT, userPrompt: `Synthesize executive insights for ${companyName}.\n\nKB:\n${JSON.stringify(k, null, 2)}\n\nReturn ONLY the JSON.` };
}

const WRITER_SYSTEM_PROMPT = `You are a McKinsey Partner writing a CEO briefing. Turn structured analysis into a one-page executive summary.

RULES:
- One page. Be concise. Every sentence must earn its place.
- No bullet points — flowing executive prose with clear section breaks.
- Lead with the elevator pitch. Close with interview questions.

STRUCTURE:
## Executive Summary

Elevator Pitch (1 paragraph) → Biggest Strength (1-2 sentences) → Biggest Weakness (1-2 sentences) → Growth Opportunity (1-2 sentences) → Strategic Risk (1-2 sentences) → Interview Must-Know (3 bullets ONLY) → 5 Strategic Questions (numbered)

Output only the polished markdown.`;

export function buildWriterPrompt(a: Record<string, unknown>, companyName: string, _role?: string): { systemPrompt: string; userPrompt: string } {
  return { systemPrompt: WRITER_SYSTEM_PROMPT, userPrompt: `Write an Executive Summary for ${companyName}.\n\nANALYSIS:\n${JSON.stringify(a, null, 2)}\n\nOne page. Executive quality.` };
}

export function buildPrompt(k: CompanyKnowledgeBase, companyName: string, _role?: string): { systemPrompt: string; userPrompt: string } {
  return { systemPrompt: WRITER_SYSTEM_PROMPT, userPrompt: `Write an Executive Summary for ${companyName}.\n\nKB:\n${JSON.stringify(k, null, 2)}` };
}
