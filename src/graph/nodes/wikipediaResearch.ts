import type { CompanyState } from "../state";
import { researchWikipedia } from "../../research/wikipedia";

export async function wikipediaResearchNode(
  state: CompanyState,
): Promise<Partial<CompanyState>> {
  const name = state.normalizedCompanyName || state.companyName;
  const envelope = await researchWikipedia(name);
  return { researchWikipedia: envelope };
}
