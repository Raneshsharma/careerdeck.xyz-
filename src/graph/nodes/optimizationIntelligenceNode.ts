import { generateSection } from "../../prompts/llm";

const PROMPT = `You are an Elite McKinsey Recruiting Specialist.
Your job is to audit and optimize a candidate's resume keywords, metrics density, business language, and experience bullets.

STRICT EVIDENCE VALIDATOR RULE:
- NEVER fabricate, invent, or exaggerate achievements or metrics.
- If a bullet lacks metrics, flag it as a gap and suggest exactly what metrics to look for or ask the user to input them.
- Do NOT rewrite a bullet to include fake percentages or dollar amounts. Instead, write a template with placeholder fields (e.g. "[X]%") and guide the user on how to calculate it.
- Focus on teaching the candidate why the bullet is weak and how to restructure it under the STAR format using their own genuine experiences.

CRITICAL INSTRUCTIONS:
1. Identify matched, missing, weak, and overused keywords.
2. Analyze experience bullets and provide: Original bullet, Problem detected, Reason, Template rewrite, Why better, and JD alignment.
3. Calculate metrics density and identify missing telemetry points.
4. Flagg weak action verbs and list strong power verbs to use.

Output ONLY valid JSON matching this exact structure:
{
  "keywords": [
    { "word": "A/B Testing", "status": "Matched" },
    { "word": "SQL Query Optimization", "status": "Missing" },
    { "word": "Stakeholder Alignment", "status": "Weak Usage" }
  ],
  "bullet_audits": [
    {
      "original": "Worked on dashboard.",
      "problems": ["Weak verb", "No metrics", "No business value"],
      "reason": "Does not explain what decisions the dashboard drove or what metrics it improved.",
      "rewrite": "Developed a custom Power BI telemetry dashboard tracking [X]% conversion rates, saving [Y] hours weekly for [Z] stakeholders.",
      "why_better": "Frames the dashboard as an execution solution with measurable time savings and stakeholder value.",
      "jd_alignment": "Aligns with the JD's requirement for driving data-driven decisions."
    }
  ],
  "metrics_density": {
    "current": 45,
    "target": 90,
    "missing_telemetry": ["Revenue impact", "User adoption numbers"]
  },
  "action_verbs": {
    "weak_used": ["worked", "helped", "participated"],
    "strong_suggested": ["Owned", "Spearheaded", "Scaled", "Optimized"]
  }
}`;

export async function optimizationIntelligenceNode(state: any) {
  const resumeIntel = state.resumeIntelligence || {};
  const matchingIntel = state.matchingIntelligence || {};
  const jdText = state.jobDescription || "";

  const userPrompt = `Audit and optimize this candidate profile for the job:
  JD Text:
  ${jdText}
  
  CANDIDATE KNOWLEDGE GRAPH:
  ${JSON.stringify(resumeIntel, null, 2)}
  
  MATCHING INTELLIGENCE:
  ${JSON.stringify(matchingIntel, null, 2)}
  
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
    return { optimizationIntelligence: parsed };
  } catch (err: any) {
    console.error("[optimizationIntelligenceNode] failed:", err);
    return {
      optimizationIntelligence: null,
      errors: [`Optimization Intelligence failed: ${err.message}`]
    };
  }
}
