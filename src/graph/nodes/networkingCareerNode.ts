import { generateSection } from "../../prompts/llm";

const PROMPT = `You are a Senior Career Strategist and Professional Network Intelligence Expert.
Your job is to analyze a LinkedIn profile's networking potential and career trajectory.

CRITICAL RULES:
1. Never invent connections, posts, or activity not present in the LKG.
2. Base career trajectory predictions on evidence: actual roles, progression, skills, and industries.
3. Networking recommendations must be specific and actionable, not generic.
4. Career direction must include reasoning from actual evidence in the LKG.
5. Skill gap analysis must compare current skills vs. skills required for predicted target roles.

Output ONLY valid JSON:
{
  "networking_career": {
    "networking_assessment": {
      "connection_quality": "High|Medium|Low",
      "recommendation_strength": "Strong|Moderate|Weak|None",
      "content_authority": "High|Medium|Low",
      "community_participation": "Active|Moderate|Inactive",
      "visibility_score": 0,
      "networking_gaps": []
    },
    "networking_recommendations": {
      "who_to_connect_with": [],
      "communities_to_join": [],
      "companies_to_follow": [],
      "discoverability_actions": []
    },
    "content_strategy": {
      "current_themes": [],
      "recommended_pillars": [],
      "posting_frequency": "",
      "content_types": [],
      "authority_topics": []
    },
    "career_trajectory": {
      "current_position": "",
      "direction": "",
      "momentum": "Strong|Moderate|Stagnant",
      "top_5_target_roles": [
        {
          "role": "",
          "fit_score": 0,
          "reasoning": "",
          "gap": ""
        }
      ]
    },
    "skill_gaps": {
      "critical": [],
      "important": [],
      "nice_to_have": []
    },
    "learning_roadmap": [
      {
        "skill": "",
        "resource_type": "",
        "time_required": "",
        "impact": "High|Medium|Low",
        "reasoning": ""
      }
    ],
    "professional_moat_gaps": []
  }
}`;

export async function networkingCareerNode(state: any) {
  const lkg = state.linkedinIntelligence;
  const brand = state.brandIntelligence;
  const optimization = state.linkedinOptimization;
  if (!lkg?.profile) {
    return { networkingCareerIntelligence: null };
  }

  const userPrompt = `Analyze networking potential and career trajectory from this intelligence:

LINKEDIN KNOWLEDGE GRAPH:
${JSON.stringify(lkg, null, 2)}

BRAND INTELLIGENCE:
${JSON.stringify(brand, null, 2)}

OPTIMIZATION INTELLIGENCE:
${JSON.stringify(optimization, null, 2)}

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
    return { networkingCareerIntelligence: parsed };
  } catch (err: any) {
    console.error("[networkingCareerNode] failed:", err);
    return {
      networkingCareerIntelligence: null,
      errors: [`Networking & Career Intelligence failed: ${err.message}`]
    };
  }
}
