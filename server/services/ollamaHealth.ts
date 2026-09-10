/*
 * Issue #8: Harden Ollama proxy.
 *
 * Tracks Ollama provider health for observability and status reporting.
 * Keeps a rolling window of recent requests with latency, status, and error
 * classification so the /status endpoint can report real provider health —
 * not just "is the URL configured."
 */

type RequestRecord = {
  timestamp: number;
  latencyMs: number;
  success: boolean;
  errorType: string | null;
};

const MAX_RECORDS = 50;
const records: RequestRecord[] = [];

let consecutiveFailures = 0;
let lastError: string | null = null;
let lastErrorAt: number | null = null;
let totalRequests = 0;
let totalSuccesses = 0;

export function recordOllamaRequest(latencyMs: number, success: boolean, errorType?: string | null): void {
  totalRequests++;
  if (success) {
    totalSuccesses++;
    consecutiveFailures = 0;
  } else {
    consecutiveFailures++;
    lastError = errorType ?? "unknown";
    lastErrorAt = Date.now();
  }

  records.push({ timestamp: Date.now(), latencyMs, success, errorType: errorType ?? null });
  if (records.length > MAX_RECORDS) records.shift();
}

export type OllamaHealthStatus = {
  configured: boolean;
  model: string | null;
  totalRequests: number;
  totalSuccesses: number;
  successRate: number;
  consecutiveFailures: number;
  lastError: string | null;
  lastErrorAt: string | null;
  avgLatencyMs: number | null;
  recentRequests: number;
};

export function getOllamaHealth(): OllamaHealthStatus {
  const configured = Boolean(process.env.OLLAMA_BASE_URL?.trim());
  const model = process.env.OLLAMA_MODEL?.trim() || "llama3";

  const recent = records.slice(-20);
  const avgLatency = recent.length > 0
    ? Math.round(recent.reduce((sum, r) => sum + r.latencyMs, 0) / recent.length)
    : null;

  return {
    configured,
    model: configured ? model : null,
    totalRequests,
    totalSuccesses,
    successRate: totalRequests > 0 ? Math.round((totalSuccesses / totalRequests) * 100) / 100 : 1,
    consecutiveFailures,
    lastError,
    lastErrorAt: lastErrorAt ? new Date(lastErrorAt).toISOString() : null,
    avgLatencyMs: avgLatency,
    recentRequests: records.length,
  };
}

/** Reset for tests. */
export function __resetOllamaHealthForTests(): void {
  records.length = 0;
  consecutiveFailures = 0;
  lastError = null;
  lastErrorAt = null;
  totalRequests = 0;
  totalSuccesses = 0;
}
