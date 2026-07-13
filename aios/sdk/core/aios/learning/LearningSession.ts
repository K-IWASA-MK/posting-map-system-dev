import { LearningState } from './LearningState';

export interface LearningSession {
    sessionId: string;
    correlationId: string;
    startedAt: string;
    completedAt?: string;
    status: LearningState;
}
