import { classifyError } from "./errorClassifier";

export interface RetryConfig {
  maxAttempts: number;
  delaysMs: number[];
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  delaysMs: [1000, 2000, 4000],
};

export class RetryManager {
  static async execute<T>(
    fn: () => Promise<T>,
    config: Partial<RetryConfig> = {},
  ): Promise<T> {
    const { maxAttempts, delaysMs } = { ...DEFAULT_RETRY_CONFIG, ...config };
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (e) {
        lastError = e instanceof Error ? e : new Error(String(e));
        const classified = classifyError(lastError);

        if (!classified.retryable || attempt >= maxAttempts) {
          throw lastError;
        }

        const delay = delaysMs[attempt - 1] ?? delaysMs[delaysMs.length - 1];
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  static async executeWithTimeout<T>(
    fn: () => Promise<T>,
    timeoutMs: number,
    retryConfig: Partial<RetryConfig> = {},
  ): Promise<T> {
    return this.execute(async () => {
      return withTimeout(fn, timeoutMs);
    }, retryConfig);
  }
}

function withTimeout<T>(fn: () => Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout after ${ms}ms`));
    }, ms);

    fn()
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}
