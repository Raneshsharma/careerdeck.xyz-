import type { MergedExtractedFacts } from "../extractors/types";
import type { CompanyKnowledgeBase } from "./types";
import { resolveConflicts } from "./conflictResolver";
import { scoreConfidence } from "./confidenceScorer";

export function buildKnowledgeBase(
  extractedFacts: MergedExtractedFacts,
): CompanyKnowledgeBase {
  const resolved = resolveConflicts(extractedFacts);
  const knowledge = scoreConfidence(resolved, extractedFacts.news);
  return knowledge;
}
