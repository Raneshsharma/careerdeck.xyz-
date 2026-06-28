import { TelemetryService } from "./telemetry";

export interface FallbackRule {
  source: string;
  fallbackSources: string[];
  fallbackFn?: () => Promise<unknown>;
}

const FALLBACK_MAP: Record<string, string[]> = {
  wikipedia: ["website", "google"],
  yahoo: ["website"],
  gnews: ["skip"],
  google: ["duckduckgo"],
  websiteDiscovery: ["skip"],
  websiteFetch: ["skip"],
  duckduckgo: ["skip"],
};

export class FallbackManager {
  static async executeWithFallback<T>(
    sourceName: string,
    companyName: string,
    primaryFn: () => Promise<T>,
    fallbackFns: Array<{ name: string; fn: () => Promise<T> }>,
  ): Promise<{ result: T | null; usedFallback: boolean; fallbackSource?: string }> {
    try {
      const result = await primaryFn();
      return { result, usedFallback: false };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      TelemetryService.logWarning(
        sourceName,
        companyName,
        `Primary failed: ${msg}. Attempting fallbacks...`,
      );
    }

    for (const fb of fallbackFns) {
      if (fb.name === "skip") {
        TelemetryService.logWarning(
          sourceName,
          companyName,
          "Skipping — no data available for this source",
        );
        return { result: null, usedFallback: true, fallbackSource: "skip" };
      }

      try {
        TelemetryService.logInfo(
          sourceName,
          companyName,
          `Trying fallback: ${fb.name}`,
        );
        const result = await fb.fn();
        return { result, usedFallback: true, fallbackSource: fb.name };
      } catch (e2) {
        const msg2 = e2 instanceof Error ? e2.message : String(e2);
        TelemetryService.logWarning(
          sourceName,
          companyName,
          `Fallback ${fb.name} also failed: ${msg2}`,
        );
      }
    }

    return { result: null, usedFallback: true, fallbackSource: "none" };
  }

  static getFallbacks(source: string): string[] {
    return FALLBACK_MAP[source] ?? ["skip"];
  }
}
