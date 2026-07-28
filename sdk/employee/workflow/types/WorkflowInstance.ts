/**
 * WorkflowInstance.ts
 * 
 * Dynamic Execution Instance of a Workflow bound to a specific Task
 */

import { WorkflowInstanceId } from './WorkflowInstanceId';
import { WorkflowId } from './WorkflowId';
import { WorkflowStage } from '../stage/types/WorkflowStage';

export enum WorkflowInstanceStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export interface WorkflowInstance {
  instanceId: WorkflowInstanceId;
  taskId: string;
  workflowId: WorkflowId;
  workflowName: string;
  currentStageId?: string;
  stages: WorkflowStage[];
  status: WorkflowInstanceStatus;
  startedAt: string;
  completedAt?: string;
}
