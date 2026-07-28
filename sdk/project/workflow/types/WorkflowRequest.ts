/**
 * WorkflowRequest.ts
 * 
 * Internal AIOS Workflow Request constructed by Project Bridge from a client project request
 */

import { WorkflowCategory } from '../../../employee/workflow/types/WorkflowCategory';
import { ProjectContext } from '../../context/types/ProjectContext';

export interface WorkflowRequest {
  requestId: string;
  projectId: string;
  taskId: string;
  targetWorkflowCategory: WorkflowCategory;
  targetBlueprintId?: string;
  taskTitle: string;
  payload: Record<string, any>;
  context: ProjectContext;
  requestedAt: string;
}
