export const LINKEDIN_SECTION_IDS = [
  "linkedinDashboard",
  "linkedinSnapshot",
  "professionalBrand",
  "recruiterFirstImpression",
  "profileStrengthScorecard",
  "headlineIntelligence",
  "aboutIntelligence",
  "experienceIntelligence",
  "skillsIntelligence",
  "personalBrandIntelligence",
  "recruiterSearchIntelligence",
  "networkingIntelligence",
  "contentIntelligence",
  "careerDirection",
  "profileGapAnalysis",
  "recruiterPersonas",
  "candidateMoat",
  "linkedinActionPlan",
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

| Metric | Score | Detail / Evidence |
| :--- | :--- | :--- |
| **LinkedIn Health** | [Score, e.g. 91]/100 | [Short 1-sentence overall status] |
| **Professional Position** | — | [Target Role / Position, e.g. Growth Product Manager] |
| **Recruiter Visibility** | [Score, e.g. 88]/100 | [Short status of keyword matches] |
| **Authority** | [Score, e.g. 72]/100 | [Number of recommendations / proof signals] |
| **Networking** | [Score, e.g. 76]/100 | [Connection quality status] |
| **Content** | [Score, e.g. 45]/100 | [Theme and post status] |
| **Brand Consistency** | [Score, e.g. 93]/100 | [Alignment of Resume vs LinkedIn Profile] |

### 🎯 Key Gaps & Mission
* **Top Strength:** [Short strength detail, e.g., Analytics + Marketplace]
* **Biggest Gap:** [Short gap details, e.g., Thought Leadership / Narrative Gaps]
* **Today's Mission:** [Direct next action, e.g., Rewrite Profile Headline]
* **Expected Gain:** [Visibility score boost, e.g., +5 Recruiter Visibility]

### 📈 Outcome Probability
Based on the profile's current state and target goal, estimate outcome probability metrics:
| Outcome Opportunity | Probability % | Context / Rationale |
| :--- | :--- | :--- |
| **Recruiter Message Response** | [Percentage]% | [Brief reason based on visibility] |
| **Interview Shortlist Rate** | [Percentage]% | [Brief reason based on experience/titles] |
| **Cold Outreach Reply Rate** | [Percentage]% | [Brief reason based on brand authority] |
| **Referral Acceptance Rate** | [Percentage]% | [Brief reason based on shared credentials] |
| **Content Organic Reach** | [Percentage]% | [Brief reason based on content pillars] |`,

    linkedinSnapshot: `Generate 'LinkedIn in One Minute' — one focused paragraph.
Explain in plain, recruiter-readable language:
- Who this person is professionally.
- What value they bring.
- Where they are in their career.
- What makes them distinctive.
Do NOT use jargon. Write as if explaining to a hiring manager in 60 seconds.`,

    professionalBrand: `Generate the 'Professional Brand & Strategy' section.
1. Draw the **Professional Brand Graph** showing how different professional components feed into the central brand. Format it as a text-based ASCII flow or graph:
\`\`\`text
  [Resume] ──────┐
  [LinkedIn] ────┼───> [Experience & Accomplishments] ───> [Professional Brand]
  [Projects] ────┤                  ▲
  [Portfolio] ───┘                  │
  [Posts] ──────────────────────────┴───> [Skills & Keywords]
\`\`\`
Explain how the user's specific assets (Resume, LinkedIn, Projects, Portfolio, Posts, Skills, Experience) relate in their brand.
2. Detail the **Target Positioning**:
   - Current Market Position: [Where the candidate stands today, e.g. Growth Product Intern]
   - Future Position: [The targeted next step, e.g. Associate Product Manager]
   - Brand Gaps: [Gaps to close to qualify for the future position, e.g. Leadership/Ownership/Experimentation]
3. Define the **Brand Moat**: what makes this candidate uniquely difficult to replace.
4. Set the **Engagement Strategy**: Target networking goal and primary content themes.`,

    recruiterFirstImpression: `Generate the 'Recruiter First Impression' section.
Simulate the recruiter funnel scroll behavior step-by-step:
\`\`\`text
  [Recruiter Opens Profile] ───> [Looks at Headline] ───> [Stops at key role/metric] ───> [Skips/Reads About] ───> [Skip or Proceed Verdict]
\`\`\`
1. **Funnel Scroll Simulation:** Explain exactly what happens when a recruiter scans the profile:
   - What stops their scroll (the hook)?
   - What gets skipped or ignored?
   - Why they would make a decision to message or skip.
2. **Company Targeting Audit:** Compare targeting alignment for "${targetCompany || "Target Company"}":
   - E.g. "This profile is optimized for Amazon but not for Google" or specific feedback on the target company.
   - Explain why the branding fits or misses the specific target company's culture and hiring criteria.
3. **Recruiter Verdict:** Would Continue / Maybe / Skip — with one-sentence reasoning.
4. **First Impression Score:** [score/100] with evidence.
Be direct and honest. Recruiters are blunt. Do not over-praise.`,

    profileStrengthScorecard: `Generate the 'Profile Strength Scorecard'.
Evaluate each section with score (0-100), rating, evidence, and one improvement action:
| Section | Score | Rating | Evidence | #1 Improvement |
| :--- | :--- | :--- | :--- | :--- |
Include: Headline, About, Experience, Projects, Skills, Recommendations, Featured, Education, Certifications, Networking, Content.
Below the table, show the **Explainable Score Weights** for overall Profile Strength.
End with a **Score vs. Top 10% Profile** benchmark comparison.`,

    headlineIntelligence: `Generate the 'Headline Intelligence' section.
1. Display the **Current Headline** and analyze: keyword density, brand clarity, recruiter appeal, role targeting.
2. List what is **Missing** from the headline.
3. Generate exactly **4 Optimized Headline Alternatives** matching specific company styles:
   - **Google Style** (Direct, keyword-optimized, high clarity: "Role | Core Skills | Business Impact")
   - **Amazon Style** (Data-driven, execution-focused: "Role | Specific Achievements & Metrics")
   - **Startup Style** (Builder, growth-oriented, high energy: "Role | Helping X do Y | Key Skill")
   - **Consulting Style** (Structured, domain authority: "Role | Domain Expert in X | Value Proposition")
Format each alternative exactly as a Markdown link with the 'apply-headline:' scheme:
[Apply Google Style: THE_HEADLINE_TEXT](apply-headline:THE_HEADLINE_TEXT)
[Apply Amazon Style: THE_HEADLINE_TEXT](apply-headline:THE_HEADLINE_TEXT)
[Apply Startup Style: THE_HEADLINE_TEXT](apply-headline:THE_HEADLINE_TEXT)
[Apply Consulting Style: THE_HEADLINE_TEXT](apply-headline:THE_HEADLINE_TEXT)
Followed by a brief explanation of why each is strong.`,

    aboutIntelligence: `Generate the 'About Section Storytelling'.
Evaluate the current summary, then provide a complete storytelling rewrite following this exact progressive framework:
1. **Journey**: The hook that establishes your professional story.
2. **Problem**: The core challenge you love to solve.
3. **Passion**: Why you choose to focus on this domain.
4. **Proof**: Hard metrics and evidence of your impact (strictly no fabrications).
5. **Future & CTA**: Where you are heading next and how to get in touch.

Format the rewrite clearly as a blockquote or code block so the user can easily copy it.`,

    experienceIntelligence: `Generate the 'Experience Intelligence' section.
For EACH work experience:
1. Current bullets → identify weaknesses.
2. Missing elements: business impact, ownership language, metrics, stakeholder scope.
3. Optimized bullets — rewrite using: Problem → Action → Business Impact → Evidence → Role Alignment.
4. **Never fabricate metrics**. If a metric is missing, write: "Add: [specific data point to source from the user]".
Format as: Company Name → Role → Duration → then a comparison table:
| Original Bullet | Weakness | Optimized Version |`,

    skillsIntelligence: `Generate the 'Skills & SEO Keyword Audit' section.
1. **Skill Cluster Map** — organize current skills into 4 clusters:
   - Technical, Business, Leadership, Industry.
2. **SEO Keyword Placement Heatmap** — show where critical target keywords appear today using text-based bar charts (e.g., █████████░):
\`\`\`text
Headline        [█████████░ / 90%]
About           [███████░░░ / 70%]
Experience      [███░░░░░░░ / 30%]
Skills          [██████░░░░ / 60%]
Featured        [░░░░░░░░░░ /  0%]
Posts           [░░░░░░░░░░ /  0%]
\`\`\`
Verify keyword placement density and add a recommendation table:
| Keyword | Headline | About | Experience | Skills | Recommendation |
| :--- | :--- | :--- | :--- | :--- | :--- |
3. **Missing Skills**: high-priority and medium-priority skills absent from the profile.
4. **Recommended Removals**: outdated or irrelevant skills diluting the brand.`,

    personalBrandIntelligence: `Generate the 'Personal Brand Strategy' section.
1. **Positioning Statement** (one sentence): How does this person position themselves vs. similar professionals?
2. **Authority Score**: [score/100] with evidence.
3. **Differentiation**: What makes this profile stand out in a competitive pool?
4. **Professional Moat**: Evidence of expertise that competitors cannot easily replicate.
5. **Brand Recommendations**: Top 3 actions to strengthen the personal brand.`,

    recruiterSearchIntelligence: `Generate the 'Recruiter Search Visibility' section.
Simulate search discovery algorithms and display a direct target checklist:
| Recruiter searching | Visibility Status (YES/PARTIAL/LOW) | Search Term Strategy |
| :--- | :--- | :--- |
Include roles related to target role (e.g. Associate PM, Growth PM, Product Analyst, Strategy, etc.).
1. Explain WHY the profile surfaces or fails to surface for each search term.
2. Detail the exact SEO adjustments required to move LOW/PARTIAL terms to YES.`,

    networkingIntelligence: `Generate the 'Networking Intelligence & Outreach targets' section.
1. **Network Quality Analysis**: Evaluate current connection metrics split by specific categories:
   - Recruiters (e.g. 5%)
   - Alumni (e.g. 20%)
   - Founders (e.g. 10%)
   - Hiring Managers (e.g. 15%)
   - Peers (e.g. 40%)
   - Thought Leaders (e.g. 10%)
   Detail gaps in connection representation.
2. **Outreach Rationale Targets**: Recommend connection targets by category:
   - APMs / Peers (e.g. 20)
   - Product Directors / Hiring Managers (e.g. 10)
   - School / Company Alumni (e.g. 10)
   - Talent Acquisition / Recruiters (e.g. 15)
   - Startup Founders (e.g. 5)
For each group, specify the exact networking outreach reason.
3. **Outreach Messaging Template**: Provide a 3-sentence, high-response outreach message template.`,

    contentIntelligence: `Generate the 'Content Engine & Pillars' section.
Rather than generic posting suggestions, generate a 30-day authority content calendar based on the candidate's experience:
1. **Content Pillars**: Define 3 core themes (e.g. Product Reviews, Growth Insight, Consumer Behavior).
2. **30-Day Posting Calendar Plan**:
   - **Week 1-4 Schedule**:
     - **Monday**: [Pillar theme, e.g. Product Breakdown] — Description & post trigger.
     - **Wednesday**: [Pillar theme, e.g. Case Study] — Description & post trigger.
     - **Friday**: [Pillar theme, e.g. Internship Learning] — Description & post trigger.
     - **Sunday**: [Pillar theme, e.g. Career Reflection] — Description & post trigger.
3. Provide a brief click-to-draft template outline for Week 1.`,

    careerDirection: `Generate the 'Career Direction' section.
1. **Current Career Trajectory**: Where is this career heading based on evidence?
2. **Career Momentum**: Strong / Moderate / Stagnant — with reasoning.
3. **Top 5 Target Roles** — formatted as:
| Role | Fit Score | Why | Key Gap |
| :--- | :--- | :--- | :--- |
4. **Industries to Target** with reasoning.
5. **Career Acceleration Actions**: 3 specific actions to accelerate trajectory.`,

    profileGapAnalysis: `Generate the 'Profile Gap Analysis & Timeline' section.
1. **Competitive Target Role Benchmark:** Compare current profile against specific role targets (Google PM, Amazon PM, Startup PM, Consultant, etc.) depending on targetGoal:
| Dimension | User Profile | Ideal Target PM | Gap | Action |
| :--- | :--- | :--- | :--- | :--- |
Include: Headline, About, Experience, Skills, Recommendations, Featured, Certifications, Network.
2. **Profile Score Timeline:** Show how the profile score evolves incrementally after each optimization step:
\`\`\`text
  [Current Score: 62] ───> [+Headline: 70] ───> [+About: 78] ───> [+Experience: 87] ───> [+Skills: 91] ───> [Final Target: 95]
\`\`\`
Explain the score jump reasoning for each segment.`,

    recruiterPersonas: `Generate the 'Recruiter Personas' section.
Simulate 4 different evaluators reviewing this LinkedIn profile:
1. **Generalist Recruiter**: HR screener, focused on keywords and completeness.
2. **Hiring Manager**: Domain expert, focused on evidence of real-world impact.
3. **Director/VP**: Senior leader, focused on leadership, trajectory, and business fit.
4. **Talent Acquisition Specialist**: Brand-focused, evaluating cultural and professional fit.
For each: Write a 3-4 sentence direct feedback quote in their authentic voice. Then: Verdict (Would Interview / Hold / Reject), Confidence (High/Medium/Low), and Key Evidence used.`,

    candidateMoat: `Generate the 'Candidate Moat & Authority Engine' section.
Analyze professional credibility using the **Authority Engine Checklist**:
* **Recommendations Score:** [Evaluation based on quality/frequency]
* **Endorsements Score:** [Evaluation based on top skills]
* **Featured Projects:** [Audit of case studies, portfolio, or publications]
* **Articles & Content Authority:** [Proof of writing]
* **Speaking & Industry Engagement:** [Speaking, teaching, or event attendance]
* **Certifications & Open Source:** [Verify Moat strength]
Evaluate Moat metrics:
| Dimension | This Profile | Top 10% Profile | Gap |
| :--- | :--- | :--- | :--- |
Rate dimensions with stars (★★★★★).`,

    linkedinActionPlan: `Generate the 'LinkedIn Action Plan' — the complete ranked improvement roadmap.
Format as a priority matrix table:
| Priority | Action | Section | Time Required | Impact | ROI |
| :--- | :--- | :--- | :--- | :--- | :--- |
Priority: 🔴 Critical / 🟡 Important / 🟢 Nice to Have
Impact: score improvement expected (e.g., +12 Recruiter Visibility)
ROI: ★★★ indicators
Include all improvements identified across ALL sections of this dossier.
Group by: Quick Wins (< 30 mins) | Medium Effort (1-3 hours) | Strategic (1+ days).
End with: **Expected Profile Transformation**: current state → after all actions state.`,

    resumeLinkedinConsistency: `Generate the 'Resume ↔ LinkedIn Consistency Scan' — the professional brand alignment audit.
Perform a forensic cross-check between the parsed Resume and the LinkedIn profile.
1. **Consistency Score**: [Score, e.g. 93]/100.
2. **Employment Date Mismatches**: Identify any dates that conflict for identical companies/roles.
3. **Job Title Inconsistencies**: Highlight discrepancies where the titles differ (e.g. "Lead Product Analyst" on Resume vs "Product Intern" on LinkedIn).
4. **Missing Accomplishments in LinkedIn**: Extract high-impact achievements, metrics, or projects present on the Resume but missing on LinkedIn.
Format each mismatch action as a Markdown link with 'sync-linkedin:' or 'sync-resume:' to trigger interactive updates on click.
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

GLOBAL RULES:
1. Write with absolute precision, strategic depth, and professional clarity. Every section must be consumable in 30 seconds.
2. Address the candidate as "you".
3. NEVER fabricate metrics, achievements, posts, certifications, or recommendations not present in the data.
4. If a metric is missing, say what to gather — never invent it.
5. Every recommendation must explain WHY it improves Professional Brand or Recruiter Visibility or Hiring Readiness.
6. Do NOT put scores in individual sections (except the Dashboard). All scores live in the Dashboard only.
7. Output polished Markdown with clear headers, tables where specified, and concise bullets.`;

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
