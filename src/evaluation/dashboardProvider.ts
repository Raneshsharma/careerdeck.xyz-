import { QualityMetricsStore } from "./qualityMetricsStore";
import { PromptRegistry } from "./promptRegistry";
import { GOLDEN_DATASET } from "./goldenDataset";

export interface DashboardData {
  overview: { totalEvaluations: number; averageScore: number; passRate: number };
  bySection: Array<{ sectionId: string; averageScore: number; passRate: number }>;
  topPrompts: Array<{ sectionId: string; version: string; score: number }>;
  lowestSections: Array<{ sectionId: string; company: string; score: number }>;
  commonFlags: Array<{ flag: string; count: number }>;
  datasetSize: number;
  promptVersions: number;
}

export class DashboardProvider {
  static getData(): DashboardData {
    const topPrompts = QualityMetricsStore.getTopPerformingPrompts(5);
    const lowest = QualityMetricsStore.getLowestScoringSections(5);
    const flags = QualityMetricsStore.getMostCommonFlags(5);

    const bySection: Record<string, number[]> = {};
    let allScores: number[] = [];
    let passCount = 0;
    let totalCount = 0;

    return {
      overview: {
        totalEvaluations: totalCount,
        averageScore: QualityMetricsStore.getAverageScore(),
        passRate: QualityMetricsStore.getPassRate(),
      },
      bySection: Object.entries(bySection).map(([id, scores]) => ({
        sectionId: id,
        averageScore: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
        passRate: 0,
      })),
      topPrompts: topPrompts.map((r) => ({
        sectionId: r.sectionId,
        version: r.promptVersion,
        score: r.score.overall,
      })),
      lowestSections: lowest.map((r) => ({
        sectionId: r.sectionId,
        company: r.companyName,
        score: r.score.overall,
      })),
      commonFlags: flags,
      datasetSize: GOLDEN_DATASET.length,
      promptVersions: PromptRegistry.listAll().length,
    };
  }
}
