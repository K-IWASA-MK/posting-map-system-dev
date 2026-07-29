/**
 * TaskResultMapper.ts
 * Maps AIOS TaskResult to internal POSTING MAP domain events/models.
 */
import { TaskResultPayload } from '../../integration/aios/callback/TaskResultPayload';

export class TaskResultMapper {
  static toInternalEventPayload(taskResult: TaskResultPayload): Record<string, unknown> {
    // Pure mapping without business logic.
    return {
      internalTaskId: taskResult.taskId,
      executionId: taskResult.executionId,
      finalStatus: taskResult.status,
      durationMs: taskResult.duration,
      completedAt: taskResult.completedAt,
      resultPayload: taskResult.payload,
      errorDetails: taskResult.error,
      metadata: taskResult.metadata
    };
  }
}
