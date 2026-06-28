import type { CompanyState } from "../state";
import { extractGoogleFacts } from "../../extractors/googleExtractor";
import type { ExtractedUrls } from "../../extractors/types";

export async function googleExtractionNode(
  state: CompanyState,
): Promise<Partial<CompanyState>> {
  const envelope = state.researchGoogle;
  if (!envelope?.data) {
    return {
      extractedGoogle: null,
      errors: ["Google extraction skipped: no data"],
    };
  }
  try {
    const name = state.normalizedCompanyName || state.companyName;
    const facts: ExtractedUrls = extractGoogleFacts(envelope.data, name);
    return { extractedGoogle: facts };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { extractedGoogle: null, errors: [`Google extraction failed: ${msg}`] };
  }
}
