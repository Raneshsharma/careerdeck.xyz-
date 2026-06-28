import type { CompanyState } from "../state";
import { extractGNewsFacts } from "../../extractors/newsExtractor";
import type { ExtractedNewsArticle } from "../../extractors/types";

export async function gnewsExtractionNode(
  state: CompanyState,
): Promise<Partial<CompanyState>> {
  const envelope = state.researchGNews;
  if (!envelope?.data) {
    return {
      extractedGNews: null,
      errors: ["GNews extraction skipped: no data"],
    };
  }
  try {
    const facts: ExtractedNewsArticle[] = extractGNewsFacts(envelope.data);
    return { extractedGNews: facts };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { extractedGNews: null, errors: [`GNews extraction failed: ${msg}`] };
  }
}
