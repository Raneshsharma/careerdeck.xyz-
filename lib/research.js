// ─── Core SerpAPI search ────────────────────────────────────────────────

async function serpSearch(query, apiKey, timeoutMs = 12000) {
  const params = new URLSearchParams({
    engine: "google",
    q: query,
    num: "2",
    api_key: apiKey,
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`https://serpapi.com/search?${params.toString()}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return [];
    const data = await res.json();
    if (!data.organic_results) return [];

    return data.organic_results.map((r) => ({
      title: r.title || "",
      snippet: r.snippet || "",
      source: r.source || "",
      date: r.date || "",
      link: r.link || "",
    }));
  } catch {
    return [];
  }
}

// ─── Financial data search ──────────────────────────────────────────────

export async function fetchFinancials(companyName) {
  const apiKey = process.env.SERP_API_KEY;
  if (!apiKey) return null;

  const queries = [
    `${companyName} revenue profit 2024 2025 annual results`,
    `${companyName} market cap valuation stock`,
  ];

  const results = await Promise.all(queries.map((q) => serpSearch(q, apiKey)));
  const allSnippets = results.flat();

  if (allSnippets.length === 0) return null;

  return {
    source: "SerpAPI real-time search",
    snippetCount: allSnippets.length,
    data: allSnippets,
  };
}

// ─── Competitor & market share search ────────────────────────────────────

export async function fetchCompetitorData(companyName) {
  const apiKey = process.env.SERP_API_KEY;
  if (!apiKey) return null;

  const queries = [
    `${companyName} competitors comparison market share`,
    `${companyName} market share percentage industry`,
  ];

  const results = await Promise.all(queries.map((q) => serpSearch(q, apiKey)));
  const allSnippets = results.flat();

  if (allSnippets.length === 0) return null;

  return {
    source: "SerpAPI real-time search",
    snippetCount: allSnippets.length,
    data: allSnippets,
  };
}

// ─── Industry data search ───────────────────────────────────────────────

export async function fetchIndustryData(companyName) {
  const apiKey = process.env.SERP_API_KEY;
  if (!apiKey) return null;

  const queries = [
    `${companyName} industry market size growth rate`,
    `${companyName} sector trends outlook 2025`,
  ];

  const results = await Promise.all(queries.map((q) => serpSearch(q, apiKey)));
  const allSnippets = results.flat();

  if (allSnippets.length === 0) return null;

  return {
    source: "SerpAPI real-time search",
    snippetCount: allSnippets.length,
    data: allSnippets,
  };
}

// ─── Company profile search ─────────────────────────────────────────────

export async function fetchCompanyProfile(companyName) {
  const apiKey = process.env.SERP_API_KEY;
  if (!apiKey) return null;

  const queries = [
    `${companyName} founded CEO employees headquarters`,
    `${companyName} business model products services overview`,
  ];

  const results = await Promise.all(queries.map((q) => serpSearch(q, apiKey)));
  const allSnippets = results.flat();

  if (allSnippets.length === 0) return null;

  return {
    source: "SerpAPI real-time search",
    snippetCount: allSnippets.length,
    data: allSnippets,
  };
}

// ─── Salary & compensation search ───────────────────────────────────────

export async function fetchSalaryData(role, companyName = "") {
  const apiKey = process.env.SERP_API_KEY;
  if (!apiKey) return null;

  const companyContext = companyName ? ` at ${companyName}` : "";
  const queries = [
    `${role} salary${companyContext} 2024 2025 compensation`,
  ];

  const results = await Promise.all(queries.map((q) => serpSearch(q, apiKey)));
  const allSnippets = results.flat();

  if (allSnippets.length === 0) return null;

  return {
    source: "SerpAPI real-time search",
    snippetCount: allSnippets.length,
    data: allSnippets,
  };
}

// ─── NEWS SEARCH (30-day / 6-month windows) ─────────────────────────────

export async function fetchCompanyNews(companyName, daysBack = 180) {
  const apiKey = process.env.SERP_API_KEY;
  if (!apiKey) return null;

  const tbsMap = { 30: "qdr:m", 180: "qdr:m6" };
  const tbs = tbsMap[daysBack] || "qdr:m6";
  const params = new URLSearchParams({
    engine: "google",
    q: `${companyName} news`,
    tbs,
    num: "5",
    api_key: apiKey,
  });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(`https://serpapi.com/search?${params.toString()}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.organic_results) return null;
    return data.organic_results.slice(0, 5).map((r) => ({
      title: r.title || "",
      snippet: r.snippet || "",
      source: r.source || "",
      date: r.date || "",
      link: r.link || "",
    }));
  } catch {
    return null;
  }
}

// ─── Full research orchestrator ─────────────────────────────────────────

export async function researchCompany(companyName) {
  const [financials, competitors, industry, profile] = await Promise.all([
    fetchFinancials(companyName),
    fetchCompetitorData(companyName),
    fetchIndustryData(companyName),
    fetchCompanyProfile(companyName),
  ]);

  return { financials, competitors, industry, profile };
}

export async function researchRole(role, companyName = "") {
  const salary = await fetchSalaryData(role, companyName);
  return { salary };
}
