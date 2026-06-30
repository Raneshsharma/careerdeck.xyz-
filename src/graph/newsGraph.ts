import { StateGraph, START, END } from "@langchain/langgraph";
import { CompanyStateAnnotation } from "./state";
import { extractNewsFactsNode } from "./nodes/extractNewsFacts";
import { generateSection } from "../prompts/llm";
import { buildNewsAnalystPrompt, buildNewsWriterPrompt, NEWS_SECTION_IDS } from "../prompts/newsSections";
import { UNIVERSAL_MASTER_PROMPT, DOMAIN_MASTER_PROMPTS } from "../prompts/masterPrompt";

function createNewsSectionNode(sectionId: string) {
  return async (state: any) => {
    const newsFacts = state.newsFacts;
    const companyName = state.companyName || "";
    const roleTitle = state.role || "";

    const domainMasterPrompt = DOMAIN_MASTER_PROMPTS["news"] || "";
    const fullMasterSystemPrompt = `${UNIVERSAL_MASTER_PROMPT}\n\n${domainMasterPrompt}`;

    try {
      // Pass 1: Analyst
      const { systemPrompt: analystSys, userPrompt: analystUser } =
        buildNewsAnalystPrompt(sectionId, newsFacts, companyName, roleTitle);
      const fullAnalystSys = `${fullMasterSystemPrompt}\n\n${analystSys}`;
      const analystRaw = await generateSection(fullAnalystSys, analystUser);

      let analysis: any = {};
      try {
        const jsonMatch = analystRaw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0]);
        } else {
          analysis = { raw: analystRaw };
        }
      } catch {
        analysis = { raw: analystRaw };
      }

      // Pass 2: Writer
      const { systemPrompt: writerSys, userPrompt: writerUser } =
        buildNewsWriterPrompt(sectionId, analysis, companyName, roleTitle);
      const fullWriterSys = `${fullMasterSystemPrompt}\n\n${writerSys}`;
      const content = await generateSection(fullWriterSys, writerUser);

      return { generatedSections: { [sectionId]: content } };
    } catch (e: any) {
      console.error(`[News Section Node: ${sectionId}] failed:`, e);
      return {
        generatedSections: { [sectionId]: `Failed to generate ${sectionId}.` },
        errors: [`${sectionId} generation failed: ${e.message}`]
      };
    }
  };
}

const g = new StateGraph(CompanyStateAnnotation) as any;

g.addNode("extractNewsFacts", extractNewsFactsNode);
g.addEdge(START, "extractNewsFacts");

NEWS_SECTION_IDS.forEach((s) => {
  g.addNode(s, createNewsSectionNode(s));
  g.addEdge("extractNewsFacts", s);
  g.addEdge(s, END);
});

export const newsGraph = g.compile();
export type NewsGraph = typeof newsGraph;
