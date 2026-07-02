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

  const profile = lkg.profile || {};
  const targetRole = state.role || "Target Role";
  const targetCompany = state.companyName || "";

  const structures: Record<string, string> = {
    linkedinDashboard: `Generate the 'LinkedIn Intelligence Dashboard' — the hero first screen.
1. Write a 2-line **LinkedIn Health Summary** (candidate's current professional brand in plain language).
2. Generate the **Hero Metrics** table:
- **Profile Strength**: [score/100]
- **Recruiter Visibility**: [score/100]  
- **Brand Clarity**: [score/100]
- **Networking Score**: [score/100]
- **Keyword Coverage**: [score/100]
- **Leadership Signals**: [score/100]
- **Content Authority**: [score/100]
- **Hiring Readiness**: [score/100]
3. Generate the **Explainable Score Breakdown** for each metric with Evidence → Reason → Gap → Improvement → Confidence.
4. Show the **Top Strength**, **Top Weakness**, **Fastest Improvement** (with Time Required and Expected Gain).
5. Show **Brand Archetypes**: Primary / Secondary / Supporting with evidence.
Format hero metrics as a scorecard table: | Metric | Score | Rating | Key Evidence | Gap |`,

    linkedinSnapshot: `Generate 'LinkedIn in One Minute' — one focused paragraph.
Explain in plain, recruiter-readable language:
- Who this person is professionally.
- What value they bring.
- Where they are in their career.
- What makes them distinctive.
Do NOT use jargon. Write as if explaining to a hiring manager in 60 seconds.`,

    professionalBrand: `Generate the 'Professional Brand' section.
1. State the **Primary Brand** in one sentence (e.g., "Growth-focused Product Manager with a builder's mindset").
2. List **Brand Evidence**: specific bullets, titles, metrics, and achievements that create this brand.
3. Identify the **Brand Archetype** (Primary / Secondary / Supporting) with reasoning.
4. Evaluate **Brand Consistency**: is the story coherent across headline, about, and experience?
5. List **Brand Gaps**: what is missing that weakens the brand?
6. State the **Professional Moat**: what makes this person uniquely difficult to replace?`,

    recruiterFirstImpression: `Generate the 'Recruiter First Impression' section.
Simulate the 8-second recruiter scan:
1. **What stands out immediately** (positive signals that stop the scroll).
2. **What gets ignored or skipped** (weak sections, sparse content).
3. **Recruiter Verdict**: Would Continue / Maybe / Skip — with one-sentence reasoning.
4. **Scroll Audit**: Walk through what a recruiter sees in order: headline → photo → current role → about → experience.
5. **First Impression Score**: [score/100] with evidence.
Be direct and honest. Recruiters are blunt. Do not over-praise.`,

    profileStrengthScorecard: `Generate the 'Profile Strength Scorecard'.
Evaluate each section with score (0-100), rating, evidence, and one improvement action:
| Section | Score | Rating | Evidence | #1 Improvement |
Include: Headline, About, Experience, Projects, Skills, Recommendations, Featured, Education, Certifications, Networking, Content.
Below the table, show the **Explainable Score Weights** for overall Profile Strength.
End with a **Score vs. Top 10% Profile** benchmark comparison.`,

    headlineIntelligence: `Generate the 'Headline Intelligence' section.
1. Display the **Current Headline** and analyze: keyword density, brand clarity, recruiter appeal, role targeting.
2. List what is **Missing** from the headline.
3. Generate exactly **3 Optimized Headline Alternatives**:
- Option 1: Keyword-heavy (ATS optimized)
- Option 2: Brand-led (personal brand first)
- Option 3: Achievement-led (impact first)
For each: explain why it is stronger, what recruiters will notice, and which role it targets best.`,

    aboutIntelligence: `Generate the 'About Section Intelligence'.
1. Evaluate the **Current About**: Story → Metrics → Leadership → Credibility → Keywords → CTA.
2. Score each dimension (0-10) with evidence.
3. Identify the 3 biggest weaknesses.
4. Generate a complete **Optimized About Section** rewrite.
Rules for the rewrite: First sentence hooks a recruiter. Uses authentic professional language. Includes at least one metric if available in evidence. Has a clear CTA (call to action). Reflects the primary brand archetype.
5. Explain exactly **Why the Rewrite is Stronger**.`,

    experienceIntelligence: `Generate the 'Experience Intelligence' section.
For EACH work experience:
1. Current bullets → identify weaknesses.
2. Missing elements: business impact, ownership language, metrics, stakeholder scope.
3. Optimized bullets — rewrite using: Problem → Action → Business Impact → Evidence → Role Alignment.
4. **Never fabricate metrics**. If a metric is missing, write: "Add: [specific data point to source from the user]".
Format as: Company Name → Role → Duration → then a comparison table:
| Original Bullet | Weakness | Optimized Version |`,

    skillsIntelligence: `Generate the 'Skills Intelligence' section.
1. **Skill Cluster Map** — organize current skills into 4 clusters:
| Cluster | Skills |
Technical | ...
Business | ...
Leadership | ...
Industry | ...
2. **Missing Skills**: high-priority and medium-priority skills absent from the profile.
3. **Recommended Removals**: outdated or irrelevant skills diluting the brand.
4. **Endorsement Strategy**: which skills to prioritize for endorsements and why.`,

    personalBrandIntelligence: `Generate the 'Personal Brand Intelligence' section.
1. **Positioning Statement** (one sentence): How does this person position themselves vs. similar professionals?
2. **Authority Score**: [score/100] with evidence.
3. **Consistency Audit**: Is the brand consistent across headline → about → experience → skills?
4. **Differentiation**: What makes this profile stand out in a competitive pool?
5. **Professional Moat**: Evidence of expertise that competitors cannot easily replicate.
6. **Brand Recommendations**: Top 3 actions to strengthen the personal brand.`,

    recruiterSearchIntelligence: `Generate the 'Recruiter Search Intelligence' section.
1. **Search Visibility Score**: [score/100].
2. **Surfaces For**: List specific keyword searches that would surface this profile today.
3. **Missing From**: List keyword searches this profile should appear in but doesn't.
4. **Keyword Gap Analysis**: Missing keywords by category (Role, Industry, Skills, Function).
5. **Search Rank Improvement Actions**: Top 5 specific changes to improve search ranking.
6. **Algorithm Signals**: LinkedIn's search ranking factors and how this profile performs on each.`,

    networkingIntelligence: `Generate the 'Networking Intelligence' section.
1. **Networking Score**: [score/100] with evidence.
2. **Connection Quality Assessment**: Based on visible signals (recommendations, endorsements, featured connections).
3. **Recommendation Analysis**: Current recommendations — strength, relevance, and what type of recommendations are missing.
4. **Networking Gaps**: What is missing from the network that is hurting visibility?
5. **Recommended Actions**:
- Who to connect with (roles, seniority levels, industries).
- Communities and LinkedIn groups to join.
- Companies to follow for network signal.`,

    contentIntelligence: `Generate the 'Content Intelligence' section.
If posts or articles are present in the profile, analyze them.
If absent, provide a complete content strategy based on the brand.
1. **Current Content Analysis**: Themes, consistency, authority, estimated reach.
2. **Content Authority Score**: [score/100].
3. **Recommended Content Pillars** (3 pillars based on brand archetype):
- Pillar 1: [topic] — why it builds authority
- Pillar 2: [topic] — why it builds authority
- Pillar 3: [topic] — why it builds authority
4. **Posting Frequency Recommendation** with reasoning.
5. **Content Types**: What formats (posts, articles, carousels, polls) work best for this brand?`,

    careerDirection: `Generate the 'Career Direction' section.
1. **Current Career Trajectory**: Where is this career heading based on evidence?
2. **Career Momentum**: Strong / Moderate / Stagnant — with reasoning.
3. **Top 5 Target Roles** — formatted as:
| Role | Fit Score | Why | Key Gap |
Roles must be derived from actual career evidence, not generic suggestions.
4. **Industries to Target** with reasoning.
5. **Career Acceleration Actions**: 3 specific actions to accelerate trajectory.`,

    profileGapAnalysis: `Generate the 'Profile Gap Analysis' section.
Compare the current LinkedIn profile against the ideal profile for the target role${targetRole ? ` "${targetRole}"` : ""}${targetCompany ? ` at "${targetCompany}"` : ""}.
Format as:
| Dimension | Current | Ideal | Gap | Action |
Include: Headline, About, Experience, Skills, Recommendations, Featured, Certifications, Network.
2. **Gap Priority Matrix**: Rank gaps by impact (High/Medium/Low) and time to fix (Quick/Medium/Long).
3. **Profile Score vs. Target Role**: [current score] → [target score] — what it would take to close the gap.`,

    recruiterPersonas: `Generate the 'Recruiter Personas' section.
Simulate 4 different evaluators reviewing this LinkedIn profile:
1. **Generalist Recruiter**: HR screener, focused on keywords and completeness.
2. **Hiring Manager**: Domain expert, focused on evidence of real-world impact.
3. **Director/VP**: Senior leader, focused on leadership, trajectory, and business fit.
4. **Talent Acquisition Specialist**: Brand-focused, evaluating cultural and professional fit.
For each: Write a 3-4 sentence direct feedback quote in their authentic voice. Then: Verdict (Would Interview / Hold / Reject), Confidence (High/Medium/Low), and Key Evidence used.`,

    candidateMoat: `Generate the 'Candidate Moat' section.
Answer: Why should recruiters remember THIS LinkedIn profile?
1. **Professional Moat**: What combination of experience, skills, and achievements is uniquely difficult to replicate?
2. **Moat Evidence**: Specific bullets, roles, and achievements that build the moat.
3. **Moat Strength**: Strong / Moderate / Weak — with reasoning.
4. **Moat Gaps**: What is missing that would make the moat unassailable?
5. **Competitor Benchmark**:
| Dimension | This Profile | Top 10% Profile | Gap |
Rate dimensions with stars (★★★★★).`,

    linkedinActionPlan: `Generate the 'LinkedIn Action Plan' — the complete ranked improvement roadmap.
Format as a priority matrix table:
| Priority | Action | Section | Time Required | Impact | ROI |
Priority: 🔴 Critical / 🟡 Important / 🟢 Nice to Have
Impact: score improvement expected (e.g., +12 Recruiter Visibility)
ROI: ★★★★★ rating
Include all improvements identified across ALL sections of this dossier.
Group by: Quick Wins (< 30 mins) | Medium Effort (1-3 hours) | Strategic (1+ days).
End with: **Expected Profile Transformation**: current state → after all actions state.`,
  };

  const structure = structures[sectionId] || "Write this LinkedIn Intelligence section with strategic depth and executive clarity.";

  const systemPrompt = `You are a Senior LinkedIn Intelligence Analyst and Personal Branding Consultant.
Your job: write the finished LinkedIn Intelligence section "${sectionId}" for ${targetRole ? `target role "${targetRole}"` : "career optimization"}${targetCompany ? ` at "${targetCompany}"` : ""}.

SECTION INSTRUCTIONS:
${structure}

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

Output ONLY polished Markdown.`;

  return { systemPrompt, userPrompt };
}
