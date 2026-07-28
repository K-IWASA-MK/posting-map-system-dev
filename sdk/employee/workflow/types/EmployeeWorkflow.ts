/**
 * EmployeeWorkflow.ts
 * 
 * Immutable Workflow Definition containing ordered WorkflowStages
 */

import { WorkflowId } from './WorkflowId';
import { WorkflowCategory } from './WorkflowCategory';
import { WorkflowStage } from '../stage/types/WorkflowStage';

export interface EmployeeWorkflow {
  workflowId: WorkflowId;
  workflowName: string;
  category: WorkflowCategory;
  description: string;
  stages: WorkflowStage[];
  createdAt: string;
}
