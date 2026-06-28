import type { CacheEntry, CacheProvider } from "./types";

class TTLInMemoryCache {
  private store = new Map<string, CacheEntry>();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() - entry.createdAt > entry.ttlMs) {
      this.store.delete(key);
      return null;
    }
    entry.hits++;
    entry.lastAccess = Date.now();
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
    this.store.set(key, {
      key,
      value,
      createdAt: Date.now(),
      ttlMs,
      hits: 0,
      lastAccess: Date.now(),
    });
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async has(key: string): Promise<boolean> {
    const entry = this.store.get(key);
    if (!entry) return false;
    if (Date.now() - entry.createdAt > entry.ttlMs) {
      this.store.delete(key);
      return false;
    }
    return true;
  }

  async clear(): Promise<void> {
    this.store.clear();
  }

  get size(): number {
    return this.store.size;
  }

  get entries(): Map<string, CacheEntry> {
    return this.store;
  }

  async getOrSet<T>(key: string, factory: () => Promise<T>, ttlMs: number): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;
    const value = await factory();
    await this.set(key, value, ttlMs);
    return value;
  }
}

export const memoryCache = new TTLInMemoryCache();
