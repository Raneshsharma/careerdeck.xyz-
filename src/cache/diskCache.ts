import * as fs from "fs";
import * as path from "path";
import type { CacheEntry, CacheProvider } from "./types";

const CACHE_ROOT = path.join(process.cwd(), ".cache", "research");

function sanitizeKey(key: string): string {
  return key.replace(/[^a-zA-Z0-9_]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
}

function entryPath(key: string): string {
  return path.join(CACHE_ROOT, `${sanitizeKey(key)}.json`);
}

class DiskCacheProvider implements CacheProvider {
  private ready: Promise<void>;

  constructor() {
    this.ready = fs.promises.mkdir(CACHE_ROOT, { recursive: true }).then(() => {});
  }

  private async ensureReady(): Promise<void> {
    await this.ready;
  }

  async get<T>(key: string): Promise<T | null> {
    await this.ensureReady();
    try {
      const raw = await fs.promises.readFile(entryPath(key), "utf-8");
      const entry: CacheEntry<T> = JSON.parse(raw);
      if (Date.now() - entry.createdAt > entry.ttlMs) {
        await this.delete(key);
        return null;
      }
      entry.hits++;
      entry.lastAccess = Date.now();
      await fs.promises.writeFile(entryPath(key), JSON.stringify(entry), "utf-8");
      return entry.value;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
    await this.ensureReady();
    const entry: CacheEntry<T> = {
      key,
      value,
      createdAt: Date.now(),
      ttlMs,
      hits: 0,
      lastAccess: Date.now(),
    };
    await fs.promises.writeFile(entryPath(key), JSON.stringify(entry), "utf-8");
  }

  async delete(key: string): Promise<void> {
    await this.ensureReady();
    try {
      await fs.promises.unlink(entryPath(key));
    } catch {
      // ignore if file doesn't exist
    }
  }

  async has(key: string): Promise<boolean> {
    await this.ensureReady();
    try {
      const raw = await fs.promises.readFile(entryPath(key), "utf-8");
      const entry: CacheEntry = JSON.parse(raw);
      if (Date.now() - entry.createdAt > entry.ttlMs) {
        await this.delete(key);
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  async clear(): Promise<void> {
    await this.ensureReady();
    try {
      const files = await fs.promises.readdir(CACHE_ROOT);
      await Promise.all(
        files.map((f) => fs.promises.unlink(path.join(CACHE_ROOT, f)).catch(() => {})),
      );
    } catch {
      // ignore if directory doesn't exist
    }
  }
}

export const diskCache = new DiskCacheProvider();
