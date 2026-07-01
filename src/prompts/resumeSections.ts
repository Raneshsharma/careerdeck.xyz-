export const RESUME_SECTION_IDS = [
  "resumeOneMinute", "atsMatch", "keywordIntel", "hiringProbability", "gapAnalysis",
  "sectionAnalysis", "bulletIntel", "starIntel", "metricsIntel", "languageIntel",
  "achievementIntel", "skillsIntel", "projectIntel", "experienceIntel", "companyAlignment",
  "roleAlignment", "jdAlignment", "missingEvidence", "rewriteEngine", "beforeAfter",
  "eyeTracking", "hiringManagerFeedback", "atsSimulator", "roadmap", "finalDashboard"
];

export function buildResumeWriterPrompt(
  sectionId: string,
  state: any,
  companyName: string,
  roleTitle: string
): { systemPrompt: string; userPrompt: string } {
  const resumeIntel = state.resumeIntelligence || {};
  const matchingIntel = state.matchingIntelligence || {};
  const optIntel = state.optimizationIntelligence || {};
  const hiringIntel = state.hiringIntelligence || {};
  const careerIntel = state.careerIntelligence || {};

  const structures: Record<string, string> = {
    resumeOneMinute: `Write a high-impact 'Candidate in One Minute' summary:
- **Core Summary**: [from CKG identity/brand]
- **Years of Experience**: [total years]
- **Best-Fit Roles**: [list best-fit roles from CKG]
- **Biggest Strength**: [from CKG strengths]
- **Biggest Weakness**: [from CKG gaps/weaknesses]
Make it punchy, using bold labels.`,

    atsMatch: `Generate an 'ATS Match & Compatibility' scorecard. Format as a table:
| Metric | Score | Rating | Recommendation |
Metrics to include: Overall Match, Technical Match, Leadership Match, Ownership Match, Formatting, and Parsing Risk.
Rate from 0-100 based on matching/optimization intelligence.`,

    keywordIntel: `Create a 'Keyword Intelligence' table showing target keywords:
| Keyword Cluster | Match Status | Importance | Placement Strategy |
Statuses: Matched (✓), Missing (✗), Weak Usage (⚠), or Overused (↑).
Use optimization intelligence keywords data.`,

    hiringProbability: `Project 'Hiring Probability' based on matching intelligence:
- **Interview Probability**: [X]% (Confidence: High/Medium/Low)
- **Offer Probability**: [Y]% (Confidence: High/Medium/Low)
Follow with 3-4 bullet points detailing explainable factors driving these probabilities.`,

    gapAnalysis: `Write a 'Candidate Gap Analysis'. Rate dimensions (Experience, Projects, Metrics, Leadership, Ownership) out of 10.
For each, provide a brief McKinsey-grade analysis paragraph outlining the gap and how to bridge it.`,

    sectionAnalysis: `Score and review each major resume section (Professional Summary, Experience, Projects, Skills, Achievements).
Identify 1 actionable improvement fix for each.`,

    bulletIntel: `Generate a 'Bullet Intelligence & STAR Rewrites' table.
Strictly enforce the **Evidence Validator**—never invent metrics or fabricate achievements. If a bullet lacks metrics, write a template with placeholder fields (e.g., "[X]%") and explain how to calculate it.
Show:
| Original Bullet | Detected Weakness | Optimized STAR Rewrite (Template) | Why Better |`,

    starIntel: `Deconstruct key resume experiences into the STAR framework:
- **Situation**: [context]
- **Task**: [what needed to be done]
- **Action**: [specific action taken]
- **Result**: [measurable outcome or target template]`,

    metricsIntel: `Write a 'Metrics Density' audit. Show current density vs. 90% target.
Detail missing telemetry points (e.g. revenue, time savings, scale) and show templates to quantify them.`,

    languageIntel: `Analyze resume action verbs. List weak verbs found in the resume (helped, worked, assisted) vs. strong power verbs to replace them with.`,

    achievementIntel: `Critique the candidate's achievements. Map achievements into Business, Leadership, or Generic Activities, highlighting missing gaps.`,

    skillsIntel: `Present a Skill Cluster Overlap analysis comparing candidate skills vs. target role clusters in a table, highlighting overlapping strengths.`,

    projectIntel: `Audit candidate projects for Business Problem, Solution, Tools, and Impact. Suggest 2 custom project templates based on target JD/Role.`,

    experienceIntel: `Assess the depth of experience: ownership scope, cross-functional collaboration, budget, and business results.`,

    companyAlignment: `Write a 'Company × Candidate Alignment' section. Detail how well the candidate's profile matches "${companyName}" core principles or leadership pillars (e.g., Amazon Leadership Principles).`,

    roleAlignment: `Analyze role fit for "${roleTitle}". Detail competency gaps and how to address them in the resume.`,

    jdAlignment: `Highlight the top 3 strongest overlaps with the Job Description and explain why they stand out.`,

    missingEvidence: `Highlight missing evidence gaps in the resume and suggest 3-4 prompting questions to help the candidate remember hidden achievements.`,

    rewriteEngine: `Generate a clean, high-impact rewrite of the candidate's Professional Summary and 2 key Experience entries. Focus on elite McKinsey style.`,

    beforeAfter: `Build a 'Before vs. After' comparison table showing side-by-side metric increases (ATS Score, Keyword Match, Metrics Density).`,

    eyeTracking: `Map out a simulated 'Recruiter Gaze Path' (10-second scan). List the first 3 things they look at and the top 3 cognitive friction points.`,

    hiringManagerFeedback: `Draft the simulated feedback card from a Hiring Manager: Pros, Cons, and a final verdict ('Would Interview', 'Hold', 'Reject') with reasons.`,

    atsSimulator: `List all ATS formatting risks (columns, headers, tables, fonts) found in the resume layout and how to resolve them.`,

    roadmap: `Build a Resume Roadmap table: actions to complete Today, this Week, before the Interview, and Long Term.`,

    finalDashboard: `Present a summary dashboard with overall ratings for Resume Quality, ATS Match, Hiring Probability, Interview Readiness, and Leadership.`
  };

  const structure = structures[sectionId] || "Write the section in McKinsey-grade consulting prose.";

  const systemPrompt = `You are a senior McKinsey Talent Consultant helping a candidate optimize their resume.
Your job: write the finished candidate intelligence section "${sectionId}" for the role "${roleTitle}" ${companyName ? `at "${companyName}"` : ""}.

SECTION INSTRUCTIONS:
${structure}

RULES:
1. Write with absolute precision, strategic depth, and executive clarity.
2. Address the candidate as "you".
3. Conclude each section with a bolded "**Resume Action:** [one concrete edit to make today]".`;

  const userPrompt = `Write the section "${sectionId}" for the resume.

RESUME INTELLIGENCE DATA (CKG):
${JSON.stringify(resumeIntel, null, 2)}

MATCHING INTELLIGENCE:
${JSON.stringify(matchingIntel, null, 2)}

OPTIMIZATION INTELLIGENCE:
${JSON.stringify(optIntel, null, 2)}

HIRING INTELLIGENCE:
${JSON.stringify(hiringIntel, null, 2)}

CAREER INTELLIGENCE:
${JSON.stringify(careerIntel, null, 2)}

Output ONLY polished Markdown.`;

  return { systemPrompt, userPrompt };
}
