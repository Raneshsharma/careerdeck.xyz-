import type { CompanyState, RoleFacts } from "../state";
import { generateSection } from "../../prompts/llm";

const ROLE_ANALYZER_SYSTEM_PROMPT = `You are a Senior McKinsey Organizational Strategy Consultant and Career Coach.
Your job is to analyze a specific job role and output a structured Role Knowledge Graph in valid JSON.

CRITICAL INSTRUCTIONS:
1. Deconstruct the target role title (e.g. "Associate Product Manager") and the optional Job Description (JD) to extract concrete operational details. Focus on universal role realities, but tailor tools/stakeholders to any specific context provided in the JD.
2. Determine the "job_family" of the role. Choose strictly one of: "product", "sales", "engineering", "finance", "marketing", "general".
3. Extract the "role_operating_system": what are the inputs, decisions, execution, metrics, feedback, and iterations of this role's workflows.
4. Define the "business_impact_graph" tracing activities -> output -> department KPI -> business KPI -> financial impact.
5. Define "decision_intelligence" detailing what the role owns, influences, approves, escalates, and typical trade-offs.
6. Detail "typical_business_problems" (e.g., for product: prioritization delays, technical debt, scope creep).
7. List "stakeholders" and "cross_functional_collaboration" dynamics.
8. Build a detailed "competency_framework" mapping at least 3-4 competencies with Beginner vs Intermediate vs Advanced expectations.
9. List "tools" with why used, frequency, and AI alternatives.
10. Detail the "maturity_model" (junior vs mid vs senior expectations) and "productivity_intelligence" (AI help, automation, human strengths).
11. Build a "business_vocabulary" of 5-10 concepts and typical usages.
12. Build the "functional_priorities" matching the job_family pillars (e.g., Product: Discovery, Prioritization, Frameworks).

Output ONLY valid JSON matching this exact structure:
{
  "role_name": "Associate Product Manager",
  "job_family": "product",
  "department": "Product Management",
  "reports_to": "Product Lead or Group Product Manager",
  "team_size": "Cross-functional team of 4-8 engineers, 1 designer",
  "core_objective": "Translate product vision into actionable backlogs and coordinate delivery of features that drive activation and retention.",
  "daily_work": [
    "Conduct daily standups and unblock engineering queries",
    "Refine product backlog items and write detailed user stories"
  ],
  "weekly_work": [
    "Run sprint planning and backlog grooming sessions",
    "Review analytics dashboards for feature adoption"
  ],
  "monthly_work": [
    "Report feature KPIs and business impact to Product Lead",
    "Perform competitive analysis and product benchmarking"
  ],
  "role_operating_system": {
    "inputs": ["User feedback tickets", "analytics data", "business objectives"],
    "decisions": ["Prioritizing user stories", "UI/UX layout trade-offs"],
    "execution": ["Sprint planning", "writing specifications", "UAT testing"],
    "metrics": ["Feature adoption", "sprint velocity", "bug rate"],
    "feedback": ["Retrospectives", "user reviews", "stakeholder reviews"],
    "iteration": ["Backlog adjustments", "process improvements"]
  },
  "business_impact_graph": {
    "activity": "Writing specifications & prioritizing stories",
    "output": "High-quality, focused sprint backlog",
    "department_kpi": "Sprint velocity and delivery predictability",
    "business_kpi": "Feature activation and user onboarding rates",
    "financial_impact": "Accelerates time-to-market, reducing development waste and driving customer LTV."
  },
  "decision_intelligence": {
    "owns": [
      "User story prioritization and sprint backlog scope",
      "Daily design-engineering trade-offs"
    ],
    "influences": [
      "Quarterly product roadmap",
      "Target customer segment definition"
    ],
    "approves": [
      "User acceptance testing (UAT) results",
      "UX wireframe layouts"
    ],
    "escalates": [
      "Sprint timeline slips exceeding 1 week",
      "Resource hiring and budget allocations"
    ],
    "typical_tradeoffs": [
      "Technical debt vs. rapid feature delivery",
      "User experience polish vs. development speed"
    ]
  },
  "typical_business_problems": [
    {
      "problem": "Scope Creep",
      "why_it_matters": "Delays release cycles and dilutes core feature focus.",
      "impacted_kpi": "Sprint predictability & Release timeline"
    }
  ],
  "stakeholders": [
    {
      "stakeholder": "Engineering Team",
      "influence": "High",
      "frequency": "Daily",
      "goal": "Clear specifications, minimal scope creep, high code quality.",
      "conflict": "Trade-offs between technical debt and shipping speed."
    }
  ],
  "cross_functional_collaboration": [
    {
      "department": "Engineering",
      "needs_and_incentives": "Code stability, clear specs, minimal context switching.",
      "common_friction_point": "Last-minute requirement changes."
    }
  ],
  "north_star_metrics": [
    "Monthly Active Users (MAU)",
    "Feature Adoption Rate"
  ],
  "kpis": [
    "Sprint Velocity (90%+ delivery)",
    "Feature Activation (increase by 15%)"
  ],
  "competency_framework": [
    {
      "competency": "Analytical Thinking",
      "beginner": "Pulls basic reports and notes obvious trends.",
      "intermediate": "Combines multiple data sources to identify root causes and run A/B test analysis.",
      "advanced": "Defines custom tracking architecture and drives long-term strategic decisions from behavior telemetry."
    }
  ],
  "tools": [
    {
      "tool": "Jira",
      "why_used": "Sprint tracking, ticket grooming, and workflow management.",
      "frequency": "Daily",
      "ai_alternative": "Jira AI agents for ticket auto-generation."
    }
  ],
  "skills": [
    "Backlog Prioritization",
    "User Story Writing",
    "Quantitative Data Analysis"
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
  "success_profile": [
    "Demonstrates extreme ownership of sprint delivery",
    "Applies first-principles thinking to user pain points"
  ],
  "maturity_model": [
    {
      "level": "Junior / Associate",
      "focus": "Execution & Delivery",
      "capabilities": ["Writing user stories", "running scrum standups", "basic QA"]
    }
  ],
  "productivity_intelligence": {
    "ai_assistance": ["Generating draft user stories from feature briefs", "summarizing user feedback"],
    "automation_opportunities": ["Automated status report generation", "syncing Jira tickets with design specs"],
    "human_only_strengths": ["Stakeholder negotiations", "defining product vision", "cross-functional conflict resolution"]
  },
  "career_path": [
    {
      "stage": "Associate Product Manager",
      "timeframe": "0-2 years",
      "skills_required": ["Agile execution", "Jira proficiency"],
      "projects_expected": ["Feature optimization", "Bug prioritization"],
      "promotion_signals": ["Consistently shipping sprints on time", "Proactive data-backed recommendations"],
      "salary_growth": "Base tier for product roles"
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
      }
    ],
    "pitfalls": [
      "Failing to quantify user impact during prioritization",
      "Sounding like a project coordinator instead of a product owner"
    ]
  },
  "business_vocabulary": [
    {
      "term": "Backlog",
      "definition": "A prioritized list of work for the development team derived from the product roadmap and its requirements.",
      "example_usage": "We need to groom the backlog before the sprint planning session."
    }
  ],
  "functional_priorities": [
    {
      "pillar": "Product Discovery",
      "description": "Identifying the right customer problems to solve before committing engineering resource.",
      "framework_used": "Opportunity Solution Tree"
    }
  ],
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
    const fallbackFacts: RoleFacts = {
      role_name: roleName,
      job_family: "general",
      department: "Corporate Operations",
      reports_to: "Manager",
      team_size: "Cross-functional team",
      core_objective: `Succeed and execute responsibilities associated with the ${roleName} role.`,
      daily_work: ["Review pending tasks and align with team objectives"],
      weekly_work: ["Review performance metrics and align priorities"],
      monthly_work: ["Report outcomes to leadership"],
      role_operating_system: {
        inputs: ["Operations data", "Team requests"],
        decisions: ["Task scheduling"],
        execution: ["Daily standups"],
        metrics: ["Delivery rate"],
        feedback: ["Gaps identified"],
        iteration: ["Workflow optimization"]
      },
      business_impact_graph: {
        activity: "Operational execution",
        output: "Predictable deliveries",
        department_kpi: "On-time delivery",
        business_kpi: "Operational efficiency",
        financial_impact: "Reduces overhead cost."
      },
      decision_intelligence: { owns: ["Daily tasks"], influences: ["Workflow updates"], approves: ["QA specs"], escalates: ["Budget constraints"], typical_tradeoffs: ["Speed vs. Quality"] },
      typical_business_problems: [{ problem: "Operational Bottleneck", why_it_matters: "Delays project release.", impacted_kpi: "On-time delivery" }],
      stakeholders: [{ stakeholder: "Team", influence: "High", frequency: "Daily", goal: "Alignment", conflict: "None" }],
      cross_functional_collaboration: [{ department: "Operations", needs_and_incentives: "Predictability", common_friction_point: "Scope creep" }],
      north_star_metrics: ["Execution efficiency"],
      kpis: ["Delivery rate"],
      competency_framework: [{ competency: "Analytical Execution", beginner: "Runs reports", intermediate: "Solves standard problems", advanced: "Redesigns processes" }],
      tools: [{ tool: "Jira", why_used: "Task tracking", frequency: "Daily", ai_alternative: "Jira AI" }],
      skills: ["Execution", "Communication"],
      projects: [{ project: "Operational alignment", objective: "Smooth delivery", stakeholders: ["Team"], deliverables: ["Process improvement"], success_metrics: ["Efficiency"] }],
      success_profile: ["Proactive execution", "Clear communication"],
      maturity_model: [{ level: "Associate", focus: "Execution", capabilities: ["Task delivery"] }],
      productivity_intelligence: { ai_assistance: ["Writing drafts"], automation_opportunities: ["Status sync"], human_only_strengths: ["Strategy"] },
      career_path: [{ stage: roleName, timeframe: "0-2 years", skills_required: ["Execution"], projects_expected: ["Standard deliverables"], promotion_signals: ["Consistent results"], salary_growth: "Standard range" }],
      salary: { range: "Market standard", currency: "Local", incentives: "Standard bonus" },
      interview: { questions: [{ question: "Tell me about your experience.", type: "General", framework: "STAR" }], pitfalls: ["Lack of specificity"] },
      business_vocabulary: [{ term: "SLA", definition: "Service Level Agreement", example_usage: "We must hit the SLA." }],
      functional_priorities: [{ pillar: "Execution", description: "Getting things done", framework_used: "Agile" }],
      company_specific: {}
    };
    return { roleFacts: fallbackFacts };
  }
}
