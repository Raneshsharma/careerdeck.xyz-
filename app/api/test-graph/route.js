import { companyGraph } from "@/src/graph/companyGraph";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET() {
  try {
    const start = Date.now();
    const result = await companyGraph.invoke({
      companyName: "Zomato",
      dossierType: "company",
    });
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);

    const sections = result.reviewedSections || {};
    const sectionIds = Object.keys(sections).filter((k) => sections[k]?.trim());
    const ci = result.competitorIntelligence;

    return Response.json({
      duration_seconds: elapsed,
      sections_generated: sectionIds.length,
      section_summary: sectionIds.map((id) => ({
        id,
        words: sections[id].split(/\s+/).filter(Boolean).length,
      })),
      report_quality: result.reportQuality ?? null,
      issues_count: result.reportIssues?.length ?? 0,
      competitor_intelligence: ci?.competitors?.map((c) => c.name) ?? [],
      error_count: result.errors?.length ?? 0,
      errors: result.errors ?? [],
      report_issues: (result.reportIssues ?? []).map((i) => ({
        section: i.section,
        severity: i.severity,
        category: i.category,
        detail: i.detail,
        suggested_fix: i.suggested_fix,
      })),
    });
  } catch (e) {
    return Response.json({
      error: e instanceof Error ? e.message : String(e),
    }, { status: 500 });
  }
}
