import { CacheLevel, buildCacheKey, CACHE_TTL } from "./types";
import { memoryCache } from "./memoryCache";
import { diskCache } from "./diskCache";
import { CacheMetricsTracker, type CacheLevelMetrics } from "./metrics";

const LEVEL_METRICS_MAP: Record<CacheLevel, CacheLevelMetrics> = {
  [CacheLevel.RESEARCH]: "research",
  [CacheLevel.EXTRACTION]: "extraction",
  [CacheLevel.KNOWLEDGE]: "knowledge",
  [CacheLevel.SECTION]: "section",
};

export class CacheManager {
  /**
   * Get a value from cache (memory → disk fallback).
   * Returns null if not found or expired.
   */
  static async get<T>(
    companyName: string,
    level: CacheLevel,
    resource: string,
  ): Promise<T | null> {
    const key = buildCacheKey(companyName, level, resource);
    const metricLevel = LEVEL_METRICS_MAP[level];

    // Fast path: memory cache
    const memResult = await memoryCache.get<T>(key);
    if (memResult !== null) {
      CacheMetricsTracker.recordHit(metricLevel);
      return memResult;
    }

    // Fallback: disk cache (survives restarts)
    const diskResult = await diskCache.get<T>(key);
    if (diskResult !== null) {
      // Warm up memory for subsequent lookups
      const ttlMap = CACHE_TTL[level];
      const ttl = ttlMap[resource] ?? ttlMap["default"] ?? 24 * 60 * 60 * 1000;
      await memoryCache.set(key, diskResult, ttl);
      CacheMetricsTracker.recordHit(metricLevel);
      return diskResult;
    }

    CacheMetricsTracker.recordMiss(metricLevel);
    return null;
  }

  /**
   * Set a value in both memory and disk cache with source-specific TTL.
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
    await Promise.all([
      memoryCache.set(key, value, ttl),
      diskCache.set(key, value, ttl),
    ]);
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
    const memHas = await memoryCache.has(key);
    if (memHas) return true;
    const diskHas = await diskCache.has(key);
    if (diskHas) {
      const value = await diskCache.get(key);
      if (value !== null) {
        const ttlMap = CACHE_TTL[level];
        const ttl = ttlMap[resource] ?? ttlMap["default"] ?? 24 * 60 * 60 * 1000;
        await memoryCache.set(key, value, ttl);
      }
      return true;
    }
    return false;
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
    await Promise.all([
      memoryCache.delete(key),
      diskCache.delete(key),
    ]);
    CacheMetricsTracker.recordInvalidation();
  }

  /**
   * Clear all cache entries.
   */
  static async clear(): Promise<void> {
    await Promise.all([
      memoryCache.clear(),
      diskCache.clear(),
    ]);
  }
}
