import { StateGraph, START, END } from "@langchain/langgraph";
import { CompanyStateAnnotation } from "./state";
import { resumeIntelligenceNode } from "./nodes/resumeIntelligenceNode";
import { matchingIntelligenceNode } from "./nodes/matchingIntelligenceNode";
import { optimizationIntelligenceNode } from "./nodes/optimizationIntelligenceNode";
import { hiringIntelligenceNode } from "./nodes/hiringIntelligenceNode";
import { careerIntelligenceNode } from "./nodes/careerIntelligenceNode";
import { generateSection } from "../prompts/llm";
import { buildResumeWriterPrompt, RESUME_SECTION_IDS } from "../prompts/resumeSections";
import { UNIVERSAL_MASTER_PROMPT, DOMAIN_MASTER_PROMPTS } from "../prompts/masterPrompt";

function createResumeSectionNode(sectionId: string) {
  return async (state: any) => {
    const companyName = state.companyName || "";
    const roleTitle = state.role || "Target Role";

    const domainMasterPrompt = DOMAIN_MASTER_PROMPTS["resume"] || "";
    const fullMasterSystemPrompt = `${UNIVERSAL_MASTER_PROMPT}\n\n${domainMasterPrompt}`;

    try {
      // Direct Writer Pass
      const { systemPrompt: writerSys, userPrompt: writerUser } =
        buildResumeWriterPrompt(sectionId, state, companyName, roleTitle);
      const fullWriterSys = `${fullMasterSystemPrompt}\n\n${writerSys}`;
      const content = await generateSection(fullWriterSys, writerUser);

      return { generatedSections: { [sectionId]: content } };
    } catch (e: any) {
      console.error(`[Resume Section Node: ${sectionId}] failed:`, e);
      return {
        generatedSections: { [sectionId]: `Failed to generate ${sectionId}.` },
        errors: [`${sectionId} generation failed: ${e.message}`]
      };
    }
  };
}

const g = new StateGraph(CompanyStateAnnotation) as any;

// Add 5 Sequential Intelligence Engines
g.addNode("resumeIntelligenceEngine", resumeIntelligenceNode);
g.addNode("matchingIntelligenceEngine", matchingIntelligenceNode);
g.addNode("optimizationIntelligenceEngine", optimizationIntelligenceNode);
g.addNode("hiringIntelligenceEngine", hiringIntelligenceNode);
g.addNode("careerIntelligenceEngine", careerIntelligenceNode);

// Connect Engines sequentially
g.addEdge(START, "resumeIntelligenceEngine");
g.addEdge("resumeIntelligenceEngine", "matchingIntelligenceEngine");
g.addEdge("matchingIntelligenceEngine", "optimizationIntelligenceEngine");
g.addEdge("optimizationIntelligenceEngine", "hiringIntelligenceEngine");
g.addEdge("hiringIntelligenceEngine", "careerIntelligenceEngine");

// Connect from Career Intelligence to 25 parallel section nodes
RESUME_SECTION_IDS.forEach((s) => {
  g.addNode(s, createResumeSectionNode(s));
  g.addEdge("careerIntelligenceEngine", s);
  g.addEdge(s, END);
});

export const resumeGraph = g.compile();
export type ResumeGraph = typeof resumeGraph;
