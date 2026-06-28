export interface CacheMetrics {
  hits: number;
  misses: number;
  sets: number;
  invalidations: number;

  // Per-level breakdown
  research: { hits: number; misses: number; sets: number };
  extraction: { hits: number; misses: number; sets: number };
  knowledge: { hits: number; misses: number; sets: number };
  section: { hits: number; misses: number; sets: number };
}

const metrics: CacheMetrics = {
  hits: 0,
  misses: 0,
  sets: 0,
  invalidations: 0,
  research: { hits: 0, misses: 0, sets: 0 },
  extraction: { hits: 0, misses: 0, sets: 0 },
  knowledge: { hits: 0, misses: 0, sets: 0 },
  section: { hits: 0, misses: 0, sets: 0 },
};

export type CacheLevelMetrics = "research" | "extraction" | "knowledge" | "section";

export const CacheMetricsTracker = {
  recordHit(level: CacheLevelMetrics): void {
    metrics.hits++;
    metrics[level].hits++;
  },

  recordMiss(level: CacheLevelMetrics): void {
    metrics.misses++;
    metrics[level].misses++;
  },

  recordSet(level: CacheLevelMetrics): void {
    metrics.sets++;
    metrics[level].sets++;
  },

  recordInvalidation(): void {
    metrics.invalidations++;
  },

  getMetrics(): CacheMetrics {
    return structuredClone(metrics);
  },

  getHitRate(level?: CacheLevelMetrics): number {
    if (level) {
      const total = metrics[level].hits + metrics[level].misses;
      return total > 0 ? metrics[level].hits / total : 0;
    }
    const total = metrics.hits + metrics.misses;
    return total > 0 ? metrics.hits / total : 0;
  },

  reset(): void {
    Object.assign(metrics, {
      hits: 0, misses: 0, sets: 0, invalidations: 0,
      research: { hits: 0, misses: 0, sets: 0 },
      extraction: { hits: 0, misses: 0, sets: 0 },
      knowledge: { hits: 0, misses: 0, sets: 0 },
      section: { hits: 0, misses: 0, sets: 0 },
    });
  },
};
