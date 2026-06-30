import type { CompanyState, AssembledResearch, CompanyKnowledge } from "../state";

export async function mergeResearchNode(
  state: CompanyState,
): Promise<Partial<CompanyState>> {
  // Idempotency: skip if already merged
  if (state.knowledge?.rawResearch) {
    return {};
  }

  const assembled: AssembledResearch = {
    wikipedia: state.researchWikipedia?.data ?? null,
    google: state.researchGoogle?.data ?? null,
    website: {
      discovery: state.researchWebsiteDiscovery?.data ?? null,
      pages: state.researchWebsitePages?.data ?? null,
    },
    yahooFinance: state.researchYahoo?.data ?? null,
    googleFinance: state.researchGoogleFinance?.data ?? null,
    gnews: state.researchGNews?.data ?? null,
    duckduckgo: state.researchDuckDuckGo?.data ?? null,
    googleNewsRss: state.researchGoogleNewsRss?.data ?? null,
    secEdgar: state.researchSecEdgar?.data ?? null,
  };

  const knowledge: CompanyKnowledge = {
    rawResearch: assembled,
  };

  const failedSources: string[] = [];

  const sources: Array<{ key: string; envelope: { success: boolean } | null }> = [
    { key: "wikipedia", envelope: state.researchWikipedia },
    { key: "google", envelope: state.researchGoogle },
    { key: "yahoo", envelope: state.researchYahoo },
    { key: "google_finance", envelope: state.researchGoogleFinance },
    { key: "gnews", envelope: state.researchGNews },
    { key: "duckduckgo", envelope: state.researchDuckDuckGo },
    { key: "website_discovery", envelope: state.researchWebsiteDiscovery },
    { key: "website_pages", envelope: state.researchWebsitePages },
  ];

  for (const { key, envelope } of sources) {
    if (!envelope?.success) {
      failedSources.push(key);
    }
  }

  return {
    knowledge,
    errors:
      failedSources.length > 0
        ? [`Research completed with ${failedSources.length} failed sources: ${failedSources.join(", ")}`]
        : [],
  };
}
