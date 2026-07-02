import { StateGraph, START, END } from "@langchain/langgraph";
import { CompanyStateAnnotation } from "./state";
import { linkedinIntelligenceNode } from "./nodes/linkedinIntelligenceNode";
import { brandIntelligenceNode } from "./nodes/brandIntelligenceNode";
import { recruiterIntelligenceNode } from "./nodes/recruiterIntelligenceNode";
import { linkedinOptimizationNode } from "./nodes/linkedinOptimizationNode";
import { networkingCareerNode } from "./nodes/networkingCareerNode";
import { generateSection } from "../prompts/llm";
import { buildLinkedInWriterPrompt, LINKEDIN_SECTION_IDS } from "../prompts/linkedinSections";
import { UNIVERSAL_MASTER_PROMPT, DOMAIN_MASTER_PROMPTS } from "../prompts/masterPrompt";

function createLinkedInSectionNode(sectionId: string) {
  return async (state: any) => {
    const domainMasterPrompt = DOMAIN_MASTER_PROMPTS["resume"] || ""; // reuse consulting quality rules
    const fullMasterSystemPrompt = `${UNIVERSAL_MASTER_PROMPT}\n\n${domainMasterPrompt}`;

    try {
      const { systemPrompt: writerSys, userPrompt: writerUser } =
        buildLinkedInWriterPrompt(sectionId, state);
      const fullWriterSys = `${fullMasterSystemPrompt}\n\n${writerSys}`;
      const content = await generateSection(fullWriterSys, writerUser);
      return { generatedSections: { [sectionId]: content } };
    } catch (e: any) {
      console.error(`[LinkedIn Section Node: ${sectionId}] failed:`, e);
      return {
        generatedSections: { [sectionId]: `Failed to generate ${sectionId}.` },
        errors: [`${sectionId} generation failed: ${e.message}`],
      };
    }
  };
}

const g = new StateGraph(CompanyStateAnnotation) as any;

// ── 5 Sequential Intelligence Engines ─────────────────────────────────────
g.addNode("linkedinIntelligenceEngine", linkedinIntelligenceNode);
g.addNode("brandIntelligenceEngine", brandIntelligenceNode);
g.addNode("recruiterIntelligenceEngine", recruiterIntelligenceNode);
g.addNode("linkedinOptimizationEngine", linkedinOptimizationNode);
g.addNode("networkingCareerEngine", networkingCareerNode);

// Connect engines sequentially
g.addEdge(START, "linkedinIntelligenceEngine");
g.addEdge("linkedinIntelligenceEngine", "brandIntelligenceEngine");
g.addEdge("brandIntelligenceEngine", "recruiterIntelligenceEngine");
g.addEdge("recruiterIntelligenceEngine", "linkedinOptimizationEngine");
g.addEdge("linkedinOptimizationEngine", "networkingCareerEngine");

// ── 18 Parallel Section Nodes ──────────────────────────────────────────────
LINKEDIN_SECTION_IDS.forEach((s) => {
  g.addNode(s, createLinkedInSectionNode(s));
  g.addEdge("networkingCareerEngine", s);
  g.addEdge(s, END);
});

export const linkedinGraph = g.compile();
export type LinkedInGraph = typeof linkedinGraph;
