import type { CompanyState } from "../state";
import { generateSection } from "../../prompts/llm";
import { buildEditorPrompt, type EditorResult } from "../../prompts/editor";
import { validateSection } from "../../prompts/validator";

export function createSectionEditor(sectionId: string, sectionName: string) {
  return async (state: CompanyState): Promise<Partial<CompanyState>> => {
    const knowledge = state.knowledge.knowledgeBase;
    const original = state.generatedSections[sectionId];

    if (!knowledge) {
      return {
        reviewedSections: { [sectionId]: original || "" },
        errors: [`${sectionId}: No knowledge base for review`],
      };
    }

    if (!original || original.trim().length === 0) {
      return {
        reviewedSections: { [sectionId]: "" },
      };
    }

    const companyName = state.normalizedCompanyName || state.companyName;

    try {
      const { systemPrompt, userPrompt } = buildEditorPrompt(
        knowledge,
        sectionName,
        original,
        companyName,
      );
      const rawResponse = await generateSection(systemPrompt, userPrompt);

      let editorResult: EditorResult;

      try {
        const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          editorResult = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No JSON found in editor response");
        }
      } catch {
        editorResult = {
          revised_section: original,
          score: { accuracy: 5, completeness: 5, clarity: 5, business_insight: 5, interview_relevance: 5, overall: 5 },
          changes_made: ["Editor parse failed — returning original"],
          issues_found: ["Editor response was not valid JSON"],
        };
      }

      const revised = editorResult.revised_section || original;

      const validation = validateSection(revised, sectionName);
      const finalSection = validation.valid ? revised : original;

      return {
        reviewedSections: { [sectionId]: finalSection },
        sectionScores: { [sectionId]: editorResult.score },
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return {
        reviewedSections: { [sectionId]: original },
        sectionScores: { [sectionId]: { accuracy: 0, completeness: 0, clarity: 0, business_insight: 0, interview_relevance: 0, overall: 0 } },
        errors: [`${sectionId} review failed: ${msg}`],
      };
    }
  };
}
