// ─── Source 1: Wikipedia (free, no API key) ─────────────────────────────

export async function researchWikipedia(companyName) {
  try {
    const q = encodeURIComponent(companyName.trim());
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${q}&limit=3&format=json&origin=*`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    const titles = searchData[1];
    if (!titles || titles.length === 0) return null;

    const bestTitle = titles.find((t) =>
      t.toLowerCase().includes(companyName.toLowerCase())
    ) || titles[0];

    const params = new URLSearchParams({
      action: "query",
      prop: "extracts",
      exintro: "1",
      explaintext: "1",
      titles: bestTitle,
      format: "json",
      origin: "*",
    });
    const extractRes = await fetch(
      `https://en.wikipedia.org/w/api.php?${params.toString()}`
    );
    const extractData = await extractRes.json();
    const pages = extractData.query?.pages;
    if (!pages) return null;
    const page = pages[Object.keys(pages)[0]];
    if (!page?.extract) return null;

    return {
      text: page.extract,
      source: "Wikipedia",
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title || bestTitle)}`,
    };
  } catch (e) {
    console.error("Wikipedia error:", e.message);
    return null;
  }
}

// ─── Source 2: DuckDuckGo Instant Answers (free, no API key) ────────────

export async function researchDuckDuckGo(companyName) {
  try {
    const q = encodeURIComponent(companyName.trim());
    const url = `https://api.duckduckgo.com/?q=${q}&format=json&no_html=1&skip_disambig=1`;
    const res = await fetch(url);
    const data = await res.json();

    const parts = [];
    if (data.AbstractText && data.AbstractText.trim()) {
      parts.push(data.AbstractText);
    }

    if (Array.isArray(data.RelatedTopics)) {
      for (const topic of data.RelatedTopics) {
        if (topic.Text && !topic.Text.startsWith("Official site")) {
          parts.push(topic.Text);
        }
        if (parts.length >= 5) break;
      }
    }

    if (parts.length === 0) return null;

    return {
      text: parts.join(" "),
      source: "DuckDuckGo",
      url: data.AbstractURL || `https://duckduckgo.com/?q=${q}`,
    };
  } catch (e) {
    console.error("DuckDuckGo error:", e.message);
    return null;
  }
}

// ─── Source 3: GNews API (free tier key required) ────────────────────────

export async function researchGNews(companyName) {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) return null;

  try {
    const q = encodeURIComponent(companyName.trim());
    const url = `https://gnews.io/api/v4/search?q=${q}&lang=en&max=3&token=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.articles || data.articles.length === 0) return null;

    const snippets = data.articles
      .map((a) => `${a.title}: ${a.description}`)
      .filter(Boolean)
      .join(" | ");

    return { text: snippets, source: "News", url: data.articles[0]?.url || null };
  } catch (e) {
    console.error("GNews error:", e.message);
    return null;
  }
}

// ─── Source 4: Google Custom Search (free tier 100/day) ──────────────────

export async function researchGoogleCSE(companyName) {
  const apiKey = process.env.GOOGLE_CSE_API_KEY;
  const cx = process.env.GOOGLE_CSE_ID;
  if (!apiKey || !cx) return null;

  try {
    const q = encodeURIComponent(companyName.trim() + " company overview");
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${q}&num=3`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.items || data.items.length === 0) return null;

    const snippets = data.items
      .map((i) => i.snippet)
      .filter(Boolean)
      .join(" | ");

    return { text: snippets, source: "Web Search", url: null };
  } catch (e) {
    console.error("Google CSE error:", e.message);
    return null;
  }
}

// ─── Source 5: Company homepage meta tags (fragile, no key) ──────────────

const COMMON_DOMAIN_TRIES = ["com", "org", "io", "co", "ai"];

export async function researchMetaTags(companyName) {
  try {
    const domain = companyName.toLowerCase().replace(/[^a-z0-9]/g, "");
    for (const tld of COMMON_DOMAIN_TRIES) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const res = await fetch(`https://${domain}.${tld}`, {
          signal: controller.signal,
          headers: { "User-Agent": "CareerDeck/1.0" },
        });
        clearTimeout(timeout);
        if (!res.ok) continue;

        const html = await res.text();
        const match = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
          || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
        if (match) {
          return {
            text: match[1],
            source: "Company Website",
            url: `https://${domain}.${tld}`,
          };
        }
        break;
      } catch { continue; }
    }
    return null;
  } catch (e) {
    console.error("Meta tags error:", e.message);
    return null;
  }
}

// ─── Source 6: Crunchbase (stub — free tier key needed, returns null) ────

export async function researchCrunchbase(companyName) {
  const apiKey = process.env.CRUNCHBASE_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch("https://api.crunchbase.com/api/v4/searches/organizations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-cb-user-key": apiKey,
      },
      body: JSON.stringify({
        field_ids: ["identifier", "short_description", "description", "website_url", "num_employees_enum"],
        query: [{ type: "predicate", field_id: "identifier", operator_id: "contains", values: [companyName] }],
        limit: 1,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const org = data.entities?.[0]?.properties;
    if (!org?.short_description) return null;

    return {
      text: org.short_description,
      source: "Crunchbase",
      url: org.website_url?.value || null,
    };
  } catch (e) {
    console.error("Crunchbase error:", e.message);
    return null;
  }
}
