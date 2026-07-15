import { GovernanceState } from './GovernanceState';

export interface GovernanceSession {
    sessionId: string;
    requestId: string;
    correlationId: string;
    startedAt: string;
    status: GovernanceState;
}
