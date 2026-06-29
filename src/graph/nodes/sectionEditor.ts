import type { CompanyState } from "../state";
import type { CoreFacts } from "../../knowledge/coreFactsExtractor";
import { generateSection } from "../../prompts/llm";
import { buildEditorPrompt, type EditorResult } from "../../prompts/editor";
import { validateSection } from "../../prompts/validator";

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
      return {
        reviewedSections: { [sectionId]: "" },
      };
    }

    const companyName = state.normalizedCompanyName || state.companyName;
    const crossContext = buildCrossSectionContext(state, sectionId);
    const coreFacts: CoreFacts | null = state.coreFacts ?? null;
    const coreFactsStr = coreFacts
      ? JSON.stringify({
          companyName: coreFacts.companyName,
          industry: coreFacts.industry,
          sector: coreFacts.sector,
          ceo: coreFacts.ceo,
          revenue: coreFacts.revenue,
          marketCap: coreFacts.marketCap,
          employees: coreFacts.employees,
          businessModel: coreFacts.businessModel,
          namedProducts: coreFacts.namedProducts,
          brandStrength: coreFacts.brandStrength,
          scaleAdvantage: coreFacts.scaleAdvantage,
          switchingCosts: coreFacts.switchingCosts,
          networkEffects: coreFacts.networkEffects,
          moatSummary: coreFacts.moatSummary,
        }, null, 2)
      : undefined;

    try {
      const { systemPrompt, userPrompt } = buildEditorPrompt(
        knowledge,
        sectionName,
        original,
        companyName,
        crossContext,
        coreFactsStr,
      );
      const rawResponse = await generateSection(systemPrompt, userPrompt);

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
