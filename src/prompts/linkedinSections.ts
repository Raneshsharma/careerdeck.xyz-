export const LINKEDIN_SECTION_IDS = [
  "linkedinHealth",
  "todaysMission",
  "recruiterSimulation",
  "networkingCards",
  "contentCalendar",
  "consistencyVisual"
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

  const targetRole = state.role || "Target Role";
  const targetCompany = state.companyName || "";
  const targetGoal = state.linkedinGoal || "Landing PM jobs";

  const structures: Record<string, string> = {

    linkedinHealth: `Generate the 'LinkedIn Health' dashboard — the ONLY top-level overview. This section MUST NOT suggest specific fixes; those belong exclusively in Today's Mission.

Output EXACTLY this format:

## 📊 LinkedIn Health

| Metric | Score | Status | Detail |
| :--- | :---: | :---: | :--- |
| **Overall Health** | [0-100] | [Excellent/Good/Needs Work/Critical] | [One sentence overall verdict] |
| **Role Match** | [0-100] | [Excellent/Good/Needs Work/Critical] | [Target role alignment status] |
| **Recruiter Visibility** | [0-100] | [Excellent/Good/Needs Work/Critical] | [Keyword and headline status] |
| **Brand Authority** | [0-100] | [Excellent/Good/Needs Work/Critical] | [Recommendations and proof signals count] |
| **Network Quality** | [0-100] | [Excellent/Good/Needs Work/Critical] | [Connection quality and reach] |
| **Consistency** | [0-100] | [Excellent/Good/Needs Work/Critical] | [Resume vs. LinkedIn alignment] |

**Biggest Strength:** [One specific, evidence-backed strength from the profile]
**Biggest Gap:** [One specific gap that most limits recruiter visibility — no fix suggestion here]
**Target Role:** ${targetRole}${targetCompany ? ` at ${targetCompany}` : ""}

> [Place all supporting analysis, evidence, or profile quotes here.]`,

    todaysMission: `Generate the 'Today's Mission' section — the SINGLE source of ALL improvement actions. This is the ONLY section that tells the user what to fix. No other section repeats these.

List EXACTLY 5 improvements ranked by ROI (highest impact first). Each item MUST follow this EXACT format with NO deviations:

## 🎯 Today's Mission

**① [Action Title]** | [X] min | [★★★★★] | +[N] pts
**Problem:** [Exactly one sentence explaining the specific issue with evidence from the profile.]
**Action:** [Copy AI Headline](apply-headline:FULL_SUGGESTED_HEADLINE_TEXT_HERE)

---

**② [Action Title]** | [X] min | [★★★★☆] | +[N] pts
**Problem:** [Exactly one sentence.]
**Action:** [Copy AI About](copy-text:FULL_SUGGESTED_ABOUT_TEXT_HERE)

---

**③ [Action Title]** | [X] min | [★★★★☆] | +[N] pts
**Problem:** [Exactly one sentence.]
**Action:** [Copy Missing Skills](copy-text:Skill1, Skill2, Skill3, Skill4)

---

**④ [Action Title]** | [X] min | [★★★☆☆] | +[N] pts
**Problem:** [Exactly one sentence.]
**Action:** [Copy Experience Rewrite](copy-text:FULL_SUGGESTED_EXPERIENCE_BULLET_TEXT)

---

**⑤ [Action Title]** | [X] min | [★★★☆☆] | +[N] pts
**Problem:** [Exactly one sentence.]
**Action:** [Copy Featured Section](copy-text:SUGGESTED_FEATURED_TEXT_OR_ACTION)

> [Place all detailed justifications and reasoning in this blockquote — it will be hidden in a collapsible drawer.]

RULES:
- apply-headline: links are for Headline rewrites. copy-text: links are for everything else.
- The link path must contain the FULL suggested text (not a placeholder).
- ★ ratings: ★★★★★ = Critical, ★★★★☆ = High, ★★★☆☆ = Medium.
- Point values: +12 headline, +9 about, +7 experience, +6 skills, +4 featured.
- NEVER add analysis paragraphs outside the blockquote.`,

    recruiterSimulation: `Generate the 'Recruiter Simulation' section. Show ONLY the verdict and three reasons. All walkthrough detail goes in a blockquote.

## 👁 Recruiter Simulation

**Verdict:** [✅ PASS / ⚠️ MAYBE / ❌ SKIP] — [One-sentence overall reason]

**Why:**
1. [First specific reason — reference a concrete profile element by name]
2. [Second specific reason — reference a concrete profile element by name]
3. [Third specific reason — reference a concrete profile element by name]

${targetCompany ? `**${targetCompany} Fit:** [One sentence on fit for this specific company — be specific about culture, stack, or values match]` : ""}

> [Place the full recruiter scroll walkthrough here: what they see step by step — Headline → Photo → About → Experience → Skills → Connections → Verdict. Include recruiter inner monologue quotes.]`,

    networkingCards: `Generate the 'Networking' section as CARDS only. No analysis paragraphs in the main body.

## 🔗 Networking

| Action | Count | Target |
| :--- | :---: | :--- |
| **Connect** | [N] | [Specific profile type, e.g. "Senior PMs at fintech startups in India"] |
| **Follow** | [N] | [Specific companies, e.g. "Razorpay, CRED, Meesho, PhonePe"] |
| **Join** | [N] | [Specific communities, e.g. "Product Folks India, PM School, Reforge"] |
| **Reach Out** | [N per week] | [Specific outreach cadence, e.g. "1 IIT Delhi alumni per week"] |

> [Place the full outreach message template and networking strategy rationale here.]`,

    contentCalendar: `Generate the 'Content Strategy' section — a 30-day content calendar. ONLY about content creation, NOT profile optimization.

## ✍️ Content Strategy

| Week | Theme | Format | Draft |
| :--- | :--- | :--- | :--- |
| **Week 1** | [Theme, e.g. Product Breakdown] | [Text Post / Carousel / Poll] | [✍️ Draft Post](draft-post:week1-product-breakdown) |
| **Week 2** | [Theme, e.g. Internship Learning] | [Text Post / Carousel / Poll] | [✍️ Draft Post](draft-post:week2-internship-learning) |
| **Week 3** | [Theme, e.g. Case Study] | [Text Post / Carousel / Poll] | [✍️ Draft Post](draft-post:week3-case-study) |
| **Week 4** | [Theme, e.g. Industry Insight] | [Text Post / Carousel / Poll] | [✍️ Draft Post](draft-post:week4-industry-insight) |

**Best time to post:** [Day and time based on target audience, e.g. "Tuesday & Thursday, 8–9am IST"]
**Content Pillar:** [One-sentence positioning strategy for your content brand]

> [Place post outlines, hooks, and example opening lines here.]`,

    consistencyVisual: `Generate the 'Resume ↔ LinkedIn Consistency' section. If no resume text is in the context, output only a friendly notice that uploading a resume will unlock this comparison.

## 🔄 Consistency

**Overall Consistency:** [Score]%

| Field | Status | Detail |
| :--- | :---: | :--- |
| **Headline** | ✅ / ⚠️ / ❌ | [One sentence describing the match or mismatch] |
| **Current Role Title** | ✅ / ⚠️ / ❌ | [Specific detail] |
| **Experience Dates** | ✅ / ⚠️ / ❌ | [Specific detail] |
| **Skills** | ✅ / ⚠️ / ❌ | [Specific detail] |
| **Education** | ✅ / ⚠️ / ❌ | [Specific detail] |
| **About / Summary** | ✅ / ⚠️ / ❌ | [Specific detail] |

For each ⚠️ or ❌ row, add a sync action on the next line:
- [Sync LinkedIn](sync-linkedin:field:SectionName:NewText) | [Sync Resume](sync-resume:field:SectionName:NewText)

> [Place full mismatch analysis and impact notes here.]`,
  };

  const structure = structures[sectionId] || "Write this LinkedIn Intelligence section with strategic depth and executive clarity.";

  const systemPrompt = `You are a Senior LinkedIn Intelligence Analyst and Personal Branding Consultant.
Your job: write the finished LinkedIn Intelligence section "${sectionId}" for ${targetRole ? `target role "${targetRole}"` : "career optimization"}${targetCompany ? ` at "${targetCompany}"` : ""}.
Target Goal of Candidate: "${targetGoal}". Align all recommendations to this goal.

GLOBAL RULES (CRITICAL — VIOLATIONS WILL BREAK THE UI):
1. Think like Apple Health, not McKinsey. Absolute brevity.
2. Each section owns ONE topic. NEVER repeat advice from another section:
   - linkedinHealth = metrics overview ONLY, no fixes.
   - todaysMission = ALL fixes, nowhere else.
   - recruiterSimulation = verdict + 3 reasons ONLY.
   - networkingCards = connection targets ONLY.
   - contentCalendar = content plan ONLY.
   - consistencyVisual = consistency scores ONLY.
3. NEVER show "Current:" copy unless it is genuinely needed for contrast. If something is already good, skip it entirely.
4. All detailed analysis, justifications, and evidence MUST go inside Markdown blockquotes (lines starting with '> '). The UI wraps these in collapsible drawers — DO NOT write analysis paragraphs outside blockquotes.
5. Address the candidate as "you".
6. NEVER fabricate metrics, achievements, posts, or certifications not present in the data.
7. Output polished Markdown with clear headers.`;

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
