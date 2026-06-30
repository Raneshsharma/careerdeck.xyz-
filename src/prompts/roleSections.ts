import type { RoleFacts } from "../graph/state";

export const ROLE_SECTION_IDS = [
  "roleOverview", "businessContext", "roleMission", "roleOperatingSystem",
  "businessImpact", "decisionIntelligence", "responsibilities", "stakeholders",
  "crossFunctionalCollaboration", "kpis", "skills", "tools",
  "knowledgeAreas", "productivityIntelligence", "typicalProblems", "blueprint",
  "maturityModel", "careerPath", "compensation", "interviewPrep",
  "first90Days", "scenarios", "businessVocabulary", "functionalPriorities"
];

// Analyst System Prompt Builder
export function buildRoleAnalystPrompt(
  sectionId: string,
  roleFacts: RoleFacts | null,
  companyName: string,
  roleTitle: string,
): { systemPrompt: string; userPrompt: string } {
  const dataStr = roleFacts ? JSON.stringify(roleFacts, null, 2) : "No role facts available";

  const objectives: Record<string, string> = {
    roleOverview: "Analyze the role's core purpose in one minute. Establish why companies hire for it and the main business issue it resolves.",
    businessContext: "Decompose where the role sits in the organizational structure and P&L hierarchy.",
    roleMission: "Decompose the Role Mission: why does this role exist, and what business problem disappears if it performs perfectly?",
    roleOperatingSystem: "Decompose the Role Operating System: Inputs -> Decisions -> Execution -> Metrics -> Feedback -> Iteration.",
    businessImpact: "Build a structured Business Impact Graph tracing Activities -> Output -> Department KPI -> Business KPI -> Financial Impact.",
    decisionIntelligence: "Decompose the Decision Intelligence: Decisions owned, decisions influenced, approvals, escalations, and typical trade-offs.",
    responsibilities: "Deconstruct the day-to-day responsibilities into strategic business metrics, and map key projects (objective, deliverables, success metrics).",
    stakeholders: "Build a Stakeholder Influence Map analyzing key stakeholders, their goals, and potential friction points.",
    crossFunctionalCollaboration: "Decompose cross-functional needs: what departments want (e.g. Engineering stability vs Sales features) and friction points.",
    kpis: "Decompose the KPI Tree: North Star -> Activation -> Retention -> Revenue -> Operational metrics.",
    skills: "Build a Competency Framework (Beginner vs Intermediate vs Advanced) and a 1-10 Role Scorecard.",
    tools: "Build Tool Intelligence: analyze Daily tools, why used, frequency, and AI alternatives.",
    knowledgeAreas: "Analyze Mental Models and industry frameworks (e.g., JTBD, DuPont, AARRR) applied in this role.",
    productivityIntelligence: "Decompose Productivity Intelligence: AI assistance, automation opportunities, and human-only strengths.",
    typicalProblems: "Decompose Typical Business Problems this role regularly tackles and the KPIs they impact.",
    blueprint: "Decompose Top Performer Habits (the top 1% behaviors) and Failure Intelligence (why people fail).",
    maturityModel: "Build a Maturity Model: junior vs mid vs senior expectations, and What Great Looks Like.",
    careerPath: "Decompose the Capability Roadmap: Year 1 (Execution) -> Year 3 (Ownership) -> Year 5 (Strategy) -> Year 8 (Leadership), promotion signals, and salary growth.",
    compensation: "Decompose salary ranges, variables, performance incentives, and adjacent salary options.",
    interviewPrep: "Decompose common questions, pitfalls leading to rejection, and a worked STAR framework blueprint.",
    first90Days: "Decompose the 30/60/90 days plan: learn, integrate, optimize, and quick wins.",
    scenarios: "Decompose a complex, ambiguous real-world interview case study with conflicting stakeholder priorities, asking 'What would you do?' and outlining a strong solution framework.",
    businessVocabulary: "Decompose 5-10 role-specific business terminology terms and typical usages.",
    functionalPriorities: "Decompose job-family specific priorities based on the role's job_family (e.g., Product Discovery & Prioritization for Product PM)."
  };

  const objective = objectives[sectionId] || "Analyze this role section.";

  const systemPrompt = `You are a Senior McKinsey Organizational Analyst.
Your job: analyze the role "${roleTitle}" ${companyName ? `at "${companyName}"` : ""} and produce a structured analysis for the section "${sectionId}".

OBJECTIVE:
${objective}

INSTRUCTIONS:
1. Use ONLY the facts in the Role Knowledge Graph. Do not invent details.
2. Structure your analysis as a valid JSON object matching the requested output format.
3. If data is missing for a required field, set it to null or provide a qualified assessment based on general professional standards for this role.

Output ONLY valid JSON.`;

  const userPrompt = `Perform the analysis for "${sectionId}" of the role "${roleTitle}".

ROLE KNOWLEDGE GRAPH:
${dataStr}

Return ONLY the JSON.`;

  return { systemPrompt, userPrompt };
}

