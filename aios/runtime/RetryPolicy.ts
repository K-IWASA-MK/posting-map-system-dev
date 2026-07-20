export interface RetryPolicy {
  readonly policyId: string;
  readonly maxRetries: number;
  readonly retryIntervalMs: number;
}
