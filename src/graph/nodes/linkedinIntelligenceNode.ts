import { generateSection } from "../../prompts/llm";

const PROMPT = `You are an Elite LinkedIn Profile Intelligence Specialist and Personal Branding Expert.
Your job is to parse a LinkedIn profile (exported as text) into a structured LinkedIn Knowledge Graph (LKG).

CRITICAL INSTRUCTIONS:
1. Extract every piece of information present in the text. Never invent or assume anything not stated.
2. Extract headline, about/summary, all work experiences with company, title, duration, and bullet points.
3. Extract education, certifications, skills, recommendations, featured items, projects, volunteer work.
4. Identify follower count, connections, creator mode indicators if present.
5. Extract brand signals: leadership language, metric density, ownership vocabulary, authority markers.
6. Infer career progression: junior → senior, individual contributor → manager, specialist → strategist.
7. Extract keywords naturally present in the profile.
8. Note any sections that are missing or sparse.

Output ONLY valid JSON matching this exact structure:
{
  "profile": {
    "name": "",
    "headline": "",
    "about": "",
    "location": "",
    "followers": "",
    "connections": "",
    "creator_mode": false,
    "experience": [
      {
        "company": "",
        "title": "",
        "duration": "",
        "location": "",
        "bullets": []
      }
    ],
    "education": [
      {
        "institution": "",
        "degree": "",
        "field": "",
        "year": ""
      }
    ],
    "projects": [
      {
        "name": "",
        "description": ""
      }
    ],
    "skills": [],
    "certifications": [],
    "licenses": [],
    "featured": [],
    "recommendations": [],
    "endorsements": [],
    "volunteer": [],
    "posts": [],
    "articles": [],
    "keywords": [],
    "industries": [],
    "career_progression": [],
    "brand_signals": [],
    "leadership_signals": [],
    "metrics": [],
    "missing_sections": [],
    "profile_completeness": ""
  }
}`;

export async function linkedinIntelligenceNode(state: any) {
  const linkedinText = state.linkedinText || "";
  if (!linkedinText.trim()) {
    return { linkedinIntelligence: { profile: {} } };
  }

  const userPrompt = `Parse this LinkedIn profile text into the LinkedIn Knowledge Graph:\n\n"""\n${linkedinText}\n"""\n\nReturn ONLY the JSON.`;

  try {
    const rawResult = await generateSection(PROMPT, userPrompt);
    let parsed: any = {};
    const jsonMatch = rawResult.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      parsed = JSON.parse(rawResult);
    }
    return { linkedinIntelligence: parsed };
  } catch (err: any) {
    console.error("[linkedinIntelligenceNode] failed:", err);
    return {
      linkedinIntelligence: null,
      errors: [`LinkedIn Intelligence extraction failed: ${err.message}`]
    };
  }
}
