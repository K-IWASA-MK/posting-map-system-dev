export class LearningMetrics {
    private metrics = {
        learningSessions: 0,
        patternsExtracted: 0,
        improvementsProposed: 0,
        knowledgePromoted: 0,
        optimizationsApplied: 0,
        recommendationsGenerated: 0,
        failuresAnalyzed: 0,
        totalLearningTimeMs: 0,
        patternReuseCount: 0,
        knowledgeReuseCount: 0,
        recommendationsAccepted: 0,
        failuresRecovered: 0
    };

    public recordSessionStart(): void {
        this.metrics.learningSessions++;
    }

    public recordPatterns(count: number): void {
        this.metrics.patternsExtracted += count;
    }

    public recordImprovements(count: number): void {
        this.metrics.improvementsProposed += count;
    }

    public recordPromotions(count: number): void {
        this.metrics.knowledgePromoted += count;
    }

    public recordSessionTime(ms: number): void {
        this.metrics.totalLearningTimeMs += ms;
    }

    public getMetrics(): any {
        return {
            ...this.metrics,
            averageLearningTime: this.metrics.learningSessions > 0 ? (this.metrics.totalLearningTimeMs / this.metrics.learningSessions) : 0,
            knowledgePromotionRate: this.metrics.patternsExtracted > 0 ? (this.metrics.knowledgePromoted / this.metrics.patternsExtracted) : 0,
            patternReuseRate: this.metrics.patternsExtracted > 0 ? (this.metrics.patternReuseCount / this.metrics.patternsExtracted) : 0,
            knowledgeReuseRate: this.metrics.knowledgePromoted > 0 ? (this.metrics.knowledgeReuseCount / this.metrics.knowledgePromoted) : 0,
            recommendationAcceptanceRate: this.metrics.recommendationsGenerated > 0 ? (this.metrics.recommendationsAccepted / this.metrics.recommendationsGenerated) : 0,
            failureRecoveryRate: this.metrics.failuresAnalyzed > 0 ? (this.metrics.failuresRecovered / this.metrics.failuresAnalyzed) : 0
        };
    }
}
