export interface GovernanceRequest {
    requestId: string;
    sourceRuntime: string;
    targetRuntime: string;
    requestedAction: string;
    requestedVersion: string;
    priority: string;
    riskScore: number;
    confidence: number;
    dependencies: string[];
    requiredPolicies: string[];
    requestedBy: string;
    traceId: string;
    executionPlanId: string;
    proposalId: string;
    createdAt: string;
}
