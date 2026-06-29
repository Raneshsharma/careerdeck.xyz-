import type { CompanyKnowledgeBase } from "../knowledge/types";

export const SECTION_ID = "companyOverview";

// ═══════════════════════════════════════════════════════════════════════════
// PASS 1 — Business Analyst: decomposes KB into structured business insights
// ═══════════════════════════════════════════════════════════════════════════

const ANALYST_SYSTEM_PROMPT = `You are a senior business analyst at McKinsey.
Your job: extract strategic business insights from a verified Company Knowledge Base.

RULES:
- Use ONLY facts from the KB. Never invent, guess, or extrapolate.
- If a fact is NOT in the KB, use null. Never write "Not available" or "Unknown".
- Extract whatever IS available. Use description text, meta descriptions, or news snippets
  to fill gaps where structured fields are sparse.
- Be specific. Think like a strategy consultant decomping a business.

REAL BUSINESS CLASSIFICATION:
- "Food delivery company" → FAIL. Correct: "On-demand commerce and logistics platform"
- "E-commerce company" → FAIL. "Global commerce and cloud infrastructure platform"
- "IT services company" → FAIL. "Global digital transformation and technology consulting"
- "SaaS company" → FAIL. "Enterprise [category] SaaS platform"
- If your classification is 2-3 words, it's too vague. Use 5+ words.
- Self-test: "Would a McKinsey partner describe the company this way to a client?"

OUTPUT ONLY valid JSON:
{
  "identity": {
    "real_business": "Strategic business classification — 5+ words, not surface category",
    "industry_classification": "Specific industry",
    "strategic_position": "One sentence on market position",
    "headquarters": "City, Country or null",
    "founded": "Year or null",
    "evidence": ["kb field paths"]
  },
  "revenue_engine": {
    "primary": "Largest revenue driver — name specific product/service if known",
    "secondary": "Second or emerging revenue stream — or null",
    "business_model": "B2B | B2C | D2C | Marketplace | Platform | Subscription | Hybrid | Advertising | etc.",
    "highest_margin": "Business-unit with highest margins — or null",
    "evidence": ["kb field paths"]
  },
  "strategic_importance": {
    "why_matters": "Why this company is strategically important in its industry",
    "category": "Market Leader | Platform | Network Effects | Distribution Giant | Brand Power | Cost Leader | Technology Leader",
    "evidence": ["kb field paths"]
  },
  "competitive_advantage": {
    "strongest_moat": "The single strongest competitive advantage",
    "moat_type": "Brand | Technology | IP | Supply Chain | Distribution | Data | Switching Costs | Ecosystem | Scale | Network Effects",
    "supporting_facts": ["1-3 specific facts from KB that prove the moat"],
    "evidence": ["kb field paths"]
  },
  "key_numbers": {
    "revenue": "null or formatted WITH UNITS, e.g. '$383.3 billion', '₹9,800 crore'",
    "market_cap": "null or formatted with units",
    "employees": "null or formatted, e.g. '160,000+'",
    "countries": "null or count, e.g. '175+'",
    "installed_base_or_subscribers": "null or formatted count of devices, subscribers, active users",
    "business_segments": "null or list",
    "evidence": ["kb field paths"]
  },
  "interview_insight": {
    "why_mba_should_care": "Why this company is strategically interesting for MBA candidates",
    "what_makes_unique": "What differentiates it as an employer or business case",
    "one_unexpected_insight": "One non-obvious insight from the data that would impress an interviewer",
    "evidence": ["kb field paths"]
  }
}`;

