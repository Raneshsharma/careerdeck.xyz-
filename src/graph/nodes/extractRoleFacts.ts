import type { CompanyState, RoleFacts } from "../state";
import { generateSection } from "../../prompts/llm";

const ROLE_ANALYZER_SYSTEM_PROMPT = `You are a Senior McKinsey Organizational Strategy Consultant and Career Coach.
Your job is to analyze a specific job role and output a structured Role Knowledge Graph in valid JSON.

CRITICAL INSTRUCTIONS:
1. Deconstruct the target role title (e.g. "Associate Product Manager") and the optional Job Description (JD) to extract concrete operational details. Focus on universal role realities, but tailor tools/stakeholders to any specific context provided in the JD.
2. For "daily_work", "weekly_work", and "monthly_work", list specific, practical operational tasks (e.g., "Prioritizing backlog items using RICE", "Conducting cross-functional standups with Engineering").
3. For "stakeholders", detail their influence (High/Med/Low), interaction frequency, primary goal, and potential conflicts.
4. Build a structured "kpis" list and "north_star_metrics".
5. Map specific "projects" (objective, stakeholders, deliverables, success metrics).
6. Map "decision_authority" clearly separating what they Own, Influence, Approve, and Escalate.
7. Map the "career_path" stages, promotion signals, required skills, expected projects, and salary growth.
8. Structure typical "interview" questions (behavioral, technical, case), their types, and evaluation pitfalls.

Output ONLY valid JSON matching this exact structure:
{
  "role_name": "Associate Product Manager",
  "department": "Product Management",
  "reports_to": "Product Lead or Group Product Manager",
  "team_size": "Cross-functional team of 4-8 engineers, 1 designer",
  "core_objective": "Translate product vision into actionable backlogs and coordinate delivery of features that drive activation and retention.",
  "daily_work": [
    "Conduct daily standups and unblock engineering queries",
    "Refine product backlog items and write detailed user stories",
    "Analyze user behavior metrics on Amplitude"
  ],
  "weekly_work": [
    "Run sprint planning and backlog grooming sessions",
    "Meet with Customer Success to gather customer feedback",
    "Review analytics dashboards for feature adoption"
  ],
  "monthly_work": [
    "Report feature KPIs and business impact to Product Lead",
    "Perform competitive analysis and product benchmarking",
    "Synthesize user research sessions"
  ],
  "stakeholders": [
    {
      "stakeholder": "Engineering Team",
      "influence": "High",
      "frequency": "Daily",
      "goal": "Clear specifications, minimal scope creep, high code quality.",
      "conflict": "Trade-offs between technical debt and shipping speed."
    },
    {
      "stakeholder": "Design (UX/UI)",
      "influence": "High",
      "frequency": "Daily",
      "goal": "User-centric layouts, interactive prototypes, design system compliance.",
      "conflict": "Complexity of design vs. engineering feasibility."
    }
  ],
  "north_star_metrics": [
    "Monthly Active Users (MAU)",
    "Feature Adoption Rate"
  ],
  "kpis": [
    "Sprint Velocity (90%+ delivery)",
    "Feature Activation (increase by 15%)",
    "Customer Effort Score (CES)"
  ],
  "tools": [
    "Jira",
    "Amplitude",
    "Figma",
    "Slack",
    "SQL"
  ],
  "skills": [
    "Backlog Prioritization",
    "User Story Writing",
    "Quantitative Data Analysis",
    "Stakeholder Management"
  ],
  "projects": [
    {
      "project": "Onboarding Flow Optimization",
      "objective": "Reduce onboarding drop-offs and improve 7-day user retention.",
      "stakeholders": ["UX Design", "Growth Engineering", "Marketing"],
      "deliverables": ["A/B test design", "optimized sign-up flow screens", "Amplitude tracking spec"],
      "success_metrics": ["12% increase in onboarding completion", "+5% 7-day retention"]
    }
  ],
  "decision_authority": {
    "owns": [
      "User story prioritization and sprint backlog scope",
      "Amplitude analytics tag definition",
      "Daily design-engineering trade-offs"
    ],
    "influences": [
      "Quarterly product roadmap",
      "Target customer segment definition",
      "Technology stack selections"
    ],
    "approves": [
      "User acceptance testing (UAT) results",
      "UX wireframe layouts"
    ],
    "escalates": [
      "Sprint timeline slips exceeding 1 week",
      "Resource hiring and budget allocations",
      "Cross-department SLA conflicts"
    ]
  },
  "success_profile": [
    "Demonstrates extreme ownership of sprint delivery",
    "Applies first-principles thinking to user pain points",
    "Communicates clearly across technical and non-technical stakeholders"
  ],
  "career_path": [
    {
      "stage": "Associate Product Manager",
      "timeframe": "0-2 years",
      "skills_required": ["Agile execution", "Jira proficiency", "Data analytics basics"],
      "projects_expected": ["Feature optimization", "Bug prioritization", "UX enhancements"],
      "promotion_signals": ["Consistently shipping sprints on time", "Proactive data-backed recommendations"],
      "salary_growth": "Base tier for product roles"
    },
    {
      "stage": "Product Manager",
      "timeframe": "2-5 years",
      "skills_required": ["Roadmapping", "Product strategy", "Advanced SQL/Analytics"],
      "projects_expected": ["Core product module launch", "Ecosystem integration"],
      "promotion_signals": ["Ownership of a major KPI metric", "Independent stakeholder management"],
      "salary_growth": "30-50% increase over base"
    }
  ],
  "salary": {
    "range": "$80,000 - $110,000 / INR 12 - 18 LPA",
    "currency": "USD/INR",
    "incentives": "10-15% performance bonus, stock options"
  },
  "interview": {
    "questions": [
      {
        "question": "How would you prioritize a feature backlog if engineering capacity was cut by 50%?",
        "type": "Product Case / Prioritization",
        "framework": "RICE Framework or Opportunity Solution Tree"
      },
      {
        "question": "Tell me about a time you had to resolve a conflict between design and engineering.",
        "type": "Behavioral",
        "framework": "STAR Framework"
      }
    ],
    "pitfalls": [
      "Failing to quantify user impact during prioritization",
      "Sounding like a project coordinator instead of a product owner",
      "Ignoring engineering technical constraints"
    ]
  },
  "company_specific": {}
}`;

