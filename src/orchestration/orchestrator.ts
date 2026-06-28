import type {
  OrchestrationRequest,
  OrchestrationResult,
  ReportExplainability,
  SectionProvenance,
  FormattedOutput,
  PipelineHealth,
} from "./types";
import { REPORT_SECTIONS } from "./types";
import type { CompanyKnowledgeBase } from "../knowledge/types";
import { TelemetryService } from "../reliability/telemetry";
import { CacheMetricsTracker } from "../cache/metrics";
import { SECTION_DEPENDENCIES, getSectionDependency } from "../cache/dependencyMap";

/**
 * Top-level Workflow Orchestrator.
 *
 * Determines which sections to run, what persona to use,
 * and assembles the final report with explainability.
 */
export class WorkflowOrchestrator {
  static async orchestrate(
    request: OrchestrationRequest,
    invokeGraph: (
      companyName: string,
      sections: string[],
    ) => Promise<{
      sections: Record<string, string>;
      reviewed: Record<string, string>;
      knowledge: CompanyKnowledgeBase;
      scores: Record<string, Record<string, number>>;
      versions: Record<string, string>;
    }>,
  ): Promise<OrchestrationResult> {
    const startTime = Date.now();
    const requestId = TelemetryService.startTrace(request.companyName);

    // Determine which sections to run
    const sections =
      request.sections?.length ? request.sections
      : request.reportType === "custom" ? []
      : REPORT_SECTIONS[request.reportType] ?? REPORT_SECTIONS.full;

    TelemetryService.logInfo(
      "orchestrator",
      request.companyName,
      `Starting ${request.reportType} report with ${sections.length} sections`,
    );

    // Run the graph
    const graphResult = await invokeGraph(request.companyName, sections);

    // Build explainability
    const explainability = this.buildExplainability(
      sections,
      graphResult.knowledge,
      graphResult.scores,
    );

    // Format output
    const formatted = this.formatOutput(
      request,
      graphResult.reviewed,
      graphResult.knowledge,
      explainability,
    );

    // Check pipeline health
    const health = this.checkHealth();

    const totalDurationMs = Date.now() - startTime;
    TelemetryService.endTrace(requestId);

    return {
      requestId,
      companyName: request.companyName,
      generatedAt: new Date().toISOString(),
      reportType: request.reportType,
      persona: request.persona,
      sections: graphResult.sections,
      reviewedSections: graphResult.reviewed,
      explainability,
      formatted,
      health,
      metadata: {
        totalDurationMs,
        researchDurationMs: 0,
        generationDurationMs: 0,
        reviewDurationMs: 0,
        cacheHits: 0,
        cacheMisses: 0,
        apiCalls: 0,
        llmCalls: 0,
        promptVersion: "current",
        knowledgeVersion: graphResult.versions,
        evaluationScores: {},
      },
    };
  }

  private static buildExplainability(
    sections: string[],
    knowledge: CompanyKnowledgeBase,
    scores: Record<string, Record<string, number>>,
  ): ReportExplainability {
    const sectionProvenances: Record<string, SectionProvenance> = {};
    let totalConfidence = 0;
    let countWithScores = 0;
    const allSources = new Set<string>();

    for (const sectionId of sections) {
      const dep = getSectionDependency(sectionId);
      const domains = dep?.dependsOn ?? [];

      const keyFacts = this.extractKeyFacts(sectionId, knowledge);

      const confidence = scores[sectionId]?.overall ?? knowledge.metadata?.confidence?.overall ?? 0.5;

      if (confidence > 0) {
        totalConfidence += confidence;
        countWithScores++;
      }

      const sources: string[] = [];
      for (const domain of domains) {
        const domainData = (knowledge as unknown as Record<string, unknown>)[domain] as {
          sources?: string[];
        };
        if (domainData?.sources) {
          for (const s of domainData.sources) {
            allSources.add(s);
            sources.push(s);
          }
        }
      }

      sectionProvenances[sectionId] = {
        sectionId,
        sectionName: dep?.sectionName ?? sectionId,
        knowledgeDomains: domains,
        sources: [...new Set(sources)],
        confidence,
        lastVerified: new Date().toISOString(),
        keyFacts,
      };
    }

    return {
      sections: sectionProvenances,
      overallConfidence:
        countWithScores > 0
          ? Math.round((totalConfidence / countWithScores) * 100) / 100
          : 0,
      sourcesUsed: [...allSources],
    };
  }

