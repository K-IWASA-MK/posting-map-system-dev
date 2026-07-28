/**
 * TaskGatewayModels.ts
 * 
 * AIOS Task Gateway Domain Models
 * CEO Decision Intake & Intent Classification Types
 */

export type TaskIntent = 
  | 'QUESTION'
  | 'PLANNING'
  | 'DESIGN'
  | 'IMPLEMENTATION'
  | 'REVIEW'
  | 'AUDIT'
  | 'RESEARCH'
  | 'HOTFIX';

export type TaskPriority = 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';

export interface CEODecisionInput {
  readonly ceoInput: string;
  readonly timestamp: string;
  readonly taskId?: string;
  readonly requestedPriority?: TaskPriority;
  readonly definitionOfDone?: ReadonlyArray<string>;
  readonly metadata?: Record<string, any>;
}

export interface TaskGatewayResult {
  readonly contract: import('./TaskContractModels').TaskContract;
  readonly acceptedAt: string;
}
