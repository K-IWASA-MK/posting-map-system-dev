export class WorkflowMetricsCollector {
  private readonly metrics = {
    executionCount: 0,
    successCount: 0,
    failureCount: 0,
    retryCount: 0,
    totalDurationMs: 0,
    stepDurations: new Map<string, number[]>()
  };

  public recordExecution(durationMs: number, success: boolean): void {
    this.metrics.executionCount++;
    if (success) {
      this.metrics.successCount++;
    } else {
      this.metrics.failureCount++;
    }
    this.metrics.totalDurationMs += durationMs;
  }

  public recordStepDuration(stepId: string, durationMs: number): void {
    const durations = this.metrics.stepDurations.get(stepId) || [];
    durations.push(durationMs);
    this.metrics.stepDurations.set(stepId, durations);
  }

  public recordRetry(): void {
    this.metrics.retryCount++;
  }

  public getReport(): Record<string, unknown> {
    const avgDuration = this.metrics.executionCount > 0 
      ? this.metrics.totalDurationMs / this.metrics.executionCount 
      : 0;

    const avgStepDurations: Record<string, number> = {};
    for (const [stepId, durations] of this.metrics.stepDurations.entries()) {
      const total = durations.reduce((a, b) => a + b, 0);
      avgStepDurations[stepId] = durations.length > 0 ? total / durations.length : 0;
    }

    return {
      executionCount: this.metrics.executionCount,
      successRate: this.metrics.executionCount > 0 ? this.metrics.successCount / this.metrics.executionCount : 0,
      failureRate: this.metrics.executionCount > 0 ? this.metrics.failureCount / this.metrics.executionCount : 0,
      averageDurationMs: avgDuration,
      retryCount: this.metrics.retryCount,
      averageStepDurations: avgStepDurations
    };
  }
}
