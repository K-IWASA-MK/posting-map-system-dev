export enum RetryStrategy {
  NO_RETRY = 'NO_RETRY',
  RETRY_1 = 'RETRY_1',
  RETRY_3 = 'RETRY_3',
  EXPONENTIAL_BACKOFF = 'EXPONENTIAL_BACKOFF'
}

export interface RetryPolicy {
  strategy: RetryStrategy;
  maxAttempts: number;
  backoffFactorMs: number;
}
