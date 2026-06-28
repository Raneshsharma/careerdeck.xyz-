import type { CompanyState } from "../state";
import { discoverCompanyWebsite } from "../../research/website";

export async function websiteDiscoveryNode(
  state: CompanyState,
): Promise<Partial<CompanyState>> {
  const name = state.normalizedCompanyName || state.companyName;
  const googleEnvelope = state.researchGoogle;
  const googleItems = googleEnvelope?.data?.items ?? [];
  const envelope = await discoverCompanyWebsite(googleItems, name);
  return { researchWebsiteDiscovery: envelope };
}
