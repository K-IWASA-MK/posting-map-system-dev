import { LearningMetrics } from '../metrics/LearningMetrics';

export class LearningObservability {
    constructor(private metrics: LearningMetrics) {}

    public getStatusReport(): any {
        return {
            metrics: this.metrics.getMetrics(),
            queues: {
                learningQueue: 0,
                knowledgePromotionQueue: 0,
                recommendationQueue: 0
            },
            timestamp: new Date().toISOString()
        };
    }

    public checkHealth(): boolean {
        const data = this.metrics.getMetrics();
        if (data.averageLearningTime > 10000) {
            return false;
        }
        return true;
    }
}
