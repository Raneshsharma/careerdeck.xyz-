import type { CompanyState } from "../state";
import { researchGoogleNewsRss } from "../../research/googleNewsRss";

export async function googleNewsRssNode(
  state: CompanyState,
): Promise<Partial<CompanyState>> {
  const name = state.normalizedCompanyName || state.companyName;
  const envelope = await researchGoogleNewsRss(name);
  return { researchGoogleNewsRss: envelope };
}
