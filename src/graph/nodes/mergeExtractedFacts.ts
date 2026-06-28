import type { CompanyState, CompanyKnowledge } from "../state";
import type { MergedExtractedFacts, ExtractedNewsArticle, ExtractedWebsite } from "../../extractors/types";

export async function mergeExtractedFactsNode(
  state: CompanyState,
): Promise<Partial<CompanyState>> {
  const w = state.extractedWikipedia;
  const g = state.extractedGoogle;
  const s = state.extractedWebsite;
  const y = state.extractedYahoo;
  const n = state.extractedGNews;
  const d = state.extractedDuckDuckGo;

  const merged: MergedExtractedFacts = {
    company: {
      name: w?.name ?? state.normalizedCompanyName ?? state.companyName,
      description: w?.description ?? d?.description ?? "",
      headquarters: w?.headquarters ?? null,
      founded: w?.founded ?? null,
      founders: w?.founders ?? [],
      industry: y?.industry ?? w?.industry ?? null,
      parentCompany: w?.parentCompany ?? null,
      products: w?.products ?? [],
      website:
        g?.officialWebsite ??
        d?.officialWebsite ??
        s?.officialUrl ??
        w?.website ??
        null,
    },
    website: {
      officialUrl: g?.officialWebsite ?? s?.officialUrl ?? d?.officialWebsite ?? null,
      metaDescription: s?.pages?.homepage?.metaDescription ?? null,
      ogTitle: s?.pages?.homepage?.ogTitle ?? null,
      ogDescription: s?.pages?.homepage?.ogDescription ?? null,
      ogImage: s?.pages?.homepage?.ogImage ?? null,
      pages: s?.pages ? {
        homepage: { paragraphs: s.pages.homepage?.paragraphs ?? [] },
      } : undefined,
    },
    leadership: {
      ceo: y?.ceo ?? w?.ceo ?? null,
      executives: extractExecutives(s),
    },
    products: {
      items: w?.products ?? [],
      businessSegments: extractBusinessSegments(s),
      brands: extractBrands(s),
    },
    financials: {
      revenue: y?.revenue ?? null,
      revenueCurrency: y?.revenueCurrency ?? null,
      marketCap: y?.marketCap ?? null,
      marketCapCurrency: y?.marketCapCurrency ?? null,
      employees: y?.employees ?? null,
      sector: y?.sector ?? null,
      industry: y?.industry ?? null,
      country: y?.country ?? null,
      currency: y?.currency ?? null,
      exchange: y?.exchange ?? null,
      ticker: y?.ticker ?? null,
      profitMargin: y?.profitMargin ?? null,
      operatingMargin: y?.operatingMargin ?? null,
      grossMargin: y?.grossMargin ?? null,
      beta: y?.beta ?? null,
      trailingPE: y?.trailingPE ?? null,
      currentPrice: y?.currentPrice ?? null,
      fiftyTwoWeekHigh: y?.fiftyTwoWeekHigh ?? null,
      fiftyTwoWeekLow: y?.fiftyTwoWeekLow ?? null,
    },
    history: {
      founded: w?.founded ?? null,
      founders: w?.founders ?? [],
      subsidiaries: w?.subsidiaries ?? [],
    },
    news: (n ?? []) as ExtractedNewsArticle[],
    urls: {
      officialWebsite:
        g?.officialWebsite ??
        s?.officialUrl ??
        d?.officialWebsite ??
        w?.website ??
        null,
      aboutPage: g?.aboutPage ?? null,
      investorRelations: g?.investorRelations ?? null,
      annualReport: g?.annualReport ?? null,
      leadership: g?.leadership ?? null,
      sustainability: g?.sustainability ?? null,
      careers: g?.careers ?? null,
      wikipedia: w?.website ?? null,
      yahooFinance: y?.ticker
        ? `https://finance.yahoo.com/quote/${y.ticker}`
        : null,
    },
  };

  const knowledge: CompanyKnowledge = {
    extractedFacts: merged,
  };

  return { knowledge };
}

function extractExecutives(website: ExtractedWebsite | null): string[] {
  if (!website?.pages) return [];
  const page = website.pages.leadership ?? website.pages.about_us ?? website.pages.about ?? website.pages.homepage;
  if (!page?.headings) return [];
  return page.headings.slice(0, 10);
}

function extractBusinessSegments(website: ExtractedWebsite | null): string[] {
  if (!website?.pages) return [];
  const page = website.pages.products ?? website.pages.about_us ?? website.pages.homepage;
  if (!page?.paragraphs) return [];
  return page.paragraphs
    .filter(
      (p: string) =>
        /\b(segment|division|unit|business unit)\b/i.test(p) &&
        p.length < 500,
    )
    .slice(0, 5);
}

function extractBrands(website: ExtractedWebsite | null): string[] {
  if (!website?.pages) return [];
  const page = website.pages.products ?? website.pages.homepage;
  if (!page?.lists) return [];
  const allLists = page.lists.flat();
  return allLists
    .filter((item: string) => item.length > 1 && item.length < 100)
    .slice(0, 20);
}
