import type { JDFacts } from "../graph/state";

export const JD_SECTION_IDS = [
  "jdOverview", "hiringIntent", "hiddenExpectations", "responsibilityIntelligence",
  "skillsIntelligence", "atsIntelligence", "hiringSignals", "businessProblems",
  "stakeholderMap", "kpiIntelligence", "interviewPrediction", "starBlueprint",
  "resumeMatch", "expectations3060", "redFlags", "companyAlignment",
  "fitScore", "interviewCheatSheet"
];

export function buildJDAnalystPrompt(
  sectionId: string,
  jdFacts: JDFacts | null,
  companyName: string,
  roleTitle: string,
): { systemPrompt: string; userPrompt: string } {
  const dataStr = jdFacts ? JSON.stringify(jdFacts, null, 2) : "No JD facts available";

  const objectives: Record<string, string> = {
    jdOverview: "Summarize this opportunity in one minute: What is this role, why does it exist right now, what is the biggest challenge the new hire will face, and what is the biggest opportunity?",
    hiringIntent: "Reverse engineer the hiring manager's true intent. What business problem are they ACTUALLY trying to solve by making this hire? What would failure look like for them?",
    hiddenExpectations: "Decode corporate euphemisms and implicit signals in the JD. What is truly expected that was never written explicitly?",
    responsibilityIntelligence: "Deconstruct each responsibility: why it exists, which business KPI it drives, what the failure mode is, and who the key stakeholders are.",
    skillsIntelligence: "Categorize all skills: Must Have (deal-breaker if missing), Good to Have (bonus points), and Learn Later (can be acquired on the job). Identify the 2-3 skills that will make or break candidacy.",
    atsIntelligence: "Extract every ATS keyword, its frequency in the JD, importance level, and how to naturally embed it in a resume or cover letter.",
    hiringSignals: "Analyze hiring signals: repeated words, urgency language, ownership emphasis, data language, growth wording, leadership signals, and what they reveal about evaluation criteria.",
    businessProblems: "Infer the underlying business problems this hire is meant to solve — not what the JD says, but what the company truly needs.",
    stakeholderMap: "Map the key stakeholders this role will work with, their influence level, interaction frequency, and what they want from this hire.",
    kpiIntelligence: "Infer how success will be measured. What metrics will define a strong performer at 6 months? At 1 year?",
    interviewPrediction: "Predict the 5-7 most likely interview questions based on responsibilities, hiring signals, and hidden expectations. Explain WHY each question is likely.",
    starBlueprint: "Build STAR blueprints for the top 3-4 responsibilities. For each, provide a situation template, task framing, action strategies, and measurable result targets.",
    resumeMatch: "Analyze the gap between a typical candidate's resume and this JD. Identify missing keywords, weak bullet structures, ATS score risks, and specific improvements.",
    expectations3060: "Infer the hiring manager's real expectations at 30, 60, and 90 days based on the JD language, seniority, and business context.",
    redFlags: "Identify red flag phrases in the JD, their true interpretations, and the risk level. Help the candidate make an informed decision about whether to apply.",
    companyAlignment: "Explain why THIS role exists inside THIS company right now. Connect the JD to the company's strategic priorities, growth stage, and competitive situation.",
    fitScore: "Build a multi-dimensional Candidate Fit Scorecard. For each dimension, rate its importance (Critical/High/Medium) based on JD signals.",
    interviewCheatSheet: "Generate a one-page Interview Cheat Sheet: top keywords, key themes, predicted questions with 1-line answer frameworks, must-demonstrate behaviors, and the hiring manager's likely evaluation lens."
  };

  const objective = objectives[sectionId] || "Analyze this JD section.";

  const systemPrompt = `You are a Senior McKinsey Talent Intelligence Analyst and former FAANG Hiring Manager.
Your job: analyze the JD for "${roleTitle}" ${companyName ? `at "${companyName}"` : ""} and produce a structured analysis for the section "${sectionId}".

PHILOSOPHY: Don't decode the JD. Decode the HIRING MANAGER.

OBJECTIVE:
${objective}

INSTRUCTIONS:
1. Use ONLY the facts in the JD Knowledge Graph. Do not hallucinate job details.
2. Structure your analysis as a valid JSON object.
3. Where data is ambiguous, apply expert inference and label it clearly.

Output ONLY valid JSON.`;

  const userPrompt = `Perform the analysis for "${sectionId}" of the JD for "${roleTitle}".

JD KNOWLEDGE GRAPH:
${dataStr}

Return ONLY the JSON.`;

  return { systemPrompt, userPrompt };
}

