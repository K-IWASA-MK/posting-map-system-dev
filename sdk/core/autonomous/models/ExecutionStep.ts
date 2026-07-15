export interface ExecutionStep {
    stepId: string;
    order: number;
    actionType: string;
    payload: any;
    preCondition: string;
    postCondition: string;
    expectedOutput: string;
    rollbackPoint: boolean;
    timeoutMs: number;
    retryPolicy: {
        maxAttempts: number;
        backoffMs: number;
    };
    executionPolicy: 'PARALLEL' | 'SEQUENTIAL' | 'MANUAL_APPROVAL_REQUIRED';
}
