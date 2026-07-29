import { TaskResultApplicationContext } from '../models/TaskResultApplicationContext';
import { AuditRecordRequest } from '../models/AuditRecordRequest';

export class AuditRecorder {
  public record(context: TaskResultApplicationContext): AuditRecordRequest {
    // Generate the audit record request.
    // DOES NOT persist to Ledger or storage.
    // Audit Runtime handles persistence.
    const request: AuditRecordRequest = {
      taskId: context.taskResult.taskId,
      eventType: `TASK_${context.taskResult.status}`, // e.g., TASK_COMPLETED
      executionId: context.executionId,
      timestamp: context.receivedAt,
      details: {
        duration: context.taskResult.duration,
        requestId: context.requestId
      }
    };

    return Object.freeze(request);
  }
}