export function buildJDWriterPrompt(
  sectionId: string,
  analysis: Record<string, unknown>,
  companyName: string,
  roleTitle: string,
): { systemPrompt: string; userPrompt: string } {
  const structures: Record<string, string> = {
    jdOverview: "Write a high-impact 'JD in One Minute' summary. Answer: What is this role? Why does it exist? What is the biggest challenge? What is the biggest opportunity? Use a tight, punchy format with bold labels.",
    hiringIntent: "Write a 'Hiring Manager Intent' section. Explain what the hiring manager is ACTUALLY trying to solve — not just what the JD says. End with a bolded 'What this means for you:' paragraph on how to position yourself.",
    hiddenExpectations: "Generate a 'Hidden Expectations' table:\n| JD Phrase | What It Actually Means | Interview Implication |\nFollow with a short strategic paragraph on how to demonstrate alignment with these hidden expectations.",
    responsibilityIntelligence: "Write a 'Responsibility Intelligence' section. For each responsibility, build a mini analysis block:\n**[Responsibility]**\n- *Why It Exists*: [reason]\n- *Business KPI*: [metric]\n- *Failure Mode*: [consequence]\n- *Key Stakeholders*: [list]",
    skillsIntelligence: "Generate a 'Skills Intelligence' classification:\n| Skill | Category | Why It Matters | How to Demonstrate |\nCategories: Must Have / Good to Have / Learn Later. Follow with a paragraph identifying the 2-3 skills that will decide candidacy.",
    atsIntelligence: "Generate an 'ATS Intelligence' table:\n| Keyword | Frequency in JD | Importance | Resume Placement Tip |\nFollow with 3-5 bullet points on how to optimize the resume for ATS without keyword stuffing.",
    hiringSignals: "Generate a 'Hiring Signals' analysis. Build a table:\n| Signal Type | Evidence from JD | What It Reveals About Evaluation Criteria |\nFollow with a strategic paragraph on what the interviewer will care about most.",
    businessProblems: "Write a 'Business Problems You Will Solve' section. Map each inferred problem:\n**Problem**: [problem]\n**Inferred Cause**: [cause]\n**Business Impact**: [metric]\nFollow with a paragraph on how to frame your experience as solutions to these exact problems.",
    stakeholderMap: "Generate a 'Stakeholder Map' table:\n| Stakeholder | Influence Level | Interaction Frequency | What They Want From You |\nFollow with a short paragraph on how to build trust with the most critical stakeholders early.",
    kpiIntelligence: "Write a 'KPI Intelligence' section mapping inferred success metrics:\n- **6-Month KPIs**: [list]\n- **1-Year KPIs**: [list]\nFollow with a paragraph on how to frame your past achievements in terms of these metrics.",
    interviewPrediction: "Generate 'Interview Predictions':\n| Question Type | Predicted Question | Why It's Likely | 1-Line Answer Framework |\nInclude behavioral, case, technical, culture, and leadership question types.",
    starBlueprint: "Build 'STAR Blueprints' for each top responsibility:\n### [Responsibility]\n**Situation Template**: [template]\n**Task**: [task framing]\n**Action Strategies**: [specific approaches]\n**Result Target**: [measurable outcome to aim for]\nMake it usable as-is for interview prep.",
    resumeMatch: "Write a 'Resume Match Analysis' section:\n- **Missing Keywords**: [list]\n- **Missing Achievements**: [list]\n- **Weak Bullet Patterns to Fix**: [examples]\n- **ATS Risk Areas**: [list]\n- **Recommended Resume Improvements**: [numbered list]",
    expectations3060: "Build a '30-60-90 Day Expectations' plan based on JD signals:\n- **Day 1-30**: [what the manager expects — learning, relationships, orientation]\n- **Day 31-60**: [what the manager expects — execution, first deliverables]\n- **Day 61-90**: [what the manager expects — ownership, measurable impact]",
    redFlags: "Generate a 'Red Flags' analysis:\n| JD Phrase | True Interpretation | Risk Level (High/Med/Low) | Questions to Ask in Interview |\nFollow with a short paragraph helping the candidate make an informed decision.",
    companyAlignment: "Write a 'Company × JD Alignment' section explaining why this role exists RIGHT NOW at this company. Connect the hiring to the company's strategic context, growth stage, competitive pressure, or product priorities.",
    fitScore: "Generate a 'Candidate Fit Scorecard':\n| Dimension | Importance | JD Signals | How to Demonstrate |\nDimensions: Analytical Thinking, Communication, Leadership, Technical Depth, Business Acumen, Execution, Ownership, Customer Focus.",
    interviewCheatSheet: "Create a complete 'Interview Cheat Sheet' (formatted as a single-page quick-reference):\n**Top 5 Keywords to Use**: [list]\n**Core Themes**: [list]\n**Hiring Manager's Evaluation Lens**: [summary]\n**Top 3 Predicted Questions + Answer Frameworks**: [structured list]\n**Must-Demonstrate Behaviors**: [list]\n**What NOT to Do**: [list]"
  };

  const structure = structures[sectionId] || "Write the section in McKinsey-grade consulting prose.";

  const systemPrompt = `You are a senior McKinsey Talent Intelligence Consultant helping a candidate decode and win a job opportunity.
Your job: write the finished JD dossier section "${sectionId}" for the role "${roleTitle}" ${companyName ? `at "${companyName}"` : ""}.

SECTION INSTRUCTIONS:
${structure}

RULES:
1. Write with precision and strategic clarity. No fluff. No summaries of the obvious.
2. Address the candidate as "you" throughout.
3. Every insight must answer: "What does this mean for ME as a candidate?"
4. Use the structured analysis data exclusively. Do not invent JD content.
5. Conclude the section with a bolded "**Candidate Action:** [one specific thing to do immediately]".`;

  const userPrompt = `Write the section "${sectionId}" for the JD for "${roleTitle}".

STRUCTURED ANALYSIS DATA:
${JSON.stringify(analysis, null, 2)}

Output ONLY polished Markdown.`;

  return { systemPrompt, userPrompt };
}
