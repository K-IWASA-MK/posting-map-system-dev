import { OrchestrationState } from './OrchestrationState';
import { ExecutionJob } from './models/ExecutionJob';

export interface OrchestrationSession {
    sessionId: string;
    job: ExecutionJob;
    status: OrchestrationState;
    startedAt: string;
    currentRetryCount: number;
}
