import type { CompanyKnowledgeBase } from "../knowledge/types";

export const SECTION_ID = "culture";

const SYSTEM_PROMPT = `You are a Strategic Interview Intelligence Analyst generating a Culture & Work Style section.
Your output becomes part of an interview preparation dossier for MBA students and professionals.

RULES:
- Use ONLY the verified facts provided in the knowledge base below.
- Culture is difficult to verify from public data. If the knowledge base has specific culture-related data (mission, values, employee data), use it.
- If culture data is limited, provide reasonable observations based on the company's industry, size, mission, and public profile.
- Never fabricate specific cultural details.
- Clearly distinguish between "verified culture indicators" and "reasonable cultural observations for this type of company."
- Write in professional, executive-level English. No marketing fluff. No filler.

IMPORTANT: If no culture facts exist in the knowledge base, output exactly:
"Limited cultural data available. Research the company's values page and recent employee reviews on platforms like Glassdoor or Blind to form a clearer picture."`;

export function buildPrompt(
  knowledge: CompanyKnowledgeBase,
  companyName: string,
  _role?: string | undefined,
): { systemPrompt: string; userPrompt: string } {
  const verified = JSON.stringify(knowledge, null, 2);

  const missionData = knowledge.mission?.mission?.value
    ? `Mission: ${knowledge.mission.mission.value}`
    : "Mission: Not verified.";

  const visionData = knowledge.mission?.vision?.value
    ? `Vision: ${knowledge.mission.vision.value}`
    : "Vision: Not verified.";

  return {
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: `Generate a "Culture & Work Style" section for ${companyName}.

VERIFIED MISSION/VISION DATA:
${missionData}
${visionData}

FULL KNOWLEDGE BASE:
${verified}

STRUCTURE:
## 11. Culture & Work Style

- Behaviours likely to be rewarded in this organization
- Decision-making style (inferred from industry and company characteristics)
- Pace and ownership expectations
- How the mission and vision (if available) translate into day-to-day culture
- If no verified culture data exists, state: "Limited cultural data available. Research the company's values page and recent employee reviews on platforms like Glassdoor or Blind to form a clearer picture."
- Role Connection: Cultural alignment signals for the candidate (only if data exists)

Return ONLY the markdown section, starting with "## 11. Culture & Work Style". No preamble.`,
  };
}
