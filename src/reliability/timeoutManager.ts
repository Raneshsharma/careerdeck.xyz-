import { TelemetryService } from "./telemetry";

const DEFAULT_TIMEOUTS: Record<string, number> = {
  wikipedia: 10_000,
  google: 15_000,
  website: 20_000,
  websiteFetch: 20_000,
  yahoo: 10_000,
  gnews: 10_000,
  duckduckgo: 10_000,
  llm_generation: 60_000,
  llm_review: 60_000,
  llm_extraction: 30_000,
  research: 15_000,
  extraction: 10_000,
  knowledge: 5_000,
};

export class TimeoutManager {
  static getTimeout(nodeName: string): number {
    return DEFAULT_TIMEOUTS[nodeName] ?? DEFAULT_TIMEOUTS.research;
  }

  static async executeWithTimeout<T>(
    nodeName: string,
    companyName: string,
    fn: () => Promise<T>,
    customTimeoutMs?: number,
  ): Promise<T> {
    const timeout = customTimeoutMs ?? this.getTimeout(nodeName);

    try {
      const result = await Promise.race([
        fn(),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error(`Timeout: ${nodeName} exceeded ${timeout}ms`)),
            timeout,
          ),
        ),
      ]);
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      TelemetryService.logWarning(
        nodeName,
        companyName,
        `Timed out after ${timeout}ms: ${msg}`,
      );
      throw e;
    }
  }
}
