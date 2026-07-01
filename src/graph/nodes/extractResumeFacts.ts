import type { CompanyState } from "../state";
import { generateSection } from "../../prompts/llm";

const RESUME_ANALYZER_SYSTEM_PROMPT = `You are an Elite McKinsey Recruiting Specialist and former FAANG Hiring Partner.
Your job is to reverse engineer raw resume text into a structured Candidate/Resume Knowledge Graph.

CRITICAL INSTRUCTIONS:
1. Extract name, education, experience, projects, skills, tools, certifications, achievements, and leadership entries.
2. Structure the experience bullets cleanly. Keep all facts intact, do not summarize them away.
3. Extract industries, strengths, and weaknesses based on the resume content.

Output ONLY valid JSON matching this exact structure:
{
  "candidate": {
    "name": "John Doe",
    "experience": [
      {
        "company": "Google",
        "role": "Software Engineer",
        "duration": "2022 - Present",
        "bullets": [
          "Led development of a high-throughput data processing pipeline using Apache Spark, reducing execution time by 34%."
        ]
      }
    ],
    "education": [
      {
        "institution": "Stanford University",
        "degree": "MS in Computer Science",
        "year": "2022"
      }
    ],
    "projects": [
      {
        "name": "Distributed Key-Value Store",
        "description": "Built a Raft-based distributed key-value store in Go with 99.99% availability under network partitions."
      }
    ],
    "skills": ["Go", "Python", "Distributed Systems", "SQL"],
    "tools": ["Docker", "Kubernetes", "Git"],
    "certifications": ["AWS Certified Solutions Architect"],
    "achievements": ["1st place at Stanford Hackathon"],
    "leadership": ["Led a team of 4 engineers"],
    "languages": ["English", "Mandarin"],
    "keywords": ["distributed systems", "high-throughput", "spark"],
    "quantified_results": ["reduced execution time by 34%"],
    "industries": ["Cloud Computing", "SaaS"],
    "roles": ["Software Engineer", "Backend Engineer"],
    "strengths": ["Strong technical depth", "Distributed systems architecture"],
    "weaknesses": ["Limited business-facing or sales experience"]
  }
}`;

export async function extractResumeFactsNode(state: any) {
  const resumeText = state.resumeText || "";
  if (!resumeText.trim()) {
    return {
      resumeFacts: {
        candidate: {
          name: "Candidate Profile",
          experience: [],
          education: [],
          projects: [],
          skills: [],
          tools: [],
          certifications: [],
          achievements: [],
          leadership: [],
          languages: [],
          keywords: [],
          quantified_results: [],
          industries: [],
          roles: [],
          strengths: [],
          weaknesses: []
        }
      }
    };
  }

  const userPrompt = `Analyze and parse this raw resume text into the Candidate Knowledge Graph:
  
  """
  ${resumeText}
  """
  
  Return ONLY the JSON.`;

  try {
    const rawResult = await generateSection(RESUME_ANALYZER_SYSTEM_PROMPT, userPrompt);
    let parsed: any = {};
    const jsonMatch = rawResult.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      parsed = JSON.parse(rawResult);
    }
    return { resumeFacts: parsed };
  } catch (err: any) {
    console.error("[extractResumeFactsNode] failed:", err);
    return {
      resumeFacts: null,
      errors: [`Resume extraction failed: ${err.message}`]
    };
  }
}
