export interface RuntimeMetric {
  readonly runtime: string;
  readonly executionCount: number;
  readonly successCount: number;
  readonly failureCount: number;
  readonly averageDuration: number;
  readonly lastExecutedAt: number;
}
