export interface RetryOptions {
  maxAttempts: number;
  baseDelayMs: number;
  shouldRetry: (error: Error, attempt: number) => boolean;
}

const NON_RETRYABLE_STATUSES = new Set([400, 401, 403, 404]);

const DEFAULT_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  shouldRetry: (_error, attempt) => attempt < 3,
};

function isNonRetryable(error: Error): boolean {
  if (error.message.includes("401") || error.message.includes("403")) return true;
  if (error.message.includes("404") || error.message.includes("Not Found")) return true;
  if (error.message.includes("invalid company") || error.message.includes("Invalid company")) return true;
  if (error.name === "AbortError") return true;
  return false;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {},
): Promise<T> {
  const { maxAttempts, baseDelayMs } = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      if (attempt >= maxAttempts || isNonRetryable(lastError)) {
        throw lastError;
      }
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
