import { TaskResultApplicationContext } from '../models/TaskResultApplicationContext';
import { ProjectionUpdateRequest } from '../models/ProjectionUpdateRequest';

export class DashboardProjectionUpdater {
  public update(context: TaskResultApplicationContext): ProjectionUpdateRequest {
    // Generate the dashboard projection update request.
    // DOES NOT compute the actual projection or interact with the Dashboard system directly.
    // The Projection Runtime will handle the recalculations.
    const request: ProjectionUpdateRequest = {
      taskId: context.taskResult.taskId,
      projectionType: 'AI_TASK_PROGRESS',
      payload: context.taskResult.payload,
      timestamp: context.receivedAt
    };

    return Object.freeze(request);
  }
}
