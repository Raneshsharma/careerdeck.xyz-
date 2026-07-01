import { generateSection } from "../../prompts/llm";

const PROMPT = `You are an Elite McKinsey Recruiting Specialist.
Your job is to match a candidate's profile against a Job Description, Role, and Company, and evaluate fit and gaps.

CRITICAL INSTRUCTIONS:
1. Compare candidate experiences, skills, and brand against the target requirements.
2. Compute quantitative fit scores (0-100) for dimensions: Overall Match, Technical Match, Leadership Match, Ownership Match, Communication Match, Business Match, and Culture Match.
3. Compare the candidate side-by-side against a "Top 10% Candidate" benchmark on key parameters (Metrics, Leadership, Ownership, Tech Depth).
4. Highlight major matching indicators and major gap risks.

Output ONLY valid JSON matching this exact structure:
{
  "scores": {
    "overall": 87,
    "technical": 90,
    "leadership": 78,
    "ownership": 85,
    "communication": 95,
    "business": 82,
    "culture": 80
  },
  "benchmarks": [
    {
      "dimension": "Metrics Density",
      "candidate_score": 6,
      "top_performer_score": 10,
      "gap": 4,
      "explanation": "You have metrics in some bullets, but top performers quantify every single entry."
    }
  ],
  "fit_highlights": [
    "Proven experience driving ad revenue conversion, which aligns with the company's core focus."
  ],
  "gap_risks": [
    "No explicit experience managing stakeholder alignment in large enterprise matrix setups."
  ]
}`;

export async function matchingIntelligenceNode(state: any) {
  const resumeIntel = state.resumeIntelligence || {};
  const companyName = state.companyName || "";
  const roleTitle = state.role || "Target Role";
  const jdText = state.jobDescription || "";

  const userPrompt = `Compare the Candidate Knowledge Graph against the target opportunity:
  Company: ${companyName}
  Role: ${roleTitle}
  JD:
  ${jdText}
  
  CANDIDATE KNOWLEDGE GRAPH:
  ${JSON.stringify(resumeIntel, null, 2)}
  
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
    return { matchingIntelligence: parsed };
  } catch (err: any) {
    console.error("[matchingIntelligenceNode] failed:", err);
    return {
      matchingIntelligence: null,
      errors: [`Matching Intelligence failed: ${err.message}`]
    };
  }
}
