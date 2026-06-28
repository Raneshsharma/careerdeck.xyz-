export enum ErrorCategory {
  NETWORK = "network",
  AUTHENTICATION = "authentication",
  RATE_LIMIT = "rate_limit",
  PARSING = "parsing",
  VALIDATION = "validation",
  LLM = "llm",
  TIMEOUT = "timeout",
  UNKNOWN = "unknown",
}

export interface ClassifiedError {
  category: ErrorCategory;
  message: string;
  statusCode?: number;
  retryable: boolean;
  originalError: unknown;
}

const STATUS_TO_CATEGORY: Record<number, ErrorCategory> = {
  400: ErrorCategory.VALIDATION,
  401: ErrorCategory.AUTHENTICATION,
  403: ErrorCategory.AUTHENTICATION,
  404: ErrorCategory.VALIDATION,
  408: ErrorCategory.TIMEOUT,
  429: ErrorCategory.RATE_LIMIT,
  500: ErrorCategory.NETWORK,
  502: ErrorCategory.NETWORK,
  503: ErrorCategory.NETWORK,
  504: ErrorCategory.TIMEOUT,
};

export function classifyError(error: unknown): ClassifiedError {
  const message = error instanceof Error ? error.message : String(error ?? "unknown");
  const name = error instanceof Error ? error.name : "";

  // Timeout errors
  if (
    name === "AbortError" ||
    name === "TimeoutError" ||
    /time(?:-| )?out/i.test(message) ||
    /ETIMEDOUT/i.test(message)
  ) {
    return {
      category: ErrorCategory.TIMEOUT,
      message,
      retryable: true,
      originalError: error,
    };
  }

  // HTTP status code in message
  const statusMatch = message.match(/(?:status|error)\s+(\d{3})/i);
  if (statusMatch) {
    const status = parseInt(statusMatch[1]);
    const category = STATUS_TO_CATEGORY[status] ?? ErrorCategory.UNKNOWN;
    return {
      category,
      message,
      statusCode: status,
      retryable: [429, 500, 502, 503, 504, 408].includes(status),
      originalError: error,
    };
  }

  // Network errors
  if (
    name === "TypeError" ||
    /fetch failed/i.test(message) ||
    /network error/i.test(message) ||
    /ECONNREFUSED/i.test(message) ||
    /ENOTFOUND/i.test(message) ||
    /ECONNRESET/i.test(message)
  ) {
    return {
      category: ErrorCategory.NETWORK,
      message,
      retryable: true,
      originalError: error,
    };
  }

  // Auth errors
  if (
    /401|403|unauthorized|forbidden|invalid api key/i.test(message)
  ) {
    return {
      category: ErrorCategory.AUTHENTICATION,
      message,
      retryable: false,
      originalError: error,
    };
  }

  // Rate limit
  if (
    /429|rate limit|too many requests/i.test(message)
  ) {
    return {
      category: ErrorCategory.RATE_LIMIT,
      message,
      retryable: true,
      originalError: error,
    };
  }

  // LLM errors
  if (
    /llm|openai|gemini|anthropic|openrouter|model/i.test(message)
  ) {
    return {
      category: ErrorCategory.LLM,
      message,
      retryable: /429|500|502|503|504/i.test(message),
      originalError: error,
    };
  }

  // Parsing errors
  if (
    name === "SyntaxError" ||
    /json|parse|unexpected token/i.test(message)
  ) {
    return {
      category: ErrorCategory.PARSING,
      message,
      retryable: false,
      originalError: error,
    };
  }

  return {
    category: ErrorCategory.UNKNOWN,
    message,
    retryable: false,
    originalError: error,
  };
}
