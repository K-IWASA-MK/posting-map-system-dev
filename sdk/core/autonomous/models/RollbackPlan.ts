export interface RollbackPlan {
    rollbackPlanId: string;
    planId: string;
    rollbackSnapshot: string;
    rollbackTrigger: string;
    rollbackReason: string;
    rollbackDurationMs?: number;
    rollbackResult?: 'SUCCESS' | 'FAILED';
    rollbackEvidence?: string;
    steps: any[]; // Specific steps to reverse the execution plan
    createdAt: string;
}
