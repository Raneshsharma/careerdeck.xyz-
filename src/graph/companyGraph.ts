import { StateGraph, START, END } from "@langchain/langgraph";
import { CompanyStateAnnotation } from "./state";
import { validateCompanyNode } from "./nodes/validateCompany";
import { normalizeCompanyNameNode } from "./nodes/normalizeCompanyName";
import { wikipediaResearchNode } from "./nodes/wikipediaResearch";
import { googleSearchNode } from "./nodes/googleSearch";
import { yahooFinanceNode } from "./nodes/yahooFinance";
import { gnewsNode } from "./nodes/gnews";
import { duckduckgoNode } from "./nodes/duckduckgo";
import { googleNewsRssNode } from "./nodes/googleNewsRss";
import { secEdgarNode } from "./nodes/secEdgarResearch";
import { websiteDiscoveryNode } from "./nodes/websiteDiscovery";
import { websiteFetchNode } from "./nodes/websiteFetch";
import { mergeResearchNode } from "./nodes/mergeResearch";
import { wikipediaExtractionNode } from "./nodes/wikipediaExtraction";
import { googleExtractionNode } from "./nodes/googleExtraction";
import { yahooExtractionNode } from "./nodes/yahooExtraction";
import { gnewsExtractionNode } from "./nodes/gnewsExtraction";
import { duckduckgoExtractionNode } from "./nodes/duckduckgoExtraction";
import { websiteExtractionNode } from "./nodes/websiteExtraction";
import { mergeExtractedFactsNode } from "./nodes/mergeExtractedFacts";
import { resolveConflictsNode } from "./nodes/resolveConflicts";
import { buildKnowledgeNode } from "./nodes/buildKnowledge";
import { generateCompanyOverview } from "./nodes/genCompanyOverview";
import { generateWhyExists } from "./nodes/genWhyExists";
import { generateBusinessModel } from "./nodes/genBusinessModel";
import { generateProducts } from "./nodes/genProducts";
import { generateJourney } from "./nodes/genJourney";
import { generateIndustry } from "./nodes/genIndustry";
import { generateCompetitors } from "./nodes/genCompetitors";
import { generateMoat } from "./nodes/genMoat";
import { generateFinancials } from "./nodes/genFinancials";
import { generateStrategy } from "./nodes/genStrategy";
import { generateCulture } from "./nodes/genCulture";
import { generateEmployeeInsights } from "./nodes/genEmployeeInsights";
import { generateInterviewQuestions } from "./nodes/genInterviewQuestions";
import { reviewCompanyOverview } from "./nodes/reviewCompanyOverview";
import { reviewWhyExists } from "./nodes/reviewWhyExists";
import { reviewBusinessModel } from "./nodes/reviewBusinessModel";
import { reviewProducts } from "./nodes/reviewProducts";
import { reviewJourney } from "./nodes/reviewJourney";
import { reviewIndustry } from "./nodes/reviewIndustry";
import { reviewCompetitors } from "./nodes/reviewCompetitors";
import { reviewMoat } from "./nodes/reviewMoat";
import { reviewFinancials } from "./nodes/reviewFinancials";
import { reviewStrategy } from "./nodes/reviewStrategy";
import { reviewCulture } from "./nodes/reviewCulture";
import { reviewEmployeeInsights } from "./nodes/reviewEmployeeInsights";
import { reviewInterviewQuestions } from "./nodes/reviewInterviewQuestions";
import { generateExecutiveSummary } from "./nodes/genExecutiveSummary";
import { generateSWOT } from "./nodes/genSWOT";
import { generatePortersFiveForces } from "./nodes/genPortersFiveForces";
import { generateInterviewPlaybook } from "./nodes/genInterviewPlaybook";
import { extractCoreFactsNode } from "./nodes/extractCoreFacts";
import { finalReportValidatorNode } from "./nodes/finalReportValidator";
import { routeAfterValidation } from "./edges/conditional";
import { competitorIntelligenceNode } from "./nodes/competitorIntelligence";

