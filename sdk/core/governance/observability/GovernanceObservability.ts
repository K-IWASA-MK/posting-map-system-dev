import { GovernanceMetrics } from '../metrics/GovernanceMetrics';

export class GovernanceObservability {
    constructor(private metrics: GovernanceMetrics) {}

    public getStatusReport(): any {
        return {
            metrics: this.metrics.getMetrics(),
            queues: {
                pendingRequests: 0,
                currentGovernanceQueue: 0
            },
            status: {
                policyVersion: '1.0',
                isolationStatus: 'ACTIVE'
            },
            runtimeHealth: 'HEALTHY',
            timestamp: new Date().toISOString()
        };
    }

    public checkHealth(): boolean {
        const data = this.metrics.getMetrics();
        if (data.governanceHealthScore < 50) {
            return false;
        }
        return true;
    }
}
