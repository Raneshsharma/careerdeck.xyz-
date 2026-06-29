import type { EvaluationResult } from "./evaluationEngine";

interface StoredResult extends EvaluationResult {
  id: string;
  promptId: string;
  modelName?: string;
  generationTimeMs?: number;
  tokenUsage?: number;
  costEstimate?: number;
  errors?: string[];
}

export class QualityMetricsStore {
  private static results: StoredResult[] = [];

  static store(result: EvaluationResult, extra: {
    promptId?: string;
    modelName?: string;
    generationTimeMs?: number;
    tokenUsage?: number;
    costEstimate?: number;
    errors?: string[];
  } = {}): void {
    this.results.push({
      ...result,
      id: `${result.sectionId}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      promptId: extra.promptId ?? result.sectionId,
      modelName: extra.modelName,
      generationTimeMs: extra.generationTimeMs,
      tokenUsage: extra.tokenUsage,
      costEstimate: extra.costEstimate,
      errors: extra.errors,
    });
  }

  static getByCompany(companyName: string): StoredResult[] {
    return this.results.filter((r) => r.companyName === companyName);
  }

  static getBySection(sectionId: string): StoredResult[] {
    return this.results.filter((r) => r.sectionId === sectionId);
  }

  static getByPromptVersion(promptId: string, version: string): StoredResult[] {
    return this.results.filter(
      (r) => r.promptId === promptId && r.promptVersion === version,
    );
  }

  static getTopPerformingPrompts(limit = 10): StoredResult[] {
    return [...this.results]
      .filter((r) => r.score.overall > 0)
      .sort((a, b) => b.score.overall - a.score.overall)
      .slice(0, limit);
  }

  static getLowestScoringSections(limit = 10): StoredResult[] {
    return [...this.results]
      .filter((r) => r.score.overall > 0)
      .sort((a, b) => a.score.overall - b.score.overall)
      .slice(0, limit);
  }

  static getMostCommonFlags(limit = 10): Array<{ flag: string; count: number }> {
    const flagCounts = new Map<string, number>();
    for (const r of this.results) {
      for (const flag of r.flags) {
        const key = flag.slice(0, 80);
        flagCounts.set(key, (flagCounts.get(key) ?? 0) + 1);
      }
    }
    return [...flagCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([flag, count]) => ({ flag, count }));
  }

  static getAverageScore(sectionId?: string): number {
    const filtered = sectionId
      ? this.results.filter((r) => r.sectionId === sectionId)
      : this.results;
    const scores = filtered.map((r) => r.score.overall).filter((s) => s > 0);
    if (scores.length === 0) return 0;
    return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100;
  }

  static getPromptComparison(
    sectionId: string,
    versionA: string,
    versionB: string,
  ): { versionA: number; versionB: number; winner: string } {
    const aAvg = this.getAverageScoreForVersion(sectionId, versionA);
    const bAvg = this.getAverageScoreForVersion(sectionId, versionB);
    return {
      versionA: aAvg,
      versionB: bAvg,
      winner: aAvg > bAvg ? versionA : bAvg > aAvg ? versionB : "tie",
    };
  }

  private static getAverageScoreForVersion(
    sectionId: string,
    version: string,
  ): number {
    const filtered = this.results.filter(
      (r) => r.sectionId === sectionId && r.promptVersion === version,
    );
    const scores = filtered.map((r) => r.score.overall).filter((s) => s > 0);
    if (scores.length === 0) return 0;
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }

  static getPassRate(sectionId?: string): number {
    const filtered = sectionId
      ? this.results.filter((r) => r.sectionId === sectionId)
      : this.results;
    if (filtered.length === 0) return 0;
    return filtered.filter((r) => r.passed).length / filtered.length;
  }

  static getAllResults(): StoredResult[] {
    return [...this.results];
  }

  static clear(): void {
    this.results = [];
  }
}
