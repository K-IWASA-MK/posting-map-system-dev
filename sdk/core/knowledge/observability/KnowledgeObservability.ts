import { KnowledgeMetrics } from '../metrics/KnowledgeMetrics';

export class KnowledgeObservability {
    constructor(private metrics: KnowledgeMetrics) {}

    public getStatusReport(): any {
        return {
            metrics: this.metrics.getMetrics(),
            timestamp: new Date().toISOString()
        };
    }

    public checkHealth(): boolean {
        const metrics = this.metrics.getMetrics();
        // If average search latency > 1000ms, it's degraded
        if (metrics.averageSearchLatency > 1000) {
            return false;
        }
        return true;
    }
}
