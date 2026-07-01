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
    masterDashboard: `Generate a 'Master Dashboard' homepage:
1. Write a 2-3 line **Candidate Intelligence Summary**.
2. Display the **Hero Metrics**:
- **Overall Hiring Readiness**: [score out of 100]
- **Key Strength**: [e.g. Growth Analytics]
- **Key Risk**: [e.g. Limited PM Ownership]
- **Next High-ROI Action**: [e.g. Rewrite Blinkit bullets]
- **Expected Score Gain**: [e.g. +6 Hiring Readiness]
3. Generate the **Readiness & Fit Scorecard** table formatted exactly as:
| Metric | Score | Rating | Recommendation |
Include these 6 metrics: 'Hiring Readiness', 'Interview Readiness', 'Resume Quality', 'Company Fit', 'Role Fit', 'JD Fit'. Rate 0-100 (e.g. Elite, High, Medium). ATS details must live inside the recommendation text of 'Resume Quality', not as a hero.
4. Write a **Why This Score?** explanation list for all 6 metrics, detailing positive (+) and negative (-) contributors:
e.g.
- **Hiring Readiness**:
  + Blinkit Impact
  + SQL proficiency
  - Short tenure
5. List **Candidate DNA** traits (Builder, Analyst, Leader, Operator, Strategist). For each, show:
- Star rating (e.g. Builder: ★★★★☆)
- Concrete Evidence from the resume (e.g. 'Built startup', 'Led GTM')
- Analysis Confidence: [High/Medium/Low]`,

    resumeStrategy: `Generate the 'Master Resume Strategy':
1. Format as a config list:
- **Target Strategy**: [e.g. Growth Product Manager]
- **Resume Tone**: [e.g. Analytical]
- **Evidence Priority**: [e.g. Metrics & Telemetry]
- **Keywords Priority**: [e.g. Product Discovery]
- **Interview Focus**: [e.g. End-to-End Ownership]
2. Write a brief 3-4 line **Strategy Rationale** explaining why this strategy is chosen based on JD requirements.
3. List 2-3 **Strategic Alignment Rules** for downstream updates.`,

    roiImprovements: `Generate the 'Highest ROI Improvements' table (Global Recommendation Engine):
1. Format as a table:
| Improvement | Hiring Gain | Time | ROI |
Ensure Hiring Gain shows the expected score improvement (e.g. +6, +3). ROI must be star-rated (e.g. ⭐⭐⭐⭐⭐ for highest).
2. Do NOT write repetitive advice throughout the dossier. Group all key optimizations here.`,

    attentionHeatmap: `Generate the 'Attention Heatmap' audit:
List the visual scan zones with explicit confidence tags:
- 🔥 **Strong Attention (Recruiter reads first)**: [entries] (Confidence: High/Medium/Low)
- 👁 **Weak Attention (Recruiter skims)**: [entries] (Confidence: High/Medium/Low)
- 💤 **Ignored / Skipped (Recruiter bypasses)**: [entries] (Confidence: High/Medium/Low)`,

    candidateMoat: `Generate the 'Candidate Moat & Competitor Comparison':
1. Define the candidate's core professional Moat and its resume evidence.
2. Generate a **Competitor Comparison Matrix** showing:
- **Why You (Your Strengths)**: [e.g. ✓ SQL, ✓ Growth, ✓ GTM]
- **Average Candidate (Gaps)**: [e.g. ✗ SQL, ✗ GTM, ✗ Analytics]`,

    recruiterSimulation: `Generate the 'Recruiter Persona Simulation':
Draft simulated feedback comments with real professional personality:
- **Recruiter (10s screening)**: "[Descriptive quote showing screening mindset]" | Verdict: [Would Interview/Hold/Reject] | Confidence: [High/Medium/Low] | Evidence: [e.g. clear target title]
- **Hiring Manager (Competency check)**: "[Descriptive quote showing execution/metrics focus]" | Verdict: [Would Interview/Hold/Reject] | Confidence: [High/Medium/Low] | Evidence: [e.g. STAR structuring]
- **Director / Panel (Strategic fit)**: "[Descriptive quote showing long-term strategy focus]" | Verdict: [Strong Hire/Lean Hire/No Hire] | Confidence: [High/Medium/Low] | Evidence: [e.g. scope size]`,

    bulletAudits: `Generate 'Interactive Bullet Audits & STAR Rewrites':
1. Strictly follow the **Evidence Validator**—never fabricate or invent metrics. If a bullet lacks metrics, write a template with placeholder fields (e.g., "[X]%") and explain how to calculate it.
2. Format as a table:
| Original Bullet | Detected Weakness | Optimized STAR Rewrite (Template) | Why Better |
Ensure rewrite templates use descriptive brackets like \`[Add metrics: e.g. CTR % increase]\` instead of raw \`[X]%\` to avoid placeholder fatigue.
3. Follow with **Missing Evidence Prompts**: Write 2-3 direct questions asking the candidate for the exact metrics needed to fill the template placeholders (e.g. 'Can you estimate the CTR increase?').`,

    candidateStory: `Generate 5 distinct versions of the candidate's professional pitch:
- **30-Second Networking Pitch**: Ultra-short overview for quick outreach.
- **45-Second HR / Screener Pitch**: Punchy introduction for recruiters.
- **60-Second Interview Pitch**: Standard "Tell Me About Yourself" baseline.
- **90-Second Executive Pitch**: High-level, value-focused summary for directors.
- **2-Minute Leadership Pitch**: In-depth story showcasing ownership, scope, and target role motivation.`,

    learningRoadmap: `Generate the 'Targeted Learning Roadmap & Coach Session':
1. List 3-4 skills to acquire with Time, Hiring Impact stars, and ROI actions.
2. Conclude the section with a styled **Interactive AI Resume Coach** call-to-action block:
---
### 🤖 Interactive AI Resume Coach
"I found [number] bullets in your resume. Only [number] key bullets are causing [percentage]% of your hiring gap. Let's fix them together in an interactive coaching loop! Ready?"
**[Start Coaching Session]**`
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
