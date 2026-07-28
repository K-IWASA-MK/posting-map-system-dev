/**
 * TaskIntakeGateway.ts
 * 
 * Gateway receiving Project Task Requests, validating against capabilities & policies, and generating ProjectContext
 */

import { ProjectTaskRequest } from './types/ProjectTaskRequest';
import { ProjectTaskResponse } from './types/ProjectTaskResponse';
import { ProjectRegistry } from '../registry/ProjectRegistry';
import { ProjectContextResolver } from '../context/ProjectContextResolver';
import { ProjectContext } from '../context/types/ProjectContext';
import { WorkflowRequestBuilder } from '../workflow/WorkflowRequestBuilder';
import { WorkflowRequest } from '../workflow/types/WorkflowRequest';
import { ProjectEventPublisher } from '../event/ProjectEventPublisher';
import { ProjectEventType } from '../event/types/ProjectEventType';

export class TaskIntakeGateway {
  public static processIntake(request: ProjectTaskRequest): {
    response: ProjectTaskResponse;
    context?: ProjectContext;
    workflowRequest?: WorkflowRequest;
  } {
    const profile = ProjectRegistry.find(request.projectId);
    if (!profile) {
      return {
        response: {
          requestId: request.requestId,
          projectId: request.projectId,
          taskId: '',
          status: 'REJECTED',
          rejectionReason: `[TaskIntakeGateway] Project ID '${request.projectId}' not registered`,
          receivedAt: new Date().toISOString()
        }
      };
    }

    // Check supported task types
    const isTaskTypeSupported = profile.capability.supportedTaskTypes.includes(request.taskType);
    if (!isTaskTypeSupported) {
      return {
        response: {
          requestId: request.requestId,
          projectId: request.projectId,
          taskId: '',
          status: 'REJECTED',
          rejectionReason: `[TaskIntakeGateway] Task type '${request.taskType}' not supported by project capability`,
          receivedAt: new Date().toISOString()
        }
      };
    }

    const taskId = `task-${profile.projectId.getValue().toLowerCase()}-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const context = ProjectContextResolver.resolveContext(profile, request.parameters, { requestId: request.requestId });
    const workflowRequest = WorkflowRequestBuilder.buildWorkflowRequest(request, context, taskId);

    ProjectEventPublisher.publish(
      ProjectEventType.TASK_ACCEPTED,
      profile.projectId.getValue(),
      taskId,
      { requestId: request.requestId, taskType: request.taskType }
    );

    return {
      response: {
        requestId: request.requestId,
        projectId: request.projectId,
        taskId,
        status: 'ACCEPTED',
        receivedAt: new Date().toISOString()
      },
      context,
      workflowRequest
    };
  }
}
