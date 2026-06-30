import type { CompanyState, NewsFacts } from "../state";
import { generateSection } from "../../prompts/llm";

const NEWS_ANALYZER_SYSTEM_PROMPT = `You are a Senior McKinsey Business Intelligence Analyst and former CNBC Senior Editor.
Your job is NOT to summarize news. Your job is to run a three-layer business reasoning pipeline on it.

PHILOSOPHY:
  Fact Layer   → What objectively happened?
  Business Layer → Why does it matter to the company, industry, customers, and competitors?
  Career Layer   → What should a candidate, employee, or interviewer take away?

CRITICAL INSTRUCTIONS:
1. "category": Classify into one of: "Acquisition", "Earnings", "Layoffs", "Product Launch", "Leadership Change", "Funding", "Regulatory", "Partnership", "Restructuring", "Market Expansion", "IPO", "Other".
2. "root_cause": Apply root-cause thinking — not surface-level. Go three levels deep: Surface → Cause → Strategic Driver.
3. "business_impact": Identify concrete winners and losers (companies, roles, customers). Quantify where possible.
4. "financial_effect": Map revenue, margin, stock, and cash implications using business logic, not guesswork.
5. "industry_impact": How will competitors react? What industry trend does this accelerate?
6. "role_impact": For EACH role family (Product, Engineering, Marketing, Sales, Finance, Operations, Consulting), explain the impact and opportunity this news creates.
7. "interview_talking_points": Generate 5 intelligent OPINIONS — not summaries. Each must start with "I think..." or "What this signals is..." and include business reasoning.
8. "predictions": Every prediction must have a confidence label (High/Medium/Low) and explicit rationale.
9. "importance_score": Rate 1-10. Base on: revenue size, hiring impact, strategic significance, industry ripple, and interview frequency.
10. "interview_relevance": Assess how likely this is to come up in an interview at this company.
11. "candidate_action_plan": List 5-7 specific, immediately actionable steps a candidate should take after reading this.

Output ONLY valid JSON:
{
  "headline": "Microsoft Acquires Activision Blizzard for $68.7B",
  "company": "Microsoft",
  "industry": "Technology / Gaming",
  "category": "Acquisition",
  "date": "2023-10-13",
  "summary": "Microsoft completed its $68.7 billion acquisition of Activision Blizzard, making it the third-largest gaming company globally by revenue.",
  "sources": ["Bloomberg", "WSJ", "Microsoft Investor Relations"],
  "business_problem": "Microsoft's Xbox division was losing market share to PlayStation and needed a content moat to justify Game Pass subscriptions and drive cloud gaming adoption.",
  "business_opportunity": "Owning Call of Duty, World of Warcraft, and Candy Crush gives Microsoft a content flywheel that drives Azure cloud gaming, Game Pass subscribers, and enterprise licensing.",
  "root_cause": "Surface: Gaming market share competition. Cause: Xbox hardware declining vs PlayStation. Strategic Driver: Cloud gaming (Azure) requires premium content IP to justify subscription economics at scale.",
  "strategic_priority": "Content IP acquisition to accelerate Game Pass subscriber growth and establish Azure as the dominant cloud gaming infrastructure.",
  "business_impact": {
    "winners": ["Microsoft (content moat)", "Game Pass subscribers (more titles)", "Azure cloud gaming division", "Activision shareholders"],
    "losers": ["PlayStation/Sony (lost exclusivity leverage)", "Independent gaming studios (pricing pressure)", "Regulators who opposed (FTC lost case)"],
    "revenue_effect": "Adds ~$9B annual revenue. Game Pass ARPU expected to rise 15-20% with new IP.",
    "margin_effect": "Short-term margin dilution from integration costs. Long-term margin accretive via subscription model.",
    "operational_effect": "Integration of 10,000+ Activision employees. Studio restructuring expected over 18 months.",
    "customer_effect": "Game Pass subscribers gain immediate access to Activision catalog. Potential price increase in 12-18 months."
  },
  "financial_effect": {
    "revenue_impact": "+$9B annual revenue (3% of Microsoft total). 5-year NPV of content IP estimated at $30-40B.",
    "margin_impact": "Integration costs of ~$3B over 2 years will compress gaming division margins short-term.",
    "stock_signal": "Neutral to slightly positive. Market priced in deal completion. Long-term accretive if Game Pass growth accelerates.",
    "cash_position": "Microsoft depleted ~20% of cash reserves. Still AA-rated with strong free cash flow generation.",
    "investment_risk": "Regulatory risk globally. Studio integration risk. Key talent retention risk."
  },
  "industry_impact": {
    "competitor_reactions": [
      "Sony locked in 10-year Call of Duty agreement with Microsoft to appease regulators.",
      "EA and Take-Two likely to pursue defensive M&A to protect content portfolios.",
      "Apple and Google gaming units likely to accelerate cloud gaming investment."
    ],
    "industry_trend": "Gaming consolidation accelerating. Content IP is the new moat. Cloud gaming infrastructure (not hardware) becoming the battleground.",
    "ripple_effects": [
      "Independent game studios face acquisition pressure or partnership dependency.",
      "Subscription gaming economics will replace single-title purchase model faster.",
      "Mobile gaming (Candy Crush) gives Microsoft a data asset for AI personalization."
    ]
  },
  "customer_impact": [
    "Game Pass subscribers gain access to 30+ Activision titles within 90 days.",
    "Call of Duty confirmed multiplatform (PlayStation, PC, Xbox) for 10 years.",
    "Mobile gamers may see Candy Crush bundled into Microsoft 365 ecosystems."
  ],
  "employee_impact": {
    "hiring_signal": "Microsoft gaming division hiring aggressively in cloud gaming infrastructure, AI personalization, and game studios.",
    "layoff_risk": "Medium. Activision had 10,000 employees. Post-merger integration typically cuts 5-10% in duplicate functions.",
    "skills_in_demand": ["Cloud gaming architecture", "AI/ML personalization", "Game monetization strategy", "Platform product management"],
    "culture_change": "Activision's previously toxic culture (harassment lawsuits) now under Microsoft's HR and compliance umbrella."
  },
  "role_impact": [
    {
      "role_family": "Product Management",
      "impact": "Game Pass product team now owns one of the most complex subscription content catalogs in consumer tech.",
      "opportunity": "PM roles for cloud gaming, content personalization, and cross-platform subscriber growth are now top priorities."
    },
    {
      "role_family": "Engineering",
      "impact": "Azure cloud gaming infrastructure must scale to support Activision titles. Latency and global distribution are critical.",
      "opportunity": "Cloud gaming infrastructure, real-time streaming, and AI-driven personalization engineering roles are high-priority hires."
    },
    {
      "role_family": "Marketing",
      "impact": "Game Pass marketing must now communicate significantly expanded content value to justify subscription pricing.",
      "opportunity": "Brand and growth marketing roles for gaming and subscription acquisition are expanding."
    },
    {
      "role_family": "Finance",
      "impact": "Integration of $9B revenue stream requires rigorous accounting, M&A integration modeling, and segment reporting.",
      "opportunity": "Corporate development, M&A integration, and gaming segment FP&A roles in high demand."
    },
    {
      "role_family": "Sales",
      "impact": "Enterprise sales teams now have gaming IP as a bundling lever for Microsoft 365 and Azure enterprise deals.",
      "opportunity": "Azure and Microsoft 365 enterprise sales roles benefit from expanded content and platform bundling pitch."
    }
  ],
  "importance_score": 9,
  "freshness": "Historical",
  "interview_relevance": "Highly Likely",
  "career_relevance": [
    {
      "role_family": "Product Management",
      "relevance": "High",
      "reason": "Demonstrates platform strategy, subscription economics, and content IP moat thinking — core PM interview themes at Microsoft."
    },
    {
      "role_family": "Engineering",
      "relevance": "High",
      "reason": "Cloud gaming infrastructure and real-time streaming scale are live engineering challenges directly linked to the acquisition."
    }
  ],
  "interview_talking_points": [
    {
      "opinion": "I think Microsoft's real bet here isn't gaming — it's AI personalization. Candy Crush's 250M daily active users give Microsoft a behavioral data moat that no other AI company has in consumer entertainment.",
      "reasoning": "AI personalization at scale requires massive behavioral datasets. Gaming interaction data (session length, spending patterns, engagement) is premium training data for Microsoft's AI ambitions.",
      "confidence": "High"
    },
    {
      "opinion": "What this signals is that content IP is becoming the new infrastructure. In the same way AWS commoditized compute, Game Pass is commoditizing game distribution — and exclusive IP is the last defensible moat.",
      "reasoning": "Subscription economics only work at scale when the content is irreplaceable. Call of Duty has 100M+ annual players — that is not a feature, it is a platform.",
      "confidence": "High"
    }
  ],
  "risks": [
    {
      "risk": "Studio talent exodus post-acquisition",
      "likelihood": "Medium",
      "mitigation": "Microsoft must ring-fence key creative studios (Blizzard, Treyarch) with autonomy and retention packages."
    },
    {
      "risk": "Regulatory pressure in future M&A activity",
      "likelihood": "High",
      "mitigation": "Microsoft will face heightened antitrust scrutiny for any future gaming acquisitions globally."
    }
  ],
  "opportunities": [
    {
      "opportunity": "AI-powered personalized gaming experiences using Activision behavioral data",
      "timeframe": "12-18 months",
      "who_benefits": "Microsoft AI division, Azure, Game Pass product team"
    }
  ],
  "predictions": [
    {
      "prediction": "Game Pass will reach 100M subscribers by 2026, driven by Activision catalog addition.",
      "timeframe": "2026",
      "confidence": "Medium",
      "rationale": "Current trajectory is 35M subscribers. Activision IP adds significant pull, but price elasticity remains a risk factor."
    }
  ],
  "candidate_action_plan": [
    {
      "action": "Read Microsoft's latest earnings call transcript and look for specific mentions of Game Pass subscriber growth and Activision integration milestones.",
      "why": "Interviewers at Microsoft will expect you to know the current state of integration, not just the deal headline.",
      "priority": "High"
    },
    {
      "action": "Form a specific opinion on whether the acquisition was strategically correct — and be able to defend it with business logic.",
      "why": "Microsoft interviews (especially PM and strategy roles) explicitly test your ability to take and defend a business position.",
      "priority": "High"
    }
  ],
  "confidence": {
    "business_impact": "High",
    "financial_effect": "Medium",
    "predictions": "Medium",
    "role_impact": "High",
    "interview_talking_points": "High"
  }
}`;

