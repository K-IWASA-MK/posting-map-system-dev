export class AgentMetrics {
    private metrics = {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        reasoningDurationMs: 0,
        planningDurationMs: 0,
        totalCost: 0,
        fallbackCount: 0,
        hallucinationDetectionCount: 0,
        successCount: 0,
        failureCount: 0
    };

    public recordUsage(promptTokens: number, completionTokens: number, costEstimate: number = 0): void {
        this.metrics.promptTokens += promptTokens;
        this.metrics.completionTokens += completionTokens;
        this.metrics.totalTokens += (promptTokens + completionTokens);
        this.metrics.totalCost += costEstimate;
    }

    public recordReasoningDuration(durationMs: number): void {
        this.metrics.reasoningDurationMs += durationMs;
    }

    public recordPlanningDuration(durationMs: number): void {
        this.metrics.planningDurationMs += durationMs;
    }

    public recordFallback(): void {
        this.metrics.fallbackCount++;
    }

    public recordHallucination(): void {
        this.metrics.hallucinationDetectionCount++;
    }

    public recordSuccess(): void {
        this.metrics.successCount++;
    }

    public recordFailure(): void {
        this.metrics.failureCount++;
    }

    public getMetrics(): any {
        return { ...this.metrics };
    }
}
