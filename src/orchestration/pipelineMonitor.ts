import { CircuitBreaker } from "../reliability/circuitBreaker";
import { CacheMetricsTracker } from "../cache/metrics";
import { TelemetryService } from "../reliability/telemetry";
import type { PipelineHealth, LayerHealth } from "./types";

/**
 * Pipeline Monitor — tracks overall system health,
 * cache performance, API health, and LLM availability.
 */
export class PipelineMonitor {
  static checkHealth(): PipelineHealth {
    const now = new Date().toISOString();
    const metrics = CacheMetricsTracker.getMetrics();
    const telemetryMetrics = TelemetryService.getMetrics();

    const totalCache = metrics.hits + metrics.misses;
    const cacheHitRate = totalCache > 0 ? metrics.hits / totalCache : 0;

    const layers: Record<string, LayerHealth> = {
      research: {
        status: this.layerStatus(cacheHitRate > 0.3, metrics.research.misses < 10),
        lastCheck: now,
        details: `Research cache: ${Math.round(cacheHitRate * 100)}% hit rate`,
      },
      extraction: {
        status: "healthy",
        lastCheck: now,
        details: `Extraction metrics: ${metrics.extraction.sets} cached extractions`,
      },
      knowledge: {
        status: this.layerStatus(true, metrics.knowledge.sets > 0),
        lastCheck: now,
        details: `Knowledge base cache: ${metrics.knowledge.sets} cached`,
      },
      generation: {
        status: this.layerStatus(
          telemetryMetrics.errors < 5,
          telemetryMetrics.llmCalls > 0,
        ),
        lastCheck: now,
        details: `LLM calls: ${telemetryMetrics.llmCalls}, errors: ${telemetryMetrics.errors}`,
      },
      review: {
        status: "healthy",
        lastCheck: now,
        details: "Review layer active",
      },
      cache: {
        status: this.layerStatus(cacheHitRate > 0.2, true),
        lastCheck: now,
        details: `${metrics.sets} total cached, ${Math.round(cacheHitRate * 100)}% hit rate`,
      },
      telemetry: {
        status: "healthy",
        lastCheck: now,
        details: `${telemetryMetrics.totalExecutions} executions tracked`,
      },
    };

    const layerStatuses = Object.values(layers).map((l) => l.status);
    const degradedLayers = layerStatuses.filter((s) => s === "degraded").length;
    const downLayers = layerStatuses.filter((s) => s === "down").length;

    const overallStatus = downLayers > 0 ? "down" : degradedLayers > 2 ? "degraded" : "healthy";

    return {
      status: overallStatus,
      layers,
      overall: {
        uptime: 1,
        successRate: telemetryMetrics.errors > 0
          ? telemetryMetrics.totalExecutions / (telemetryMetrics.totalExecutions + telemetryMetrics.errors)
          : 1,
        avgLatencyMs: telemetryMetrics.totalExecutions > 0
          ? telemetryMetrics.totalDurationMs / telemetryMetrics.totalExecutions
          : 0,
      },
    };
  }

  private static layerStatus(primaryCondition: boolean, fallbackCondition: boolean): "healthy" | "degraded" | "down" {
    if (!primaryCondition && !fallbackCondition) return "down";
    if (!primaryCondition) return "degraded";
    return "healthy";
  }

  static resetCircuitBreakers(): void {
    const services = [
      "wikipedia", "google", "yahoo", "gnews",
      "duckduckgo", "websiteDiscovery", "websiteFetch",
    ];
    for (const svc of services) {
      CircuitBreaker.reset(svc);
    }
  }
}
