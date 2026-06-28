import type { CompanyState } from "../state";
import { researchGNews } from "../../research/gnews";

export async function gnewsNode(
  state: CompanyState,
): Promise<Partial<CompanyState>> {
  const name = state.normalizedCompanyName || state.companyName;
  const envelope = await researchGNews(name);
  return { researchGNews: envelope };
}
