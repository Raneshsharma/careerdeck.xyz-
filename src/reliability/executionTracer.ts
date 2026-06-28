import { TelemetryService } from "./telemetry";

export class ExecutionTracer {
  static async traceNode<T>(
    requestId: string,
    nodeName: string,
    companyName: string,
    fn: () => Promise<T>,
    extra: {
      cacheHit?: boolean;
      retryCount?: number;
      fallbackUsed?: boolean;
    } = {},
  ): Promise<T> {
    const startTime = Date.now();

    TelemetryService.log(0, nodeName, companyName, "start", {
      status: "start",
    });

    try {
      const result = await fn();
      const durationMs = Date.now() - startTime;

      TelemetryService.recordNodeExecution(
        requestId,
        nodeName,
        "success",
        durationMs,
        {
          cacheHit: extra.cacheHit ?? false,
          retryCount: extra.retryCount ?? 0,
          fallbackUsed: extra.fallbackUsed ?? false,
        },
      );

      TelemetryService.log(1, nodeName, companyName, "completed", {
        status: "end",
        durationMs,
        cacheUsed: extra.cacheHit ?? false,
        retryCount: extra.retryCount ?? 0,
      });

      return result;
    } catch (e) {
      const durationMs = Date.now() - startTime;
      const msg = e instanceof Error ? e.message : String(e);

      TelemetryService.recordNodeExecution(
        requestId,
        nodeName,
        "error",
        durationMs,
        {
          errorMessage: msg,
          retryCount: extra.retryCount ?? 0,
          fallbackUsed: extra.fallbackUsed ?? false,
        },
      );

      TelemetryService.logError(nodeName, companyName, msg);

      throw e;
    }
  }
}
