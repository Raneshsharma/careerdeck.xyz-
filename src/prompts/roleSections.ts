import type { RoleFacts } from "../graph/state";

export const ROLE_SECTION_IDS = [
  "roleOverview", "businessContext", "roleMission", "roleEvolution",
  "dayInLife", "responsibilities", "stakeholders", "kpis",
  "decisionAuthority", "businessImpact", "skills", "tools",
  "knowledgeAreas", "blueprint", "aiInRole", "careerPath",
  "compensation", "interviewPrep", "first90Days", "scenarios"
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
    roleOverview: "Decompose the primary objective of the role, why companies hire for it, and what core business problem it solves.",
    businessContext: "Decompose where the role fits organizationally, what departmental goals it supports, and what happens if the role performs poorly.",
    roleMission: "Decompose the core mission of this role. Why does it exist? What business problem disappears if the role performs well?",
    roleEvolution: "Decompose the historical trajectory of the role (past 5-10 years) and future trends (automation, shifts) over the next decade.",
    dayInLife: "Decompose a typical weekly time allocation, recurring meetings, and typical day-to-day decisions and operational bottlenecks.",
    responsibilities: "Decompose the core responsibilities and structure typical projects (project, objective, stakeholders, deliverables, success metrics).",
    stakeholders: "Build a structured Stakeholder Influence Map listing stakeholders, influence level, frequency, goals, and conflicts.",
    kpis: "Build a KPI Tree mapping the North Star metric down to activation, retention, revenue, and operational metrics.",
    decisionAuthority: "Decompose decision authority: what the role owns, influences, approves, and escalates.",
    businessImpact: "Trace activities to business metrics, customers, revenue, and profitability (Role -> Activities -> Metrics -> Revenue -> Customer -> Profit).",
    skills: "Decompose required technical, business, and communication skills. Build a Role Scorecard scoring skills from 1-10.",
    tools: "Decompose daily-use software, analytics tools, reporting dashboards, and what tools to learn beforehand.",
    knowledgeAreas: "Decompose essential business knowledge, industry frameworks, decision-making methodologies (e.g. RICE, MoSCoW, Opportunity Solution Tree) and when/not to use them.",
    blueprint: "Decompose top performer habits, winning mindset, and common failure modes that average performers make.",
    aiInRole: "Decompose practical AI use cases, time savings, prompt templates, automation workflows, and risks.",
    careerPath: "Build a multi-stage Career Roadmap (e.g. Year 0 -> Year 2 -> Year 5) mapping stages, timeframe, required skills, expected projects, promotion signals, and salary growth.",
    compensation: "Decompose compensation ranges, bonus structures, adjacent comparisons, and drivers of faster progression.",
    interviewPrep: "Decompose common question types, what interviewers are testing, common pitfalls, and a structured STAR worked framework example.",
    first90Days: "Decompose a structured onboarding plan: what to learn, relationships to build, quick wins (30/60/90 days), and pitfalls.",
    scenarios: "Build a realistic operational scenario involving ambiguous data and conflicting stakeholder priorities, asking 'What would you do?' and outlining a strong solution framework."
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
    roleEvolution: "Write a paragraph tracing the role's evolution over the last 10 years and projecting how AI, automation, and organizational design will shape it in the next decade.",
    dayInLife: "Write a descriptive paragraph detailing the weekly time allocation (e.g., meetings vs. focus work) and operational workflow. Use bolding for key activities.",
    responsibilities: "Write a structured paragraph on core responsibilities. Follow this with a Markdown table mapping 'Typical Projects':\n| Project | Objective | Stakeholders | Deliverables | Success Metrics |\nUse only projects from the analysis.",
    stakeholders: "Generate a markdown table mapping the Stakeholder Influence Map:\n| Stakeholder | Influence Level | Frequency | Key Goal | Common Conflict |\nFollow this with a short paragraph detailing trust-building strategies.",
    kpis: "Build a visual Markdown KPI Tree:\n- **North Star Metric**: [Metric]\n  - **Activation Metric**: [Metric]\n  - **Retention Metric**: [Metric]\n  - **Operational Metrics**: [Metric]\nWrite 2-3 sentences explaining the linkage between these levels.",
    decisionAuthority: "Format a structured Decision Rights block:\n- **Owns (Independent Decisions)**: [list]\n- **Influences**: [list]\n- **Approves**: [list]\n- **Escalates (Requires Approval)**: [list]\nFollow with a brief explanation of how authority changes during scaling.",
    businessImpact: "Trace the business impact using this visual chain:\n**Role** -> **Activities** -> **Metrics** -> **Revenue** -> **Customer** -> **Profit**\nFollow with an explanation of how daily tasks directly move the company's financial needle.",
    skills: "Generate a markdown table representing the **Role Scorecard**:\n| Skill / Competency | Required Level (1-10) | Description / Core Focus |\nInclude technical, business, and communication dimensions. Follow with a short paragraph explaining the distinguishing traits.",
    tools: "Write a paragraph describing daily-use tools and technologies, reporting dashboards, and what software a candidate should master before Day 1.",
    knowledgeAreas: "Write a paragraph explaining critical business concepts. Follow this with a Markdown table of **Decision Frameworks**:\n| Framework | Best Applied When | Avoid Using When | Core Logic |\nInclude frameworks like RICE, MoSCoW, opportunity trees, or JTBD.",
    blueprint: "Write a strategic paragraph on top performer habits. Create a sub-section on **Common Failure Modes** (e.g., tactical tunnel vision, stakeholder isolation) and how to avoid them.",
    aiInRole: "Write a strategic paragraph on AI in the role. Provide 2-3 specific time-saving AI use cases, prompt examples, automation opportunities, and risk mitigations.",
    careerPath: "Build a multi-stage **Career Roadmap** table:\n| Stage / Title | Timeframe | Core Skills | Target Projects | Promotion Signals | Salary Growth |\nFollow with a short paragraph explaining exit opportunities.",
    compensation: "Write a detailed paragraph on compensation ranges, variable pay drivers, performance incentives, and adjacent salary comparisons.",
    interviewPrep: "Write a tactical paragraph on what interviewers test. Provide a **STAR Framework Worked Example** mapping a common question, Situation, Task, Action, and Result.",
    first90Days: "Create a structured 30/60/90 days plan:\n- **Days 1-30 (Learn & Align)**: [bullet list]\n- **Days 31-60 (Execute & Integrate)**: [bullet list]\n- **Days 61-90 (Optimize & Scale)**: [bullet list]\nFollow with a short paragraph on early relationship building.",
    scenarios: "Present the complex scenario from the analysis under the header '### Real-World Interview Case Scenario'. Ask the question 'What would you do?' and outline the structural factors a strong candidate must address in their solution."
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
