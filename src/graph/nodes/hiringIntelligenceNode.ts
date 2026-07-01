import { generateSection } from "../../prompts/llm";

const PROMPT = `You are a Panel of Interviewers: a Recruiter, a Hiring Manager, and a Director.
Your job is to simulate a complete screening loop for the candidate and provide realistic persona-specific feedback.

CRITICAL INSTRUCTIONS:
1. Recruiter (8-second scan): What catches their eye first? What are their quick rejection points?
2. Hiring Manager (technical & team screen): What technical queries do they have? What STAR behavioral questions will they ask to test alignment?
3. Director/Panel (strategic & leadership check): What concerns them about business acumen? What are the key offer risks?
4. Generate the most likely predicted questions and STAR blueprint structures for the candidate.

Output ONLY valid JSON matching this exact structure:
{
  "recruiter_feedback": {
    "gaze_path": ["Education history at Stanford", "First job title at Google"],
    "rejection_triggers": ["Limited tenure in the last software engineering role"],
    "verdict": "Pass to Hiring Manager"
  },
  "hiring_manager_feedback": {
    "loved_points": ["Strong metrics in bidding engine project"],
    "concerns": ["Candidate has not worked directly on B2B SaaS roadmaps"],
    "predicted_behavioral_questions": [
      {
        "question": "Tell me about a time you owned a product feature end-to-end under high ambiguity.",
        "eval_bar": "Looking for clear evidence of prioritizing engineering sprint goals without direct guidance.",
        "star_hints": "Use your Google Ads growth project as the base."
      }
    ],
    "verdict": "Interview"
  },
  "panel_feedback": {
    "strategic_depth": "Medium. Candidate understands technical execution, but needs to showcase more top-line business strategy.",
    "offer_risks": ["Competing offers", "Expected salary band differences"],
    "verdict": "Conditional Hire"
  }
}`;

export async function hiringIntelligenceNode(state: any) {
  const resumeIntel = state.resumeIntelligence || {};
  const matchingIntel = state.matchingIntelligence || {};
  const optIntel = state.optimizationIntelligence || {};
  const jdText = state.jobDescription || "";

  const userPrompt = `Simulate the hiring screening for this target role:
  JD Text:
  ${jdText}
  
  CANDIDATE KNOWLEDGE GRAPH:
  ${JSON.stringify(resumeIntel, null, 2)}
  
  MATCHING INTELLIGENCE:
  ${JSON.stringify(matchingIntel, null, 2)}
  
  OPTIMIZATION INTELLIGENCE:
  ${JSON.stringify(optIntel, null, 2)}
  
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
    return { hiringIntelligence: parsed };
  } catch (err: any) {
    console.error("[hiringIntelligenceNode] failed:", err);
    return {
      hiringIntelligence: null,
      errors: [`Hiring Intelligence failed: ${err.message}`]
    };
  }
}
