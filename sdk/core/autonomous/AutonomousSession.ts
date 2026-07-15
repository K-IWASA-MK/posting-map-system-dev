import { AutonomousState } from './AutonomousState';

export interface AutonomousSession {
    sessionId: string;
    proposalId: string;
    correlationId: string;
    startedAt: string;
    status: AutonomousState;
    completedAt?: string;
}
