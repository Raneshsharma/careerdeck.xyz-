import type { CompanyState } from "../state";
import { researchDuckDuckGo } from "../../research/duckduckgo";

export async function duckduckgoNode(
  state: CompanyState,
): Promise<Partial<CompanyState>> {
  const name = state.normalizedCompanyName || state.companyName;
  const envelope = await researchDuckDuckGo(name);
  return { researchDuckDuckGo: envelope };
}