// Writer System Prompt Builder
export function buildRoleWriterPrompt(
  sectionId: string,
  analysis: Record<string, unknown>,
  companyName: string,
  roleTitle: string,
): { systemPrompt: string; userPrompt: string } {
  const structures: Record<string, string> = {
    roleOverview: "Write a high-fidelity McKinsey-style prose paragraph outlining the role's primary objective and why it is a critical organizational pillar.",
    businessContext: "Write a strategic paragraph explaining the role's departmental placement, financial relevance, and the downstream impact of poor execution.",
    roleMission: "Write a strategic summary of the Role Mission. Highlight what core value would disappear from the organization if this role was eliminated. End with a bolded Executive Insight.",
    roleOperatingSystem: "Build the visual **Role Operating System** using Markdown blocks or lists:\n- **Inputs (What triggers work)**: [list]\n- **Decisions (What you weigh)**: [list]\n- **Execution (What you produce)**: [list]\n- **Metrics (How you are measured)**: [list]\n- **Feedback & Iteration (How you improve)**: [list]\nFollow this with a brief strategic explanation of the loop.",
    businessImpact: "Build the visual **Business Impact Graph** flow:\n**Activity** -> **Output** -> **Department KPI** -> **Business KPI** -> **Financial Impact**\nFollow with an explanation of how daily tasks directly move the company's financial needle (revenue, cost, customer, risk).",
    decisionIntelligence: "Build a structured Decision rights block:\n- **Decisions Owned (Independent Decisions)**: [list]\n- **Decisions Influenced**: [list]\n- **Approvals Required**: [list]\n- **Escalation Triggers (Requires Approval)**: [list]\nFollow this with a Markdown table mapping **Typical Trade-offs**:\n| Scenario | Trade-off Option A | Trade-off Option B | Deciding Factor |",
    responsibilities: "Write a structured paragraph on core responsibilities. Follow this with a Markdown table mapping 'Typical Projects':\n| Project | Objective | Stakeholders | Deliverables | Success Metrics |\nUse only projects from the analysis.",
    stakeholders: "Generate a markdown table mapping the Stakeholder Influence Map:\n| Stakeholder | Influence Level | Frequency | Key Goal | Common Conflict |\nFollow this with a short paragraph detailing trust-building strategies.",
    crossFunctionalCollaboration: "Write a paragraph detailing cross-functional dynamics. Follow this with a Markdown table:\n| Department | Needs & Incentives | Common Friction Point | How to Resolve |\nMap department requirements (e.g. Engineering stability vs Sales features).",
    kpis: "Build a visual Markdown KPI Tree:\n- **North Star Metric**: [Metric]\n  - **Activation Metric**: [Metric]\n  - **Retention Metric**: [Metric]\n  - **Operational Metrics**: [Metric]\nWrite 2-3 sentences explaining the linkage between these levels.",
    skills: "Generate a markdown table representing the **Competency Framework**:\n| Competency | Beginner Level | Intermediate Level | Advanced Level |\nFollow this with a markdown table representing the **Role Scorecard**:\n| Dimension | Score Needed (1-10) | Core Focus |",
    tools: "Generate a markdown table mapping **Tool Intelligence**:\n| Tool | Why Used | Frequency | Learning Priority | AI Alternative |",
    knowledgeAreas: "Write a paragraph explaining critical business concepts. Follow this with a Markdown table of **Mental Models & Frameworks**:\n| Model / Framework | Best Applied When | Avoid Using When | Core Logic |",
    productivityIntelligence: "Build the **Productivity Intelligence** stack:\n- **AI Assistance (Immediate Time Savings)**: [list]\n- **Automation Opportunities**: [list]\n- **Human-only Strengths (Your Moat)**: [list]\nWrite 2-3 sentences explaining how to leverage AI to scale your capacity.",
    typicalProblems: "Write a paragraph explaining typical business problems. Follow this with a Markdown table:\n| Business Problem | Why It Matters | Impacted KPI | Strategic Workaround |",
    blueprint: "Write a strategic paragraph on top performer habits. Create a sub-section on **Failure Intelligence** detailing why people fail (Skill gaps, behavioral mistakes, prioritization issues).",
    maturityModel: "Build the **Role Maturity Model**:\n- **Junior / Execution Level**: [capabilities]\n- **Mid / Ownership Level**: [capabilities]\n- **Senior / Strategy Level**: [capabilities]\nFollow this with a section on **What Great Looks Like** (how leadership knows someone is exceptional).",
    careerPath: "Build a multi-stage **Capability Roadmap** table:\n| Stage / Title | Timeframe | Core Skills | Target Projects | Promotion Signals | Salary Growth |\nFollow with a short paragraph explaining exit opportunities.",
    compensation: "Write a detailed paragraph on compensation ranges, variable pay drivers, performance incentives, and adjacent salary comparisons.",
    interviewPrep: "Write a tactical paragraph on what interviewers test. Provide a **STAR Framework Worked Example** mapping a common question, Situation, Task, Action, and Result.",
    first90Days: "Create a structured 30/60/90 days plan:\n- **Days 1-30 (Learn & Align)**: [bullet list]\n- **Days 31-60 (Execute & Integrate)**: [bullet list]\n- **Days 61-90 (Optimize & Scale)**: [bullet list]\nFollow with a short paragraph on early relationship building.",
    scenarios: "Present the complex scenario from the analysis under the header '### Real-World Interview Case Scenario'. Ask the question 'What would you do?' and outline the structural factors a strong candidate must address in their solution.",
    businessVocabulary: "Generate a markdown table of **Business Vocabulary**:\n| Term | Definition | Example Usage |",
    functionalPriorities: "Write a strategic briefing on the job family's functional pillars (e.g. Discovery & Prioritization for Product). Follow this with a Markdown table of key priorities."
  };

  const structure = structures[sectionId] || "Write the section in McKinsey consulting prose.";

  const systemPrompt = `You are a McKinsey Organizational Strategy Consultant.
Your job: write the finished dossier section "${sectionId}" for the role "${roleTitle}" ${companyName ? `at "${companyName}"` : ""}.

SECTION INSTRUCTIONS:
${structure}

RULES:
1. Write in a clean, professional, objective McKinsey tone. Address the candidate as "you".
2. Use every non-null field from the structured analysis. Do not invent facts or names.
3. Every prose paragraph should answer: "Why does this matter? What is the business implication?"
4. No preamble, no meta-commentary, no conversational fillers. Output ONLY the polished Markdown.
5. Conclude the section with a bolded "**Executive Insight:** [insight]" showing the key strategic takeaway.`;

  const userPrompt = `Write the section "${sectionId}" for the role "${roleTitle}".

STRUCTURED ANALYSIS DATA:
${JSON.stringify(analysis, null, 2)}

Output ONLY polished Markdown.`;

  return { systemPrompt, userPrompt };
}