/**
 * 6-layer architecture + 4 premium synthesis modules.
 * Graph has 50+ nodes — uses mutable builder pattern to avoid
 * TypeScript type instantiation depth limit from chaining.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = new StateGraph(CompanyStateAnnotation) as any;

// Layer 1: Validation & Normalization
g.addNode("validateCompany", validateCompanyNode);
g.addNode("normalizeCompanyName", normalizeCompanyNameNode);
g.addEdge(START, "validateCompany");
g.addConditionalEdges("validateCompany", routeAfterValidation, { __end__: END, normalizeCompanyName: "normalizeCompanyName" });

// Layer 2: Research
for (const n of ["wikipedia","google","yahoo","gnews","duckduckgo","websiteDiscovery","websiteFetch","mergeResearch","googleNewsRss","secEdgar"]) {
  g.addNode(n, {wikipedia: wikipediaResearchNode, google: googleSearchNode, yahoo: yahooFinanceNode, gnews: gnewsNode, duckduckgo: duckduckgoNode, websiteDiscovery: websiteDiscoveryNode, websiteFetch: websiteFetchNode, mergeResearch: mergeResearchNode, googleNewsRss: googleNewsRssNode, secEdgar: secEdgarNode}[n]);
}
for (const n of ["wikipedia","google","yahoo","gnews","duckduckgo","googleNewsRss","secEdgar"]) g.addEdge("normalizeCompanyName", n);
g.addEdge("google", "websiteDiscovery");
g.addEdge("websiteDiscovery", "websiteFetch");
for (const n of ["wikipedia","websiteFetch","yahoo","gnews","duckduckgo","googleNewsRss","secEdgar"]) g.addEdge(n, "mergeResearch");

// Layer 3: Extraction
for (const n of ["wikipediaExtraction","googleExtraction","yahooExtraction","gnewsExtraction","duckduckgoExtraction","websiteExtraction","mergeExtractedFacts"]) {
  g.addNode(n, {wikipediaExtraction: wikipediaExtractionNode, googleExtraction: googleExtractionNode, yahooExtraction: yahooExtractionNode, gnewsExtraction: gnewsExtractionNode, duckduckgoExtraction: duckduckgoExtractionNode, websiteExtraction: websiteExtractionNode, mergeExtractedFacts: mergeExtractedFactsNode}[n]);
}
for (const n of ["wikipediaExtraction","googleExtraction","yahooExtraction","gnewsExtraction","duckduckgoExtraction","websiteExtraction"]) {
  g.addEdge("mergeResearch", n);
  g.addEdge(n, "mergeExtractedFacts");
}

// Layer 4: Knowledge Resolution
g.addNode("resolveConflicts", resolveConflictsNode);
g.addNode("buildKnowledge", buildKnowledgeNode);
g.addNode("extractCoreFacts", extractCoreFactsNode);
g.addEdge("mergeExtractedFacts", "resolveConflicts");
g.addEdge("resolveConflicts", "buildKnowledge");
g.addEdge("buildKnowledge", "extractCoreFacts");

// Layer 5: 13 Section Generators + Competitor Intelligence
const sections = ["genCompanyOverview","genWhyExists","genBusinessModel","genProducts","genJourney","genIndustry","genCompetitors","genMoat","genFinancials","genStrategy","genCulture","genEmployeeInsights","genInterviewQuestions"];
const genNodes = [generateCompanyOverview, generateWhyExists, generateBusinessModel, generateProducts, generateJourney, generateIndustry, generateCompetitors, generateMoat, generateFinancials, generateStrategy, generateCulture, generateEmployeeInsights, generateInterviewQuestions];
sections.forEach((n, i) => { g.addNode(n, genNodes[i]); g.addEdge("extractCoreFacts", n); });

// Competitor Intelligence — researches named competitors via Wikipedia (runs in parallel with generators)
g.addNode("competitorIntel", competitorIntelligenceNode);
g.addEdge("extractCoreFacts", "competitorIntel");

// Layer 6: 13 Reviewers
const reviews = ["reviewCompanyOverview","reviewWhyExists","reviewBusinessModel","reviewProducts","reviewJourney","reviewIndustry","reviewCompetitors","reviewMoat","reviewFinancials","reviewStrategy","reviewCulture","reviewEmployeeInsights","reviewInterviewQuestions"];
const revNodes = [reviewCompanyOverview, reviewWhyExists, reviewBusinessModel, reviewProducts, reviewJourney, reviewIndustry, reviewCompetitors, reviewMoat, reviewFinancials, reviewStrategy, reviewCulture, reviewEmployeeInsights, reviewInterviewQuestions];
reviews.forEach((n, i) => { g.addNode(n, revNodes[i]); g.addEdge(sections[i], n); });

// Final Report Validator — all reviewers + competitorIntel converge here
g.addNode("finalValidator", finalReportValidatorNode);
reviews.forEach((n) => g.addEdge(n, "finalValidator"));
g.addEdge("competitorIntel", "finalValidator");
g.addEdge("finalValidator", END);

// Premium Synthesis Modules
const premium = ["genExecutiveSummary","genSWOT","genPortersFiveForces","genInterviewPlaybook"];
const premNodes = [generateExecutiveSummary, generateSWOT, generatePortersFiveForces, generateInterviewPlaybook];
premium.forEach((n, i) => { g.addNode(n, premNodes[i]); g.addEdge("extractCoreFacts", n); g.addEdge(n, END); });

export const companyGraph = g.compile();
export type CompanyGraph = typeof companyGraph;
