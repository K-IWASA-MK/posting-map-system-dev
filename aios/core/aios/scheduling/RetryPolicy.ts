export interface RetryPolicy {
  readonly maxRetry: number;
  readonly backoff: "LINEAR" | "EXPONENTIAL" | "FIXED";
  readonly strategy: "IMMEDIATE" | "DELAYED" | "QUEUE_END";
  readonly retryDelayMs: number;
}
