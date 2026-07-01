import { generateSection } from "../../prompts/llm";

const PROMPT = `You are an Elite McKinsey Career Coach.
Your job is to deconstruct a candidate's profile into their long-term Career Intelligence assets.

CRITICAL INSTRUCTIONS:
1. Define Candidate Moat: What makes them completely unique compared to all other candidates?
2. Construct the Resume Story: A script/narrative answering "Tell me about yourself" that ties their background (e.g., tech to MBA to PM) into a coherent story.
3. Build the Learning Roadmap: Missing competencies and courses/projects to build over the next 3, 6, and 12 months.
4. Extract their unique Candidate Brand positioning.

Output ONLY valid JSON matching this exact structure:
{
  "moat": {
    "dimensions": ["High Technical Depth", "Data-driven Growth expertise"],
    "summary": "Your unique moat is the rare combination of Go/systems engineering depth with MBA-level growth/revenue strategy."
  },
  "brand": "The Technical Growth Operator",
  "resume_story": "I started my career as a backend systems engineer at Stanford... realized I wanted to drive top-line product strategy, so I went to MBA... now I focus on high-scale growth product management.",
  "learning_roadmap": [
    {
      "topic": "SaaS Financial Models",
      "timeline": "Next 30 days",
      "suggested_resource": "Reforge Product Strategy course / read IRR annual filings",
      "action_item": "Build a mock cohort retention ledger"
    }
  ]
}`;

export async function careerIntelligenceNode(state: any) {
  const resumeIntel = state.resumeIntelligence || {};
  const matchingIntel = state.matchingIntelligence || {};
  const hiringIntel = state.hiringIntelligence || {};

  const userPrompt = `Deconstruct the career assets and coaching roadmap for this candidate:
  
  CANDIDATE KNOWLEDGE GRAPH:
  ${JSON.stringify(resumeIntel, null, 2)}
  
  MATCHING & HIRING INTELLIGENCE:
  ${JSON.stringify(matchingIntel, null, 2)}
  ${JSON.stringify(hiringIntel, null, 2)}
  
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
    return { careerIntelligence: parsed };
  } catch (err: any) {
    console.error("[careerIntelligenceNode] failed:", err);
    return {
      careerIntelligence: null,
      errors: [`Career Intelligence failed: ${err.message}`]
    };
  }
}
