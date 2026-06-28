/**
 * Normalize a single text value: trim, collapse whitespace,
 * normalize Unicode, remove HTML, remove duplicate punctuation.
 */
export function cleanText(value: string | null | undefined): string | null {
  if (value == null) return null;
  let cleaned = value.trim();
  cleaned = cleaned.replace(/\s+/g, " ");
  cleaned = cleaned.replace(/&amp;/g, "&");
  cleaned = cleaned.replace(/&lt;/g, "<");
  cleaned = cleaned.replace(/&gt;/g, ">");
  cleaned = cleaned.replace(/&quot;/g, '"');
  cleaned = cleaned.replace(/&#039;/g, "'");
  cleaned = cleaned.replace(/&nbsp;/g, " ");
  cleaned = cleaned.replace(/\.{3,}/g, "...");
  cleaned = cleaned.replace(/\?{2,}/g, "?");
  cleaned = cleaned.replace(/!{2,}/g, "!");
  cleaned = cleaned.trim();
  return cleaned || null;
}

/**
 * Remove trailing punctuation and trim.
 */
export function cleanTitle(value: string | null | undefined): string | null {
  if (value == null) return null;
  let cleaned = cleanText(value);
  if (!cleaned) return null;
  cleaned = cleaned.replace(/[,;.:!?\s]+$/, "");
  return cleaned || null;
}

/**
 * Normalize a URL: ensure https, remove tracking parameters, trailing slash consistency.
 */
export function normalizeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    u.searchParams.delete("utm_source");
    u.searchParams.delete("utm_medium");
    u.searchParams.delete("utm_campaign");
    u.searchParams.delete("utm_content");
    u.searchParams.delete("utm_term");
    u.searchParams.delete("fbclid");
    u.searchParams.delete("gclid");
    u.searchParams.delete("ref");
    u.searchParams.delete("source");
    if (u.searchParams.size === 0) {
      u.search = "";
    }
    return u.toString().replace(/\/$/, "") || null;
  } catch {
    return url.replace(/^http:/, "https:").replace(/\/$/, "") || null;
  }
}

/**
 * Convert a date string to ISO format (YYYY-MM-DD or YYYY-MM).
 * Returns null if unparseable.
 */
export function normalizeDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const cleaned = cleanText(value);
  if (!cleaned) return null;

  // Already ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) return cleaned;
  if (/^\d{4}-\d{2}$/.test(cleaned)) return cleaned;

  // Just a year
  if (/^\d{4}$/.test(cleaned)) return cleaned;

  try {
    const d = new Date(cleaned);
    if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
  } catch {
    // fall through
  }

  // Try to find ISO date within string
  const match = cleaned.match(/(\d{4}-\d{2}-\d{2})/);
  if (match) return match[1];

  return null;
}

/**
 * Parse a number string to a plain number.
 * Handles: "5000000000", "$5 Billion", "5B", "10M", "1,234,567"
 */
export function normalizeNumber(value: string | number | null | undefined): number | null {
  if (value == null) return null;
  if (typeof value === "number" && isFinite(value)) return value;

  const raw = String(value).trim();
  if (!raw) return null;

  const multipliers: Record<string, number> = {
    t: 1e12,
    trillion: 1e12,
    b: 1e9,
    billion: 1e9,
    bn: 1e9,
    m: 1e6,
    million: 1e6,
    mn: 1e6,
    k: 1e3,
    thousand: 1e3,
  };

  let numeric = raw.replace(/[$,£€¥%]/g, "").replace(/,/g, "").trim();

  for (const [suffix, mult] of Object.entries(multipliers)) {
    const regex = new RegExp(`^([\\d.]+)\\s*${suffix}$`, "i");
    const m = numeric.match(regex);
    if (m) {
      const n = parseFloat(m[1]);
      if (!isNaN(n) && isFinite(n)) return n * mult;
    }
  }

  const n = parseFloat(numeric);
  return !isNaN(n) && isFinite(n) ? n : null;
}

/**
 * Standardize a currency code to 3-letter ISO.
 */
export function normalizeCurrency(value: string | null | undefined): string | null {
  if (!value) return null;
  const cleaned = cleanText(value);
  if (!cleaned) return null;

  const upper = cleaned.toUpperCase().trim();
  if (/^[A-Z]{3}$/.test(upper)) return upper;

  const symbolMap: Record<string, string> = {
    "$": "USD",
    "US$": "USD",
    "€": "EUR",
    "£": "GBP",
    "¥": "JPY",
    "₹": "INR",
    "A$": "AUD",
    "C$": "CAD",
    "CHF": "CHF",
  };

  if (symbolMap[upper]) return symbolMap[upper];
  return upper.length >= 2 && upper.length <= 4 ? upper : null;
}

/**
 * Standardize country name.
 */
export function normalizeCountry(value: string | null | undefined): string | null {
  if (!value) return null;
  const cleaned = cleanText(value);
  if (!cleaned) return null;

  const countryMap: Record<string, string> = {
    "usa": "United States",
    "united states of america": "United States",
    "us": "United States",
    "u.s.": "United States",
    "uk": "United Kingdom",
    "united kingdom": "United Kingdom",
    "uae": "United Arab Emirates",
    "united arab emirates": "United Arab Emirates",
  };

  const lower = cleaned.toLowerCase();
  return countryMap[lower] ?? cleaned;
}

/**
 * Deduplicate key: strip case, whitespace, special characters.
 */
export function dedupeKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Deduplicate a string array.
 */
export function deduplicateList(items: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of items) {
    const key = dedupeKey(item);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item.trim());
    }
  }
  return result;
}
