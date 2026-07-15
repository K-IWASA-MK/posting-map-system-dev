export interface OptimizationMetrics {
  recordTime(operation: string, timeMs: number): void;
  incrementCounter(counter: string): void;
  getMetrics(): Record<string, any>;
}
