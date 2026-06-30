import type { NewsFacts } from "../graph/state";

export const NEWS_SECTION_IDS = [
  "newsOverview", "executiveSummary", "whatHappened", "whyItHappened",
  "businessImpact", "strategicImportance", "industryImpact", "financialImpact",
  "customerImpact", "employeeImpact", "roleImpact", "interviewTalkingPoints",
  "risksAndOpportunities", "whatHappensNext", "candidateActionPlan"
];

export function buildNewsAnalystPrompt(
  sectionId: string,
  newsFacts: NewsFacts | null,
  companyName: string,
  roleTitle: string,
): { systemPrompt: string; userPrompt: string } {
  const dataStr = newsFacts ? JSON.stringify(newsFacts, null, 2) : "No news facts available";

  const objectives: Record<string, string> = {
    newsOverview: "Synthesize the news into a 'News in One Minute' brief: What happened? Why did it happen? Why should a candidate care about it right now?",
    executiveSummary: "Write a CEO-level one-paragraph summary of this news event — what it means strategically, financially, and competitively.",
    whatHappened: "Construct an objective, fact-only timeline of the event. No opinions, no speculation. Only verifiable facts with source attribution.",
    whyItHappened: "Perform three-level root cause analysis: Surface (what triggered it), Cause (underlying business pressure), Strategic Driver (what management was ultimately trying to achieve).",
    businessImpact: "Decompose business impact across six dimensions: Winners, Losers, Revenue Effects, Margin Effects, Operational Effects, Customer Effects.",
    strategicImportance: "Decompose why management made this move — what strategic objective does it serve, what alternatives were likely considered, and what this signals about future direction.",
    industryImpact: "Analyze how this news ripples across the industry: competitor reactions, industry trend acceleration, and second-order effects on adjacent businesses.",
    financialImpact: "Decompose all financial dimensions: revenue impact, margin effects, stock signal, cash position change, and investment risk.",
    customerImpact: "Analyze what changes for customers — product access, pricing, service levels, and long-term relationship dynamics.",
    employeeImpact: "Analyze hiring signals, layoff risk, in-demand skills, and culture change implications for current and future employees.",
    roleImpact: `Analyze the specific impact on each role family (Product, Engineering, Marketing, Sales, Finance, Operations, Consulting). ${roleTitle ? `Pay special attention to the "${roleTitle}" role.` : ""}`,
    interviewTalkingPoints: "Generate 5 intelligent, opinionated talking points — not summaries. Each must be a strong professional opinion with reasoning and confidence level.",
    risksAndOpportunities: "Decompose all material risks (with likelihood and mitigation) and opportunities (with timeframe and who benefits).",
    whatHappensNext: "Generate 3-5 forward-looking predictions with explicit timeframes and High/Medium/Low confidence levels and rationale.",
    candidateActionPlan: "Build a prioritized, specific action plan for a candidate to make the most of this news intelligence."
  };

  const objective = objectives[sectionId] || "Analyze this news section.";

  const systemPrompt = `You are a Senior McKinsey Business Intelligence Analyst.
Your job: analyze the news event for "${companyName}" and produce a structured analysis for the section "${sectionId}".

PHILOSOPHY: Facts → Business → Career. Don't summarize. Explain second-order effects.

OBJECTIVE:
${objective}

INSTRUCTIONS:
1. Use ONLY the facts in the News Knowledge Graph. Do not hallucinate.
2. Structure your analysis as valid JSON.
3. Label all speculation with confidence levels (High/Medium/Low).

Output ONLY valid JSON.`;

  const userPrompt = `Perform the analysis for "${sectionId}" for the news event at "${companyName}".

NEWS KNOWLEDGE GRAPH:
${dataStr}

Return ONLY the JSON.`;

  return { systemPrompt, userPrompt };
}

