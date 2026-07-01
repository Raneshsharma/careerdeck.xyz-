export const RESUME_SECTION_IDS = [
  "masterDashboard",
  "resumeStrategy",
  "roiImprovements",
  "attentionHeatmap",
  "candidateMoat",
  "recruiterSimulation",
  "bulletAudits",
  "candidateStory",
  "learningRoadmap"
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
    masterDashboard: `Generate a 'Master Dashboard' homepage layout:
1. Write a 2-3 line **Candidate Intelligence Summary**.
2. Generate an **ATS Match & Readiness** scorecard table formatted exactly as:
| Metric | Score | Rating | Recommendation |
Include these 7 metrics: 'Candidate Intelligence', 'Hiring Readiness', 'Interview Readiness', 'Resume Quality', 'Company Fit', 'Role Fit', 'JD Fit'.
Score from 0-100 and rate (e.g. Elite for 90+, High for 80+, Medium for 70+).
3. List **Candidate DNA** (star ratings 1-5 stars, e.g. Builder: ★★★★★, Analyst: ★★★★★, Leader: ★★★☆☆, Operator: ★★★★☆, Strategist: ★★★★☆).
4. List **Biggest Strength** and **Biggest Risk**.
5. Conclude with **Today's Mission** (the single highest-ROI improvement) and **Expected Improvement** (e.g., '+6 Hiring Score').`,

    resumeStrategy: `Generate the 'Resume Strategy' configuration:
1. **Core Optimization Angle**: (e.g. Product Thinking vs. Technology Scale).
2. **Strategy Rationale**: 3-4 lines explaining why this angle is selected based on target Job Description/competency demands (e.g. 'JD highlights product discovery and roadmap ownership over implementation details').
3. **Strategic Alignment Rules**: 2-3 actionable guidelines to frame experiences downstream (e.g. 'Translate technical implementation to customer conversion metrics').`,

    roiImprovements: `Generate the 'Highest ROI Improvements' table (Global Recommendation Engine):
1. Format as a table:
| Improvement | Estimated Hiring Impact | Effort | Priority | Reference Section |
2. Do NOT write repetitive advice. Map all key improvements across the candidate's profile into this single unified matrix.
3. Use categorical rankings: Impact (High/Medium/Low), Effort (Low/Medium/High), Priority (🔴 Do Today / 🔴 This Week / 🟡 Before Interview / 🟢 Long Term).`,

    attentionHeatmap: `Generate an 'Attention Heatmap' audit:
- 🔥 **Strong Attention (Recruiter scans here first)**: 2-3 specific entries/metrics in the resume that stand out immediately.
- 👁 **Weak Attention (Recruiter skims quickly)**: 2-3 sections/formatting elements that get low visual focus.
- 💤 **Ignored / Skipped (Recruiter completely bypasses)**: 2-3 elements that do not influence decision-making.`,

    candidateMoat: `Generate the 'Candidate Moat & DNA Evidence':
1. Identify the candidate's core professional Moat (e.g., Growth Analytics, Scale Architecture).
2. Detail **Moat Evidence**: List concrete facts, metrics, and technologies from the candidate's resume (e.g., ₹32L GMV, SQL, Blinkit experience). Do NOT write generic definitions.
3. Write a brief 3-line **Moat Story** explaining how this moat positions them above average candidates.`,

    recruiterSimulation: `Generate a 'Recruiter Persona Simulation':
1. Simulate feedback from three distinct screening perspectives:
   - **Recruiter (10-second screening check)**: Verdict (Would Interview/Hold/Reject), Confidence (High/Medium/Low), and Evidence (e.g. Clear Brand, matching Title).
   - **Hiring Manager (Competency check)**: Verdict (Would Interview/Hold/Reject), Confidence (High/Medium/Low), and Evidence (e.g. Scope of ownership, metrics density).
   - **Panel / Interviewers (Technical/Behavioral check)**: Verdict (Strong Hire/Lean Hire/No Hire), Confidence (High/Medium/Low), and Evidence (e.g. STAR structure match).
2. Eliminate fake precision percentages—always express evaluation confidence as High/Medium/Low and provide evidence.`,

    bulletAudits: `Generate 'Interactive Bullet Audits & Rewrites':
1. Enforce the **Evidence Validator**—never fabricate or invent metrics. If a bullet lacks metrics, write a template with placeholder fields (e.g., "[X]%") and explain how to calculate it.
2. Format as a table:
| Original Bullet | Detected Weakness | Optimized STAR Rewrite (Template) | Why Better |
3. Follow with **Missing Evidence Prompts**: Write 2-3 direct questions asking the candidate for the exact metrics needed to fill the template placeholders (e.g. 'Can you estimate the increase in CTR?').`,

    candidateStory: `Generate the 'Candidate Story' pitches:
Generate three distinct elevator pitch versions of the candidate's professional narrative:
1. **30-Second Elevator Pitch**: Ultra-short, high-impact overview.
2. **60-Second "Tell Me About Yourself" Pitch**: Standard behavioral interview overview.
3. **2-Minute Deep-Dive Pitch**: Structured walkthrough detailing background, key moat experiences, and role motivation.`,

    learningRoadmap: `Generate the 'Targeted Learning Roadmap':
List 3-4 skills/topics the candidate must acquire to address role gaps. For each item show:
- **Skill to Learn**: [topic]
- **Time Required**: [e.g. 8 hours, 12 hours]
- **Hiring Impact**: [star rating, e.g. ★★★★★]
- **ROI Action**: [specific task/resource to complete]`
  };

  const structure = structures[sectionId] || "Write the section in McKinsey-grade consulting prose.";

  const systemPrompt = `You are a senior McKinsey Talent Consultant helping a candidate optimize their resume.
Your job: write the finished candidate intelligence section "${sectionId}" for the role "${roleTitle}" ${companyName ? `at "${companyName}"` : ""}.

SECTION INSTRUCTIONS:
${structure}

RULES:
1. Write with absolute precision, strategic depth, and executive clarity. Ensure every section can be consumed in 30 seconds (keep it extremely concise and direct).
2. Address the candidate as "you".
3. Do NOT put scores in individual sections to prevent score fatigue. All scores must be in the Master Dashboard only.
4. Conclude each section (except the Master Dashboard) with a bolded "**Resume Action:** [one concrete edit to make today]".`;

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
