import { AgentMetrics } from '../metrics/AgentMetrics';
import { AgentStateMachine } from '../state/AgentStateMachine';

export class AgentObservability {
    constructor(
        private metrics: AgentMetrics,
        private stateMachine: AgentStateMachine
    ) {}

    public getStatusReport(): any {
        return {
            currentState: this.stateMachine.getState(),
            metrics: this.metrics.getMetrics(),
            timestamp: new Date().toISOString()
        };
    }

    public checkHealth(): boolean {
        const metrics = this.metrics.getMetrics();
        // Example logic for degraded state
        if (metrics.failureCount > 10 || metrics.hallucinationDetectionCount > 5) {
            return false;
        }
        return true;
    }
}
