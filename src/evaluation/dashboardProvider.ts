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
    const allSections = QualityMetricsStore.getAllResults();
    const avgScore = QualityMetricsStore.getAverageScore();

    const sectionMap = new Map<string, { scores: number[]; pass: number; total: number }>();
    for (const r of allSections) {
      if (!sectionMap.has(r.sectionId)) {
        sectionMap.set(r.sectionId, { scores: [], pass: 0, total: 0 });
      }
      const entry = sectionMap.get(r.sectionId)!;
      entry.scores.push(r.score.overall);
      entry.total++;
      if (r.passed) entry.pass++;
    }

    return {
      overview: {
        totalEvaluations: allSections.length,
        averageScore: avgScore,
        passRate: QualityMetricsStore.getPassRate(),
      },
      bySection: Array.from(sectionMap.entries()).map(([id, data]) => ({
        sectionId: id,
        averageScore: data.scores.length > 0
          ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length
          : 0,
        passRate: data.total > 0 ? data.pass / data.total : 0,
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
