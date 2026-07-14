export interface SchedulingMetrics {
  recordWaitTime(timeMs: number): void;
  recordDispatchLatency(timeMs: number): void;
  recordPreemption(): void;
  getMetrics(): {
    averageWaitTimeMs: number;
    averageDispatchLatencyMs: number;
    preemptionCount: number;
  };
}
