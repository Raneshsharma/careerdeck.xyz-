export const LINKEDIN_SECTION_IDS = [
  "linkedinDashboard",
  "executiveSummary",
  "professionalBrand",
  "recruiterSimulation",
  "priorityImprovements",
  "aiImprovements",
  "networkingStrategy",
  "contentPlan",
  "resumeLinkedinConsistency"
];

export function buildLinkedInWriterPrompt(
  sectionId: string,
  state: any,
): { systemPrompt: string; userPrompt: string } {
  const lkg = state.linkedinIntelligence || {};
  const brand = state.brandIntelligence || {};
  const recruiter = state.recruiterIntelligence || {};
  const optimization = state.linkedinOptimization || {};
  const networking = state.networkingCareerIntelligence || {};
  const consistency = state.consistencyIntelligence || {};

  const profile = lkg.profile || {};
  const targetRole = state.role || "Target Role";
  const targetCompany = state.companyName || "";
  const targetGoal = state.linkedinGoal || "Landing PM jobs";

  const structures: Record<string, string> = {
    linkedinDashboard: `Generate the 'LinkedIn Career Intelligence Dashboard' — the unified metric first screen.
Format the dashboard EXACTLY like this (using this structure, replacing values based on actual analysis):

## 📊 Career Brand Dashboard

### ⚡ Today's Mission
Provide a prioritized checklist of target fixes, ranked by impact (keep it very brief):
* **[Action Name]** | +[Score Gain] | [Time, e.g., 3 min] | [Priority stars, e.g., ★★★★★]
* **[Action Name]** | +[Score Gain] | [Time] | [Priority stars]

| Metric | Score | Detail / Evidence |
| :--- | :--- | :--- |
| **LinkedIn Health** | [Score, e.g. 91]/100 | [Short 1-sentence overall status] |
| **Professional Position** | — | [Target Role / Position, e.g. Growth Product Manager] |
| **Recruiter Visibility** | [Score, e.g. 88]/100 | [Short status of keyword matches] |
| **Authority** | [Score, e.g. 72]/100 | [Number of recommendations / proof signals] |
| **Networking** | [Score, e.g. 76]/100 | [Connection quality status] |
| **Content** | [Score, e.g. 45]/100 | [Theme and post status] |
| **Brand Consistency** | [Score, e.g. 93]/100 | [Alignment of Resume vs LinkedIn Profile] |

### 📈 Outcome Probability
Based on the profile's current state and target goal, estimate outcome probability metrics:
| Outcome Opportunity | Probability % | Context / Rationale |
| :--- | :--- | :--- |
| **Recruiter Message Response** | [Percentage]% | [Brief reason based on visibility] |
| **Interview Shortlist Rate** | [Percentage]% | [Brief reason based on experience/titles] |
| **Cold Outreach Reply Rate** | [Percentage]% | [Brief reason based on brand authority] |
| **Referral Acceptance Rate** | [Percentage]% | [Brief reason based on shared credentials] |
| **Content Organic Reach** | [Percentage]% | [Brief reason based on content pillars] |`,

    executiveSummary: `Generate the 'Executive Summary' section.
Output EXACTLY three bullet points and nothing else:
✓ [Positive point about target role fit]
✗ [Key branding/experience gap]
→ [Strategic summary or key verdict/recommendation]`,

    professionalBrand: `Generate the 'Professional Brand' section.
1. Output target positioning as key-value items:
   - **Current Position:** [Where candidate stands today]
   - **Desired Position:** [Target role, e.g. "${targetRole}"]
   - **Brand Gaps:** [Exactly 3 bulleted gaps, e.g. Ownership, Leadership, Metrics]
2. **Professional Brand Graph** — Draw the text-based ASCII flow:
\`\`\`text
  [Resume] ──────┐
  [LinkedIn] ────┼───> [Experience & Accomplishments] ───> [Professional Brand]
  [Projects] ────┤                  ▲
  [Portfolio] ───┘                  │
  [Posts] ──────────────────────────┴───> [Skills & Keywords]
\`\`\`
3. **Brand Moat:** Exactly one sentence defining what makes you uniquely difficult to replace.
4. Place any supporting brand analysis inside a Markdown blockquote (> ).`,

    recruiterSimulation: `Generate the 'Recruiter Simulation' section.
1. Draw the recruiter scroll funnel:
\`\`\`text
  [Recruiter Opens Profile] ───> [Looks at Headline] ───> [Stops at key role/metric] ───> [Skips/Reads About] ───> [Verdict]
\`\`\`
2. Simulate the recruiter's micro-decisions step-by-step using a list format.
3. Target Company Audit: If a target company is specified ("${targetCompany || "Target Company"}"), analyze fit:
   - E.g. "This profile is optimized for Amazon but not for Google" or specific feedback.
4. Recruiter Verdict: Would Continue / Maybe / Skip — with one-sentence reasoning.
5. Place recruiter quotes or long explanation text inside a Markdown blockquote (> ).`,

    priorityImprovements: `Generate the 'Priority Improvements' section.
List exactly 5 prioritized improvements ranked by ROI:
| Action | Time Required | Impact |
| :--- | :--- | :--- |
Use star rating symbols (e.g. ⭐⭐⭐⭐⭐) for impact. No additional paragraphs.`,

    aiImprovements: `Generate the 'AI Improvements' section.
Output only suggested copy rewrites. Place all 'Why' or 'Explain' notes inside Markdown blockquotes (> ).
Include:
1. **Headline:**
   - Current: "[current headline]"
   - Suggested:
     - [Apply Google Style: THE_HEADLINE_TEXT](apply-headline:THE_HEADLINE_TEXT)
     - [Apply Amazon Style: THE_HEADLINE_TEXT](apply-headline:THE_HEADLINE_TEXT)
     - [Apply Startup Style: THE_HEADLINE_TEXT](apply-headline:THE_HEADLINE_TEXT)
     - [Apply Consulting Style: THE_HEADLINE_TEXT](apply-headline:THE_HEADLINE_TEXT)
2. **About Summary:**
   - Suggested Storytelling Rewrite (as a copyable block).
3. **Experience Rewrites:**
   - For key roles (e.g. Blinkit), show:
     - Current Bullet
     - Suggested STAR Rewrite (Problem → Action → Impact)
     - [Sync to LinkedIn](sync-linkedin:experience:Company:RewriteText)`,

    networkingStrategy: `Generate the 'Networking Strategy' section.
Output simple, prioritized targets and actions:
**Connect**
* [Number] Recruiters
* [Number] Peers / target role professionals
* [Number] Alumni
* [Number] Startup Founders

**Join**
* [Number] Tech/Role Communities

**Follow**
* [Number] Target Companies
Provide a 3-sentence outreach message template. Place messaging rules or explanation inside a blockquote (> ).`,

    contentPlan: `Generate the 'Content Plan' section.
Output a 30-Day posting calendar calendar by weeks:
* **Week 1:** [Theme, e.g. Product Breakdown]
* **Week 2:** [Theme, e.g. Case Study]
* **Week 3:** [Theme, e.g. Internship Learning]
* **Week 4:** [Theme, e.g. Industry Insight]
Include a click-to-draft post button using the 'draft-post:' scheme link:
- [✍️ Draft Week 1 Post](draft-post:the-week-1-experience-pillar)
Place all post ideas, outlines, and examples inside a Markdown blockquote (> ).`,

    resumeLinkedinConsistency: `Generate the 'Resume ↔ LinkedIn Consistency Scan' — the professional brand alignment audit.
1. **Consistency Score**: [Score, e.g. 93]/100.
2. Identify date conflicts, title mismatches, and missing resume achievements.
3. Format each mismatch action as a Markdown link with 'sync-linkedin:' or 'sync-resume:' to trigger interactive updates on click.
For example:
- **Title Mismatch at CompanyName**: Resume: "Title A" vs. LinkedIn: "Title B"
  - [Sync LinkedIn Title to "Title A"](sync-linkedin:title:CompanyName:Title A) | [Sync Resume Title to "Title B"](sync-resume:title:CompanyName:Title B)
- **Missing Achievement from CompanyName**: "Achievement text..."
  - [Sync Achievement to LinkedIn](sync-linkedin:achievement:CompanyName:Achievement text)

If no resume text is provided in the context, display a friendly notice explaining that uploading a resume will unlock this comparative consistency check.`,
  };

  const structure = structures[sectionId] || "Write this LinkedIn Intelligence section with strategic depth and executive clarity.";

  const systemPrompt = `You are a Senior LinkedIn Intelligence Analyst and Personal Branding Consultant.
Your job: write the finished LinkedIn Intelligence section "${sectionId}" for ${targetRole ? `target role "${targetRole}"` : "career optimization"}${targetCompany ? ` at "${targetCompany}"` : ""}.
Target Goal of Candidate: "${targetGoal}". Make sure all recommendations and branding pivots align with achieving this goal.

GLOBAL RULES (CRITICAL):
1. Think like Apple Health, not McKinsey. Write with absolute brevity.
2. For every profile section (Headline, About, Experience, Skills, Networking, etc.), you MUST follow this exact format:
   - A single score line (if applicable)
   - **Problem / Insight**: Exactly ONE clear sentence.
   - **Recommendation**: Exactly ONE actionable sentence.
   - **Action**: A single interactive Markdown link or CTA button line (e.g. apply-headline link, sync link, draft-post link).
3. Place all detailed analysis, justifications, recruiter simulation voices, data proof, and explanation text inside a Markdown blockquote (starting with '> '). DO NOT write any paragraphs outside of blockquotes. This allows the UI to wrap it in a collapsible drawer.
4. Address the candidate as "you".
5. NEVER fabricate metrics, achievements, posts, certifications, or recommendations not present in the data.
6. Output polished Markdown with clear headers and concise bullets.`;

  const userPrompt = `Write the section "${sectionId}".

LINKEDIN KNOWLEDGE GRAPH:
${JSON.stringify(lkg, null, 2)}

BRAND INTELLIGENCE:
${JSON.stringify(brand, null, 2)}

RECRUITER INTELLIGENCE:
${JSON.stringify(recruiter, null, 2)}

OPTIMIZATION INTELLIGENCE:
${JSON.stringify(optimization, null, 2)}

NETWORKING & CAREER INTELLIGENCE:
${JSON.stringify(networking, null, 2)}

CONSISTENCY SCAN DATA (RESUME VS LINKEDIN):
${JSON.stringify(consistency, null, 2)}

Output ONLY polished Markdown.`;

  return { systemPrompt, userPrompt };
}
