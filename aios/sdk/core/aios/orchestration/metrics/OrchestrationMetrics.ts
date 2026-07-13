export class OrchestrationMetrics {
    private metrics = {
        totalJobs: 0,
        completedJobs: 0,
        failedJobs: 0,
        cancelledJobs: 0,
        totalRetries: 0,
        totalPauses: 0,
        totalExecutionTimeMs: 0,
        dispatchLatencyMs: 0,
        dependencyResolutionTimeMs: 0,
        lockContentionCount: 0,
        timeoutCount: 0
    };

    public recordJob() { this.metrics.totalJobs++; }
    public recordCompletion(timeMs: number) { this.metrics.completedJobs++; this.metrics.totalExecutionTimeMs += timeMs; }
    public recordFailure() { this.metrics.failedJobs++; }
    public recordCancel() { this.metrics.cancelledJobs++; }
    public recordRetry() { this.metrics.totalRetries++; }
    public recordPause() { this.metrics.totalPauses++; }
    public recordDispatchLatency(ms: number) { this.metrics.dispatchLatencyMs += ms; }
    public recordDependencyResolution(ms: number) { this.metrics.dependencyResolutionTimeMs += ms; }
    public recordLockContention() { this.metrics.lockContentionCount++; }
    public recordTimeout() { this.metrics.timeoutCount++; }

    public getMetrics() {
        const total = this.metrics.totalJobs;
        return {
            ...this.metrics,
            successRate: total > 0 ? (this.metrics.completedJobs / total) : 0,
            failureRate: total > 0 ? (this.metrics.failedJobs / total) : 0,
            retryRate: total > 0 ? (this.metrics.totalRetries / total) : 0,
            averageExecutionTime: this.metrics.completedJobs > 0 ? (this.metrics.totalExecutionTimeMs / this.metrics.completedJobs) : 0,
            averageDispatchLatency: total > 0 ? (this.metrics.dispatchLatencyMs / total) : 0
        };
    }
}
