import {
  researchWikipedia,
  researchDuckDuckGo,
  researchGNews,
  researchGoogleCSE,
  researchMetaTags,
  researchCrunchbase,
} from "./research-sources";

export async function researchCompany(companyName, jd) {
  const sources = [];
  let text = "";

  if (jd && jd.trim()) {
    text = jd.trim();
    sources.push({ source: "User Research", text: jd.trim(), url: null });
  }

  const fetchers = [
    researchWikipedia,
    researchDuckDuckGo,
    researchGNews,
    researchGoogleCSE,
    researchMetaTags,
    researchCrunchbase,
  ];

  for (const fn of fetchers) {
    if (text.length > 3000) break;
    try {
      const r = await fn(companyName);
      if (r?.text && r.text.trim()) {
        text += "\n\n" + r.text.trim();
        sources.push(r);
      }
    } catch (e) {
      console.error(`Research source ${fn.name} error:`, e.message);
    }
  }

  return { text, sources };
}
