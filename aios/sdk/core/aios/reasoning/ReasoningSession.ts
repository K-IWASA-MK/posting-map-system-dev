import { ReasoningState } from './ReasoningState';

export interface ReasoningSession {
    sessionId: string;
    correlationId?: string;
    agentId?: string;
    workflowId?: string;
    startedAt: string;
    completedAt?: string;
    status: ReasoningState;
}
