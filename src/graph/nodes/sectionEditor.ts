import type { CompanyState } from "../state";
import { generateSection } from "../../prompts/llm";
import { buildEditorPrompt, type EditorResult } from "../../prompts/editor";
import { validateSection } from "../../prompts/validator";
import type { CompanyKnowledgeBase } from "../../knowledge/types";
import type { CoreFacts } from "../../knowledge/coreFactsExtractor";

function buildCrossSectionContext(
  state: CompanyState,
  currentSectionId: string,
): string {
  const sections = state.generatedSections || {};
  const summaries: string[] = [];

  const sectionNames: Record<string, string> = {
    companyOverview: "Company in One Minute",
    whyExists: "Why It Exists",
    businessModel: "Business Model",
    products: "Products & Services",
    journey: "Company Journey",
    industry: "Industry Overview",
    competitors: "Competitor Analysis",
    moat: "Competitive Advantage (Moat)",
    financials: "Financial Health",
    strategy: "Strategic Priorities",
    culture: "Culture & Work Style",
    employeeInsights: "Employee Insights",
    interviewQuestions: "Interview Questions",
  };

  for (const [id, content] of Object.entries(sections)) {
    if (id === currentSectionId || !content?.trim()) continue;
    const name = sectionNames[id] || id;
    const firstParagraph = content.split("\n\n")[0]?.slice(0, 300) || "";
    const facts = extractKeyClaims(firstParagraph);
    if (facts) {
      summaries.push(`${name}: ${facts}`);
    }
  }

  return summaries.length > 0
    ? summaries.join("\n")
    : "No other sections available for cross-reference.";
}

function extractKeyClaims(text: string): string {
  const claims: string[] = [];
  const patterns: Array<[RegExp, string]> = [
    [/(\b(?:is|are|was|were|has|have)\s+(?:a|an|the)\s+[\w\s]+(?:company|platform|leader|ecosystem|service|business))/gi, "identity"],
    [/(\b(?:revenue|market cap|employees|founded|headquartered|customers|users|countries)\b[^.,;!]+)/gi, "metrics"],
    [/(\b(?:CEO|founder|led by|leader|executive)\b[^.,;!]+)/gi, "leadership"],
    [/(\b(?:brand|moat|competitive advantage|ecosystem|network effects|switching costs)\b[^.,;!]+)/gi, "competitive"],
  ];

  for (const [pattern] of patterns) {
    const matches = text.match(pattern);
    if (matches) {
      for (const m of matches.slice(0, 2)) {
        const cleaned = m.trim().replace(/\s+/g, " ");
        if (cleaned.length > 10 && cleaned.length < 200) {
          claims.push(cleaned);
        }
      }
    }
  }

  return claims.join("; ");
}

function extractAvailableNumbers(knowledge: CompanyKnowledgeBase): string[] {
  const numbers: string[] = [];
  const f = knowledge.financials;

  if (f?.revenue?.value != null) numbers.push(`Revenue: ${f.revenue.value} ${f.revenueCurrency?.value ?? ""}`);
  if (f?.marketCap?.value != null) numbers.push(`Market Cap: ${f.marketCap.value} ${f.marketCapCurrency?.value ?? ""}`);
  if (f?.employees?.value != null) numbers.push(`Employees: ${f.employees.value}`);
  if (f?.profitMargin?.value != null) numbers.push(`Profit Margin: ${(f.profitMargin.value * 100).toFixed(1)}%`);
  if (f?.operatingMargin?.value != null) numbers.push(`Operating Margin: ${(f.operatingMargin.value * 100).toFixed(1)}%`);
  if (f?.grossMargin?.value != null) numbers.push(`Gross Margin: ${(f.grossMargin.value * 100).toFixed(1)}%`);
  if (f?.beta?.value != null) numbers.push(`Beta: ${f.beta.value}`);
  if (f?.trailingPE?.value != null) numbers.push(`P/E Ratio: ${f.trailingPE.value}`);
  if (f?.currentPrice?.value != null) numbers.push(`Current Price: ${f.currentPrice.value} ${f.currency?.value ?? ""}`);
  if (f?.fiftyTwoWeekHigh?.value != null && f?.fiftyTwoWeekLow?.value != null) {
    numbers.push(`52-Week Range: ${f.fiftyTwoWeekLow.value} - ${f.fiftyTwoWeekHigh.value}`);
  }

  const h = knowledge.history;
  if (h?.founded?.value != null) numbers.push(`Founded: ${h.founded.value}`);
  const founders = knowledge.leadership?.founders?.value;
  if (Array.isArray(founders) && founders.length > 0) numbers.push(`Founders: ${founders.join(", ")}`);

  const p = knowledge.products;
  if (Array.isArray(p?.items?.value) && p.items.value.length > 0) numbers.push(`Products: ${p.items.value.join(", ")}`);
  if (Array.isArray(p?.brands?.value) && p.brands.value.length > 0) numbers.push(`Brands: ${p.brands.value.join(", ")}`);
  const segs = knowledge.business?.businessSegments?.value;
  if (Array.isArray(segs) && segs.length > 0) numbers.push(`Business Segments: ${segs.join(", ")}`);

  const news = knowledge.news?.slice(0, 5)?.map((n: { title: string; publishedDate?: string | null }) =>
    `${n.title}${n.publishedDate ? ` (${n.publishedDate})` : ""}`
  ) ?? [];
  if (news.length > 0) numbers.push(`Recent News: ${news.join(" | ")}`);

  return numbers;
}

