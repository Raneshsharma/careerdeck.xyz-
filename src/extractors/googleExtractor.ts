import type { GoogleSearchResult } from "../research/types";
import type { ExtractedUrls } from "./types";

const CATEGORY_RULES: Array<{ key: keyof ExtractedUrls; patterns: RegExp[] }> = [
  {
    key: "aboutPage",
    patterns: [/\/about(?:\/|$|-us\/|\.)/i, /\/company\/about/i],
  },
  {
    key: "investorRelations",
    patterns: [/\/investor/i, /\bir\b.*\.com/i, /investors?\./i, /\/ir\//i],
  },
  {
    key: "annualReport",
    patterns: [/annual.report/i, /\/annual-/i, /\/report\/annual/i, /financial-results/i],
  },
  {
    key: "leadership",
    patterns: [/\/leadership/i, /\bteam\b.*\.co/i, /\/management/i, /\/board/i, /executive/i, /\/our-leadership/i],
  },
  {
    key: "sustainability",
    patterns: [/sustainability/i, /\besg\b/i, /\bcsr\b/i, /responsibility/i, /corporate.citizenship/i],
  },
  {
    key: "careers",
    patterns: [/\/careers/i, /\/jobs\//i, /work.with.us/i, /join.our.team/i, /employment/i],
  },
];

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.hostname}`;
  } catch {
    return url;
  }
}

function isLikelyOfficial(url: string, companyName: string): boolean {
  const companySlug = companyName.toLowerCase().replace(/[^a-z0-9]/g, "");
  const hostMatch = url.toLowerCase().match(/https?:\/\/([^/]+)/);
  if (!hostMatch) return false;
  const host = hostMatch[1].replace(/^www\./, "");
  return host.includes(companySlug);
}

export function extractGoogleFacts(
  result: GoogleSearchResult,
  companyName: string,
): ExtractedUrls {
  const extracted: ExtractedUrls = {
    officialWebsite: null,
    aboutPage: null,
    investorRelations: null,
    annualReport: null,
    leadership: null,
    sustainability: null,
    careers: null,
  };

  const items = result.items;

  for (const item of items) {
    const url = item.link;
    if (!url) continue;

    // Match URL categories
    for (const rule of CATEGORY_RULES) {
      if (extracted[rule.key]) continue;
      const matched = rule.patterns.some((p) => p.test(url));
      if (matched) {
        (extracted[rule.key] as string) = url;
        break;
      }
    }

    // Find official website by company name match
    if (!extracted.officialWebsite && isLikelyOfficial(url, companyName)) {
      extracted.officialWebsite = normalizeUrl(url);
    }
  }

  return extracted;
}