export function buildNewsWriterPrompt(
  sectionId: string,
  analysis: Record<string, unknown>,
  companyName: string,
  roleTitle: string,
): { systemPrompt: string; userPrompt: string } {
  const structures: Record<string, string> = {
    newsOverview: "Write a punchy 'News in One Minute' block with three bold-labeled answers:\n**What Happened**: [1 sentence]\n**Why It Happened**: [1-2 sentences]\n**Why You Should Care**: [1-2 sentences with career angle]\nFollow with a **News Scorecard** block:\n- Importance: [X]/10\n- Freshness: [label]\n- Interview Relevance: [label]",
    executiveSummary: "Write a single, tight CEO-level paragraph (5-7 sentences max) covering: what the event is, why it happened strategically, the primary financial signal, and the most important forward-looking implication.",
    whatHappened: "Build a 'What Actually Happened' timeline using a numbered list of objective facts:\n1. [Date] — [Fact]\n2. [Date] — [Fact]\nFollow with a 'Verified Facts' vs 'Reported/Unverified' two-column table.",
    whyItHappened: "Write a 'Why It Happened' section using the three-level root cause structure:\n**Surface Level**: [what triggered it]\n**Business Level**: [underlying pressure]\n**Strategic Level**: [long-term objective management was pursuing]\nFollow with a paragraph explaining why THIS timing — why now.",
    businessImpact: "Build the 'Business Impact' analysis:\n**Winners**: [bulleted list with brief rationale]\n**Losers**: [bulleted list with brief rationale]\nFollow with a structured table:\n| Impact Dimension | Effect | Timeframe |\nCover: Revenue, Margins, Operations, Customers.",
    strategicImportance: "Write a 'Strategic Importance' analysis. Use this structure:\n**The Move**: [what was done]\n**The Real Goal**: [what management was trying to achieve]\n**Alternatives Considered**: [2-3 likely alternatives and why they were rejected]\n**What This Signals**: [forward-looking strategic direction]",
    industryImpact: "Write an 'Industry Impact' section:\n**Competitor Reactions**: [bulleted analysis of likely responses]\n**Industry Trend Accelerated**: [what broader shift this confirms]\n**Second-Order Ripple Effects**: [impacts on adjacent businesses or roles]\nEnd with a 'Industry Shift Map' mapping who gains and loses positioning.",
    financialImpact: "Build a 'Financial Impact' analysis table:\n| Financial Dimension | Effect | Confidence |\nCover: Revenue, Margins, Stock Signal, Cash Position, Investment Risk.\nFollow with a short paragraph on the key financial risk to monitor.",
    customerImpact: "Write a 'Customer Impact' section covering: product access changes, pricing implications, service level changes, and the long-term customer relationship dynamic. End with a bolded takeaway on net customer impact.",
    employeeImpact: "Write an 'Employee Impact' section:\n**Hiring Signal**: [what this means for hiring]\n**Layoff Risk**: [assessment]\n**Skills Now in Demand**: [bulleted list]\n**Culture Impact**: [what changes internally]\nEnd with a paragraph on what this means for candidates targeting this company.",
    roleImpact: `Build a 'Role Impact' analysis. For each role family, create a mini-block:\n**[Role Family]**\n- Impact: [specific operational or strategic change]\n- Opportunity: [new hiring or growth opportunity created]\n${roleTitle ? `\nGive special depth to the "${roleTitle}" role — add an 'Interview Angle' for how a candidate in this role should discuss this news.` : ""}`,
    interviewTalkingPoints: "Generate 5 'Interview Talking Points' — intelligent, opinionated statements a candidate can use verbatim:\n### Talking Point [N]\n**Opinion**: \"[Statement starting with 'I think...' or 'What this signals is...']\"\n**Business Reasoning**: [supporting logic]\n**Confidence**: [High/Medium/Low]\nThese should be usable immediately in an interview.",
    risksAndOpportunities: "Build a 'Risks & Opportunities' analysis:\n**Material Risks**:\n| Risk | Likelihood | Strategic Mitigation |\n\n**Strategic Opportunities**:\n| Opportunity | Timeframe | Who Benefits |",
    whatHappensNext: "Build a 'What Happens Next' prediction section:\n| Prediction | Timeframe | Confidence | Rationale |\nInclude 3-5 predictions. Label all confidence levels explicitly. End with a paragraph on the single most important thing to watch.",
    candidateActionPlan: "Build a 'Candidate Action Plan' as a prioritized checklist:\n**Priority 1 (Do Today)**:\n- [Specific action]\n**Priority 2 (This Week)**:\n- [Specific action]\n**Priority 3 (Before Interview)**:\n- [Specific action]\nEach action must include WHY it matters."
  };

  const structure = structures[sectionId] || "Write the section in McKinsey-grade business intelligence prose.";

  const systemPrompt = `You are a Senior McKinsey Business Intelligence Writer.
Your job: write the finished News Intelligence section "${sectionId}" for the news event at "${companyName}" ${roleTitle ? `(reader's target role: ${roleTitle})` : ""}.

SECTION INSTRUCTIONS:
${structure}

RULES:
1. Don't summarize. Explain second-order effects and business implications.
2. Every insight must answer: "Why does this matter?" or "What should the candidate do with this?"
3. Label all predictions and opinions with confidence levels.
4. Use only the structured analysis data. Do not hallucinate facts.
5. Conclude the section with a bolded "**Intelligence Takeaway:** [one key insight]".`;

  const userPrompt = `Write the section "${sectionId}" for the news at "${companyName}".

STRUCTURED ANALYSIS DATA:
${JSON.stringify(analysis, null, 2)}

Output ONLY polished Markdown.`;

  return { systemPrompt, userPrompt };
}
