import type { CompanyKnowledgeBase } from "../knowledge/types";
import type { SectionProvenance, ReportExplainability } from "./types";
import { SECTION_DEPENDENCIES } from "../cache/dependencyMap";

/**
 * Explainability Engine — tracks every fact back to its source.
 *
 * Every section knows:
 * - Which knowledge domains contributed
 * - Which external sources were used
 * - Confidence per fact
 * - When it was last verified
 */
export class ExplainabilityEngine {
  static buildSectionProvenance(
    sectionId: string,
    knowledge: CompanyKnowledgeBase,
    sectionScores?: Record<string, Record<string, number>>,
  ): SectionProvenance {
    const dep = SECTION_DEPENDENCIES.find((s) => s.sectionId === sectionId);
    const domains = dep?.dependsOn ?? [];

    // Collect sources from each dependent domain
    const sources = new Set<string>();
    for (const domain of domains) {
      const domainData = (knowledge as unknown as Record<string, unknown>)[domain] as {
        value?: unknown;
        sources?: string[];
        confidence?: number;
      };
      if (domainData?.sources) {
        for (const s of domainData.sources) sources.add(s);
      }
    }

    // Build key facts from knowledge domains
    const keyFacts: Array<{
      fact: string;
      value: string;
      source: string;
      confidence: number;
    }> = [];

    for (const domain of domains) {
      const domainData = (knowledge as unknown as Record<string, unknown>)[domain];
      if (!domainData || typeof domainData !== "object") continue;

      const entries = Object.entries(domainData as Record<string, unknown>);
      for (const [key, val] of entries) {
        if (val && typeof val === "object" && "value" in (val as object)) {
          const pv = val as { value: unknown; sources?: string[]; confidence?: number };
          if (pv.value != null && pv.value !== "" && pv.value !== 0) {
            const strVal = Array.isArray(pv.value)
              ? (pv.value as string[]).slice(0, 3).join(", ")
              : String(pv.value);
            if (strVal.length < 200) {
              keyFacts.push({
                fact: `${domain}.${key}`,
                value: strVal,
                source: pv.sources?.[0] ?? "unknown",
                confidence: pv.confidence ?? 0.5,
              });
            }
          }
        }
      }
    }

    const confidence =
      sectionScores?.[sectionId]?.overall ??
      keyFacts.length > 0
        ? keyFacts.reduce((sum, f) => sum + f.confidence, 0) / keyFacts.length
        : 0.5;

    return {
      sectionId,
      sectionName: dep?.sectionName ?? sectionId,
      knowledgeDomains: domains,
      sources: [...sources],
      confidence: Math.round(confidence * 100) / 100,
      lastVerified: new Date().toISOString(),
      keyFacts: keyFacts.slice(0, 20),
    };
  }

  static buildReportExplainability(
    sectionIds: string[],
    knowledge: CompanyKnowledgeBase,
    scores?: Record<string, Record<string, number>>,
  ): ReportExplainability {
    const sections: Record<string, SectionProvenance> = {};
    const allSources = new Set<string>();
    let totalConfidence = 0;

    for (const sectionId of sectionIds) {
      const provenance = this.buildSectionProvenance(sectionId, knowledge, scores);
      sections[sectionId] = provenance;
      totalConfidence += provenance.confidence;
      for (const s of provenance.sources) allSources.add(s);
    }

    return {
      sections,
      overallConfidence:
        sectionIds.length > 0
          ? Math.round((totalConfidence / sectionIds.length) * 100) / 100
          : 0,
      sourcesUsed: [...allSources],
    };
  }
}
