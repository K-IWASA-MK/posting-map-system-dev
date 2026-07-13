import { MemoryMetrics } from '../metrics/MemoryMetrics';

export class MemoryObservability {
    constructor(private metrics: MemoryMetrics) {}

    public getStatusReport(): any {
        return {
            metrics: this.metrics.getMetrics(),
            timestamp: new Date().toISOString()
        };
    }

    public checkHealth(): boolean {
        const data = this.metrics.getMetrics();
        // Degraded if retrieval takes more than 1000ms on average
        if (data.averageRetrievalTime > 1000) {
            return false;
        }
        return true;
    }
}
