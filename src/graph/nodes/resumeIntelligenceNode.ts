import { generateSection } from "../../prompts/llm";

const PROMPT = `You are an Elite McKinsey Recruiting Specialist and former FAANG Hiring Partner.
Your job is to reverse engineer raw resume text into a structured Candidate Knowledge Graph (CKG).

CRITICAL INSTRUCTIONS:
1. Extract identity, education, experience, projects, achievements, skills, and tools.
2. Evaluate growth trajectory (growth from junior to senior or analyst to manager).
3. Evaluate ownership (evidence of owning roadmaps, features, or metrics).
4. Evaluate business impact & metrics density (identify bullets with concrete numbers, revenue growth, or time savings).
5. Extract candidate brand (e.g. Growth PM, Technical Operator, Consultant-turned-Builder).
6. List structural strengths and gaps/weaknesses.

Output ONLY valid JSON matching this exact structure:
{
  "candidate": {
    "identity": {
      "name": "John Doe",
      "brand": "Growth-focused Product Manager"
    },
    "experience": [
      {
        "company": "Google",
        "role": "Product Manager",
        "duration": "2022 - Present",
        "bullets": [
          "Owned growth initiatives for Google Ads, driving $12M in incremental run-rate."
        ]
      }
    ],
    "education": [
      {
        "institution": "Stanford University",
        "degree": "MBA",
        "year": "2022"
      }
    ],
    "projects": [
      {
        "name": "ML Bidding Engine",
        "description": "Led cross-functional team to build predictive bids."
      }
    ],
    "leadership": ["Managed 3 designers and 8 software developers"],
    "achievements": ["Recipient of Google Founders Award"],
    "skills": ["A/B Testing", "SQL", "Product Roadmap"],
    "tools": ["Amplitude", "Jira"],
    "industries": ["AdTech", "B2B SaaS"],
    "business_functions": ["Product Management", "Growth Strategy"],
    "metrics": ["$12M in incremental run-rate", "14% conversion lift"],
    "keywords": ["growth", "bidding", "conversion", "roadmap"],
    "strengths": ["Strong quantitative analysis", "Cross-functional ownership"],
    "gaps": ["No hardware product experience"],
    "growth_trajectory": "Transitioned from Software Engineer to Senior PM within 4 years."
  }
}`;

export async function resumeIntelligenceNode(state: any) {
  const resumeText = state.resumeText || "";
  if (!resumeText.trim()) {
    return { resumeIntelligence: { candidate: {} } };
  }

  const userPrompt = `Deconstruct this raw resume text into the Candidate Knowledge Graph:
  
  """
  ${resumeText}
  """
  
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
    return { resumeIntelligence: parsed, resumeFacts: parsed };
  } catch (err: any) {
    console.error("[resumeIntelligenceNode] failed:", err);
    return {
      resumeIntelligence: null,
      errors: [`Resume Intelligence extraction failed: ${err.message}`]
    };
  }
}
