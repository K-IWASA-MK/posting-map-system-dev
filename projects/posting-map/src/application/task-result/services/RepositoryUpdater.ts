import { TaskResultApplicationContext } from '../models/TaskResultApplicationContext';
import { RepositoryUpdateRequest } from '../models/RepositoryUpdateRequest';

export class RepositoryUpdater {
  public update(context: TaskResultApplicationContext): RepositoryUpdateRequest {
    // Generate the repository update request based on the context.
    // DOES NOT interact with SpreadsheetApp or perform any persistence.
    // Business rule application is delegated to the Repository layer based on this request.
    const request: RepositoryUpdateRequest = {
      taskId: context.taskResult.taskId,
      idempotencyKey: `repo-update-${context.executionId}`,
      status: context.taskResult.status,
      completedAt: context.taskResult.completedAt,
      metadata: context.taskResult.metadata
    };

    return Object.freeze(request);
  }
}
