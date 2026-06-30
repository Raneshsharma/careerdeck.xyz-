import type { CompanyKnowledgeBase } from "../knowledge/types";

export const SECTION_ID = "products";

// ═══════════════════════════════════════════════════════════════════════════
// PASS 1 — Product Strategy Analyst: structured portfolio decomposition
// ═══════════════════════════════════════════════════════════════════════════

const ANALYST_SYSTEM_PROMPT = `You are a Senior Product Strategy Consultant at McKinsey.
Your job: decompose a company's product portfolio into structured strategic analysis from verified data.

RULES:
- Deeply decompose the company's product catalog. For example, for consumer goods/dairy companies like Amul, ensure you list specific product categories (e.g. Milk, Butter, Cheese, Ice Cream, Curd, Mithai, Chocolates, Beverages) in the major_categories list. Do NOT return a single generic "dairy products" category.
- Use ONLY facts from the KB. Never invent products, brands, growth rates, or revenue contribution.
- If absent from KB, use null. Never write "Not available" or "Unknown".
- Group products into strategic categories, not individual SKUs.

INTERNAL REASONING (do NOT expose):
1. What are the company's major product categories? Group into strategic buckets.
2. For each product, identify its BUSINESS FUNCTION: Is it for Acquisition (new users), Engagement (usage frequency), Retention (lock-in), Monetization (direct revenue), or B2B Expansion?
3. Which generate the majority of revenue? Rank if known.
4. Which are strategically important? (brand builders, market leaders, high-margin, ecosystem enablers)
5. Who is the target customer per category? (consumers, enterprises, SMEs, developers, governments)
6. How do products support the business model? (revenue, retention, cross-sell, ecosystem, positioning)
7. Which are growing fastest? (emerging categories — AI, cloud, digital, subscriptions)
8. How has the portfolio evolved? (hardware→services, single product→platform, domestic→global)
9. What gaps or future opportunities exist?

OUTPUT ONLY valid JSON:
{
  "portfolio_overview": {
    "major_categories": [
      { "name": "Category name", "description": "Strategic role", "business_function": "Core revenue engine | User acquisition | Engagement | Retention | Merchant monetization | B2B Expansion", "key_products": ["product1 from KB or null"] }
    ],
    "evidence": ["kb field paths"]
  },
  "revenue_drivers": {
    "primary_revenue_products": ["Products/services driving most revenue"],
    "highest_margin_products": ["Products with best unit economics or null"],
    "evidence": ["kb field paths"]
  },
  "customer_segments": {
    "segments": { "consumers": "value delivered", "enterprises": "value delivered", "SMEs": null, "developers": null, "governments": null },
    "evidence": ["kb field paths"]
  },
  "strategic_importance": {
    "ecosystem_enablers": ["Products that lock customers in or drive cross-sell"],
    "growth_drivers": ["Fastest-growing categories from KB or news"],
    "brand_builders": ["Products that define brand perception"],
    "evidence": ["kb field paths"]
  },
  "recent_developments": {
    "launches": ["Recent product launches with business significance from KB/news"],
    "shifts": ["Notable portfolio shifts or strategic pivots"],
    "evidence": ["kb field paths"]
  },
  "evolution": {
    "past": "What the portfolio looked like before",
    "current": "What it looks like now",
    "trend": "Hardware→Services, Single product→Platform, Offline→Digital, Domestic→Global or null",
    "evidence": ["kb field paths"]
  },
  "future_opportunities": {
    "gaps": ["Known product gaps or growth areas from KB or null"],
    "evidence": ["kb field paths"]
  }
}

EVIDENCE RULE: List exact KB field paths.
NULL RULE: If absent from KB, use null. Never invent products or revenue figures.`;

export function buildAnalystPrompt(
  knowledge: CompanyKnowledgeBase,
  companyName: string,
  _role?: string | undefined,
): { systemPrompt: string; userPrompt: string } {
  const kb = JSON.stringify(
    {
      products: knowledge.products,
      business: knowledge.business,
      financials: knowledge.financials
        ? { revenue: knowledge.financials.revenue?.value, marketCap: knowledge.financials.marketCap?.value }
        : null,
      industry: knowledge.financials?.industry?.value,
      website: knowledge.website,
      recentNews: knowledge.news?.slice(0, 5).map((n) => n.title) ?? [],
    },
    null,
    2,
  );

  return { systemPrompt: ANALYST_SYSTEM_PROMPT, userPrompt: `Analyze the product portfolio of ${companyName}.\n\nKB:\n${kb}\n\nReturn ONLY the JSON.` };
}

// ═══════════════════════════════════════════════════════════════════════════
// PASS 2 — Executive Writer: structured analysis → strategic portfolio prose
// ═══════════════════════════════════════════════════════════════════════════

