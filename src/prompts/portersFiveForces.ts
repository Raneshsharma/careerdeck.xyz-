import type { CompanyKnowledgeBase } from "../knowledge/types";

export const SECTION_ID = "portersFiveForces";

const ANALYST_SYSTEM_PROMPT = `You are a McKinsey Strategy Consultant. Analyze the competitive dynamics of the company's industry using Porter's Five Forces. Use ONLY verified facts from the KB.

Score each force: 0 = very low pressure, 10 = very high pressure.

OUTPUT ONLY valid JSON:
{
  "rivalry": { "score": 7, "assessment": "Why rivalry is at this level", "evidence": [] },
  "new_entrants": { "score": 5, "assessment": "How easy for new players to enter", "evidence": [] },
  "substitutes": { "score": 6, "assessment": "Availability of alternatives", "evidence": [] },
  "supplier_power": { "score": 3, "assessment": "How much power suppliers have", "evidence": [] },
  "buyer_power": { "score": 8, "assessment": "How much power customers have", "evidence": [] },
  "overall_assessment": "Overall industry attractiveness — attractive | moderate | challenging",
  "strategic_implication": "What this means for the company's strategy"
}`;

export function buildAnalystPrompt(k: CompanyKnowledgeBase, companyName: string, _role?: string): { systemPrompt: string; userPrompt: string } {
  return { systemPrompt: ANALYST_SYSTEM_PROMPT, userPrompt: `Analyze competitive dynamics for ${companyName}'s industry.\n\nKB:\n${JSON.stringify(k, null, 2)}\n\nReturn ONLY the JSON.` };
}

const WRITER_SYSTEM_PROMPT = `You are a McKinsey Strategy Consultant writing Porter's Five Forces analysis. Turn scored analysis into strategic prose.

RULES:
For each of the 5 forces, you must output exactly:
- The force name as a subheader (e.g. ### Competitive Rivalry)
- **Score**: X/10
- **Evidence**: [Specific facts, metrics, or data points from the analysis JSON]
- **Reasoning**: [Explain the strategic logic connecting the evidence to the score]
- **Analysis**: [2-3 sentences of flowing consultant-grade prose summarizing the threat]

Do NOT use bullet points in the Analysis section. Make sure all scores are fully justified by the listed evidence.

STRUCTURE:
## Porter's Five Forces

[For each of the 5 forces, output the subheader, Score, Evidence, Reasoning, and Analysis]

### Overall Assessment
[flowing prose paragraph]

### Strategic Implication
[flowing prose paragraph]

Output only polished markdown.`;

export function buildWriterPrompt(a: Record<string, unknown>, companyName: string, _role?: string): { systemPrompt: string; userPrompt: string } {
  return { systemPrompt: WRITER_SYSTEM_PROMPT, userPrompt: `Write Porter's Five Forces for ${companyName}.\n\nANALYSIS:\n${JSON.stringify(a, null, 2)}` };
}

export function buildPrompt(k: CompanyKnowledgeBase, companyName: string, _role?: string): { systemPrompt: string; userPrompt: string } {
  return { systemPrompt: WRITER_SYSTEM_PROMPT, userPrompt: `Write Porter's Five Forces for ${companyName}.\n\nKB:\n${JSON.stringify(k, null, 2)}` };
}
