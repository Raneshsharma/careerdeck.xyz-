import { BenchmarkRunner } from "@/src/evaluation/benchmarkRunner";
import { companyGraph } from "@/src/graph/companyGraph";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

async function dummySectionGenerator(companyName) {
  try {
    const result = await companyGraph.invoke({ companyName, dossierType: "company" });
    return result.reviewedSections || {};
  } catch (e) {
    console.error(`Benchmark graph error for ${companyName}:`, e.message);
    return {};
  }
}

async function dummyKnowledgeProvider(companyName) {
  try {
    const result = await companyGraph.invoke({ companyName, dossierType: "company" });
    return result.knowledge?.knowledgeBase || {};
  } catch {
    return {};
  }
}

export async function POST(request) {
  try {
    const { companies, sections } = await request.json().catch(() => ({}));

    const report = await BenchmarkRunner.runBenchmark(
      dummySectionGenerator,
      dummyKnowledgeProvider,
      { companies, sections, promptVersion: "4.0" },
    );

    return Response.json(report, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return Response.json({ error: msg }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({
    message: "POST to /api/benchmark with { companies?: string[], sections?: string[] } to run a benchmark. Companies use golden dataset IDs (e.g. 'apple', 'zomato').",
  });
}
