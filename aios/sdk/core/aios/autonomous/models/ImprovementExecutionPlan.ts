import { ExecutionStep } from './ExecutionStep';

export interface ImprovementExecutionPlan {
    planId: string;
    proposalId: string;
    steps: ExecutionStep[];
    estimatedDurationMs: number;
    requiresDowntime: boolean;
    rollbackPlanId?: string;
    createdAt: string;
}
