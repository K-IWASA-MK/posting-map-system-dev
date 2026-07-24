export interface BrowserWorkerMetrics {
  queueLength: number;
  averageWaitTimeMs: number;
  averageExecutionTimeMs: number;
  lockContentionCount: number;
  timeoutCount: number;
  retryCount: number;
  deadlockRecoveryCount: number;
}
