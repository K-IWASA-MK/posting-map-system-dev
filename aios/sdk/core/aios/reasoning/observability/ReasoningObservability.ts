import { ReasoningMetrics } from '../metrics/ReasoningMetrics';

export class ReasoningObservability {
    constructor(private metrics: ReasoningMetrics) {}

    public getStatusReport(): any {
        return {
            metrics: this.metrics.getMetrics(),
            timestamp: new Date().toISOString()
        };
    }

    public checkHealth(): boolean {
        const data = this.metrics.getMetrics();
        // Degraded if decisions take too long or confidence drops significantly
        if (data.averageDecisionTime > 5000 || (data.decisionCount > 10 && data.averageConfidence < 0.3)) {
            return false;
        }
        return true;
    }
}
