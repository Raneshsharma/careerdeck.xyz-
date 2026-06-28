import type { CompanyState } from "../state";
import { researchYahoo } from "../../research/yahoo";

export async function yahooFinanceNode(
  state: CompanyState,
): Promise<Partial<CompanyState>> {
  const name = state.normalizedCompanyName || state.companyName;
  const envelope = await researchYahoo(name);
  return { researchYahoo: envelope };
}
