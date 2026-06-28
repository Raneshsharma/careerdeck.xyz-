import type { CompanyState, CompanyKnowledge } from "../state";
import { resolveConflicts } from "../../knowledge/conflictResolver";
import type { RawResolvedFacts } from "../../knowledge/conflictResolver";

export async function resolveConflictsNode(
  state: CompanyState,
): Promise<Partial<CompanyState>> {
  const extracted = state.knowledge.extractedFacts;
  if (!extracted) {
    return {
      errors: ["No extracted facts available for conflict resolution"],
      knowledge: {},
    };
  }

  try {
    const resolved: RawResolvedFacts = resolveConflicts(extracted);

    const knowledge: CompanyKnowledge = {
      resolvedFacts: resolved,
    };

    return { knowledge };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { errors: [`Conflict resolution failed: ${msg}`] };
  }
}
