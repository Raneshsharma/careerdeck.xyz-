import { EvaluationEngine } from "./evaluationEngine";
import { PromptRegistry } from "./promptRegistry";
import { QualityMetricsStore } from "./qualityMetricsStore";
import type { EvaluationResult } from "./evaluationEngine";

export interface ABTestResult {
  sectionId: string;
  companyName: string;
  versionA: string;
  versionB: string;
  scoreA: number;
  scoreB: number;
  winner: string;
  tokensA?: number;
  tokensB?: number;
  latencyA?: number;
  latencyB?: number;
}

export class ABTestRunner {
  static async runABTest(
    sectionId: string,
    versionA: string,
    versionB: string,
    companyName: string,
    knowledgeBase: Record<string, unknown>,
  ): Promise<ABTestResult> {
    const prompts = PromptRegistry.getPromptsForComparison(sectionId, versionA, versionB);

    if (prompts.length < 2) {
      throw new Error(`Need 2 prompt versions to compare. Found: ${prompts.length}`);
    }

    const promptA = prompts.find((p) => p.meta.version === versionA)!;
    const promptB = prompts.find((p) => p.meta.version === versionB)!;

    const startA = Date.now();
    const { userPrompt: userA } = promptA.buildPrompt(knowledgeBase, companyName);
    const { userPrompt: userB } = promptB.buildPrompt(knowledgeBase, companyName);

    // Mock generation — in real use, call the LLM
    // For now, we evaluate prompt structure quality
    const resultA = await EvaluationEngine.evaluateSection(
      sectionId,
      promptA.meta.sectionName,
      `[Generated with ${versionA}: ${userA.slice(0, 500)}...]`,
      knowledgeBase,
      companyName,
      versionA,
    );
    const latencyA = Date.now() - startA;

    const startB = Date.now();
    const resultB = await EvaluationEngine.evaluateSection(
      sectionId,
      promptB.meta.sectionName,
      `[Generated with ${versionB}: ${userB.slice(0, 500)}...]`,
      knowledgeBase,
      companyName,
      versionB,
    );
    const latencyB = Date.now() - startB;

    QualityMetricsStore.store(resultA, {
      promptId: sectionId,
      generationTimeMs: latencyA,
    });
    QualityMetricsStore.store(resultB, {
      promptId: sectionId,
      generationTimeMs: latencyB,
    });

    return {
      sectionId,
      companyName,
      versionA,
      versionB,
      scoreA: resultA.score.overall,
      scoreB: resultB.score.overall,
      winner:
        resultA.score.overall > resultB.score.overall
          ? versionA
          : resultB.score.overall > resultA.score.overall
            ? versionB
            : "tie",
      latencyA,
      latencyB,
    };
  }
}