export function createSectionEditor(sectionId: string, sectionName: string) {
  return async (state: CompanyState): Promise<Partial<CompanyState>> => {
    const knowledge = state.knowledge.knowledgeBase;
    const original = state.generatedSections[sectionId];

    if (!knowledge) {
      return {
        reviewedSections: { [sectionId]: original || "" },
        errors: [`${sectionId}: No knowledge base for review`],
      };
    }

    if (!original || original.trim().length === 0) {
      return { reviewedSections: { [sectionId]: "" } };
    }

    const companyName = state.normalizedCompanyName || state.companyName;
    const crossContext = buildCrossSectionContext(state, sectionId);
    const cf: CoreFacts | null = state.coreFacts ?? null;
    const coreFactsStr = cf
      ? JSON.stringify({
          companyName: cf.companyName, industry: cf.industry, sector: cf.sector,
          ceo: cf.ceo, revenue: cf.revenue, marketCap: cf.marketCap,
          employees: cf.employees, businessModel: cf.businessModel,
          namedProducts: cf.namedProducts, brandStrength: cf.brandStrength,
          scaleAdvantage: cf.scaleAdvantage, switchingCosts: cf.switchingCosts,
          networkEffects: cf.networkEffects, moatSummary: cf.moatSummary,
        }, null, 2)
      : undefined;

    const availableNumbers = extractAvailableNumbers(knowledge);

    const sectionNumberMinimums: Record<string, number> = {
      financials: 4, companyOverview: 3, businessModel: 3,
      competitors: 4, industry: 2, products: 3,
      journey: 2, strategy: 2, moat: 2, whyExists: 2,
      culture: 1, employeeInsights: 1, interviewQuestions: 0,
    };
    const minNumbers = sectionNumberMinimums[sectionId] ?? 2;

    const numbersStr = availableNumbers.length > 0
      ? `\nAVAILABLE QUANTITATIVE EVIDENCE (you MUST incorporate at least ${minNumbers} into this section — minimum ${minNumbers} specific numbers/named facts required for '${sectionName}'):\n${availableNumbers.join("\n")}`
      : `\nNO quantitative evidence available in KB — if no numbers exist, state that clearly once and move on. Minimum ${minNumbers} named facts required.`;

    try {
      const { systemPrompt, userPrompt } = buildEditorPrompt(
        knowledge, sectionName, original, companyName,
        crossContext, coreFactsStr,
      );

      const enhancedUserPrompt = userPrompt + numbersStr;
      const rawResponse = await generateSection(systemPrompt, enhancedUserPrompt);

      let editorResult: EditorResult;

      try {
        const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          editorResult = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No JSON found in editor response");
        }
      } catch {
        editorResult = {
          revised_section: original,
          score: { accuracy: 5, completeness: 5, clarity: 5, business_insight: 5, interview_relevance: 5, quantitative_quality: 5, overall: 5 },
          changes_made: ["Editor parse failed — returning original"],
          issues_found: ["Editor response was not valid JSON"],
          contradictions_removed: [],
        };
      }

      const revised = editorResult.revised_section || original;

      const validation = validateSection(revised, sectionName);
      const finalSection = validation.valid ? revised : original;

      return {
        reviewedSections: { [sectionId]: finalSection },
        sectionScores: { [sectionId]: editorResult.score },
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return {
        reviewedSections: { [sectionId]: original },
        sectionScores: { [sectionId]: { accuracy: 0, completeness: 0, clarity: 0, business_insight: 0, interview_relevance: 0, overall: 0 } },
        errors: [`${sectionId} review failed: ${msg}`],
      };
    }
  };
}
