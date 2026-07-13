export interface RetryPolicy {
  maxRetries: number;
  backoffMultiplier: number;
  initialBackoffMs: number;
  retryableErrors: string[]; // e.g. ['NetworkError', 'TimeoutError', 'FlakyTest']
}