export async function extractRoleFactsNode(
  state: CompanyState,
): Promise<Partial<CompanyState>> {
  const roleName = state.role || "Product Manager";
  const jd = state.jobDescription || "";
  const companyName = state.companyName || "";

  try {
    const userPrompt = `Analyze the role "${roleName}" ${companyName ? `at "${companyName}"` : ""}.
    
    JOB DESCRIPTION:
    ${jd || "No job description provided."}
    
    Return ONLY the structured Role Knowledge Graph JSON.`;

    const response = await generateSection(ROLE_ANALYZER_SYSTEM_PROMPT, userPrompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON object found in role facts extraction response");
    }

    const roleFacts: RoleFacts = JSON.parse(jsonMatch[0]);
    return { roleFacts };
  } catch (error) {
    console.error("[extractRoleFactsNode] Failed to extract role facts, using stub fallback:", error);
    // Simple fallback stub to prevent graph failure
    const fallbackFacts: RoleFacts = {
      role_name: roleName,
      department: "Corporate Operations",
      reports_to: "Manager",
      team_size: "Cross-functional team",
      core_objective: `Succeed and execute responsibilities associated with the ${roleName} role.`,
      daily_work: ["Review pending tasks and align with team objectives", "Collaborate on active workflows"],
      weekly_work: ["Review performance metrics and align priorities"],
      monthly_work: ["Report outcomes to leadership"],
      stakeholders: [{ stakeholder: "Team", influence: "High", frequency: "Daily", goal: "Alignment", conflict: "None" }],
      north_star_metrics: ["Execution efficiency"],
      kpis: ["Delivery rate"],
      tools: ["Jira", "MS Office"],
      skills: ["Execution", "Communication"],
      projects: [{ project: "Operational alignment", objective: "Smooth delivery", stakeholders: ["Team"], deliverables: ["Process improvement"], success_metrics: ["Efficiency"] }],
      decision_authority: { owns: ["Daily tasks"], influences: ["Workflow updates"], approves: ["UAT"], escalates: ["Budget issues"] },
      success_profile: ["Proactive execution", "Clear communication"],
      career_path: [{ stage: roleName, timeframe: "0-2 years", skills_required: ["Execution"], projects_expected: ["Standard deliverables"], promotion_signals: ["Consistent results"], salary_growth: "Standard range" }],
      salary: { range: "Market standard", currency: "Local", incentives: "Standard bonus" },
      interview: { questions: [{ question: "Tell me about your experience.", type: "General", framework: "STAR" }], pitfalls: ["Lack of specificity"] },
      company_specific: {}
    };
    return { roleFacts: fallbackFacts };
  }
}
