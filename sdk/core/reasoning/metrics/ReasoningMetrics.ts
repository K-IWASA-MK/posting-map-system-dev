export class ReasoningMetrics {
    private metrics = {
        reasoningCount: 0,
        decisionCount: 0,
        conflictCount: 0,
        totalDecisionTimeMs: 0,
        averageConfidence: 0,
        evidenceCount: 0,
        hypothesisCount: 0,
        cacheHits: 0,
        cacheAttempts: 0
    };

    public recordReasoningStart(): void {
        this.metrics.reasoningCount++;
    }

    public recordDecision(timeMs: number, confidence: number): void {
        this.metrics.decisionCount++;
        this.metrics.totalDecisionTimeMs += timeMs;
        // Running average
        this.metrics.averageConfidence = 
            ((this.metrics.averageConfidence * (this.metrics.decisionCount - 1)) + confidence) / this.metrics.decisionCount;
    }

    public recordConflict(): void {
        this.metrics.conflictCount++;
    }

    public recordEvidence(count: number): void {
        this.metrics.evidenceCount += count;
    }

    public recordHypotheses(count: number): void {
        this.metrics.hypothesisCount += count;
    }

    public recordCacheAccess(hit: boolean): void {
        this.metrics.cacheAttempts++;
        if (hit) {
            this.metrics.cacheHits++;
        }
    }

    public getMetrics(): any {
        return {
            ...this.metrics,
            averageDecisionTime: this.metrics.decisionCount > 0 ? (this.metrics.totalDecisionTimeMs / this.metrics.decisionCount) : 0,
            conflictRate: this.metrics.decisionCount > 0 ? (this.metrics.conflictCount / this.metrics.decisionCount) : 0,
            cacheHitRate: this.metrics.cacheAttempts > 0 ? (this.metrics.cacheHits / this.metrics.cacheAttempts) : 0
        };
    }
}
