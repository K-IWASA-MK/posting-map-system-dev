import { TaskResultApplicationContext } from '../models/TaskResultApplicationContext';
import { NotificationRequest } from '../models/NotificationRequest';

export class NotificationPublisher {
  public publish(context: TaskResultApplicationContext): NotificationRequest {
    // Generate the notification request.
    // DOES NOT execute actual notification sending (e.g. LINE API, Email).
    // The Notification Runtime will handle the transmission.
    const eventType = context.taskResult.status === 'COMPLETED' 
      ? 'TASK_COMPLETED_NOTIFICATION' 
      : (context.taskResult.status === 'FAILED' ? 'TASK_FAILED_NOTIFICATION' : 'TASK_STATUS_NOTIFICATION');

    const request: NotificationRequest = {
      channel: 'DEFAULT', // Abstract channel mapping
      eventType: eventType,
      recipient: 'SYSTEM_ADMIN', // Target resolution is handled downstream
      payload: {
        taskId: context.taskResult.taskId,
        executionId: context.executionId,
        metadata: context.taskResult.metadata
      }
    };

    return Object.freeze(request);
  }
}
