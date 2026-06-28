import type { DuckDuckGoResult } from "../research/types";
import type { ExtractedDuckDuckGo } from "./types";

const ENTITY_HINTS: Record<string, string> = {
  inc: "Corporation",
  corp: "Corporation",
  corporation: "Corporation",
  llc: "Company",
  ltd: "Company",
  limited: "Company",
  plc: "Company",
  gmbh: "Company",
  university: "Educational Institution",
  college: "Educational Institution",
  institute: "Organization",
  foundation: "Foundation",
  nonprofit: "Nonprofit",
  "non-profit": "Nonprofit",
  ngo: "Nonprofit",
  association: "Association",
  venture: "Venture Capital",
  capital: "Financial",
  partners: "Partnership",
  bank: "Financial Institution",
  hospital: "Healthcare",
  clinic: "Healthcare",
  media: "Media",
  entertainment: "Entertainment",
  studios: "Entertainment",
  labs: "Technology",
  technologies: "Technology",
  software: "Technology",
  networks: "Technology",
  pharmaceuticals: "Pharmaceuticals",
  pharma: "Pharmaceuticals",
  energy: "Energy",
  oil: "Energy",
  gas: "Energy",
  mining: "Mining",
  airlines: "Transportation",
  automotive: "Automotive",
  motors: "Automotive",
  insurance: "Insurance",
  hotels: "Hospitality",
  restaurants: "Hospitality",
  retail: "Retail",
  stores: "Retail",
};

function detectEntityType(heading: string, abstract: string): string | null {
  const lower = (heading + " " + abstract).toLowerCase();
  for (const [hint, entityType] of Object.entries(ENTITY_HINTS)) {
    if (lower.includes(hint)) return entityType;
  }
  return null;
}

export function extractDuckDuckGoFacts(result: DuckDuckGoResult): ExtractedDuckDuckGo {
  return {
    description: result.abstractText || null,
    officialWebsite: result.abstractUrl ?? null,
    entityType: detectEntityType(result.heading, result.abstractText),
  };
}
