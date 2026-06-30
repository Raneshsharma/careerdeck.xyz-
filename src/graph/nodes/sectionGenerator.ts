import type { CompanyState } from "../state";
import type { CompanyKnowledgeBase } from "../../knowledge/types";
import { generateSection } from "../../prompts/llm";
import { CacheManager } from "../../cache/cacheManager";
import { CacheLevel } from "../../cache/types";
import { getSectionDependency } from "../../cache/dependencyMap";

function getScopedCoreFacts(sectionId: string, cf: any): Record<string, any> {
  if (!cf) return {};

  const isFinancialOrMoat = ["financials", "strategy", "competitors", "moat"].includes(sectionId);
  const isPeopleOrCulture = ["culture", "employeeInsights", "interviewQuestions", "interviewPlaybook"].includes(sectionId);

  if (isFinancialOrMoat) {
    return {
      brandStrength: cf.brandStrength,
      scaleAdvantage: cf.scaleAdvantage,
      switchingCosts: cf.switchingCosts,
      networkEffects: cf.networkEffects,
      moatSummary: cf.moatSummary,
      revenue: cf.revenue,
      revenueGrowth: cf.revenueGrowth ?? null,
      netIncome: cf.netIncome ?? null,
      ebitda: cf.ebitda ?? null,
      freeCashFlow: cf.freeCashFlow ?? null,
      marketCap: cf.marketCap,
      employees: cf.employees,
      asOfTimestamp: cf.asOfTimestamp ?? null,
      businessModel: cf.businessModel,
      namedProducts: cf.namedProducts,
      namedBrands: cf.namedBrands,
      careersValues: cf.careersValues,
      leadershipPrinciples: cf.leadershipPrinciples,
      interviewExperiences: cf.interviewExperiences,
      workStyleTrends: cf.workStyleTrends,
    };
  }

  if (isPeopleOrCulture) {
    return {
      companyName: cf.companyName,
      employees: cf.employees,
      asOfTimestamp: cf.asOfTimestamp ?? null,
      careersValues: cf.careersValues,
      leadershipPrinciples: cf.leadershipPrinciples,
      interviewExperiences: cf.interviewExperiences,
      workStyleTrends: cf.workStyleTrends,
      employeeInsights: cf.employeeInsights,
    };
  }

  return {
    companyName: cf.companyName,
    moatSummary: cf.moatSummary,
    revenue: cf.revenue,
    revenueGrowth: cf.revenueGrowth ?? null,
    marketCap: cf.marketCap,
    employees: cf.employees,
    asOfTimestamp: cf.asOfTimestamp ?? null,
    businessModel: cf.businessModel,
    namedProducts: cf.namedProducts,
    namedBrands: cf.namedBrands,
  };
}

interface SectionPrompt {
  SECTION_ID: string;
  buildPrompt: (
    knowledge: CompanyKnowledgeBase,
    companyName: string,
    role?: string | undefined,
  ) => { systemPrompt: string; userPrompt: string };
  buildAnalystPrompt?: (
    knowledge: CompanyKnowledgeBase,
    companyName: string,
    role?: string | undefined,
  ) => { systemPrompt: string; userPrompt: string };
  buildWriterPrompt?: (
    analysis: Record<string, unknown>,
    companyName: string,
    role?: string | undefined,
  ) => { systemPrompt: string; userPrompt: string };
}

