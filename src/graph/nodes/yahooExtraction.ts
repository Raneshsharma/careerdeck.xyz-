import type { CompanyState } from "../state";
import { extractYahooFacts } from "../../extractors/yahooExtractor";
import type { ExtractedFinancials } from "../../extractors/types";

export async function yahooExtractionNode(
  state: CompanyState,
): Promise<Partial<CompanyState>> {
  const envelope = state.researchYahoo;
  if (!envelope?.data) {
    return {
      extractedYahoo: null,
      errors: ["Yahoo extraction skipped: no data"],
    };
  }
  try {
    const facts: ExtractedFinancials = extractYahooFacts(envelope.data);
    return { extractedYahoo: facts };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { extractedYahoo: null, errors: [`Yahoo extraction failed: ${msg}`] };
  }
}
