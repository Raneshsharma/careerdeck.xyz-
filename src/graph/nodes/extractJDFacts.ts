import type { CompanyState, JDFacts } from "../state";
import { generateSection } from "../../prompts/llm";

const JD_ANALYZER_SYSTEM_PROMPT = `You are a Senior McKinsey Talent Intelligence Analyst and former FAANG Hiring Manager.
Your job is NOT to summarize a job description. Your job is to REVERSE ENGINEER it into a structured JD Knowledge Graph.

PHILOSOPHY:
- Don't decode the JD. Decode the HIRING MANAGER.
- A job description is a compressed specification of the ideal candidate. Your mission is to decompress it into actionable intelligence.
- Hidden expectations matter more than stated ones. "Excellent communication" means influence without authority. "Fast-paced" means high ambiguity. "Ownership" means work independently with minimal guidance.

CRITICAL INSTRUCTIONS:
1. Classify seniority (e.g., "Junior", "Mid-Level", "Senior", "Lead", "Director").
2. Extract "must_have_skills" vs "good_to_have_skills" — distinguish what will get you rejected vs what scores bonus points.
3. For every "responsibility", analyze WHY it exists (business rationale), which KPI it drives, what the failure mode is, and who the stakeholders are.
4. Infer "business_problems" the company is trying to solve by hiring for this role — not what they said, but what they MEANT.
5. Extract "hidden_expectations" — decode corporate euphemisms into their true meaning and implication.
6. Extract ALL "ats_keywords" with frequency counts. Count how many times the keyword (or synonyms) appear.
7. Extract "hiring_signals" — patterns like repeated words, urgent wording, growth language, leadership emphasis, or customer obsession.
8. Predict "interview_signals" — the 5-7 most likely interview questions based on responsibilities and hiring signals.
9. Generate "star_blueprints" for top 3-4 responsibilities — Situation, Task, Action, Result frameworks.
10. Identify "red_flags" — phrases that signal potential challenges (e.g., "wear multiple hats" = understaffed, "fast-paced" = unclear processes).
11. Map "fit_dimensions" — dimensions the hiring manager will evaluate candidates on, scored by importance.
12. Infer "expectations_30_60_90" — what the manager will expect at 30, 60, 90 days based on JD language.

Output ONLY valid JSON matching this exact structure:
{
  "role": "Senior Product Manager",
  "company": "Acme Corp",
  "department": "Product",
  "seniority": "Senior",
  "location": "Remote / Bangalore",
  "employment_type": "Full-Time",
  "must_have_skills": [
    "5+ years of product management experience",
    "Proficiency in SQL and data analysis",
    "Experience with Agile/Scrum methodologies"
  ],
  "good_to_have_skills": [
    "Experience with ML/AI products",
    "Background in B2B SaaS"
  ],
  "responsibilities": [
    {
      "responsibility": "Own and prioritize the product roadmap",
      "why_it_exists": "The company is scaling rapidly and needs structured feature prioritization to avoid engineering waste.",
      "business_kpi": "Sprint delivery rate and feature adoption",
      "failure_mode": "Roadmap bloat, missed release deadlines, team misalignment.",
      "stakeholders": ["Engineering Lead", "CEO", "Sales", "Customer Success"]
    }
  ],
  "tools": ["Jira", "Amplitude", "Figma", "SQL", "Notion"],
  "business_problems": [
    {
      "problem": "Roadmap chaos and misaligned engineering priorities",
      "inferred_cause": "Rapid growth without structured product processes",
      "impacted_metric": "Time-to-market and engineering efficiency"
    }
  ],
  "stakeholders": [
    {
      "stakeholder": "Engineering Lead",
      "influence": "High",
      "frequency": "Daily",
      "goal": "Clear, stable, well-specified requirements."
    }
  ],
  "success_metrics": [
    "Feature adoption rate (>20% MoM)",
    "Sprint velocity improvement (>10%)",
    "NPS improvement by end of Q2"
  ],
  "hidden_expectations": [
    {
      "phrase": "Excellent communication skills",
      "true_meaning": "Influence without formal authority across Engineering, Sales, and Leadership.",
      "implication": "You will need to sell ideas up, down, and sideways without relying on your title."
    },
    {
      "phrase": "Work in a fast-paced environment",
      "true_meaning": "Processes are still evolving and ambiguity is the norm.",
      "implication": "You must self-structure and create clarity where none exists."
    }
  ],
  "keywords": ["product roadmap", "agile", "stakeholder management", "data-driven", "user research"],
  "ats_keywords": [
    {
      "keyword": "product roadmap",
      "frequency": 4,
      "importance": "Critical"
    },
    {
      "keyword": "stakeholder management",
      "frequency": 3,
      "importance": "High"
    }
  ],
  "resume_keywords": [
    "Owned end-to-end product roadmap",
    "Data-driven prioritization",
    "Cross-functional stakeholder alignment"
  ],
  "hiring_signals": [
    {
      "signal_type": "Ownership emphasis",
      "evidence": "'Own', 'drive', 'lead' used 7+ times",
      "implication": "Manager wants self-starters who take full accountability, not executors who wait for direction."
    },
    {
      "signal_type": "Data obsession",
      "evidence": "'Data-driven', 'metrics', 'analytics' appear 5 times",
      "implication": "Every decision is expected to be backed by quantitative evidence."
    }
  ],
  "culture_signals": [
    "Bias for action over perfection",
    "Customer obsession mentioned twice",
    "Cross-functional collaboration is central"
  ],
  "interview_signals": [
    {
      "question_type": "Behavioral / Ownership",
      "predicted_question": "Tell me about a time you had to prioritize competing product features with limited engineering resources.",
      "why_likely": "'Own the roadmap' and 'data-driven prioritization' appear repeatedly, signaling this is a core evaluation dimension."
    },
    {
      "question_type": "Case / Product Sense",
      "predicted_question": "How would you improve our core user activation metric by 20% in Q2?",
      "why_likely": "The JD emphasizes activation metrics and user growth as top KPIs."
    }
  ],
  "star_blueprints": [
    {
      "responsibility": "Own and prioritize the product roadmap",
      "situation": "At [Company], our engineering team was working on 12+ simultaneous features with no clear prioritization framework, causing a 40% miss rate on quarterly OKRs.",
      "task": "I was responsible for introducing a structured prioritization system and aligning 4 departments on a single source-of-truth roadmap.",
      "action": "I implemented RICE scoring, ran roadmap review sessions weekly with Engineering and Sales, and created a public Notion dashboard for visibility across the org.",
      "result": "Sprint delivery predictability improved from 60% to 92% in 2 quarters. The CEO cited roadmap clarity as a key driver of the Series B raise narrative."
    }
  ],
  "red_flags": [
    {
      "phrase": "Wear multiple hats",
      "interpretation": "The team is small and under-resourced. You will likely handle scope beyond your title.",
      "risk_level": "Medium"
    },
    {
      "phrase": "Comfortable with ambiguity",
      "interpretation": "Company may lack clear processes, documentation, or leadership direction.",
      "risk_level": "High"
    }
  ],
  "fit_dimensions": [
    {
      "dimension": "Analytical Thinking",
      "importance": "Critical",
      "signals_from_jd": "'Data-driven decisions', 'metrics-focused', 'SQL proficiency required'"
    },
    {
      "dimension": "Stakeholder Management",
      "importance": "Critical",
      "signals_from_jd": "'Cross-functional collaboration', 'influence without authority', 'executive communication'"
    }
  ],
  "expectations_30_60_90": {
    "day_30": [
      "Shadow all major stakeholders and understand team workflows",
      "Audit existing roadmap and backlog health",
      "Deliver a prioritized list of quick wins for engineering"
    ],
    "day_60": [
      "Own the sprint planning and backlog grooming fully",
      "Present a revised quarterly roadmap to leadership",
      "Establish a data tracking spec for top 3 KPIs"
    ],
    "day_90": [
      "Deliver first major feature with measurable business impact",
      "Run first end-to-end product review cycle",
      "Establish trust and rhythm with Engineering and Design teams"
    ]
  },
  "confidence": {
    "seniority": "High",
    "hidden_expectations": "High",
    "business_problems": "Medium",
    "ats_keywords": "High",
    "star_blueprints": "Medium"
  }
}`;

