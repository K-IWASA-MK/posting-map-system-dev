import { ExecutionQueueItem, SchedulingPolicy } from './models/OrchestrationModels';
import { AIOSEventBus } from '../event/AIOSEventBus';

export class ExecutionDispatcher {
  constructor(private readonly eventBus: AIOSEventBus) {}

  public async dispatch(queueItem: ExecutionQueueItem): Promise<void> {
    await this.eventBus.publish({
      eventId: `EVT-ORCH-DISP-${Date.now()}`,
      eventType: 'WorkflowDispatched',
      eventVersion: '1.0',
      occurredAt: new Date().toISOString(),
      producerRuntimeId: 'aios.orchestration',
      correlationId: `COR-${queueItem.queueId}`,
      causationId: `CAU-${queueItem.queueId}`,
      payload: {
        queueId: queueItem.queueId,
        workflowId: queueItem.workflowId,
        applicationId: queueItem.applicationId,
        status: 'DISPATCHED'
      },
      runtimeId: 'aios.orchestration',
      timestamp: new Date().toISOString(),
      state: 'RUNNING'
    });
  }

  public sortQueue(items: ExecutionQueueItem[], policy: SchedulingPolicy): ExecutionQueueItem[] {
    const sorted = [...items];
    switch (policy) {
      case SchedulingPolicy.PRIORITY:
        const priorityWeight = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        return sorted.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);
      case SchedulingPolicy.DEADLINE:
        return sorted.sort((a, b) => {
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        });
      case SchedulingPolicy.FIFO:
      default:
        return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
  }
}
