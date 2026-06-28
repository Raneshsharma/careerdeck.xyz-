import type { CompanyState } from "../state";
import { extractWebsiteFacts } from "../../extractors/websiteExtractor";
import type { ExtractedWebsite } from "../../extractors/types";

export async function websiteExtractionNode(
  state: CompanyState,
): Promise<Partial<CompanyState>> {
  const envelope = state.researchWebsitePages;
  if (!envelope?.data) {
    return {
      extractedWebsite: null,
      errors: ["Website extraction skipped: no pages data"],
    };
  }
  try {
    const facts: ExtractedWebsite = extractWebsiteFacts(envelope.data);
    return { extractedWebsite: facts };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { extractedWebsite: null, errors: [`Website extraction failed: ${msg}`] };
  }
}
