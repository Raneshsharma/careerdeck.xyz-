export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARNING = 2,
  ERROR = 3,
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  nodeName: string;
  companyName: string;
  message: string;
  durationMs?: number;
  inputSize?: number;
  outputSize?: number;
  status: "start" | "end" | "error" | "cache_hit" | "fallback";
  cacheUsed: boolean;
  retryCount: number;
  errorCategory?: string;
}

export interface ExecutionMetrics {
  totalExecutions: number;
  totalDurationMs: number;
  researchDurationMs: number;
  extractionDurationMs: number;
  knowledgeResolutionDurationMs: number;
  generationDurationMs: number;
  reviewDurationMs: number;
  cacheHits: number;
  cacheMisses: number;
  retries: number;
  fallbacks: number;
  errors: number;
  llmCalls: number;
  avgApiLatencyMs: number;
  avgTokensPerCall: number;
}

export interface Trace {
  requestId: string;
  companyName: string;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  nodeExecutions: Array<{
    node: string;
    status: string;
    durationMs: number;
    cacheHit: boolean;
    retryCount: number;
    fallbackUsed: boolean;
    errorMessage?: string;
  }>;
  skippedNodes: string[];
  totalApiCalls: number;
  totalLlmCalls: number;
}

export class TelemetryService {
  private static logs: LogEntry[] = [];
  private static traces: Map<string, Trace> = new Map();
  private static metrics: ExecutionMetrics = {
    totalExecutions: 0,
    totalDurationMs: 0,
    researchDurationMs: 0,
    extractionDurationMs: 0,
    knowledgeResolutionDurationMs: 0,
    generationDurationMs: 0,
    reviewDurationMs: 0,
    cacheHits: 0,
    cacheMisses: 0,
    retries: 0,
    fallbacks: 0,
    errors: 0,
    llmCalls: 0,
    avgApiLatencyMs: 0,
    avgTokensPerCall: 0,
  };

  static log(
    level: LogLevel,
    nodeName: string,
    companyName: string,
    message: string,
    extra: Partial<LogEntry> = {},
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      nodeName,
      companyName,
      message,
      status: extra.status ?? "start",
      cacheUsed: extra.cacheUsed ?? false,
      retryCount: extra.retryCount ?? 0,
      durationMs: extra.durationMs,
      inputSize: extra.inputSize,
      outputSize: extra.outputSize,
      errorCategory: extra.errorCategory,
    };
    this.logs.push(entry);
    this.metrics.totalExecutions++;
  }

  static logInfo(node: string, company: string, message: string): void {
    this.log(LogLevel.INFO, node, company, message, { status: "end" });
  }

  static logWarning(node: string, company: string, message: string): void {
    this.log(LogLevel.WARNING, node, company, message, { status: "fallback" });
  }

  static logError(
    node: string,
    company: string,
    message: string,
    errorCategory?: string,
  ): void {
    this.log(LogLevel.ERROR, node, company, message, {
      status: "error",
      errorCategory,
    });
    this.metrics.errors++;
  }

  static recordMetric(key: keyof ExecutionMetrics, value: number): void {
    (this.metrics[key] as number) += value;
  }

  static setMetric(key: keyof ExecutionMetrics, value: number): void {
    this.metrics[key] = value as never;
  }

  static startTrace(companyName: string): string {
    const id = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    this.traces.set(id, {
      requestId: id,
      companyName,
      startedAt: new Date().toISOString(),
      nodeExecutions: [],
      skippedNodes: [],
      totalApiCalls: 0,
      totalLlmCalls: 0,
    });
    return id;
  }

  static recordNodeExecution(
    requestId: string,
    node: string,
    status: string,
    durationMs: number,
    extra: {
      cacheHit?: boolean;
      retryCount?: number;
      fallbackUsed?: boolean;
      errorMessage?: string;
    } = {},
  ): void {
    const trace = this.traces.get(requestId);
    if (!trace) return;
    trace.nodeExecutions.push({
      node,
      status,
      durationMs,
      cacheHit: extra.cacheHit ?? false,
      retryCount: extra.retryCount ?? 0,
      fallbackUsed: extra.fallbackUsed ?? false,
      errorMessage: extra.errorMessage,
    });
  }

  static recordSkippedNode(requestId: string, node: string): void {
    const trace = this.traces.get(requestId);
    if (!trace) return;
    trace.skippedNodes.push(node);
  }

  static recordApiCall(requestId: string): void {
    const trace = this.traces.get(requestId);
    if (trace) trace.totalApiCalls++;
  }

  static recordLlmCall(requestId: string): void {
    const trace = this.traces.get(requestId);
    if (trace) trace.totalLlmCalls++;
  }

  static endTrace(requestId: string): void {
    const trace = this.traces.get(requestId);
    if (!trace) return;
    trace.completedAt = new Date().toISOString();
    trace.durationMs =
      new Date(trace.completedAt).getTime() -
      new Date(trace.startedAt).getTime();
  }

  static getTrace(requestId: string): Trace | undefined {
    return this.traces.get(requestId);
  }

  static getMetrics(): ExecutionMetrics {
    return { ...this.metrics };
  }

  static getLogs(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logs.filter((l) => l.level >= level);
    }
    return [...this.logs];
  }

  static clear(): void {
    this.logs = [];
    this.traces.clear();
    Object.assign(this.metrics, {
      totalExecutions: 0,
      totalDurationMs: 0,
      researchDurationMs: 0,
      extractionDurationMs: 0,
      knowledgeResolutionDurationMs: 0,
      generationDurationMs: 0,
      reviewDurationMs: 0,
      cacheHits: 0,
      cacheMisses: 0,
      retries: 0,
      fallbacks: 0,
      errors: 0,
      llmCalls: 0,
      avgApiLatencyMs: 0,
      avgTokensPerCall: 0,
    });
  }
}
