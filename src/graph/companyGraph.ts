import { StateGraph, START, END } from "@langchain/langgraph";
import { CompanyStateAnnotation } from "./state";
import { validateCompanyNode } from "./nodes/validateCompany";
import { normalizeCompanyNameNode } from "./nodes/normalizeCompanyName";
import { wikipediaResearchNode } from "./nodes/wikipediaResearch";
import { googleSearchNode } from "./nodes/googleSearch";
import { yahooFinanceNode } from "./nodes/yahooFinance";
import { gnewsNode } from "./nodes/gnews";
import { duckduckgoNode } from "./nodes/duckduckgo";
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
// Section generators
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
// Section reviewers
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
import { routeAfterValidation } from "./edges/conditional";

/**
 * 6-layer architecture — every section: Write → Edit → Done
 */
export const companyGraph = new StateGraph(CompanyStateAnnotation)
  // Layer 1
  .addNode("validateCompany", validateCompanyNode)
  .addNode("normalizeCompanyName", normalizeCompanyNameNode)
  .addEdge(START, "validateCompany")
  .addConditionalEdges("validateCompany", routeAfterValidation, {
    __end__: END,
    normalizeCompanyName: "normalizeCompanyName",
  })

  // Layer 2
  .addNode("wikipedia", wikipediaResearchNode)
  .addNode("google", googleSearchNode)
  .addNode("yahoo", yahooFinanceNode)
  .addNode("gnews", gnewsNode)
  .addNode("duckduckgo", duckduckgoNode)
  .addNode("websiteDiscovery", websiteDiscoveryNode)
  .addNode("websiteFetch", websiteFetchNode)
  .addNode("mergeResearch", mergeResearchNode)
  .addEdge("normalizeCompanyName", "wikipedia")
  .addEdge("normalizeCompanyName", "google")
  .addEdge("normalizeCompanyName", "yahoo")
  .addEdge("normalizeCompanyName", "gnews")
  .addEdge("normalizeCompanyName", "duckduckgo")
  .addEdge("google", "websiteDiscovery")
  .addEdge("websiteDiscovery", "websiteFetch")
  .addEdge("wikipedia", "mergeResearch")
  .addEdge("websiteFetch", "mergeResearch")
  .addEdge("yahoo", "mergeResearch")
  .addEdge("gnews", "mergeResearch")
  .addEdge("duckduckgo", "mergeResearch")

  // Layer 3
  .addNode("wikipediaExtraction", wikipediaExtractionNode)
  .addNode("googleExtraction", googleExtractionNode)
  .addNode("yahooExtraction", yahooExtractionNode)
  .addNode("gnewsExtraction", gnewsExtractionNode)
  .addNode("duckduckgoExtraction", duckduckgoExtractionNode)
  .addNode("websiteExtraction", websiteExtractionNode)
  .addNode("mergeExtractedFacts", mergeExtractedFactsNode)
  .addEdge("mergeResearch", "wikipediaExtraction")
  .addEdge("mergeResearch", "googleExtraction")
  .addEdge("mergeResearch", "yahooExtraction")
  .addEdge("mergeResearch", "gnewsExtraction")
  .addEdge("mergeResearch", "duckduckgoExtraction")
  .addEdge("mergeResearch", "websiteExtraction")
  .addEdge("wikipediaExtraction", "mergeExtractedFacts")
  .addEdge("googleExtraction", "mergeExtractedFacts")
  .addEdge("yahooExtraction", "mergeExtractedFacts")
  .addEdge("gnewsExtraction", "mergeExtractedFacts")
  .addEdge("duckduckgoExtraction", "mergeExtractedFacts")
  .addEdge("websiteExtraction", "mergeExtractedFacts")

  // Layer 4
  .addNode("resolveConflicts", resolveConflictsNode)
  .addNode("buildKnowledge", buildKnowledgeNode)
  .addEdge("mergeExtractedFacts", "resolveConflicts")
  .addEdge("resolveConflicts", "buildKnowledge")

  // Layer 5: 13 writers
  .addNode("genCompanyOverview", generateCompanyOverview)
  .addNode("genWhyExists", generateWhyExists)
  .addNode("genBusinessModel", generateBusinessModel)
  .addNode("genProducts", generateProducts)
  .addNode("genJourney", generateJourney)
  .addNode("genIndustry", generateIndustry)
  .addNode("genCompetitors", generateCompetitors)
  .addNode("genMoat", generateMoat)
  .addNode("genFinancials", generateFinancials)
  .addNode("genStrategy", generateStrategy)
  .addNode("genCulture", generateCulture)
  .addNode("genEmployeeInsights", generateEmployeeInsights)
  .addNode("genInterviewQuestions", generateInterviewQuestions)
  .addEdge("buildKnowledge", "genCompanyOverview")
  .addEdge("buildKnowledge", "genWhyExists")
  .addEdge("buildKnowledge", "genBusinessModel")
  .addEdge("buildKnowledge", "genProducts")
  .addEdge("buildKnowledge", "genJourney")
  .addEdge("buildKnowledge", "genIndustry")
  .addEdge("buildKnowledge", "genCompetitors")
  .addEdge("buildKnowledge", "genMoat")
  .addEdge("buildKnowledge", "genFinancials")
  .addEdge("buildKnowledge", "genStrategy")
  .addEdge("buildKnowledge", "genCulture")
  .addEdge("buildKnowledge", "genEmployeeInsights")
  .addEdge("buildKnowledge", "genInterviewQuestions")

  // Layer 6: 13 editors
  .addNode("reviewCompanyOverview", reviewCompanyOverview)
  .addNode("reviewWhyExists", reviewWhyExists)
  .addNode("reviewBusinessModel", reviewBusinessModel)
  .addNode("reviewProducts", reviewProducts)
  .addNode("reviewJourney", reviewJourney)
  .addNode("reviewIndustry", reviewIndustry)
  .addNode("reviewCompetitors", reviewCompetitors)
  .addNode("reviewMoat", reviewMoat)
  .addNode("reviewFinancials", reviewFinancials)
  .addNode("reviewStrategy", reviewStrategy)
  .addNode("reviewCulture", reviewCulture)
  .addNode("reviewEmployeeInsights", reviewEmployeeInsights)
  .addNode("reviewInterviewQuestions", reviewInterviewQuestions)
  .addEdge("genCompanyOverview", "reviewCompanyOverview")
  .addEdge("genWhyExists", "reviewWhyExists")
  .addEdge("genBusinessModel", "reviewBusinessModel")
  .addEdge("genProducts", "reviewProducts")
  .addEdge("genJourney", "reviewJourney")
  .addEdge("genIndustry", "reviewIndustry")
  .addEdge("genCompetitors", "reviewCompetitors")
  .addEdge("genMoat", "reviewMoat")
  .addEdge("genFinancials", "reviewFinancials")
  .addEdge("genStrategy", "reviewStrategy")
  .addEdge("genCulture", "reviewCulture")
  .addEdge("genEmployeeInsights", "reviewEmployeeInsights")
  .addEdge("genInterviewQuestions", "reviewInterviewQuestions")
  .addEdge("reviewCompanyOverview", END)
  .addEdge("reviewWhyExists", END)
  .addEdge("reviewBusinessModel", END)
  .addEdge("reviewProducts", END)
  .addEdge("reviewJourney", END)
  .addEdge("reviewIndustry", END)
  .addEdge("reviewCompetitors", END)
  .addEdge("reviewMoat", END)
  .addEdge("reviewFinancials", END)
  .addEdge("reviewStrategy", END)
  .addEdge("reviewCulture", END)
  .addEdge("reviewEmployeeInsights", END)
  .addEdge("reviewInterviewQuestions", END)
  .compile();

export type CompanyGraph = typeof companyGraph;
