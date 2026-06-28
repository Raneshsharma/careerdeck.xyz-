export interface ResearchLog {
  timestamp: string;
  source: string;
  companyName: string;
  phase: "start" | "end" | "cache_hit" | "error";
  durationMs?: number;
  cached?: boolean;
  success: boolean;
  error?: string;
  responseSizeBytes?: number;
}

export class ResearchLogger {
  private static logs: ResearchLog[] = [];

  static start(source: string, companyName: string): { logStart: ResearchLog; startTime: number } {
    const logStart: ResearchLog = {
      timestamp: new Date().toISOString(),
      source,
      companyName,
      phase: "start",
      success: true,
    };
    return { logStart, startTime: Date.now() };
  }

  static end(
    logStart: ResearchLog,
    startTime: number,
    success: boolean,
    responseSizeBytes?: number,
  ): ResearchLog {
    const log: ResearchLog = {
      timestamp: new Date().toISOString(),
      source: logStart.source,
      companyName: logStart.companyName,
      phase: "end",
      durationMs: Date.now() - startTime,
      cached: false,
      success,
      responseSizeBytes,
    };
    this.logs.push(log);
    return log;
  }

  static cacheHit(source: string, companyName: string): ResearchLog {
    const log: ResearchLog = {
      timestamp: new Date().toISOString(),
      source,
      companyName,
      phase: "cache_hit",
      cached: true,
      success: true,
    };
    this.logs.push(log);
    return log;
  }

  static error(
    source: string,
    companyName: string,
    error: string,
    durationMs?: number,
  ): ResearchLog {
    const log: ResearchLog = {
      timestamp: new Date().toISOString(),
      source,
      companyName,
      phase: "error",
      durationMs,
      cached: false,
      success: false,
      error,
    };
    this.logs.push(log);
    return log;
  }

  static getLogs(): ResearchLog[] {
    return [...this.logs];
  }

  static clear(): void {
    this.logs = [];
  }
}
