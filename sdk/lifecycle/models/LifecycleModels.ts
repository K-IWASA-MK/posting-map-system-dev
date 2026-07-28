/**
 * LifecycleModels.ts
 * 
 * AIOS Task Lifecycle Record & Transition Reason Code Models
 * Immutable LifecycleRecord capturing current state ("where it is") without embedded history.
 */

import { TaskOutcome, TaskState } from './TaskState';

export type TransitionReasonCode =
  | 'INITIAL_INTAKE'
  | 'AGENT_ASSIGNED'
  | 'PREPARATION_COMPLETE'
  | 'WORK_STARTED'
  | 'STAGE_COMPLETED'
  | 'VALIDATION_PASSED'
  | 'HANDOVER_PREPARED'
  | 'WORKFLOW_COMPLETED'
  | 'WORKFLOW_CLOSED'
  | 'STAGE_FAILED'
  | 'TASK_CANCELLED'
  | 'TASK_REJECTED';

export interface LifecycleRecord {
  readonly lifecycleId: string;
  readonly taskId: string;
  readonly assignmentId: string;
  readonly currentState: TaskState;
  readonly previousState: TaskState | 'NONE';
  readonly outcome: TaskOutcome;
  readonly previousOutcome: TaskOutcome | 'NONE';
  readonly transitionReasonCode: TransitionReasonCode;
  readonly transitionedAt: string;
}
