export type GovernanceDecisionStatus = 'APPROVED' | 'APPROVED_WITH_CONDITIONS' | 'DEFERRED' | 'REJECTED';

export interface GovernanceDecision {
    decisionId: string;
    requestId: string;
    status: GovernanceDecisionStatus;
    decisionReason: string;
    decisionScore: number;
    decisionConfidence: number;
    requiredConditions: string[];
    isolationLevel: string;
    expiry: string;
    decisionTimestamp: string;
}
