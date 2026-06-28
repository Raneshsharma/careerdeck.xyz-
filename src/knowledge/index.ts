export {
  cleanText,
  cleanTitle,
  normalizeUrl,
  normalizeDate,
  normalizeNumber,
  normalizeCurrency,
  normalizeCountry,
  dedupeKey,
  deduplicateList,
} from "./normalizer";
export { resolveConflicts, SOURCE_PRIORITY } from "./conflictResolver";
export { scoreConfidence, type SourceConfidence } from "./confidenceScorer";
export { buildKnowledgeBase } from "./knowledgeBuilder";
export type {
  ProvenancedValue,
  ProvenancedList,
  CompanyKnowledgeBase,
} from "./types";
