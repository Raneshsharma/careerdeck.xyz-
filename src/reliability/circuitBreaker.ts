import { TelemetryService } from "./telemetry";

interface CircuitState {
  failures: number;
  openedAt: number | null;
  cooldownMs: number;
}

const DEFAULT_THRESHOLD = 5;
const DEFAULT_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

const circuits = new Map<string, CircuitState>();

export class CircuitBreaker {
  static async execute<T>(
    serviceName: string,
    companyName: string,
    fn: () => Promise<T>,
    options: { failureThreshold?: number; cooldownMs?: number } = {},
  ): Promise<T> {
    const threshold = options.failureThreshold ?? DEFAULT_THRESHOLD;
    const cooldown = options.cooldownMs ?? DEFAULT_COOLDOWN_MS;

    let circuit = circuits.get(serviceName);
    if (!circuit) {
      circuit = { failures: 0, openedAt: null, cooldownMs: cooldown };
      circuits.set(serviceName, circuit);
    }

    // Check if circuit is open
    if (circuit.failures >= threshold && circuit.openedAt) {
      const elapsed = Date.now() - circuit.openedAt;
      if (elapsed < cooldown) {
        // Circuit still open — skip this call
        TelemetryService.logWarning(
          serviceName,
          companyName,
          `Circuit open — skipping call (${circuit.failures} failures, cooldown ${Math.ceil((cooldown - elapsed) / 1000)}s remaining)`,
        );
        throw new Error(`Circuit open for ${serviceName}`);
      }
      // Half-open: allow trial
    }

    try {
      const result = await fn();
      // Success — reset circuit
      circuit.failures = 0;
      circuit.openedAt = null;
      return result;
    } catch (e) {
      circuit.failures++;
      if (circuit.failures >= threshold) {
        circuit.openedAt = Date.now();
        TelemetryService.logWarning(
          serviceName,
          companyName,
          `Circuit opened after ${circuit.failures} failures — cooldown ${cooldown / 1000}s`,
        );
      }
      throw e;
    }
  }

  static reset(serviceName: string): void {
    circuits.delete(serviceName);
  }

  static getState(serviceName: string): CircuitState | null {
    return circuits.get(serviceName) ?? null;
  }
}
