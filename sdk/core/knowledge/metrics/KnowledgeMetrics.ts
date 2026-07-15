export class KnowledgeMetrics {
    private metrics = {
        knowledgeCount: 0,
        reusableCount: 0,
        deprecatedCount: 0,
        promotedCount: 0,
        totalValidations: 0,
        successfulValidations: 0,
        searchCount: 0,
        searchLatencyMs: 0,
        knowledgeGraphSize: 0
    };

    public recordCreation(): void {
        this.metrics.knowledgeCount++;
    }

    public recordPromotion(): void {
        this.metrics.promotedCount++;
    }

    public recordReusable(): void {
        this.metrics.reusableCount++;
    }

    public recordDeprecated(): void {
        this.metrics.deprecatedCount++;
    }

    public recordValidation(success: boolean): void {
        this.metrics.totalValidations++;
        if (success) {
            this.metrics.successfulValidations++;
        }
    }

    public recordSearch(latencyMs: number): void {
        this.metrics.searchCount++;
        this.metrics.searchLatencyMs += latencyMs;
    }

    public updateGraphSize(size: number): void {
        this.metrics.knowledgeGraphSize = size;
    }

    public getMetrics(): any {
        return {
            ...this.metrics,
            promotionRate: this.metrics.knowledgeCount > 0 ? (this.metrics.promotedCount / this.metrics.knowledgeCount) : 0,
            validationSuccessRate: this.metrics.totalValidations > 0 ? (this.metrics.successfulValidations / this.metrics.totalValidations) : 0,
            averageSearchLatency: this.metrics.searchCount > 0 ? (this.metrics.searchLatencyMs / this.metrics.searchCount) : 0
        };
    }
}
