export class AutonomousMetrics {
    private metrics = {
        totalProposals: 0,
        acceptedProposals: 0,
        totalExecutions: 0,
        successfulExecutions: 0,
        totalRollbacks: 0,
        totalPromotions: 0,
        totalTimeMs: 0,
        riskDistribution: { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 } as Record<string, number>,
        totalValidations: 0,
        successfulValidations: 0
    };

    public recordProposal(accepted: boolean) {
        this.metrics.totalProposals++;
        if (accepted) this.metrics.acceptedProposals++;
    }

    public recordExecution(success: boolean, timeMs: number) {
        this.metrics.totalExecutions++;
        if (success) this.metrics.successfulExecutions++;
        this.metrics.totalTimeMs += timeMs;
    }

    public recordRisk(category: string) {
        if (this.metrics.riskDistribution[category] !== undefined) {
            this.metrics.riskDistribution[category]++;
        }
    }

    public recordValidation(success: boolean) {
        this.metrics.totalValidations++;
        if (success) this.metrics.successfulValidations++;
    }

    public recordRollback() { this.metrics.totalRollbacks++; }
    public recordPromotion() { this.metrics.totalPromotions++; }

    public getMetrics() {
        return {
            ...this.metrics,
            proposalAcceptanceRate: this.metrics.totalProposals > 0 ? (this.metrics.acceptedProposals / this.metrics.totalProposals) : 0,
            successRate: this.metrics.totalExecutions > 0 ? (this.metrics.successfulExecutions / this.metrics.totalExecutions) : 0,
            rollbackRate: this.metrics.totalExecutions > 0 ? (this.metrics.totalRollbacks / this.metrics.totalExecutions) : 0,
            validationAccuracy: this.metrics.totalValidations > 0 ? (this.metrics.successfulValidations / this.metrics.totalValidations) : 0,
            promotionRate: this.metrics.successfulExecutions > 0 ? (this.metrics.totalPromotions / this.metrics.successfulExecutions) : 0,
            averageTimeMs: this.metrics.totalExecutions > 0 ? (this.metrics.totalTimeMs / this.metrics.totalExecutions) : 0
        };
    }
}
