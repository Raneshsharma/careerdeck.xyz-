/**
 * Section → Domain dependency map.
 * Each section depends on specific knowledge domains.
 * If any dependent domain's version changes, the section must be regenerated.
 */

export type DomainName =
  | "company"
  | "leadership"
  | "financials"
  | "products"
  | "industry"
  | "culture"
  | "news"
  | "mission"
  | "business"
  | "history";

export interface SectionDependency {
  sectionId: string;
  sectionName: string;
  dependsOn: DomainName[];
}

export const SECTION_DEPENDENCIES: SectionDependency[] = [
  {
    sectionId: "companyOverview",
    sectionName: "Company in One Minute",
    dependsOn: ["company", "leadership", "financials"],
  },
  {
    sectionId: "whyExists",
    sectionName: "Why It Exists",
    dependsOn: ["company", "mission", "history"],
  },
  {
    sectionId: "businessModel",
    sectionName: "Business Model",
    dependsOn: ["products", "business", "financials"],
  },
  {
    sectionId: "products",
    sectionName: "Products & Services",
    dependsOn: ["products"],
  },
  {
    sectionId: "journey",
    sectionName: "Company Journey",
    dependsOn: ["company", "history"],
  },
  {
    sectionId: "industry",
    sectionName: "Industry Overview",
    dependsOn: ["industry", "company"],
  },
  {
    sectionId: "competitors",
    sectionName: "Competitor Analysis",
    dependsOn: ["products", "industry"],
  },
  {
    sectionId: "moat",
    sectionName: "Competitive Advantage (Moat)",
    dependsOn: ["products", "business", "industry"],
  },
  {
    sectionId: "financials",
    sectionName: "Financial Health",
    dependsOn: ["financials"],
  },
  {
    sectionId: "strategy",
    sectionName: "Strategic Priorities",
    dependsOn: ["financials", "industry", "news", "business"],
  },
  {
    sectionId: "culture",
    sectionName: "Culture & Work Style",
    dependsOn: ["culture", "mission"],
  },
  {
    sectionId: "employeeInsights",
    sectionName: "Employee Insights",
    dependsOn: ["culture", "leadership"],
  },
  {
    sectionId: "interviewQuestions",
    sectionName: "Interview Questions",
    dependsOn: [
      "company",
      "leadership",
      "financials",
      "products",
      "industry",
      "news",
      "business",
      "history",
    ],
  },
];

export function getDependentSections(
  changedDomains: DomainName[],
): string[] {
  const affected = new Set<string>();
  for (const dep of SECTION_DEPENDENCIES) {
    if (dep.dependsOn.some((d) => changedDomains.includes(d))) {
      affected.add(dep.sectionId);
    }
  }
  return [...affected];
}

export function getSectionDependency(
  sectionId: string,
): SectionDependency | undefined {
  return SECTION_DEPENDENCIES.find((s) => s.sectionId === sectionId);
}