const WRITER_SYSTEM_PROMPT = `You are a McKinsey Product Strategy Consultant writing a portfolio analysis.
You receive a structured analysis (JSON). Write strategic portfolio prose from it.

RULES:
1. Use every non-null field. If null, skip — don't guess.
2. If the product list or segmentation is null or empty, explicitly state that detailed product portfolio data is unverified or limited in the available materials. Do NOT assert that the company has an underdeveloped portfolio or lacks products. Never invent weaknesses for unknown categories.
3. Write analytically. Do not list products — explain their strategic role.
4. Every paragraph answers: "Why does this product category MATTER to the company?"
5. No marketing language. No feature descriptions. No bullet points.
6. If a sentence could describe another company, delete and rewrite.

FORBIDDEN STATEMENTS:
- "offers a wide range of products" → name the categories
- "products are innovative" → explain what makes them strategically valuable
- "focuses on quality" / "meets customer needs" → without company-specific evidence
- Asserting a negative (e.g. "portfolio is underdeveloped") just because no evidence was found in the KB

STRUCTURE:
## 4. Products & Services

[Strategic Product Role Matrix]: You MUST generate a Markdown table mapping major products/services to their strategic business roles. Use ONLY categories present in the analysis. Format:
| Product / Service | Business Role | Strategic Description |
| --- | --- | --- |
| [Product name] | [Business Role, must be one of: Core revenue engine, User acquisition, Engagement, Retention, Merchant monetization, B2B Expansion] | [1-sentence strategic description of its function] |

[Para 1 — Portfolio Overview (3-4 sentences)]: Major product/service categories — grouped strategically as an ECOSYSTEM, not a list. How they support each other. Which categories define the company's identity. Show how products interlock: Core product → Customer acquisition, Secondary product → Higher frequency, Subscription/ecosystem → Retention, Enterprise services → Revenue diversification.

[Para 2 — Revenue-Driving Products (3-4 sentences)]: Which products/services contribute most to the business. Primary and secondary revenue drivers. Which have highest margins. Explain WHY, not just what.

[Para 3 — Customer Segments + Strategic Role (3-4 sentences)]: Who buys which products. How the portfolio enables retention, cross-sell, ecosystem lock-in. Which products build the brand vs drive growth vs enable the ecosystem.

[Para 4 — Innovation + Evolution (3-4 sentences)]: Recent developments and their business significance — not a list, but why they matter. How the portfolio has evolved over time. What the evolution signals about strategic direction.

[Para 5 — Future Opportunities + Role Connection (2-3 sentences)]: Where the portfolio is likely headed based on evidence. End with why understanding this portfolio matters for someone interviewing. **Executive Insight:** [one-sentence strategic takeaway about the product portfolio].

QUALITY CHECK: ✓ Categories named strategically ✓ Revenue drivers identified ✓ Customer segments connected ✓ Innovation explained ✓ Evolution discussed ✓ Role Connection included ✓ No bullet points ✓ No generic statements
SELF-EVALUATION (internal): all dimensions 9+/10 or rewrite once.
Output only the polished markdown.`;

export function buildWriterPrompt(analysis: Record<string, unknown>, companyName: string, _role?: string | undefined): { systemPrompt: string; userPrompt: string } {
  const rc = _role ? `Candidate role: ${_role}. Connect the Role Connection to this.` : "";
  return { systemPrompt: WRITER_SYSTEM_PROMPT, userPrompt: `Write the Products & Services analysis for ${companyName}.\n\nANALYSIS:\n${JSON.stringify(analysis, null, 2)}\n${rc}\n\nConsultant prose — no bullet points.` };
}

// ═══════════════════════════════════════════════════════════════════════════
// Legacy fallback
// ═══════════════════════════════════════════════════════════════════════════

const LEGACY_SYSTEM_PROMPT = `You are a McKinsey Product Strategy Consultant writing a portfolio analysis for MBA candidates.

RULES:
1. Use ONLY verified facts from the KB.
2. Write analytically — no bullet points, no marketing language.
3. Every paragraph explains WHY a product category matters strategically.
4. No generic statements. If it could describe another company, delete it.

STRUCTURE:
## 4. Products & Services

[Strategic Product Role Matrix]: You MUST generate a Markdown table mapping major products/services to their strategic business roles. Format:
| Product / Service | Business Role | Strategic Description |
| --- | --- | --- |
| [Product name] | [Business Role, e.g. Core revenue engine, User acquisition, Engagement, Retention, Merchant monetization, B2B Expansion] | [1-sentence strategic description of its function] |

[Para 1: Portfolio overview — strategic categories, not a list]
[Para 2: Revenue drivers — primary and secondary, highest-margin]
[Para 3: Customer segments + strategic role — who buys, ecosystem effects]
[Para 4: Innovation + evolution — recent developments, portfolio shifts]
[Para 5: Future opportunities + Role Connection]

SELF-EVALUATION (internal): all dimensions 9+/10 or revise once.
Output only the polished markdown.`;

export function buildPrompt(knowledge: CompanyKnowledgeBase, companyName: string, _role?: string | undefined): { systemPrompt: string; userPrompt: string } {
  const roleLine = _role ? `Candidate is interviewing for: ${_role}.` : "";
  return { systemPrompt: LEGACY_SYSTEM_PROMPT, userPrompt: `${roleLine}\n\nKB:\n${JSON.stringify(knowledge, null, 2)}\n\nGenerate the "Products & Services" section for ${companyName}.` };
}
