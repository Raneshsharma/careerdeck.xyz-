import type { CompanyState } from "../state";
import { fetchCompanyWebsite } from "../../research/website";

export async function websiteFetchNode(
  state: CompanyState,
): Promise<Partial<CompanyState>> {
  const name = state.normalizedCompanyName || state.companyName;
  const discoveryEnvelope = state.researchWebsiteDiscovery;

  if (!discoveryEnvelope?.data) {
    return {
      researchWebsitePages: {
        source: "website_pages",
        success: false,
        fetchedAt: new Date().toISOString(),
        cached: false,
        durationMs: 0,
        data: null,
        error: "No website URL discovered",
      },
    };
  }

  const envelope = await fetchCompanyWebsite(discoveryEnvelope.data, name);
  return { researchWebsitePages: envelope };
}
