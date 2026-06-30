import { StateGraph, START, END } from "@langchain/langgraph";
import { CompanyStateAnnotation } from "./state";
import { extractRoleFactsNode } from "./nodes/extractRoleFacts";
import { generateSection } from "../prompts/llm";
import { buildRoleAnalystPrompt, buildRoleWriterPrompt } from "../prompts/roleSections";
import { UNIVERSAL_MASTER_PROMPT, DOMAIN_MASTER_PROMPTS } from "../prompts/masterPrompt";

function createRoleSectionNode(sectionId: string) {
  return async (state: any) => {
    const roleFacts = state.roleFacts;
    const companyName = state.companyName || "";
    const roleTitle = state.role || "Product Manager";

    const domainType = "role";
    const domainMasterPrompt = DOMAIN_MASTER_PROMPTS[domainType] || "";
    const fullMasterSystemPrompt = `${UNIVERSAL_MASTER_PROMPT}\n\n${domainMasterPrompt}`;

    try {
      // Pass 1: Analyst
      const { systemPrompt: analystSys, userPrompt: analystUser } =
        buildRoleAnalystPrompt(sectionId, roleFacts, companyName, roleTitle);
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
        buildRoleWriterPrompt(sectionId, analysis, companyName, roleTitle);
      const fullWriterSys = `${fullMasterSystemPrompt}\n\n${writerSys}`;
      const content = await generateSection(fullWriterSys, writerUser);

      return {
        generatedSections: { [sectionId]: content }
      };
    } catch (e: any) {
      console.error(`[Role Section Node: ${sectionId}] failed:`, e);
      return {
        generatedSections: { [sectionId]: `Failed to generate ${sectionId}.` },
        errors: [`${sectionId} generation failed: ${e.message}`]
      };
    }
  };
}

const g = new StateGraph(CompanyStateAnnotation) as any;

g.addNode("extractRoleFacts", extractRoleFactsNode);
g.addEdge(START, "extractRoleFacts");

const sections = [
  "roleOverview", "businessContext", "roleMission", "roleOperatingSystem",
  "businessImpact", "decisionIntelligence", "responsibilities", "stakeholders",
  "crossFunctionalCollaboration", "kpis", "skills", "tools",
  "knowledgeAreas", "productivityIntelligence", "typicalProblems", "blueprint",
  "maturityModel", "careerPath", "compensation", "interviewPrep",
  "first90Days", "scenarios", "businessVocabulary", "functionalPriorities"
];

sections.forEach((s) => {
  g.addNode(s, createRoleSectionNode(s));
  g.addEdge("extractRoleFacts", s);
  g.addEdge(s, END);
});

export const roleGraph = g.compile();
export type RoleGraph = typeof roleGraph;
