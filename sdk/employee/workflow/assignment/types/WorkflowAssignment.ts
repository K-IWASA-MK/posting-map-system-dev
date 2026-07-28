/**
 * WorkflowAssignment.ts
 * 
 * Full Workflow Assignment containing bindings for all Stages
 */

import { StageAssignment } from './StageAssignment';

export interface WorkflowAssignment {
  workflowInstanceId: string;
  taskId: string;
  stageAssignments: StageAssignment[];
  assignedAt: string;
}
