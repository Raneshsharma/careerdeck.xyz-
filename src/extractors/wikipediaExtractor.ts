import type { WikipediaResult } from "../research/types";
import type { ExtractedCompany } from "./types";

function normalizeWhitespace(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

function extractPattern(text: string, patterns: RegExp[]): string | null {
  for (const p of patterns) {
    const m = text.match(p);
    if (m?.[1]) return normalizeWhitespace(m[1]);
  }
  return null;
}

function extractAllPatterns(text: string, pattern: RegExp, group = 1): string[] {
  const results: string[] = [];
  const g = new RegExp(pattern.source, "g" + (pattern.flags.includes("i") ? "i" : ""));
  let m: RegExpExecArray | null;
  while ((m = g.exec(text)) !== null) {
    const val = normalizeWhitespace(m[group] ?? "");
    if (val && val.length > 1 && !results.includes(val)) {
      results.push(val);
    }
  }
  return results;
}

function extractFounded(text: string): string | null {
  const patterns = [
    /founded\s+(?:in|on)\s+(\d{4}(?:-\d{2}(?:-\d{2})?)?)/i,
    /founded\s+(\d{4})/i,
    /established\s+(?:in|on)\s+(\d{4}(?:-\d{2}(?:-\d{2})?)?)/i,
    /founded\s+by\s+[\w\s,]+\s+in\s+(\d{4})/i,
    /since\s+(\d{4})/i,
  ];
  return extractPattern(text, patterns);
}

function extractHeadquarters(text: string): string | null {
  const patterns = [
    /headquartered\s+in\s+([^.,]+(?:,\s*[^.,]+)?)/i,
    /headquarters\s+(?:is|are|in)\s+([^.,]+(?:,\s*[^.,]+)?)/i,
    /based\s+in\s+([^.,]+(?:,\s*[^.,]+)?)/i,
    /headquarters\s*(?:–|—|-)\s*([^.,\n]+)/i,
  ];
  return extractPattern(text, patterns);
}

function extractFounders(text: string): string[] {
  const patterns = [
    /founded\s+by\s+([^.]+?)(?:\.|,|\s+and\s+serves)/i,
    /founders?\s+(?:are|is|include|:)\s+([^.]+?)\./i,
    /co-founded\s+by\s+([^.]+?)\./i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m?.[1]) {
      const raw = m[1].replace(/\s+and\s+/g, ", ").replace(/,\s*$/g, "");
      return raw
        .split(/,|&/)
        .map((s) => s.trim().replace(/^(Sir|Dr|Mr|Mrs|Ms)\.?\s+/i, ""))
        .filter((s) => s.length > 1 && !/^\d/.test(s));
    }
  }
  return [];
}

function extractCEO(text: string): string | null {
  const patterns = [
    /CEO\s+(?:is|,)\s+([\w\s.]+?)(?:\.|\s*,|\s+\(|\s+since|\s+who|\s+and|\s+as|\s+has|\s+joined|\s+w[a-z]|\n)/i,
    /chief executive officer\s+(?:is|,)\s+([\w\s.]+?)(?:\.|\s*,|\s+\(|\s+since)/i,
    /led by\s+CEO\s+([\w\s.]+?)(?:\.|\s*,|\s+\(|\s+since)/i,
    /CEO\s+([\w\s.]+?)(?:,|\.|\s+announced|\s+said)/i,
  ];
  return extractPattern(text, patterns);
}

function extractIndustry(text: string): string | null {
  const patterns = [
    /is an?\s+(?:American|Indian|British|Chinese|Japanese|German|French|Canadian|Australian|multinational|global|publicly)\s+([a-z\s]+(?:company|corporation|conglomerate|organization|retailer|manufacturer|provider|firm|bank|platform|enterprise|network|agency|studio))/i,
    /is an?\s+([a-z\s]+(?:company|corporation|firm|startup|tech|platform|retailer|brand|manufacturer))/i,
    /(?:the\s+)?(?:world'?s?\s+)?largest\s+([a-z\s]+(?:company|retailer|manufacturer|provider))/i,
    /Industry[:\s]+([^\n,.]+)/i,
    /Sector[:\s]+([^\n,.]+)/i,
  ];
  return extractPattern(text, patterns);
}

function extractProducts(text: string): string[] {
  const products: string[] = [];
  const productSection = text.match(
    /(?:Products|Services|Brands|Portfolio)[:\s]*\n([\s\S]*?)(?:\n\n|\n(?:History|References|See also|External|Notes|Awards))/i,
  );
  const source = productSection?.[1] ?? text;

  const productPatterns = [
    /\b(?:products?\s+include\s+)([^.]+)\./i,
    /\b(?:known\s+for\s+(?:its\s+)?)([^.]+)\./i,
    /\b(?:offers?\s+)([^.]+?)\./i,
    /\b(?:flagship\s+(?:product|brand|service)s?\s+include\s+)([^.]+)\./i,
    /\b(?:product\s+lines?\s+include\s+)([^.]+)\./i,
  ];

  for (const p of productPatterns) {
    const m = source.match(p);
    if (m?.[1]) {
      const items = m[1].split(/,| and |, and /).map((s) => normalizeWhitespace(s));
      for (const item of items) {
        if (item.length > 2 && item.length < 100 && !/^\d/.test(item)) {
          products.push(item);
        }
      }
    }
  }

  return products;
}

function extractSubsidiaries(text: string): string[] {
  const patterns = [
    /subsidiaries?\s+include\s+([^.]+)\./i,
    /wholly[-\s]owned\s+subsidiaries?\s+include\s+([^.]+)\./i,
    /owns?\s+(?:several\s+)?(?:subsidiaries|brands)\s+including\s+([^.]+)\./i,
  ];

  for (const p of patterns) {
    const m = text.match(p);
    if (m?.[1]) {
      return m[1]
        .split(/,| and |, and /)
        .map((s) => normalizeWhitespace(s))
        .filter((s) => s.length > 1 && !/^\d/.test(s) && !/^including/i.test(s));
    }
  }
  return [];
}

function extractParentCompany(text: string): string | null {
  const patterns = [
    /(?:is a\s+)?(?:wholly[-\s]owned\s+)?subsidiary\s+of\s+([\w\s.&]+?)(?:\.|\s*,|\s+\(|\s+and|\s+since|\n)/i,
    /(?:is\s+)?owned\s+by\s+([\w\s.&]+?)(?:\.|\s*,|\s+\(|\s+since|\n)/i,
    /parent\s+(?:company|organization)[:\s]+([\w\s.&]+?)(?:\.|,|\n)/i,
  ];
  return extractPattern(text, patterns);
}

function extractDescription(text: string): string {
  const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [];
  const relevant = sentences.slice(0, 5).join(" ");
  return normalizeWhitespace(relevant) || text.slice(0, 500);
}

export function extractWikipediaFacts(result: WikipediaResult): ExtractedCompany {
  const text = result.extract;

  return {
    name: result.title,
    description: extractDescription(text),
    headquarters: extractHeadquarters(text),
    founded: extractFounded(text),
    founders: extractFounders(text),
    ceo: extractCEO(text),
    industry: extractIndustry(text),
    parentCompany: extractParentCompany(text),
    subsidiaries: extractSubsidiaries(text),
    products: extractProducts(text),
    website: result.url,
  };
}
