/**
 * TaskContractModels.ts
 * 
 * AIOS Task Contract Foundation Model
 * Immutable task contract generated solely by Task Gateway
 */

import { TaskIntent, TaskPriority } from './TaskGatewayModels';
import { WorkflowStage } from './WorkflowProfileModels';
import { WorkflowProfile } from './WorkflowProfile';
import { OutputPolicy } from './OutputPolicyModels';

export type TaskContractStatus = 'CONTRACT_GENERATED' | 'RECEIVED';

export interface CEODecisionProvenance {
  readonly ceoInput: string;
  readonly timestamp: string;
  readonly metadata?: Record<string, any>;
}

export interface TaskContract {
  readonly taskId: string;
  readonly intent: TaskIntent;
  readonly workflowProfile: WorkflowProfile;
  readonly workflowStages: ReadonlyArray<WorkflowStage>;
  readonly priority: TaskPriority;
  readonly status: TaskContractStatus;
  readonly outputLanguage: 'JA';
  readonly outputPolicy: OutputPolicy;
  readonly createdAt: string;
  readonly definitionOfDone: ReadonlyArray<string>;
  readonly ceoDecision: CEODecisionProvenance;
}
