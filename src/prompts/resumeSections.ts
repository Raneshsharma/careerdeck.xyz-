export const RESUME_SECTION_IDS = [
  "resumeOneMinute", "atsMatch", "keywordIntel", "hiringProbability", "gapAnalysis",
  "sectionAnalysis", "bulletIntel", "starIntel", "metricsIntel", "languageIntel",
  "achievementIntel", "skillsIntel", "projectIntel", "experienceIntel", "companyAlignment",
  "roleAlignment", "jdAlignment", "missingEvidence", "rewriteEngine", "beforeAfter",
  "eyeTracking", "hiringManagerFeedback", "atsSimulator", "roadmap", "finalDashboard"
];

export function buildResumeAnalystPrompt(
  sectionId: string,
  resumeFacts: any,
  companyName: string,
  roleTitle: string,
  jdText: string = ""
): { systemPrompt: string; userPrompt: string } {
  const dataStr = resumeFacts ? JSON.stringify(resumeFacts, null, 2) : "No Resume facts available";

  const objectives: Record<string, string> = {
    resumeOneMinute: "Analyze the candidate's profile: What is their core summary, years of experience, biggest strength, biggest weakness, and best-fit roles based on their resume?",
    atsMatch: "Simulate an ATS scoring algorithm. Provide numerical scores (Overall ATS, Resume Quality, Keyword Match, Experience Match, Impact Score, Formatting, and Parsing Risk). Rate from 0-100.",
    keywordIntel: "Extract core, secondary, and bonus keywords. Categorize them and assign status tags: Matched (✓), Missing (✗), Weak Usage (⚠), or Overused (↑) compared to the JD/Role.",
    hiringProbability: "Assess the confidence-tier probability of the candidate landing an interview and an offer. Back this up with explicit evidence-based factors.",
    gapAnalysis: "Perform a gap analysis on dimensions: Experience, Projects, Leadership, Ownership, Metrics, Business, and Communication. Score each out of 10 and explain why.",
    sectionAnalysis: "Score and review each major resume section: Professional Summary, Experience, Projects, Skills, Achievements, Certifications, Leadership, and Formatting.",
    bulletIntel: "Analyze each experience bullet. Flag weaknesses (weak verb, no metrics, no ownership, no impact) and rewrite 2-3 key bullets to showcase Power BI/STAR formatting.",
    starIntel: "Deconstruct the candidate's experiences into the STAR (Situation, Task, Action, Result) framework automatically.",
    metricsIntel: "Calculate metrics density (% of bullets containing metrics: %, $, numbers, time, growth, users). Target is 90%. Explain what numbers are missing.",
    languageIntel: "Count and identify strong action verbs (Owned, Led, Built, Launched, Scaled) vs. weak verbs (Helped, Worked, Assisted, Responsible) used in the resume.",
    achievementIntel: "Differentiate between weak/generic activities and strong/business/leadership achievements.",
    skillsIntel: "Perform similarity mapping for skill clusters (e.g. SQL, Python, Excel vs. Tableau) showing overlapping clusters instead of raw string matches.",
    projectIntel: "Evaluate candidate projects: verify Business Problem, Solution, Impact, Tools, and suggest new projects matching the JD if missing.",
    experienceIntel: "Assess candidate experiences for Ownership, Scope, Metrics, Leadership, Growth, Decision Making, and Cross-functional impact.",
    companyAlignment: `Analyze how well the candidate's profile matches the specific culture/ideology of "${companyName}" (e.g. Amazon's Customer Obsession, Google's Scale, Swiggy's Growth).`,
    roleAlignment: `Examine the gap between the candidate's resume and typical competencies for a "${roleTitle}" (e.g. PM roadmapping/testing vs. engineering).`,
    jdAlignment: "Evaluate the direct fit against the provided Job Description. Highlight the strongest overlap areas.",
    missingEvidence: "Identify critical JD requirements that are completely missing from the resume. Suggest how the candidate can surface genuine experiences they might have left out.",
    rewriteEngine: "Draft a complete section-by-section rewrite of the resume's summary, experiences, and projects. Improve ATS and human readability without fabricating facts.",
    beforeAfter: "Compare before-and-after metrics side-by-side: Current ATS vs. New ATS, Keyword Match Current vs. New, Leadership and Metrics density current vs. new.",
    eyeTracking: "Simulate a recruiter's first 10-second gaze. Identify what catches attention first, likely rejection points, and cognitive friction areas.",
    hiringManagerFeedback: "Generate candid, realistic feedback from the hiring manager's perspective: What they will love, what concerns them, and whether they would interview.",
    atsSimulator: "Identify formatting risks that could cause ATS parsing to fail (headings, columns, tables, headers, fonts, special characters).",
    roadmap: "Create a structured, timeline-based roadmap: actions to complete Today, this Week, before the Interview, and Long Term.",
    finalDashboard: "Compile a unified scorecard summarizing Resume Quality, ATS Match, Hiring Probability, Interview Readiness, Business Impact, and Leadership scores."
  };

  const objective = objectives[sectionId] || "Perform candidate intelligence analysis.";

  const systemPrompt = `You are a Senior McKinsey Talent Consultant and Elite Recruiting Expert.
Your job: analyze the candidate's resume for "${roleTitle}" ${companyName ? `at "${companyName}"` : ""} and produce a structured analysis for the section "${sectionId}".

PHILOSOPHY: Don't just match keywords. Build a comprehensive Candidate Value Profile that evaluates business impact, leadership capacity, and role alignment.

OBJECTIVE:
${objective}

INSTRUCTIONS:
1. Ground your analysis strictly in the provided resume data.
2. Structure your analysis as a valid JSON object.
${jdText ? `3. Compare the candidate's profile directly against the provided JD: \n"""\n${jdText}\n"""\n` : ""}

Output ONLY valid JSON.`;

  const userPrompt = `Perform the analysis for "${sectionId}" of the resume.

RESUME DATA:
${dataStr}

Return ONLY the JSON.`;

  return { systemPrompt, userPrompt };
}

export function buildResumeWriterPrompt(
  sectionId: string,
  analysis: Record<string, unknown>,
  companyName: string,
  roleTitle: string
): { systemPrompt: string; userPrompt: string } {
  const structures: Record<string, string> = {
    resumeOneMinute: "Write a punchy, executive-level summary of the candidate: Profile, Years of Experience, Best-Fit Roles, and a bold list of Top Strengths/Weaknesses.",
    atsMatch: "Generate a visual ATS scorecard showing metrics (Overall, Quality, Keyword, Experience, Formatting) as a table or list. Conclude with a bolded parsing risk assessment.",
    keywordIntel: "Create a 'Keyword Intelligence' breakdown. Categorize matching, missing, weak, and overused keywords with statuses (✓, ✗, ⚠, ↑) in a clean markdown table.",
    hiringProbability: "Generate a 'Hiring Probability' projection: Interview Probability and Offer Probability with high/medium/low confidence. Follow with 3-5 bulleted explanation factors.",
    gapAnalysis: "Generate a 'Candidate Gap Analysis'. Score dimensions (Experience, Projects, Metrics, Leadership, Ownership) out of 10. Follow with a detailed McKinsey-grade paragraph for each.",
    sectionAnalysis: "Score and review each section of the resume (Summary, Experience, Projects, Skills) from 0-100. Provide 1 actionable fix for each.",
    bulletIntel: "Write a 'Bullet Intelligence' table showing current bullets vs. optimized STAR rewrites, detailing exactly why the rewrites are stronger (metrics, verbs, impact).",
    starIntel: "Map key experiences to the STAR framework:\n- **Situation**: [context]\n- **Task**: [responsibility]\n- **Action**: [what they did]\n- **Result**: [quantified metric]",
    metricsIntel: "Write a 'Metrics Density' audit. Show current density vs. 90% target, list missing metrics, and suggest how to quantify achievements.",
    languageIntel: "List all strong verbs used vs. weak verbs to avoid. Provide 5-6 power verbs matching the target role.",
    achievementIntel: "Critique the candidate's achievements. Highlight leadership, business, and activity achievements and note missing gaps.",
    skillsIntel: "Present a Skill Cluster Overlap analysis comparing resume skills vs. target role clusters in a table, highlighting overlapping strengths.",
    projectIntel: "Audit projects for Business Problem, Solution, Tools, and Impact. Suggest 2 custom projects based on target JD/Role.",
    experienceIntel: "Assess the depth of experience: ownership scope, cross-functional collaboration, budget, and business results.",
    companyAlignment: `Write a 'Company × Candidate Alignment' section. Detail how well the resume matches "${companyName}" core principles or leadership pillars.`,
    roleAlignment: `Analyze role fit for "${roleTitle}". Detail competency gaps and how to address them in the resume.`,
    jdAlignment: "Highlight the top 3 strongest overlaps with the Job Description and explain why they stand out.",
    missingEvidence: "Highlight missing evidence gaps in the resume and suggest 3-4 prompting questions to help the candidate remember hidden achievements.",
    rewriteEngine: "Generate a clean, high-impact rewrite of the candidate's Professional Summary and 2 key Experience entries. Focus on elite McKinsey style.",
    beforeAfter: "Build a 'Before vs. After' comparison table showing side-by-side metric increases (ATS Score, Keyword Match, Metrics Density).",
    eyeTracking: "Map out a simulated 'Recruiter Gaze Path' (10-second scan). List the first 3 things they look at and the top 3 cognitive friction points.",
    hiringManagerFeedback: "Draft the simulated feedback card from a Hiring Manager: Pros, Cons, and a final verdict ('Would Interview', 'Hold', 'Reject') with reasons.",
    atsSimulator: "List all ATS formatting risks (columns, headers, tables, fonts) found in the resume layout and how to resolve them.",
    roadmap: "Build a Resume Roadmap table: actions to complete Today, this Week, before the Interview, and Long Term.",
    finalDashboard: "Present a summary dashboard with overall ratings for Resume Quality, ATS Match, Hiring Probability, Interview Readiness, and Leadership."
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

STRUCTURED ANALYSIS DATA:
${JSON.stringify(analysis, null, 2)}

Output ONLY polished Markdown.`;

  return { systemPrompt, userPrompt };
}
