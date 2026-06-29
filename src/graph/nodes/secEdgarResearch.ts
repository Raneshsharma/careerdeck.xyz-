import type { CompanyState } from "../state";
import { researchSecEdgar } from "../../research/secEdgar";

export async function secEdgarNode(
  state: CompanyState,
): Promise<Partial<CompanyState>> {
  const name = state.normalizedCompanyName || state.companyName;
  const ticker = state.researchYahoo?.data?.symbol ?? null;
  const envelope = await researchSecEdgar(name, ticker);
  return { researchSecEdgar: envelope };
}
