export interface CacheEntry<T = unknown> {
  key: string;
  value: T;
  createdAt: number;
  ttlMs: number;
  hits: number;
  lastAccess: number;
}

export interface CacheProvider {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlMs: number): Promise<void>;
  delete(key: string): Promise<void>;
  has(key: string): Promise<boolean>;
  clear(): Promise<void>;
}

export enum CacheLevel {
  RESEARCH = "research",
  EXTRACTION = "extraction",
  KNOWLEDGE = "knowledge",
  SECTION = "section",
}

export const CACHE_TTL: Record<CacheLevel, Record<string, number>> = {
  [CacheLevel.RESEARCH]: {
    wikipedia: 7 * 24 * 60 * 60 * 1000,
    google: 24 * 60 * 60 * 1000,
    yahoo: 24 * 60 * 60 * 1000,
    gnews: 30 * 60 * 1000,
    duckduckgo: 24 * 60 * 60 * 1000,
    googleNewsRss: 30 * 60 * 1000,
    websiteDiscovery: 7 * 24 * 60 * 60 * 1000,
    websitePages: 7 * 24 * 60 * 60 * 1000,
  },
  [CacheLevel.EXTRACTION]: {
    default: 24 * 60 * 60 * 1000,
  },
  [CacheLevel.KNOWLEDGE]: {
    default: 24 * 60 * 60 * 1000,
  },
  [CacheLevel.SECTION]: {
    default: 7 * 24 * 60 * 60 * 1000,
  },
};

export function buildCacheKey(
  companyName: string,
  level: CacheLevel,
  resource: string,
): string {
  const normalized = companyName.toLowerCase().trim().replace(/\s+/g, "_");
  return `company:${normalized}:${level}:${resource}`;
}
