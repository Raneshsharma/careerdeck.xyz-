import { StateGraph, START, END } from "@langchain/langgraph";
import { CompanyStateAnnotation } from "./state";
import { extractJDFactsNode } from "./nodes/extractJDFacts";
import { generateSection } from "../prompts/llm";
import { buildJDAnalystPrompt, buildJDWriterPrompt, JD_SECTION_IDS } from "../prompts/jdSections";
import { UNIVERSAL_MASTER_PROMPT, DOMAIN_MASTER_PROMPTS } from "../prompts/masterPrompt";

function createJDSectionNode(sectionId: string) {
  return async (state: any) => {
    const jdFacts = state.jdFacts;
    const companyName = state.companyName || "";
    const roleTitle = state.role || "Product Manager";

    const domainMasterPrompt = DOMAIN_MASTER_PROMPTS["jd"] || "";
    const fullMasterSystemPrompt = `${UNIVERSAL_MASTER_PROMPT}\n\n${domainMasterPrompt}`;

    try {
      // Pass 1: Analyst
      const { systemPrompt: analystSys, userPrompt: analystUser } =
        buildJDAnalystPrompt(sectionId, jdFacts, companyName, roleTitle);
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
        buildJDWriterPrompt(sectionId, analysis, companyName, roleTitle);
      const fullWriterSys = `${fullMasterSystemPrompt}\n\n${writerSys}`;
      const content = await generateSection(fullWriterSys, writerUser);

      return { generatedSections: { [sectionId]: content } };
    } catch (e: any) {
      console.error(`[JD Section Node: ${sectionId}] failed:`, e);
      return {
        generatedSections: { [sectionId]: `Failed to generate ${sectionId}.` },
        errors: [`${sectionId} generation failed: ${e.message}`]
      };
    }
  };
}

const g = new StateGraph(CompanyStateAnnotation) as any;

g.addNode("extractJDFacts", extractJDFactsNode);
g.addEdge(START, "extractJDFacts");

JD_SECTION_IDS.forEach((s) => {
  g.addNode(s, createJDSectionNode(s));
  g.addEdge("extractJDFacts", s);
  g.addEdge(s, END);
});

export const jdGraph = g.compile();
export type JDGraph = typeof jdGraph;
