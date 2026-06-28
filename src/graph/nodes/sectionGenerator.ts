import type { CompanyState } from "../state";
import type { CompanyKnowledgeBase } from "../../knowledge/types";
import { generateSection } from "../../prompts/llm";
import { CacheManager } from "../../cache/cacheManager";
import { CacheLevel } from "../../cache/types";
import { getSectionDependency } from "../../cache/dependencyMap";

interface SectionPrompt {
  buildPrompt: (
    knowledge: CompanyKnowledgeBase,
    companyName: string,
    role?: string | undefined,
  ) => { systemPrompt: string; userPrompt: string };
  SECTION_ID: string;
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

    // Build a version-tagged cache key using dependent domain versions
    const dep = getSectionDependency(prompt.SECTION_ID);
    const domainVersions = state.domainVersions;
    let versionTag = "";

    if (dep && domainVersions) {
      versionTag = dep.dependsOn
        .map((d) => `${d}:${(domainVersions as unknown as Record<string, string>)[d] ?? "0"}`)
        .join(";");
    }

    // L4: Check section cache with version tag
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
      const { systemPrompt, userPrompt } = prompt.buildPrompt(knowledge, companyName, role);
      const content = await generateSection(systemPrompt, userPrompt);

      // L4: Store in section cache
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
