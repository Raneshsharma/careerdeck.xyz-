import { StateGraph, START, END } from "@langchain/langgraph";
import { CompanyStateAnnotation } from "./state";
import { extractResumeFactsNode } from "./nodes/extractResumeFacts";
import { generateSection } from "../prompts/llm";
import { buildResumeAnalystPrompt, buildResumeWriterPrompt, RESUME_SECTION_IDS } from "../prompts/resumeSections";
import { UNIVERSAL_MASTER_PROMPT, DOMAIN_MASTER_PROMPTS } from "../prompts/masterPrompt";

function createResumeSectionNode(sectionId: string) {
  return async (state: any) => {
    const resumeFacts = state.resumeFacts;
    const companyName = state.companyName || "";
    const roleTitle = state.role || "Target Candidate";
    const jdText = state.jobDescription || "";

    const domainMasterPrompt = DOMAIN_MASTER_PROMPTS["resume"] || "";
    const fullMasterSystemPrompt = `${UNIVERSAL_MASTER_PROMPT}\n\n${domainMasterPrompt}`;

    try {
      // Pass 1: Analyst
      const { systemPrompt: analystSys, userPrompt: analystUser } =
        buildResumeAnalystPrompt(sectionId, resumeFacts, companyName, roleTitle, jdText);
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
        buildResumeWriterPrompt(sectionId, analysis, companyName, roleTitle);
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

g.addNode("extractResumeFacts", extractResumeFactsNode);
g.addEdge(START, "extractResumeFacts");

RESUME_SECTION_IDS.forEach((s) => {
  g.addNode(s, createResumeSectionNode(s));
  g.addEdge("extractResumeFacts", s);
  g.addEdge(s, END);
});

export const resumeGraph = g.compile();
export type ResumeGraph = typeof resumeGraph;
