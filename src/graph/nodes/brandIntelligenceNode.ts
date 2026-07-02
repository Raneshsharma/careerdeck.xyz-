import { generateSection } from "../../prompts/llm";

const PROMPT = `You are an Elite Personal Branding Strategist and Career Intelligence Expert.
Your job is to analyze a LinkedIn Knowledge Graph (LKG) and derive the candidate's Professional Brand Intelligence.

CRITICAL INSTRUCTIONS:
1. Never invent information. Only reference evidence present in the LKG.
2. Identify the primary brand archetype: how recruiters and the market perceive this person.
3. Derive secondary and supporting archetypes to complete the brand picture.
4. Identify the professional moat: what makes this candidate uniquely difficult to replace.
5. Evaluate narrative consistency: is the career story coherent and progressive?
6. Identify brand gaps: what is missing from the brand that weakens recruiter perception.
7. Assess brand clarity: would a recruiter immediately understand this person's value?

Brand Archetypes to consider:
Builder | Operator | Growth Leader | Product Thinker | Consultant | Analyst | Strategist |
Customer Champion | Creator | Researcher | Engineer | Founder | Connector | Domain Expert |
Data Leader | Marketing Specialist | Sales Leader | Finance Expert | People Leader

Output ONLY valid JSON:
{
  "brand": {
    "primary_archetype": {
      "name": "",
      "evidence": [],
      "confidence": "High|Medium|Low"
    },
    "secondary_archetype": {
      "name": "",
      "evidence": [],
      "confidence": "High|Medium|Low"
    },
    "supporting_archetype": {
      "name": "",
      "evidence": [],
      "confidence": "High|Medium|Low"
    },
    "professional_moat": "",
    "moat_evidence": [],
    "career_narrative": "",
    "narrative_consistency": "Strong|Moderate|Weak",
    "narrative_gaps": [],
    "brand_clarity": "High|Medium|Low",
    "brand_strengths": [],
    "brand_gaps": [],
    "differentiation": "",
    "authority_signals": [],
    "credibility_markers": []
  }
}`;

export async function brandIntelligenceNode(state: any) {
  const lkg = state.linkedinIntelligence;
  if (!lkg?.profile) {
    return { brandIntelligence: null };
  }

  const userPrompt = `Derive the Professional Brand Intelligence from this LinkedIn Knowledge Graph:

${JSON.stringify(lkg, null, 2)}

Target Role Context: ${state.role || "Not specified"}
Target Company: ${state.companyName || "Not specified"}

Return ONLY the JSON.`;

  try {
    const rawResult = await generateSection(PROMPT, userPrompt);
    let parsed: any = {};
    const jsonMatch = rawResult.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      parsed = JSON.parse(rawResult);
    }
    return { brandIntelligence: parsed };
  } catch (err: any) {
    console.error("[brandIntelligenceNode] failed:", err);
    return {
      brandIntelligence: null,
      errors: [`Brand Intelligence failed: ${err.message}`]
    };
  }
}
