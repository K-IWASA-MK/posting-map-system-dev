export interface ExecutionMetrics {
  recordExecutionTime(timeMs: number): void;
  recordRollback(): void;
  getMetrics(): {
    averageExecutionTimeMs: number;
    rollbackCount: number;
  };
}
