import type { CompanyState } from "../state";
import { researchGoogleFinance } from "../../research/googleFinance";

export async function googleFinanceNode(
  state: CompanyState,
): Promise<Partial<CompanyState>> {
  const name = state.normalizedCompanyName || state.companyName;
  const envelope = await researchGoogleFinance(name);
  return { researchGoogleFinance: envelope };
}
