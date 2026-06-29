import type { CompanyState } from "../state";
import { extractCoreFacts } from "../../knowledge/coreFactsExtractor";

export async function extractCoreFactsNode(
  state: CompanyState,
): Promise<Partial<CompanyState>> {
  const knowledge = state.knowledge.knowledgeBase;
  if (!knowledge) {
    return { errors: ["No knowledge base for core facts extraction"] };
  }

  try {
    const coreFacts = extractCoreFacts(knowledge);
    return { coreFacts };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { errors: [`Core facts extraction failed: ${msg}`] };
  }
}
