import { LearningSession } from './LearningSession';
import { LearningSource } from './models/LearningSource';

export interface LearningContext {
    contextId: string;
    session: LearningSession;
    sources: LearningSource[];
    targetMetrics: string[];
}
