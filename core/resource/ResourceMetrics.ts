export interface ResourceMetrics {
  recordExhaustion(): void;
  recordAllocationLatency(timeMs: number): void;
  getMetrics(): {
    exhaustionRate: number;
    averageAllocationLatencyMs: number;
  };
}
