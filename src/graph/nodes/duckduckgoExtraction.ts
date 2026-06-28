import type { CompanyState } from "../state";
import { extractDuckDuckGoFacts } from "../../extractors/duckduckgoExtractor";
import type { ExtractedDuckDuckGo } from "../../extractors/types";

export async function duckduckgoExtractionNode(
  state: CompanyState,
): Promise<Partial<CompanyState>> {
  const envelope = state.researchDuckDuckGo;
  if (!envelope?.data) {
    return {
      extractedDuckDuckGo: null,
      errors: ["DuckDuckGo extraction skipped: no data"],
    };
  }
  try {
    const facts: ExtractedDuckDuckGo = extractDuckDuckGoFacts(envelope.data);
    return { extractedDuckDuckGo: facts };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      extractedDuckDuckGo: null,
      errors: [`DuckDuckGo extraction failed: ${msg}`],
    };
  }
}
