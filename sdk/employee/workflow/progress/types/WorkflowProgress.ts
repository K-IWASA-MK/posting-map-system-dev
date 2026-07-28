/**
 * WorkflowProgress.ts
 * 
 * Progress tracking model for a WorkflowInstance
 */

import { WorkflowInstanceStatus } from '../../types/WorkflowInstance';

export interface WorkflowProgress {
  workflowInstanceId: string;
  taskId: string;
  currentStageId?: string;
  completedStageIds: string[];
  remainingStageIds: string[];
  progressPercentage: number;
  status: WorkflowInstanceStatus;
  producedArtifacts: string[];
  lastUpdated: string;
}
