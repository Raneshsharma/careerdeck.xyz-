import type { CompanyState } from "../state";
import { researchGoogleCSE } from "../../research/google";

export async function googleSearchNode(
  state: CompanyState,
): Promise<Partial<CompanyState>> {
  const name = state.normalizedCompanyName || state.companyName;
  const envelope = await researchGoogleCSE(name);
  return { researchGoogle: envelope };
}
