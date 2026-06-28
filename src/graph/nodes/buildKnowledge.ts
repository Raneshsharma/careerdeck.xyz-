import type { CompanyState } from "../state";
import type { CompanyKnowledge } from "../state";
import { scoreConfidence } from "../../knowledge/confidenceScorer";
import { computeDomainVersions } from "../../cache/versioning";
import { CacheManager } from "../../cache/cacheManager";
import { CacheLevel } from "../../cache/types";
import { CacheMetricsTracker } from "../../cache/metrics";

export async function buildKnowledgeNode(
  state: CompanyState,
): Promise<Partial<CompanyState>> {
  const resolved = state.knowledge.resolvedFacts;
  const news = state.extractedGNews ?? [];
  const companyName = state.normalizedCompanyName || state.companyName;
  const extracted = state.knowledge.extractedFacts;

  if (!resolved) {
    return { errors: ["No resolved facts available for knowledge building"] };
  }

  try {
    const knowledgeBase = scoreConfidence(resolved, news);

    // L3: Cache knowledge base
    if (extracted) {
      await CacheManager.set(
        companyName,
        CacheLevel.KNOWLEDGE,
        "knowledgeBase",
        knowledgeBase,
      );
    }

    // Compute per-domain versions for incremental regeneration
    const domainVersions = extracted
      ? await computeDomainVersions(extracted)
      : null;

    const knowledge: Partial<CompanyKnowledge> = { knowledgeBase };

    return {
      knowledge,
      domainVersions,
      completedAt: new Date().toISOString(),
      cacheMetadata: CacheMetricsTracker.getMetrics(),
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { errors: [`Knowledge building failed: ${msg}`] };
  }
}
