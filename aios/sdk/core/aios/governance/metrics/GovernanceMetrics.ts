export class GovernanceMetrics {
    private metrics = {
        totalRequests: 0,
        approvedRequests: 0,
        rejectedRequests: 0,
        deferredRequests: 0,
        policyConflicts: 0,
        isolationAppliedCount: 0,
        dependencyFailures: 0,
        totalTimeMs: 0
    };

    public recordRequest() { this.metrics.totalRequests++; }
    public recordDecision(status: string) {
        if (status === 'APPROVED' || status === 'APPROVED_WITH_CONDITIONS') {
            this.metrics.approvedRequests++;
        } else if (status === 'REJECTED') {
            this.metrics.rejectedRequests++;
        } else if (status === 'DEFERRED') {
            this.metrics.deferredRequests++;
        }
    }
    public recordPolicyConflict() { this.metrics.policyConflicts++; }
    public recordIsolation() { this.metrics.isolationAppliedCount++; }
    public recordDependencyFailure() { this.metrics.dependencyFailures++; }
    public recordTime(timeMs: number) { this.metrics.totalTimeMs += timeMs; }

    public getMetrics() {
        return {
            ...this.metrics,
            approvalRate: this.metrics.totalRequests > 0 ? (this.metrics.approvedRequests / this.metrics.totalRequests) : 0,
            rejectionRate: this.metrics.totalRequests > 0 ? (this.metrics.rejectedRequests / this.metrics.totalRequests) : 0,
            deferredRate: this.metrics.totalRequests > 0 ? (this.metrics.deferredRequests / this.metrics.totalRequests) : 0,
            policyConflictRate: this.metrics.totalRequests > 0 ? (this.metrics.policyConflicts / this.metrics.totalRequests) : 0,
            approvalLatency: this.metrics.totalRequests > 0 ? (this.metrics.totalTimeMs / this.metrics.totalRequests) : 0,
            governanceHealthScore: 100 - (this.metrics.policyConflicts * 5) - (this.metrics.dependencyFailures * 10)
        };
    }
}
