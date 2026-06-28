import type { CompanyState } from "../state";
import type { CompanyKnowledgeBase } from "../../knowledge/types";
import { generateSection } from "../../prompts/llm";
import { CacheManager } from "../../cache/cacheManager";
import { CacheLevel } from "../../cache/types";
import { getSectionDependency } from "../../cache/dependencyMap";

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

    try {
      let content: string;

      if (prompt.buildAnalystPrompt && prompt.buildWriterPrompt) {
        // ── Two-pass: Business Analyst → Executive Writer ──
        const { systemPrompt: analystSys, userPrompt: analystUser } =
          prompt.buildAnalystPrompt(knowledge, companyName, role);
        const analystRaw = await generateSection(analystSys, analystUser);
        const analysis = parseStructuredAnalysis(analystRaw);

        const { systemPrompt: writerSys, userPrompt: writerUser } =
          prompt.buildWriterPrompt(analysis, companyName, role);
        content = await generateSection(writerSys, writerUser);
      } else {
        // ── Legacy single-pass ──
        const { systemPrompt, userPrompt } = prompt.buildPrompt(knowledge, companyName, role);
        content = await generateSection(systemPrompt, userPrompt);
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
