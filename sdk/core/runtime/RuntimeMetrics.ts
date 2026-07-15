export interface RuntimeMetrics {
  executionCount: number;
  successCount: number;
  failureCount: number;
  averageDurationMs: number;
  p95DurationMs: number;
  p99DurationMs: number;
  memoryUsageBytes: number;
  cpuUsagePercent: number;
  queueDepth: number;
  lastMeasuredAt: string;
}
