import { generateSection } from "../prompts/llm";

export interface EvaluationScore {
  accuracy: number;
  completeness: number;
  businessInsight: number;
  specificity: number;
  interviewReadiness: number;
  readability: number;
  consistency: number;
  structure: number;
  roleConnection: number;
  overall: number;
}

export interface EvaluationResult {
  sectionId: string;
  companyName: string;
  promptVersion: string;
  score: EvaluationScore;
  passed: boolean;
  flags: string[];
  timestamp: string;
}

const EVAL_SYSTEM_PROMPT = `You are an expert quality evaluator for interview preparation dossiers.
Evaluate the given section against the provided Company Knowledge Base.

Score each dimension 0-10. Be strict and objective.

DIMENSIONS:
1. accuracy: Every factual claim matches the Knowledge Base. No unsupported claims.
2. completeness: All available verified facts from the KB are used.
3. businessInsight: Explains WHY and WHAT IT MEANS, not just WHAT.
4. specificity: Company-specific details, not generic statements.
5. interviewReadiness: Would this help someone perform better in an interview?
6. readability: Clear, concise, well-structured prose.
7. consistency: No contradictions within the section.
8. structure: Logical flow, proper headers, good paragraph breaks.
9. roleConnection: Includes meaningful role-relevant insight (only if section calls for it).

OVERALL = average of all dimensions, rounded to 1 decimal.

QUALITY THRESHOLDS (minimum):
- accuracy >= 9.0
- completeness >= 8.5
- businessInsight >= 8.5
- interviewReadiness >= 9.0

FLAGS: If any dimension is below threshold, add specific, actionable feedback.
If the section contains unsupported claims, flag them.
If key verified facts from the KB are missing, note them.

OUTPUT: Return ONLY valid JSON in this format:
{
  "accuracy": 0,
  "completeness": 0,
  "businessInsight": 0,
  "specificity": 0,
  "interviewReadiness": 0,
  "readability": 0,
  "consistency": 0,
  "structure": 0,
  "roleConnection": 0,
  "overall": 0,
  "flags": ["flag1", "flag2"]
}`;

export class EvaluationEngine {
  static async evaluateSection(
    sectionId: string,
    sectionName: string,
    sectionContent: string,
    knowledgeBase: Record<string, unknown>,
    companyName: string,
    promptVersion: string,
  ): Promise<EvaluationResult> {
    if (!sectionContent?.trim()) {
      return {
        sectionId,
        companyName,
        promptVersion,
        score: {
          accuracy: 0, completeness: 0, businessInsight: 0,
          specificity: 0, interviewReadiness: 0, readability: 0,
          consistency: 0, structure: 0, roleConnection: 0, overall: 0,
        },
        passed: false,
        flags: ["Section is empty"],
        timestamp: new Date().toISOString(),
      };
    }

    const kb = JSON.stringify(knowledgeBase, null, 2);

    try {
      const response = await generateSection(
        EVAL_SYSTEM_PROMPT,
        `Evaluate this "${sectionName}" section for ${companyName}.

COMPANY KNOWLEDGE BASE:
${kb}

GENERATED SECTION:
${sectionContent}

Return ONLY the JSON evaluation as specified.`,
      );

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in evaluation response");
      }

      const evalData = JSON.parse(jsonMatch[0]);

      const score: EvaluationScore = {
        accuracy: this.clamp(evalData.accuracy, 0, 10),
        completeness: this.clamp(evalData.completeness, 0, 10),
        businessInsight: this.clamp(evalData.businessInsight, 0, 10),
        specificity: this.clamp(evalData.specificity, 0, 10),
        interviewReadiness: this.clamp(evalData.interviewReadiness, 0, 10),
        readability: this.clamp(evalData.readability, 0, 10),
        consistency: this.clamp(evalData.consistency, 0, 10),
        structure: this.clamp(evalData.structure, 0, 10),
        roleConnection: this.clamp(evalData.roleConnection, 0, 10),
        overall:
          [
            evalData.accuracy, evalData.completeness, evalData.businessInsight,
            evalData.specificity, evalData.interviewReadiness, evalData.readability,
            evalData.consistency, evalData.structure, evalData.roleConnection,
          ].reduce((a: number, b: number) => a + b, 0) / 9,
      };

      score.overall = Math.round(score.overall * 10) / 10;

      const passed =
        score.accuracy >= 9.0 &&
        score.completeness >= 8.5 &&
        score.businessInsight >= 8.5 &&
        score.interviewReadiness >= 9.0;

      return {
        sectionId,
        companyName,
        promptVersion,
        score,
        passed,
        flags: evalData.flags ?? [],
        timestamp: new Date().toISOString(),
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return {
        sectionId,
        companyName,
        promptVersion,
        score: {
          accuracy: 0, completeness: 0, businessInsight: 0,
          specificity: 0, interviewReadiness: 0, readability: 0,
          consistency: 0, structure: 0, roleConnection: 0, overall: 0,
        },
        passed: false,
        flags: [`Evaluation failed: ${msg}`],
        timestamp: new Date().toISOString(),
      };
    }
  }

  private static clamp(value: number, min: number, max: number): number {
    const n = typeof value === "number" ? value : 0;
    return Math.max(min, Math.min(max, n));
  }
}
