import type { GNewsResult } from "../research/types";
import type { ExtractedNewsArticle } from "./types";

function toISODate(raw: string): string | null {
  if (!raw) return null;
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) {
      const match = raw.match(/(\d{4}-\d{2}-\d{2})/);
      if (match) return match[1];
      return null;
    }
    return d.toISOString().split("T")[0];
  } catch {
    return null;
  }
}

const CATEGORY_KEYWORDS: Array<{ keyword: string; category: string }> = [
  { keyword: "merger", category: "Mergers & Acquisitions" },
  { keyword: "acquisition", category: "Mergers & Acquisitions" },
  { keyword: "acquires", category: "Mergers & Acquisitions" },
  { keyword: "ipo", category: "IPO" },
  { keyword: "public offering", category: "IPO" },
  { keyword: "earnings", category: "Earnings" },
  { keyword: "quarterly", category: "Earnings" },
  { keyword: "revenue", category: "Earnings" },
  { keyword: "profit", category: "Earnings" },
  { keyword: "loss", category: "Earnings" },
  { keyword: "layoff", category: "Workforce" },
  { keyword: "layoffs", category: "Workforce" },
  { keyword: "hiring", category: "Workforce" },
  { keyword: "ceo", category: "Leadership" },
  { keyword: "appoints", category: "Leadership" },
  { keyword: "executive", category: "Leadership" },
  { keyword: "product launch", category: "Product" },
  { keyword: "new product", category: "Product" },
  { keyword: "announces", category: "Product" },
  { keyword: "partnership", category: "Partnership" },
  { keyword: "partner", category: "Partnership" },
  { keyword: "investor", category: "Investment" },
  { keyword: "funding", category: "Investment" },
  { keyword: "raises", category: "Investment" },
  { keyword: "lawsuit", category: "Legal" },
  { keyword: "regulation", category: "Legal" },
  { keyword: "data breach", category: "Security" },
  { keyword: "cyber", category: "Security" },
  { keyword: "expansion", category: "Expansion" },
  { keyword: "expands", category: "Expansion" },
  { keyword: "new office", category: "Expansion" },
  { keyword: "sustainability", category: "Sustainability" },
  { keyword: "esg", category: "Sustainability" },
  { keyword: "stock", category: "Stock" },
  { keyword: "market cap", category: "Stock" },
  { keyword: "share price", category: "Stock" },
  { keyword: "patent", category: "Innovation" },
  { keyword: "ai", category: "Technology" },
  { keyword: "artificial intelligence", category: "Technology" },
  { keyword: "cloud", category: "Technology" },
  { keyword: "blockchain", category: "Technology" },
];

function classifyArticle(title: string): string | null {
  const lower = title.toLowerCase();
  for (const { keyword, category } of CATEGORY_KEYWORDS) {
    if (lower.includes(keyword)) return category;
  }
  return null;
}

function isValidUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return ["http:", "https:"].includes(u.protocol);
  } catch {
    return false;
  }
}

export function extractGNewsFacts(result: GNewsResult): ExtractedNewsArticle[] {
  const articles = result.articles.slice(0, 10);

  return articles
    .map((a) => ({
      title: a.title.trim(),
      publishedDate: toISODate(a.publishedAt),
      source: a.source.name.trim(),
      url: isValidUrl(a.url) ? a.url : "",
      category: classifyArticle(a.title),
    }))
    .filter((a) => a.title.length > 0 && a.source.length > 0);
}
