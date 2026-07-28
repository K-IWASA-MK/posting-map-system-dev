/**
 * WorkflowRequestBuilder.ts
 * 
 * Engine constructing WorkflowRequest from ProjectTaskRequest and ProjectContext
 */

import { ProjectTaskRequest } from '../intake/types/ProjectTaskRequest';
import { ProjectContext } from '../context/types/ProjectContext';
import { WorkflowRequest } from './types/WorkflowRequest';
import { WorkflowCategory } from '../../employee/workflow/types/WorkflowCategory';

export class WorkflowRequestBuilder {
  public static buildWorkflowRequest(
    request: ProjectTaskRequest,
    context: ProjectContext,
    taskId: string
  ): WorkflowRequest {
    // Map project taskType to internal AIOS WorkflowCategory or Blueprint
    let category = WorkflowCategory.ENGINEERING;
    let targetBlueprintId = 'bp-wf-e2e-delivery';

    if (request.taskType.includes('RESEARCH') || request.taskType.includes('INVESTIGATION')) {
      category = WorkflowCategory.RESEARCH;
      targetBlueprintId = 'bp-wf-research';
    } else if (request.taskType.includes('VALIDATION') || request.taskType.includes('AUDIT')) {
      category = WorkflowCategory.QUALITY_ASSURANCE;
      targetBlueprintId = 'bp-wf-validation';
    } else if (request.taskType.includes('DEPLOY') || request.taskType.includes('PUBLISH') || request.taskType.includes('OPERATIONS')) {
      category = WorkflowCategory.DEPLOYMENT;
      targetBlueprintId = 'bp-wf-deployment';
    }

    return {
      requestId: request.requestId,
      projectId: request.projectId,
      taskId,
      targetWorkflowCategory: category,
      targetBlueprintId,
      taskTitle: `Project Task [${request.projectId}]: ${request.taskType}`,
      payload: request.payload,
      context,
      requestedAt: new Date().toISOString()
    };
  }
}
