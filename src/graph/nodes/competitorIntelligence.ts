import type { CompanyState } from "../state";
import { researchWikipedia } from "../../research/wikipedia";
import { generateSection } from "../../prompts/llm";

interface CompetitorProfile {
  name: string;
  source: string;
  description: string;
  headquarters: string | null;
  founded: string | null;
  revenue: string | null;
  employees: string | null;
  industry: string | null;
  keyProducts: string[];
  strengths: string[];
  weaknesses: string[];
}

export interface CompetitorIntelligence {
  competitors: CompetitorProfile[];
  researchedAt: string;
}

const COMPETITOR_EXTRACTION_PROMPT = `You are a competitive intelligence analyst. Given the company knowledge base, extract a list of COMPETITOR NAMES only.

Return ONLY valid JSON:
{
  "competitor_names": ["Competitor1", "Competitor2"],
  "source": "kb | industry-inferred"
}

Rules:
- Use only named competitors found in the KB data below
- If the KB explicitly names competitors, extract them
- If no competitors are named, use industry context to suggest up to 3 LIKELY competitors
- Tag source as "kb" if explicitly named, "industry-inferred" if inferred from industry context
- Never fabricate competitor names out of thin air`;

export async function competitorIntelligenceNode(
  state: CompanyState,
): Promise<Partial<CompanyState>> {
  const knowledge = state.knowledge.knowledgeBase;
  const companyName = state.normalizedCompanyName || state.companyName;

  if (!knowledge) {
    return { errors: ["Competitor intelligence: No knowledge base available"] };
  }

  try {
    // Step 1: Extract competitor names from KB
    const kbSummary = JSON.stringify({
      industry: knowledge.financials?.industry?.value,
      sector: knowledge.financials?.sector?.value,
      businessSegments: knowledge.business?.businessSegments?.value,
      products: knowledge.products?.items?.value,
      description: knowledge.company?.description?.value,
      recentNews: knowledge.news?.slice(0, 5).map((n: { title: string }) => n.title),
    }, null, 2);

    const rawNames = await generateSection(
      COMPETITOR_EXTRACTION_PROMPT,
      `Extract competitor names from this company's KB:\n\n${kbSummary}\n\nCompany: ${companyName}`,
    );

    let competitorNames: string[] = [];
    try {
      const jsonMatch = rawNames.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        competitorNames = parsed.competitor_names ?? [];
      }
    } catch {
      // fallback
    }

    if (competitorNames.length === 0) {
      return { errors: ["Competitor intelligence: No competitor names extracted"] };
    }

    // Step 2: Research each competitor via Wikipedia
    const profiles: CompetitorProfile[] = [];
    for (const name of competitorNames.slice(0, 5)) {
      try {
        const wiki = await researchWikipedia(name);
        const data = wiki?.data;
        profiles.push({
          name,
          source: wiki?.success ? "wikipedia" : "kb-only",
          description: data?.extract?.slice(0, 500) ?? "",
          headquarters: null,
          founded: null,
          revenue: null,
          employees: null,
          industry: null,
          keyProducts: [],
          strengths: [],
          weaknesses: [],
        });
      } catch {
        profiles.push({
          name, source: "kb-only", description: "", headquarters: null,
          founded: null, revenue: null, employees: null, industry: null,
          keyProducts: [], strengths: [], weaknesses: [],
        });
      }
    }

    return {
      competitorIntelligence: {
        competitors: profiles,
        researchedAt: new Date().toISOString(),
      },
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { errors: [`Competitor intelligence failed: ${msg}`] };
  }
}
