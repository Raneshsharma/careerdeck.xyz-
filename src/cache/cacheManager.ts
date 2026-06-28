import { CacheLevel, buildCacheKey, CACHE_TTL } from "./types";
import { memoryCache } from "./memoryCache";
import { CacheMetricsTracker, type CacheLevelMetrics } from "./metrics";

const LEVEL_METRICS_MAP: Record<CacheLevel, CacheLevelMetrics> = {
  [CacheLevel.RESEARCH]: "research",
  [CacheLevel.EXTRACTION]: "extraction",
  [CacheLevel.KNOWLEDGE]: "knowledge",
  [CacheLevel.SECTION]: "section",
};

export class CacheManager {
  /**
   * Get a value from cache. Returns null if not found or expired.
   */
  static async get<T>(
    companyName: string,
    level: CacheLevel,
    resource: string,
  ): Promise<T | null> {
    const key = buildCacheKey(companyName, level, resource);
    const result = await memoryCache.get<T>(key);
    const metricLevel = LEVEL_METRICS_MAP[level];
    if (result !== null) {
      CacheMetricsTracker.recordHit(metricLevel);
    } else {
      CacheMetricsTracker.recordMiss(metricLevel);
    }
    return result;
  }

  /**
   * Set a value in cache with source-specific TTL.
   */
  static async set<T>(
    companyName: string,
    level: CacheLevel,
    resource: string,
    value: T,
  ): Promise<void> {
    const key = buildCacheKey(companyName, level, resource);
    const ttlMap = CACHE_TTL[level];
    const ttl = ttlMap[resource] ?? ttlMap["default"] ?? 24 * 60 * 60 * 1000;
    await memoryCache.set(key, value, ttl);
    CacheMetricsTracker.recordSet(LEVEL_METRICS_MAP[level]);
  }

  /**
   * Get or set: returns cached value if available, otherwise runs factory, caches, and returns.
   */
  static async getOrSet<T>(
    companyName: string,
    level: CacheLevel,
    resource: string,
    factory: () => Promise<T>,
  ): Promise<T> {
    const cached = await this.get<T>(companyName, level, resource);
    if (cached !== null) return cached;

    const value = await factory();
    await this.set(companyName, level, resource, value);
    return value;
  }

  /**
   * Check if a key exists and is fresh.
   */
  static async has(
    companyName: string,
    level: CacheLevel,
    resource: string,
  ): Promise<boolean> {
    const key = buildCacheKey(companyName, level, resource);
    return memoryCache.has(key);
  }

  /**
   * Delete a specific cache entry.
   */
  static async delete(
    companyName: string,
    level: CacheLevel,
    resource: string,
  ): Promise<void> {
    const key = buildCacheKey(companyName, level, resource);
    await memoryCache.delete(key);
    CacheMetricsTracker.recordInvalidation();
  }

  /**
   * Clear all cache entries.
   */
  static async clear(): Promise<void> {
    await memoryCache.clear();
  }
}
