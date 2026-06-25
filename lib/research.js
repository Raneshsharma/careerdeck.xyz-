// ─── Wikipedia research (free, no API key) ──────────────────────────────

export async function researchCompanyWikipedia(companyName) {
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
      title: page.title || bestTitle,
      extract: page.extract,
      pageUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title || bestTitle)}`,
    };
  } catch (e) {
    console.error("Wikipedia research error:", e.message);
    return null;
  }
}
