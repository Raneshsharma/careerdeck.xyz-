export const RESUME_SECTION_IDS = [
  "resumeStrategy",
  "masterDashboard",
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
    resumeStrategy: `Generate the 'Master Resume Strategy':
1. Format as a config list:
- **Target Strategy**: [e.g. Growth Product Manager]
- **Resume Tone**: [e.g. Analytical]
- **Evidence Priority**: [e.g. Metrics & Telemetry]
- **Keywords Priority**: [e.g. Product Discovery]
- **Interview Focus**: [e.g. End-to-End Ownership]
2. Write a brief 3-4 line **Strategy Rationale** explaining why this strategy is chosen based on JD requirements.
3. List 2-3 **Strategic Alignment Rules** for downstream updates.
*Note: Make sure to clearly state that all subsequent sections (Bullet Audits, Candidate Story, simulated feedback) are generated strictly under the influence of this Master Strategy. Explain that CareerDeck has dynamically optimized this report for the PM/target role mode.*`,

    masterDashboard: `Generate a 'Master Dashboard' homepage:
1. Write a 2-3 line **Candidate Intelligence Summary**.
2. Display the **Hero Metrics**:
- **Overall Hiring Readiness**: [score out of 100]
- **Top Strength**: [e.g. Growth Analytics]
- **Top Weakness**: [e.g. Restaurant Partnerships]
- **Fastest Improvement**: [e.g. Rewrite Blinkit bullets]
- **Time Required**: [15 min]
- **Expected Gain**: [+6 Hiring Readiness]
3. Generate the **Readiness & Fit Scorecard** table formatted exactly as:
| Metric | Score | Rating | Recommendation |
Include these 6 metrics: 'Hiring Readiness', 'Interview Readiness', 'Resume Quality', 'Company Fit', 'Role Fit', 'JD Fit'. Rate 0-100 (e.g. Elite, High, Medium). ATS details must live inside the recommendation text of 'Resume Quality', not as a hero.
4. Detail the **Explainable Score Weights** driving these metrics (e.g. 'Hiring Readiness: 35% Role Match, 25% Business Impact, 15% Leadership, 15% Resume Quality, 10% Culture Fit').
5. Write a **Why This Score?** explanation list for all 6 metrics, detailing positive (+) and negative (-) contributors, and under each contributor, list the **specific Evidence links/references** from the resume (e.g. 'Blinkit: ₹32L GMV, 33% (Verified)').
6. List the **Candidate Archetypes** based on CKG data (e.g. Primary Archetype: Growth Builder, Secondary: Data Operator, Supporting: Product Strategist) along with:
- One sentence explaining why this specific combination of archetypes matters for high performance.
- The concrete resume evidence (e.g. Blinkit, Startup, GTM) supporting these archetypes.
7. Output a visual **Candidate Narrative Timeline** displaying career transitions using arrows (e.g. Marketing → Startup Founder → Category Marketing → Target: Growth Product Manager).
8. Detail the **Business Evidence Coverage** list displaying target counts (e.g. Leadership: 2 examples found / Target: 4, Ownership: 5 examples found / Target: 6, Metrics: 8 examples found / Target: 10).`,

    roiImprovements: `Generate the 'Highest ROI Improvements' table (Global Action Center):
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
2. Generate a **Competitor Benchmark Gap Matrix** comparing You vs a Top 10% Candidate:
| Capability | You | Top 10% Candidate | Gap / Recommendation |
Rate capabilities with stars (e.g. You: ★★★★★, Top Candidate: ★★★★★). Include specific gap status items (e.g. '—' or 'High' or 'Needs improvement').`,

    recruiterSimulation: `Generate the 'Recruiter Persona Simulation':
1. Identify the company type from the name "${companyName}" and dynamically choose the 3 simulation personas matching that company's hiring model:
- If Amazon: Recruiter, Hiring Manager, Bar Raiser (focus on Leadership Principles).
- If Google: Recruiter, Technical Interviewer (GCA/RRK), Hiring Committee (Googleyness).
- If BCG/McKinsey: Recruiter, Case Interviewer (Case Structuring), Partner Evaluation.
- If Meta: Recruiter, Product Sense Interviewer, Execution Interviewer.
- If a Startup/Small company: Founder, Head of Product, CTO.
- Otherwise (General Big Tech/Enterprise): Recruiter, Hiring Manager, Director / Panel.
2. For each, output a descriptive feedback quote with real professional personality (e.g. "Potential is evident, but I don't yet see strategic product thinking at scale.").
3. For each, list Verdict (e.g. Would Interview/Hold/Reject) and Confidence (High/Medium/Low) with evidence.`,

    bulletAudits: `Generate 'Interactive Bullet Audits & STAR Rewrites':
1. Strictly follow the **Evidence Validator**—never fabricate or invent metrics.
2. Rewrite ONLY the language, scope, and action verbs of the bullet. Do NOT add raw placeholders like "[X]%" or "[Y]%" or bracketed metric placeholders inside the optimized rewrite itself. Keep the rewrite focused purely on improving flow, verbs, and scope (e.g. 'Owned end-to-end category performance across Tier-II/III launches using dashboards...').
3. Format as a table:
| Original Bullet | Detected Weakness | Optimized STAR Rewrite (Linguistic) | Why Better |
4. Follow the table with a **Missing Evidence prompts** checklist. For each audited bullet, ask 2-3 direct questions prompting the candidate to provide the exact missing metrics (e.g. 'Can you estimate the category GMV increase?', 'Did availability improve?').`,

    candidateStory: `Generate 5 distinct versions of the candidate's professional pitch, fully aligned with the Master Resume Strategy:
- **30-Second Networking Pitch**: Ultra-short overview for quick outreach.
- **45-Second HR / Screener Pitch**: Punchy introduction for recruiters.
- **60-Second Interview Pitch**: Standard "Tell Me About Yourself" baseline.
- **90-Second Executive Pitch**: High-level, value-focused summary for directors.
- **2-Minute Leadership Pitch**: In-depth story showcasing ownership, scope, and target role motivation.`,

    learningRoadmap: `Generate the 'Targeted Learning Roadmap & Coach Session':
1. List 3-4 skills to acquire with Time required, Hiring Impact stars, ROI actions, Salary Impact (High/Medium/Low), and Promotion Impact (High/Medium/Low).
2. Conclude the section with the **Interactive AI Resume Coach Workflow** card:
---
### 🤖 Interactive AI Resume Coach (V1.0)
"I found [number] bullets in your resume. Only [number] key bullets are causing [percentage]% of your hiring gap. Let's fix them together!"

**Coaching Workflow:**
- **Step 1**: Select a high-impact bullet (e.g., Blinkit category metrics).
- **Step 2**: Enter your genuine missing metric or evidence.
- **Step 3**: The AI coach will rescan and update your Hiring Readiness score.
- **Step 4**: Progress to the next highest-ROI bullet.

**[Start Interactive Coaching Session]**`
  };

  const structure = structures[sectionId] || "Write the section in McKinsey-grade consulting prose.";

  const systemPrompt = `You are a senior McKinsey Talent Consultant helping a candidate optimize their resume.
Your job: write the finished candidate intelligence section "${sectionId}" for the role "${roleTitle}" ${companyName ? `at "${companyName}"` : ""}.

SECTION INSTRUCTIONS:
${structure}

RULES:
1. Write with absolute precision, strategic depth, and executive clarity. Ensure every section can be consumed in 30 seconds (keep it extremely concise and direct).
2. Address the candidate as "you".
3. Do NOT put scores in individual sections to prevent score fatigue. All scores must be in the Master Dashboard only.`;

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
