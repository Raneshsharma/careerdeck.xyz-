import type { WebsitePagesResult } from "../research/types";
import type { ExtractedWebsite, ExtractedWebsitePage } from "./types";

function stripTags(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractMetaTag(html: string, name: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["']`, "i"),
    new RegExp(`<meta[^>]+property=["']${name}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${name}["']`, "i"),
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m?.[1]) return m[1].trim();
  }
  return null;
}

function extractJsonLd(html: string): Record<string, unknown>[] {
  const results: Record<string, unknown>[] = [];
  const pattern = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(m[1]);
      if (typeof parsed === "object") {
        results.push(Array.isArray(parsed) ? parsed[0] : parsed);
      }
    } catch {
      // Ignore malformed JSON-LD
    }
  }
  return results;
}

function extractHeadings(html: string): string[] {
  const headings: string[] = [];
  const pattern = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi;
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(html)) !== null) {
    const text = stripTags(m[2]);
    if (text.length > 0) headings.push(text);
  }
  return headings;
}

function extractParagraphs(html: string): string[] {
  const paragraphs: string[] = [];
  const pattern = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(html)) !== null) {
    const text = stripTags(m[1]);
    if (text.length > 20) paragraphs.push(text);
  }
  return paragraphs;
}

function extractLists(html: string): string[][] {
  const lists: string[][] = [];
  const pattern = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  let m: RegExpExecArray | null;
  const items: string[] = [];
  while ((m = pattern.exec(html)) !== null) {
    const text = stripTags(m[1]);
    if (text.length > 1) items.push(text);
  }
  if (items.length > 0) lists.push(items);
  return lists;
}

function extractLinks(html: string): Array<{ text: string; href: string }> {
  const links: Array<{ text: string; href: string }> = [];
  const pattern = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(html)) !== null) {
    const text = stripTags(m[2]);
    if (text.length > 1) {
      links.push({ text, href: m[1] });
    }
  }
  return links;
}

function parsePage(html: string, path: string): ExtractedWebsitePage {
  return {
    path,
    textContent: stripTags(html),
    metaDescription: extractMetaTag(html, "description"),
    ogTitle: extractMetaTag(html, "og:title"),
    ogDescription: extractMetaTag(html, "og:description"),
    ogImage: extractMetaTag(html, "og:image"),
    ogUrl: extractMetaTag(html, "og:url"),
    jsonld: extractJsonLd(html),
    headings: extractHeadings(html),
    paragraphs: extractParagraphs(html),
    lists: extractLists(html),
    links: extractLinks(html),
  };
}

export function extractWebsiteFacts(result: WebsitePagesResult): ExtractedWebsite {
  const pages: Record<string, ExtractedWebsitePage> = {};

  for (const page of result.pages) {
    const label =
      page.path === "/"
        ? "homepage"
        : page.path.replace(/\//g, "").replace(/[^a-zA-Z0-9]/g, "_");
    pages[label] = parsePage(page.html, page.path);
  }

  return {
    officialUrl: result.baseUrl,
    pages,
  };
}