export async function extractJDFactsNode(
  state: CompanyState,
): Promise<Partial<CompanyState>> {
  const roleTitle = state.role || "Product Manager";
  const companyName = state.companyName || "";
  const jd = state.jobDescription || "";

  try {
    const userPrompt = `Analyze this Job Description for the role "${roleTitle}" ${companyName ? `at "${companyName}"` : ""}.

JOB DESCRIPTION:
${jd || "No job description provided. Use your expert knowledge of this role and company context to infer the most likely hiring intent, expectations, and candidate specification."}

Return ONLY the structured JD Knowledge Graph JSON.`;

    const response = await generateSection(JD_ANALYZER_SYSTEM_PROMPT, userPrompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON object found in JD facts extraction response");
    }

    const jdFacts: JDFacts = JSON.parse(jsonMatch[0]);
    return { jdFacts };
  } catch (error) {
    console.error("[extractJDFactsNode] Failed to extract JD facts, using stub fallback:", error);
    const fallbackFacts: JDFacts = {
      role: roleTitle,
      company: companyName,
      department: null,
      seniority: "Mid-Level",
      location: "Not specified",
      employment_type: "Full-Time",
      must_have_skills: ["Relevant domain experience", "Communication skills", "Problem-solving ability"],
      good_to_have_skills: ["Domain certifications", "Advanced tooling knowledge"],
      responsibilities: [{
        responsibility: "Execute core role responsibilities",
        why_it_exists: "Drives the team's key business outcomes.",
        business_kpi: "Delivery efficiency",
        failure_mode: "Missed deadlines and stakeholder misalignment.",
        stakeholders: ["Manager", "Team"]
      }],
      tools: ["Standard office tools", "Collaboration platforms"],
      business_problems: [{ problem: "Execution gap", inferred_cause: "Growth requiring additional expertise", impacted_metric: "Delivery velocity" }],
      stakeholders: [{ stakeholder: "Direct Manager", influence: "High", frequency: "Daily", goal: "Reliable execution and delivery." }],
      success_metrics: ["On-time delivery", "Stakeholder satisfaction"],
      hidden_expectations: [{ phrase: "Fast-paced environment", true_meaning: "High ambiguity and evolving processes.", implication: "You must self-structure and create clarity where none exists." }],
      keywords: [roleTitle, "stakeholder management", "delivery"],
      ats_keywords: [{ keyword: roleTitle, frequency: 3, importance: "Critical" }],
      resume_keywords: ["Delivered measurable results", "Cross-functional collaboration"],
      hiring_signals: [{ signal_type: "Ownership emphasis", evidence: "Ownership language used throughout", implication: "Self-starters preferred over executors." }],
      culture_signals: ["Collaborative environment", "Results-oriented"],
      interview_signals: [{ question_type: "Behavioral", predicted_question: "Tell me about a time you delivered a project under pressure.", why_likely: "Ownership and delivery are core themes." }],
      star_blueprints: [{ responsibility: "Core responsibility", situation: "At my previous company, we faced [challenge].", task: "I was responsible for [objective].", action: "I [specific actions taken].", result: "We achieved [measurable outcome]." }],
      red_flags: [{ phrase: "Wear multiple hats", interpretation: "Team may be under-resourced.", risk_level: "Medium" }],
      fit_dimensions: [{ dimension: "Execution", importance: "Critical", signals_from_jd: "Delivery and ownership language throughout JD." }],
      expectations_30_60_90: { day_30: ["Learn team workflows and stakeholders"], day_60: ["Own first deliverable"], day_90: ["Demonstrate measurable business impact"] },
      confidence: { seniority: "Low", hidden_expectations: "Medium", ats_keywords: "Low" }
    };
    return { jdFacts: fallbackFacts };
  }
}
