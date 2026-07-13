export interface ExecutionJob {
    jobId: string;
    executionPlanId: string;
    proposalId: string;
    governanceDecisionId: string;
    priority: string;
    executionMode: string;
    targetRuntime: string;
    executionPolicy: string;
    traceId: string;
    sessionId: string;
    createdAt: string;
    
    // Steps to execute
    steps: string[];
}