function parseStructuredAnalysis(rawResponse: string): Record<string, unknown> {
  try {
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch { /* fall through */ }
  return { raw_analysis: rawResponse };
}

export function createSectionGenerator(prompt: SectionPrompt) {
  return async (state: CompanyState): Promise<Partial<CompanyState>> => {
    const knowledge = state.knowledge.knowledgeBase;
    if (!knowledge) {
      return {
        generatedSections: { [prompt.SECTION_ID]: "" },
        errors: [`${prompt.SECTION_ID}: No knowledge base available`],
      };
    }

    const companyName = state.normalizedCompanyName || state.companyName;
    const role = state.role;

    const dep = getSectionDependency(prompt.SECTION_ID);
    const domainVersions = state.domainVersions;
    let versionTag = "";

    if (dep && domainVersions) {
      versionTag = dep.dependsOn
        .map((d) => `${d}:${(domainVersions as unknown as Record<string, string>)[d] ?? "0"}`)
        .join(";");
    }

    if (versionTag) {
      const cached = await CacheManager.get<string>(
        companyName,
        CacheLevel.SECTION,
        `${prompt.SECTION_ID}:v=${versionTag}`,
      );
      if (cached) {
        return { generatedSections: { [prompt.SECTION_ID]: cached } };
      }
    }

    // Enrich prompts with CoreFacts (authoritative knowledge graph)
    const coreFactsSuffix = state.coreFacts
      ? `\n\nCORE FACTS (authoritative knowledge graph — sections MUST NOT contradict these):\n${JSON.stringify(
          getScopedCoreFacts(prompt.SECTION_ID, state.coreFacts),
          null,
          2
        )}`
      : "";

    const confidenceSuffix = `\n\nCONFIDENCE-AWARE WRITING RULES:
1. Classify information internally into three confidence tiers:
   - VERIFIED: Directly supported by concrete numbers/dates (e.g. "Revenue of $2.3B in FY2024"). Present these as definitive facts.
   - EVIDENCE-BACKED INFERENCE: Strategic conclusions derived from patterns (e.g. Swiggy has faster delivery times, suggesting..."). Use qualifying verbs ("indicates", "suggests", "implies", "appears to").
   - HYPOTHESIS: Extrapolations from limited news snippets or proxy metrics. Use speculative qualifiers ("likely", "could be", "potentially").
2. HISTORICAL VS CURRENT FOOTPRINT: For any international operations or scale descriptors, distinguish between past peaks (historical expansion) and current operational reality. Use terms like "historically operated in..." vs "currently operates in..." and ground with the asOfTimestamp if available.
3. Keep the report trustworthy by never stating a hypothesis or inference as a verified fact.`;

    try {
      let content: string;

      if (prompt.buildAnalystPrompt && prompt.buildWriterPrompt) {
        try {
          // ── Two-pass: Business Analyst → Executive Writer ──
          const { systemPrompt: analystSys, userPrompt: analystUser } =
            prompt.buildAnalystPrompt(knowledge, companyName, role);
          const analystRaw = await generateSection(analystSys, analystUser + coreFactsSuffix + confidenceSuffix);
          const analysis = parseStructuredAnalysis(analystRaw);

          const { systemPrompt: writerSys, userPrompt: writerUser } =
            prompt.buildWriterPrompt(analysis, companyName, role);
          content = await generateSection(writerSys, writerUser + coreFactsSuffix + confidenceSuffix);
        } catch (twoPassError) {
          console.error(`${prompt.SECTION_ID}: two-pass failed, falling back to single-pass:`, twoPassError);
          // Fallback to legacy single-pass
          const { systemPrompt, userPrompt } = prompt.buildPrompt(knowledge, companyName, role);
          content = await generateSection(systemPrompt, userPrompt + coreFactsSuffix + confidenceSuffix);
        }
      } else {
        // ── Legacy single-pass ──
        const { systemPrompt, userPrompt } = prompt.buildPrompt(knowledge, companyName, role);
        content = await generateSection(systemPrompt, userPrompt + coreFactsSuffix + confidenceSuffix);
      }

      if (versionTag && content) {
        await CacheManager.set(
          companyName,
          CacheLevel.SECTION,
          `${prompt.SECTION_ID}:v=${versionTag}`,
          content,
        );
      }

      return { generatedSections: { [prompt.SECTION_ID]: content } };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return {
        generatedSections: { [prompt.SECTION_ID]: "" },
        errors: [`${prompt.SECTION_ID} generation failed: ${msg}`],
      };
    }
  };
}