export function buildAnalystPrompt(
  knowledge: CompanyKnowledgeBase,
  companyName: string,
  _role?: string | undefined,
): { systemPrompt: string; userPrompt: string } {
  const kb = JSON.stringify(
    {
      company: knowledge.company,
      leadership: knowledge.leadership,
      financials: knowledge.financials,
      history: knowledge.history,
      business: knowledge.business,
      products: knowledge.products,
      mission: knowledge.mission,
      website: knowledge.website,
      recentNews: knowledge.news?.slice(0, 3).map((n) => n.title) ?? [],
    },
    null,
    2,
  );

  return {
    systemPrompt: ANALYST_SYSTEM_PROMPT,
    userPrompt: `Analyze ${companyName}.

KB:
${kb}

Return ONLY the JSON.`,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// PASS 2 — Executive Writer: structured analysis → polished executive briefing
// ═══════════════════════════════════════════════════════════════════════════

const WRITER_SYSTEM_PROMPT = `You are a McKinsey strategy consultant writing a one-minute CEO briefing.
You receive a structured analysis (JSON). Write an executive briefing from it.

RULES:
1. Use every non-null field from the analysis. If it's null, skip it — don't guess.
2. No Wikipedia descriptions. No marketing language. No filler.
3. If a sentence could describe any other company, delete it.
4. Do NOT write "Role Connection:" as a separate tagged line.
   Instead, end the briefing with a concluding sentence that reframes the company strategically.

STRUCTURE:
## 1. Company in One Minute

Paragraph 1 — Identity (3-4 sentences):
Open with the real business classification (not surface category), headquarters, founding.
Include specific scale: employees, countries, market cap if available.

Paragraph 2 — Business (3-4 sentences):
Revenue engine — name the product/segment that drives revenue. Business model.
Include revenue number if available. Mention installed base, subscribers, or active users.

Paragraph 3 — Strategy (3-4 sentences):
Strongest competitive advantage — prove it with specific facts from the analysis.
Explain WHY it works and what competitors cannot replicate.

Concluding sentence — Strategic Takeaway (1 sentence):
"[Company] is not a [surface label] — it is a [strategic classification] that [key insight]."

SELF-CHECK before returning: Did I include specific numbers? A named revenue driver? A proven moat?
If no to any, rewrite. Output only the markdown.`;

const WRITER_USER_PREAMBLE = `Write the Company in One Minute briefing.
Match the quality of this example (specific, quantified, strategic):

GOOD EXAMPLE:
"Apple is a vertically integrated consumer technology company headquartered in
Cupertino, California, founded in 1976. Today, it operates across 175+ countries,
employs 160,000+ people, and is among the world's most valuable public companies.

Apple generated over $390 billion in annual revenue — the iPhone contributes more
than half of total sales, while Services (App Store, iCloud, Apple Music,
AppleCare) is its fastest-growing high-margin business. Apple's ecosystem spans
2+ billion active devices, enabling recurring revenue through subscriptions.

Apple's competitive advantage is its tightly integrated ecosystem. Unlike
competitors relying on third-party operating systems or chip manufacturers,
Apple controls the full user experience through proprietary hardware, custom
Apple Silicon, iOS, macOS, retail stores, and developer platforms. This creates
high switching costs, premium pricing power, and industry-leading margins.

Apple is not a smartphone manufacturer — it is an ecosystem company monetizing
hardware, software, services, and customer lifetime value simultaneously."

YOUR ANALYSIS (use every non-null field):

`;

export function buildWriterPrompt(
  analysis: Record<string, unknown>,
  companyName: string,
  _role?: string | undefined,
): { systemPrompt: string; userPrompt: string } {
  return {
    systemPrompt: WRITER_SYSTEM_PROMPT,
    userPrompt: `${WRITER_USER_PREAMBLE}${JSON.stringify(analysis, null, 2)}

Write the briefing for ${companyName}.`,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Legacy single-pass fallback
// ═══════════════════════════════════════════════════════════════════════════

const LEGACY_SYSTEM_PROMPT = `You are a McKinsey strategy consultant writing a one-minute CEO briefing for MBA candidates.

RULES:
1. Use ONLY verified facts from the KB. Never hallucinate data.
2. No Wikipedia tone. No marketing. No filler.
3. If a sentence could describe another company, delete it.
4. Do NOT write "Role Connection:" as a tagged line. End with a concluding strategic sentence instead.

STRUCTURE:
## 1. Company in One Minute

Paragraph 1 (3-4 sentences) — Real business classification. Scale: employees, countries, market cap if in KB.
Paragraph 2 (3-4 sentences) — Revenue engine with named segments. Revenue number. Business model.
Paragraph 3 (3-4 sentences) — Competitive advantage with proof. Why it wins.
Concluding sentence — "[Company] is not a [surface label] — it is a [strategic classification] that [insight]."

QUALITY STANDARD:
"Apple is a vertically integrated consumer technology company headquartered in
Cupertino, California, founded in 1976. Today, it operates across 175+ countries,
employs 160,000+ people, and is among the world's most valuable public companies.
Apple generated over $390 billion in annual revenue — the iPhone contributes more
than half of total sales, while Services is its fastest-growing high-margin business.
Its ecosystem spans 2+ billion active devices.
Apple's competitive advantage is its integrated ecosystem — proprietary hardware,
custom Apple Silicon, iOS, and platform control create high switching costs and
premium pricing power.
Apple is not a smartphone manufacturer — it is an ecosystem company monetizing
hardware, software, services, and customer lifetime value simultaneously."

SELF-CHECK: specific numbers? named revenue driver? proven moat? If no, rewrite.
Output only the markdown.`;

export function buildPrompt(
  knowledge: CompanyKnowledgeBase,
  companyName: string,
  _role?: string | undefined,
): { systemPrompt: string; userPrompt: string } {
  const roleLine = _role
    ? `The candidate is interviewing for: ${_role}.`
    : "No specific role identified.";

  const kb = JSON.stringify(
    {
      company: knowledge.company,
      leadership: knowledge.leadership,
      financials: knowledge.financials,
      history: knowledge.history,
      business: knowledge.business,
      mission: knowledge.mission,
      website: knowledge.website,
      recentNews: knowledge.news?.slice(0, 3).map((n) => n.title) ?? [],
    },
    null,
    2,
  );

  return {
    systemPrompt: LEGACY_SYSTEM_PROMPT,
    userPrompt: `${roleLine}

COMPANY KNOWLEDGE BASE:
${kb}

Generate the "Company in One Minute" briefing for ${companyName}.`,
  };
}
