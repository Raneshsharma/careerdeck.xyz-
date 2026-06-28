import { GOLDEN_DATASET } from "./goldenDataset";
import { EvaluationEngine, type EvaluationResult } from "./evaluationEngine";
import { QualityMetricsStore } from "./qualityMetricsStore";
import { PromptRegistry } from "./promptRegistry";

export interface BenchmarkResult {
  company: string;
  section: string;
  promptVersion: string;
  score: number;
  passed: boolean;
  flags: string[];
}

export interface BenchmarkReport {
  runAt: string;
  totalTests: number;
  passed: number;
  failed: number;
  passRate: number;
  averageScore: number;
  results: BenchmarkResult[];
  bySection: Record<string, { count: number; averageScore: number; passRate: number }>;
  byCompany: Record<string, { count: number; averageScore: number; passRate: number }>;
}

export class BenchmarkRunner {
  static async runBenchmark(
    sectionGenerator: (companyName: string) => Promise<Record<string, string>>,
    knowledgeProvider: (companyName: string) => Promise<Record<string, unknown>>,
    options: {
      companies?: string[];
      sections?: string[];
      promptVersion?: string;
    } = {},
  ): Promise<BenchmarkReport> {
    const companies = options.companies
      ? GOLDEN_DATASET.filter((c) => options.companies!.includes(c.id))
      : GOLDEN_DATASET.slice(0, 5); // Default: first 5

    const results: BenchmarkResult[] = [];
    const version = options.promptVersion ?? "current";

    for (const company of companies) {
      const knowledge = await knowledgeProvider(company.name);

      const sections = await sectionGenerator(company.name);
      const sectionIds = Object.keys(sections);

      for (const sectionId of sectionIds) {
        const sectionContent = sections[sectionId];
        const evalResult = await EvaluationEngine.evaluateSection(
          sectionId,
          sectionId,
          sectionContent,
          knowledge,
          company.name,
          version,
        );

        QualityMetricsStore.store(evalResult, {
          promptId: sectionId,
          generationTimeMs: 0,
        });

        results.push({
          company: company.name,
          section: sectionId,
          promptVersion: version,
          score: evalResult.score.overall,
          passed: evalResult.passed,
          flags: evalResult.flags,
        });
      }
    }

    const passed = results.filter((r) => r.passed).length;
    const total = results.length;
    const scores = results.map((r) => r.score).filter((s) => s > 0);

    const bySection: Record<string, { count: number; averageScore: number; passRate: number }> = {};
    const byCompany: Record<string, { count: number; averageScore: number; passRate: number }> = {};

    for (const r of results) {
      if (!bySection[r.section]) bySection[r.section] = { count: 0, averageScore: 0, passRate: 0 };
      bySection[r.section].count++;
      const sResults = results.filter((x) => x.section === r.section);
      bySection[r.section].averageScore =
        sResults.map((x) => x.score).reduce((a, b) => a + b, 0) / sResults.length;
      bySection[r.section].passRate = sResults.filter((x) => x.passed).length / sResults.length;
    }

    for (const r of results) {
      if (!byCompany[r.company]) byCompany[r.company] = { count: 0, averageScore: 0, passRate: 0 };
      byCompany[r.company].count++;
      const cResults = results.filter((x) => x.company === r.company);
      byCompany[r.company].averageScore =
        cResults.map((x) => x.score).reduce((a, b) => a + b, 0) / cResults.length;
      byCompany[r.company].passRate = cResults.filter((x) => x.passed).length / cResults.length;
    }

    return {
      runAt: new Date().toISOString(),
      totalTests: total,
      passed,
      failed: total - passed,
      passRate: total > 0 ? passed / total : 0,
      averageScore: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
      results,
      bySection,
      byCompany,
    };
  }
}
