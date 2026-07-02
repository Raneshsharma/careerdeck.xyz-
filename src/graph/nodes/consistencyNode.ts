import { generateSection } from "../../prompts/llm";

const PROMPT = `You are a Senior Recruiter and Forensic Career Intelligence Auditor.
Your job is to run a deep comparison between the candidate's Resume and their LinkedIn Profile.
Identify any inconsistencies, mismatches, gaps, or missed opportunities for synergy.

CRITICAL SCREENING CHECKLIST:
1. Date Mismatches: Check if employment start/end dates for the same company differ between the Resume and LinkedIn.
2. Title Inconsistencies: Check if roles have conflicting titles (e.g. "Senior Manager" vs "Intern").
3. Missing Accomplishments: Identify high-impact achievements, projects, or metrics present on the Resume but completely missing on the LinkedIn profile.
4. Positioning Differences: Analyze if the two documents tell completely different branding stories.
5. Skill Gaps: List skills that are highlighted on the resume but missing from the LinkedIn profile's skills section.

Output ONLY valid JSON:
{
  "consistency": {
    "consistency_score": 0,
    "date_mismatches": [
      {
        "company": "",
        "resume_dates": "",
        "linkedin_dates": "",
        "issue": "",
        "impact": "High|Medium|Low"
      }
    ],
    "title_inconsistencies": [
      {
        "company": "",
        "resume_title": "",
        "linkedin_title": "",
        "issue": "",
        "impact": "High|Medium|Low"
      }
    ],
    "missing_achievements_in_linkedin": [
      {
        "company": "",
        "achievement": "",
        "why_it_matters": "",
        "impact": "High|Medium|Low"
      }
    ],
    "positioning_differences": {
      "resume_focus": "",
      "linkedin_focus": "",
      "mismatch_explanation": "",
      "recommendation": ""
    },
    "skills_mismatches": [
      {
        "skill": "",
        "status": "On Resume, Missing on LinkedIn | On LinkedIn, Missing on Resume",
        "recommendation": ""
      }
    ]
  }
}`;

export async function consistencyNode(state: any) {
  const resume = state.resumeText;
  const linkedin = state.linkedinText;

  // If either resume or linkedin is missing, we bypass
  if (!resume || !linkedin) {
    return {
      consistencyIntelligence: {
        consistency: {
          consistency_score: 100,
          bypassed: true,
          reason: "Both Resume and LinkedIn profile text are required to perform a consistency audit."
        }
      }
    };
  }

  const userPrompt = `Perform a career consistency audit comparing this Resume and LinkedIn profile:

RESUME TEXT:
${resume}

LINKEDIN PROFILE TEXT:
${linkedin}

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
    return { consistencyIntelligence: parsed };
  } catch (err: any) {
    console.error("[consistencyNode] failed:", err);
    return {
      consistencyIntelligence: null,
      errors: [`Consistency Intelligence failed: ${err.message}`]
    };
  }
}
