import { CacheManager } from "../cache/cacheManager";
import { CacheLevel } from "../cache/types";
import type { ResearchEnvelope } from "./types";

export class ResearchCache {
  static buildKey(companyName: string, source: string): string {
    return `${companyName.toLowerCase().trim().replace(/\s+/g, "_")}_${source}`;
  }

  static async get(key: string): Promise<ResearchEnvelope | null> {
    const companyName = key.split("_")[0];
    const source = key.substring(key.indexOf("_") + 1);
    return CacheManager.get<ResearchEnvelope>(companyName, CacheLevel.RESEARCH, source);
  }

  static async set(key: string, envelope: ResearchEnvelope, source: string): Promise<void> {
    const companyName = key.split("_")[0];
    await CacheManager.set(companyName, CacheLevel.RESEARCH, source, envelope);
  }

  static clear(): void {
    // CacheManager.clear handles all levels
  }
}
