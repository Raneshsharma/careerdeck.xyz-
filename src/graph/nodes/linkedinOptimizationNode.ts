import { generateSection } from "../../prompts/llm";

const PROMPT = `You are an Elite LinkedIn Optimization Specialist and Personal Branding Consultant.
Your job is to generate specific, actionable optimization plans for each LinkedIn profile section.

CRITICAL RULES:
1. NEVER invent experience, achievements, metrics, recommendations, certifications, or posts not in the LKG.
2. NEVER use placeholder metrics like [X]%, [Y] users, or [insert number].
3. If a metric is missing, say "Add: [specific data point the user should gather]" — do not fabricate it.
4. Every optimization must improve either: Professional Brand, Recruiter Visibility, or Hiring Readiness.
5. Explain WHY each change improves the profile — not just what to change.
6. Prioritize by impact: High / Medium / Low.

For each section generate: Current → Problem → Reason → Optimized Version → Why Better → Priority.
Optimized versions must be written in full — not just described.
Headline optimizations: provide exactly 3 alternatives.
About optimizations: provide one complete rewrite.

Output ONLY valid JSON:
{
  "optimization": {
    "headline": {
      "current": "",
      "problems": [],
      "alternatives": ["", "", ""],
      "why_better": "",
      "priority": "High|Medium|Low",
      "estimated_impact": ""
    },
    "about": {
      "current_summary": "",
      "problems": [],
      "optimized_version": "",
      "why_better": "",
      "priority": "High|Medium|Low",
      "estimated_impact": ""
    },
    "experience": [
      {
        "company": "",
        "role": "",
        "current_bullets": [],
        "problems": [],
        "optimized_bullets": [],
        "why_better": "",
        "priority": "High|Medium|Low"
      }
    ],
    "skills": {
      "current": [],
      "missing_high_priority": [],
      "missing_medium_priority": [],
      "recommended_removals": [],
      "skill_clusters": {
        "technical": [],
        "business": [],
        "leadership": [],
        "industry": []
      }
    },
    "featured": {
      "current": [],
      "recommendations": [],
      "priority": "High|Medium|Low"
    },
    "certifications": {
      "current": [],
      "recommended": [],
      "priority": "High|Medium|Low"
    },
    "overall_optimization_score": 0,
    "top_3_improvements": []
  }
}`;

export async function linkedinOptimizationNode(state: any) {
  const lkg = state.linkedinIntelligence;
  const brand = state.brandIntelligence;
  const recruiter = state.recruiterIntelligence;
  if (!lkg?.profile) {
    return { linkedinOptimization: null };
  }

  const userPrompt = `Generate LinkedIn optimization plans from this intelligence:

LINKEDIN KNOWLEDGE GRAPH:
${JSON.stringify(lkg, null, 2)}

BRAND INTELLIGENCE:
${JSON.stringify(brand, null, 2)}

RECRUITER EVALUATION:
${JSON.stringify(recruiter, null, 2)}

Target Role: ${state.role || "Not specified"}
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
    return { linkedinOptimization: parsed };
  } catch (err: any) {
    console.error("[linkedinOptimizationNode] failed:", err);
    return {
      linkedinOptimization: null,
      errors: [`LinkedIn Optimization failed: ${err.message}`]
    };
  }
}
