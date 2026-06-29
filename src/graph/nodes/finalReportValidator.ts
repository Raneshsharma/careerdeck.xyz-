import type { CompanyState } from "../state";
import { generateSection } from "../../prompts/llm";

/**
 * Final Report Validator — runs after all 17 sections are generated + reviewed.
 * Single LLM pass that checks cross-section consistency, quantitative evidence,
 * unsupported claims, repetition, and missing Executive Insights.
 */

const VALIDATOR_SYSTEM_PROMPT = `You are a McKinsey Quality Assurance Partner performing a final review of a complete company dossier.

Your job: read ALL 13+ sections together and identify issues. Focus on 4 checks:

1. CONTRADICTIONS: Do any two sections make conflicting claims? 
   Example: Section 3 says "strong brand" but Section 8 says "no strong brand."
   Flag the exact sections and claims.

2. QUANTITATIVE DEFICITS: Does each section contain enough specific numbers or named facts?
   Minimum per section type:
   - Financial Health (Section 9): 4+ specific numbers
   - Company Overview (Section 1): 3+ numbers or named facts
   - Business Model (Section 3): 3+ named revenue streams, segments, or numbers
   - Competitor Analysis (Section 7): 4+ competitor names, metrics, or comparisons
   - Industry (Section 6): 2+ market trends, growth drivers, or metrics
   - Products (Section 4): 3+ named products, segments, or brands
   - All other sections: 2+ specific facts or numbers
   Sections below minimum must be flagged.

3. UNSUPPORTED CLAIMS: Any factual claim without KB backing?
   "Swiggy has 50% market share" — flag if no KB evidence.
   "The company is the market leader" — flag if unsupported.

4. REPETITION: Do sections repeat the same facts verbatim?
   Example: Section 3 and Section 4 both explain same revenue model.

OUTPUT ONLY valid JSON:
{
  "overall_quality": 8.5,
  "sections_ok": ["companyOverview", "businessModel", "financials"],
  "issues": [
    {
      "section": "sectionId",
      "severity": "critical | moderate | minor",
      "category": "contradiction | quantitative_deficit | unsupported_claim | repetition",
      "detail": "Specific description of the issue",
      "suggested_fix": "What should change"
    }
  ],
  "summary": "One-paragraph quality assessment"
}`;

export async function finalReportValidatorNode(
  state: CompanyState,
): Promise<Partial<CompanyState>> {
  // Idempotency guard: skip if already validated
  if (state.reportQuality > 0) {
    return {};
  }

  let sections = { ...(state.reviewedSections || {}) };
  const sectionIds = Object.keys(sections).filter((id) => sections[id]?.trim());

  if (sectionIds.length < 13) {
    return { errors: [`Final validation skipped: only ${sectionIds.length}/13 sections ready`] };
  }

  // Guarantee **Executive Insight:** on every section — append if missing
  const sectionNames: Record<string, string> = {
    companyOverview: "Company in One Minute", whyExists: "Why It Exists",
    businessModel: "Business Model", products: "Products & Services",
    journey: "Company Journey", industry: "Industry Overview",
    competitors: "Competitor Analysis", moat: "Competitive Advantage",
    financials: "Financial Health", strategy: "Strategic Priorities",
    culture: "Culture & Work Style", employeeInsights: "Employee Insights",
    interviewQuestions: "Interview Questions",
  };
  for (const id of sectionIds) {
    const content = sections[id] ?? "";
    if (!/\*\*Executive Insight:\*\*/.test(content)) {
      const name = sectionNames[id] ?? id;
      sections[id] = content.trimEnd() + `\n\n**Executive Insight:** ${name} data is limited from verified sources for this company. Candidates should research company materials and third-party sources for deeper insight during interview preparation.`;
    }
  }

  const allSections = sectionIds
    .map((id) => `--- ${id} ---\n${sections[id]}`)
    .join("\n\n");

  const companyName = state.normalizedCompanyName || state.companyName;
  const ci = state.competitorIntelligence;

  try {
    const ciContext = ci?.competitors?.length
      ? `\nCOMPETITOR INTELLIGENCE (verified research on named competitors):\n${ci.competitors.map((c) => `- ${c.name}: ${c.description.slice(0, 200)}`).join("\n")}\n`
      : "";

    const userPrompt = `Review this complete dossier for ${companyName}. Check contradictions, quantitative deficits, unsupported claims, repetition, and missing Executive Insights.${ciContext}

ALL SECTIONS:
${allSections}

Return ONLY the JSON specified.`;

    const rawResponse = await generateSection(VALIDATOR_SYSTEM_PROMPT, userPrompt);

    let validatorResult: {
      overall_quality: number;
      sections_ok: string[];
      issues: Array<{
        section: string;
        severity: string;
        category: string;
        detail: string;
        suggested_fix: string;
      }>;
      summary: string;
    };

    try {
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        validatorResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
    } catch {
      return { errors: ["Report validator: could not parse response"] };
    }

    const criticalIssues = validatorResult.issues?.filter(
      (i) => i.severity === "critical",
    ) ?? [];

    return {
      reviewedSections: sections,
      reportQuality: validatorResult.overall_quality ?? 8,
      reportIssues: validatorResult.issues ?? [],
      errors:
        criticalIssues.length > 0
          ? [`Final validation found ${criticalIssues.length} critical issues across sections.`]
          : [],
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { errors: [`Report validation failed: ${msg}`] };
  }
}