export async function extractNewsFactsNode(
  state: CompanyState,
): Promise<Partial<CompanyState>> {
  const companyName = state.companyName || "";
  const roleTitle = state.role || "";
  // The news topic may come from companyName field (used as query) or jobDescription (used as raw news text)
  const newsInput = state.jobDescription || companyName;

  try {
    const userPrompt = `Run the three-layer business reasoning pipeline on this news topic.

COMPANY / TOPIC: ${companyName}
${roleTitle ? `CANDIDATE'S TARGET ROLE: ${roleTitle} (tailor role_impact and career_relevance accordingly)` : ""}

NEWS INPUT:
${newsInput || "No news content provided. Use your expert knowledge to analyze the most recent major news for this company."}

Return ONLY the structured News Knowledge Graph JSON.`;

    const response = await generateSection(NEWS_ANALYZER_SYSTEM_PROMPT, userPrompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON object found in news facts extraction response");
    }

    const newsFacts: NewsFacts = JSON.parse(jsonMatch[0]);
    return { newsFacts };
  } catch (error) {
    console.error("[extractNewsFactsNode] Failed, using fallback:", error);
    const fallback: NewsFacts = {
      headline: `Recent developments at ${companyName || "the company"}`,
      company: companyName,
      industry: "Not specified",
      category: "Other",
      date: new Date().toISOString().split("T")[0],
      summary: `Analysis of recent business developments at ${companyName || "the company"}.`,
      sources: [],
      business_problem: "Market dynamics requiring strategic response.",
      business_opportunity: "Potential for competitive differentiation.",
      root_cause: "Competitive market pressure requiring strategic action.",
      strategic_priority: "Market positioning and growth.",
      business_impact: { winners: [], losers: [], revenue_effect: "TBD", margin_effect: "TBD", operational_effect: "TBD", customer_effect: "TBD" },
      financial_effect: { revenue_impact: "TBD", margin_impact: "TBD", stock_signal: "Neutral", cash_position: "TBD", investment_risk: "Medium" },
      industry_impact: { competitor_reactions: [], industry_trend: "Evolving", ripple_effects: [] },
      customer_impact: [],
      employee_impact: { hiring_signal: "Stable", layoff_risk: "Low", skills_in_demand: [], culture_change: "Minimal" },
      role_impact: [{ role_family: "General", impact: "Monitor for operational changes.", opportunity: "Stay informed for interview discussions." }],
      importance_score: 5,
      freshness: "This Week",
      interview_relevance: "Likely",
      career_relevance: [{ role_family: "General", relevance: "Medium", reason: "Stay informed on company strategy." }],
      interview_talking_points: [{ opinion: "I think this development signals a broader strategic shift worth monitoring closely.", reasoning: "Businesses rarely make major moves without multi-year strategic intent.", confidence: "Medium" }],
      risks: [{ risk: "Execution risk during transition", likelihood: "Medium", mitigation: "Monitor quarterly earnings for progress." }],
      opportunities: [{ opportunity: "First-mover advantage in emerging segment", timeframe: "12 months", who_benefits: "Early movers in the industry" }],
      predictions: [{ prediction: "Company will announce follow-on strategic actions within 2 quarters.", timeframe: "6 months", confidence: "Medium", rationale: "Major strategic moves typically require follow-through announcements." }],
      candidate_action_plan: [{ action: "Read the latest company earnings call transcript and CEO letter.", why: "Interviewers expect up-to-date business knowledge.", priority: "High" }],
      confidence: { overall: "Low — insufficient news data provided." }
    };
    return { newsFacts: fallback };
  }
}