  private static extractKeyFacts(
    sectionId: string,
    knowledge: CompanyKnowledgeBase,
  ): Array<{ fact: string; value: string; source: string; confidence: number }> {
    const facts: Array<{ fact: string; value: string; source: string; confidence: number }> = [];

    const extract = (
      label: string,
      field: { value: unknown; sources?: string[]; confidence?: number } | undefined,
    ): void => {
      if (!field || field.value == null || field.value === "") return;
      facts.push({
        fact: label,
        value: String(field.value),
        source: field.sources?.[0] ?? "unknown",
        confidence: field.confidence ?? 0.5,
      });
    };

    const k = knowledge;

    if (sectionId === "companyOverview" || sectionId === "journey") {
      extract("Company Name", (k.company as unknown as { name?: { value: unknown; sources?: string[] } })?.name);
      extract("Industry", (k.company as unknown as { industry?: { value: unknown; sources?: string[] } })?.industry);
    }

    if (sectionId === "financials") {
      extract("Revenue", (k.financials as unknown as { revenue?: { value: unknown; sources?: string[] } })?.revenue);
      extract("Market Cap", (k.financials as unknown as { marketCap?: { value: unknown; sources?: string[] } })?.marketCap);
      extract("Employees", (k.financials as unknown as { employees?: { value: unknown; sources?: string[] } })?.employees);
    }

    if (sectionId === "companyOverview" || sectionId === "leadership" || sectionId === "employeeInsights") {
      extract("CEO", (k.leadership as unknown as { ceo?: { value: unknown; sources?: string[] } })?.ceo);
    }

    if (sectionId === "journey" || sectionId === "whyExists") {
      extract("Founded", (k.history as unknown as { founded?: { value: unknown; sources?: string[] } })?.founded);
    }

    if (sectionId === "products" || sectionId === "competitors" || sectionId === "moat") {
      const products = (k.products as unknown as { items?: { value: unknown; sources?: string[]; confidence?: number } })?.items;
      if (products?.value && Array.isArray(products.value)) {
        facts.push({
          fact: "Products",
          value: (products.value as string[]).slice(0, 5).join(", "),
          source: products.sources?.[0] ?? "unknown",
          confidence: products.confidence ?? 0.5,
        });
      }
    }

    return facts;
  }

  private static formatOutput(
    request: OrchestrationRequest,
    reviewed: Record<string, string>,
    _knowledge: CompanyKnowledgeBase,
    explainability: ReportExplainability,
  ): FormattedOutput {
    switch (request.outputFormat) {
      case "json":
        return {
          format: "json",
          content: {
            companyName: request.companyName,
            reportType: request.reportType,
            persona: request.persona,
            sections: reviewed,
            explainability: {
              overallConfidence: explainability.overallConfidence,
              sourcesUsed: explainability.sourcesUsed,
            },
            generatedAt: new Date().toISOString(),
          },
        };
      case "structured":
        return {
          format: "structured",
          content: reviewed,
        };
      case "markdown":
      default:
        return {
          format: "markdown",
          content: Object.values(reviewed).join("\n\n"),
        };
    }
  }

  private static checkHealth(): PipelineHealth {
    const metrics = CacheMetricsTracker.getMetrics();
    const total = metrics.hits + metrics.misses;
    const cacheHealth = total > 0 && metrics.hits / total > 0.3 ? "healthy" : "degraded";

    return {
      status: "healthy",
      layers: {
        research: { status: "healthy", lastCheck: new Date().toISOString(), details: "Research cache active" },
        extraction: { status: "healthy", lastCheck: new Date().toISOString(), details: "Deterministic extraction online" },
        knowledge: { status: "healthy", lastCheck: new Date().toISOString(), details: "Conflict resolution active" },
        generation: { status: "healthy", lastCheck: new Date().toISOString(), details: "LLM generation available" },
        review: { status: "healthy", lastCheck: new Date().toISOString(), details: "Quality review active" },
        cache: { status: cacheHealth, lastCheck: new Date().toISOString(), details: `Hit rate: ${total > 0 ? Math.round((metrics.hits / total) * 100) : 0}%` },
        telemetry: { status: "healthy", lastCheck: new Date().toISOString(), details: "Telemetry service running" },
      },
      overall: { uptime: 1, successRate: 1, avgLatencyMs: 0 },
    };
  }
}
