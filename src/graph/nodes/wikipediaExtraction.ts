import type { CompanyState } from "../state";
import { extractWikipediaFacts } from "../../extractors/wikipediaExtractor";
import type { ExtractedCompany } from "../../extractors/types";

export async function wikipediaExtractionNode(
  state: CompanyState,
): Promise<Partial<CompanyState>> {
  const envelope = state.researchWikipedia;
  if (!envelope?.data) {
    return {
      extractedWikipedia: null,
      errors: ["Wikipedia extraction skipped: no data"],
    };
  }
  try {
    const facts: ExtractedCompany = extractWikipediaFacts(envelope.data);
    return { extractedWikipedia: facts };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { extractedWikipedia: null, errors: [`Wikipedia extraction failed: ${msg}`] };
  }
}
