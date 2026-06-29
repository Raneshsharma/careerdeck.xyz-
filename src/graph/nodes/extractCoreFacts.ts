import type { CompanyState, AssembledResearch } from "../state";
import { generateSection } from "../../prompts/llm";
import type { CoreFacts } from "../../knowledge/coreFactsExtractor";

const EXTRACTION_SYSTEM_PROMPT = `You are a McKinsey Strategy Analyst. Your task is to compile a Canonical Knowledge Graph of Core Facts for a company from the provided raw multi-source research text.

CRITICAL INSTRUCTIONS:
1. Extract ALL concrete metrics (Revenue, Market Cap, Employees, Founded Year, CEO name, founders, headquarters description). If they are in the text, extract them. Never invent them. If they are absent or unavailable, return null.
2. For Revenue and Market Cap, return the raw numeric value (e.g. 150000000 for $150M), the currency code (e.g. "USD", "INR"), and the year if mentioned.
3. Extract all named products, brands, and business segments.
4. Assess the competitive advantages (Moat) using this scale:
   - Strong (score 7-10): Consistently verified across high-quality sources, clear structural barrier.
   - Moderate (score 4-6): Supported by some evidence, but replicable or limited.
   - Weak (score 1-3): Clear evidence of structural weakness or commodity status.
   - Unknown (score null): NO evidence exists in the text. Return null for the score. Do NOT return 0.
5. Distinguish between 'Weak' (evidence shows high churn, low pricing power, high competition) and 'Unknown' (absence of evidence in the text).
   - If a dimension is Unknown, the assessment MUST state 'Unknown - insufficient evidence in the source material.'

Output ONLY valid JSON matching this exact structure:
{
  "companyName": "Company Name",
  "industry": "...",
  "sector": "...",
  "founded": "YYYY or null",
  "founders": ["Founder 1", ...],
  "description": "Short strategic description...",
  "ceo": "CEO Name or null",
  "revenue": { "value": 123450000, "currency": "USD", "year": "2024" },
  "marketCap": { "value": 5432100000, "currency": "USD" },
  "employees": 12000,
  "operatingCountries": 5,
  "primaryRevenueDriver": "...",
  "businessModel": ["segment1", ...],
  "businessSegments": ["segment1", ...],
  "namedProducts": ["product1", ...],
  "namedBrands": ["brand1", ...],
  "brandStrength": { "score": 8, "assessment": "Detailed McKinsey-style assessment..." },
  "scaleAdvantage": { "score": 6, "assessment": "..." },
  "switchingCosts": { "score": null, "assessment": "Unknown — insufficient evidence in the source material." },
  "networkEffects": { "score": null, "assessment": "Unknown — insufficient evidence in the source material." },
  "moatSummary": "One-sentence competitive strategy summary",
  "recentMilestones": ["milestone1", ...],
  "evidenceSources": ["wikipedia", "yahoo", ...]
}`;

function compileRawResearchText(research: AssembledResearch | undefined): string {
  if (!research) return "";
  const parts: string[] = [];

  if (research.wikipedia?.extract) {
    parts.push(`--- Wikipedia ---\n${research.wikipedia.extract}`);
  }
  if (research.yahooFinance) {
    parts.push(`--- Yahoo Finance ---\n${JSON.stringify(research.yahooFinance, null, 2)}`);
  }
  if (research.google?.items) {
    parts.push(`--- Google Search Snippets ---\n${research.google.items.map(i => `${i.title}: ${i.snippet}`).join("\n")}`);
  }
  if (research.duckduckgo?.abstractText) {
    parts.push(`--- DuckDuckGo ---\n${research.duckduckgo.abstractText}`);
  }
  if (research.website?.pages) {
    const pageTexts = Object.entries(research.website.pages)
      .map(([name, page]) => `Page: ${name}\n${page.textContent?.slice(0, 1500) ?? ""}`);
    parts.push(`--- Website Pages ---\n${pageTexts.join("\n\n")}`);
  }
  if (research.gnews?.articles) {
    parts.push(`--- News Articles ---\n${research.gnews.articles.map(a => `${a.title}: ${a.description}`).join("\n")}`);
  }

  return parts.join("\n\n");
}

export async function extractCoreFactsNode(
  state: CompanyState,
): Promise<Partial<CompanyState>> {
  const rawResearch = state.knowledge?.rawResearch;
  if (!rawResearch) {
    return { errors: ["No raw research available for core facts extraction"] };
  }

  try {
    const compiledText = compileRawResearchText(rawResearch);
    const companyName = state.normalizedCompanyName || state.companyName;

    const userPrompt = `Extract core facts for the company "${companyName}" from the compiled research text.\n\nRESEARCH:\n${compiledText}\n\nReturn ONLY the JSON.`;
    const response = await generateSection(EXTRACTION_SYSTEM_PROMPT, userPrompt);

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON object found in core facts extraction response");
    }

    const coreFacts: CoreFacts = JSON.parse(jsonMatch[0]);
    coreFacts.extractedAt = new Date().toISOString();

    return { coreFacts };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { errors: [`Core facts LLM extraction failed: ${msg}`] };
  }
}
