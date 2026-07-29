import { TaskResultApplicationContext, TaskResultApplicationResult } from './models';
import { RepositoryUpdater } from './services/RepositoryUpdater';
import { DashboardProjectionUpdater } from './services/DashboardProjectionUpdater';
import { NotificationPublisher } from './services/NotificationPublisher';
import { AuditRecorder } from './services/AuditRecorder';
import { TaskResultPayload } from '../../integration/aios/callback/TaskResultPayload';
import { randomUUID } from 'crypto';

export class TaskResultSubscriber {
  constructor(
    private repositoryUpdater: RepositoryUpdater,
    private dashboardProjectionUpdater: DashboardProjectionUpdater,
    private notificationPublisher: NotificationPublisher,
    private auditRecorder: AuditRecorder
  ) {}

  /**
   * Subscribes to POSTINGMAP_TASK_COMPLETED event payload.
   * Acts as a pure orchestrator, calling each Application Service in order.
   * DOES NOT contain business logic or branching logic based on taskResult status.
   */
  public async handleTaskCompletedEvent(payload: Record<string, unknown>): Promise<TaskResultApplicationResult> {
    const taskResult = payload as unknown as TaskResultPayload;
    
    // Fallbacks if payload mapping missed fields
    const correlationId = (payload.correlationId as string) || randomUUID();
    const executionId = (payload.executionId as string) || taskResult.executionId || 'unknown-exec-id';
    const requestId = (payload.requestId as string) || undefined;
    
    const context = new TaskResultApplicationContext({
      taskResult,
      receivedAt: new Date(),
      correlationId,
      executionId,
      requestId
    });

    // 1. Generate Repository Update Request
    const repositoryRequest = this.repositoryUpdater.update(context);
    
    // 2. Generate Dashboard Projection Request
    const projectionRequest = this.dashboardProjectionUpdater.update(context);
    
    // 3. Generate Notification Request
    const notificationRequest = this.notificationPublisher.publish(context);
    
    // 4. Generate Audit Record Request
    const auditRequest = this.auditRecorder.record(context);

    // Note: Actual submission of these requests to the downstream Run-time layers
    // (e.g. putting into Message Queues or passing to Application Event Dispatcher)
    // is conceptually the final step of the subscriber pipeline. For this phase, 
    // returning the Result containing the requests completes the E2E Egress validation.

    const result = new TaskResultApplicationResult({
      repositoryUpdated: true,
      dashboardProjected: true,
      notificationPublished: true,
      auditRecorded: true,
      repositoryRequest,
      projectionRequest,
      notificationRequest,
      auditRequest
    });

    return result;
  }
}
