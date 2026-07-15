import { AIOSEventBus, EventHandler } from '../../event/AIOSEventBus';
import { AIOSEvent } from '../../event/AIOSEvent';
import { DashboardRegistry } from '../DashboardRegistry';
import { DashboardMetricsCollector } from '../metrics/DashboardMetricsCollector';

export class EventSubscriber {
  private handler: EventHandler;

  constructor(
    private readonly eventBus: AIOSEventBus,
    private readonly registry: DashboardRegistry,
    private readonly metrics: DashboardMetricsCollector
  ) {
    this.handler = async (event: AIOSEvent<any>) => {
      const startTime = Date.now();
      this.registry.addEvent(event);

      try {
        switch (event.eventType) {
          case 'RuntimeStartedEvent':
            if (event.payload.runtimeId) {
              this.registry.updateRuntimeState(event.payload.runtimeId, {
                status: 'RUNNING',
                health: 'HEALTHY'
              });
            }
            break;
          case 'RuntimeStoppedEvent':
            if (event.payload.runtimeId) {
              this.registry.updateRuntimeState(event.payload.runtimeId, {
                status: 'STOPPED'
              });
            }
            break;
          case 'WorkflowStartedEvent':
            if (event.payload.workflowId) {
              this.registry.updateWorkflowState(event.payload.workflowId, {
                jobId: event.payload.jobId,
                state: 'RUNNING',
                startedAt: event.occurredAt
              });
            }
            break;
          case 'WorkflowCompletedEvent':
            if (event.payload.workflowId) {
              this.registry.updateWorkflowState(event.payload.workflowId, {
                state: 'COMPLETED',
                completedAt: event.occurredAt
              });
            }
            break;
          case 'WorkflowFailedEvent':
            if (event.payload.workflowId) {
              this.registry.updateWorkflowState(event.payload.workflowId, {
                state: 'FAILED',
                completedAt: event.occurredAt,
                errorReason: event.payload.reason
              });
            }
            break;
        }

        if (['WorkflowStartedEvent', 'WorkflowCompletedEvent', 'WorkflowFailedEvent', 'DeploymentCompletedEvent', 'ReleasePublishedEvent'].includes(event.eventType)) {
          this.registry.addLedgerEntry({
            time: event.occurredAt,
            runtime: event.producerRuntimeId,
            event: event.eventType,
            result: event.eventType.includes('Failed') ? 'FAILED' : 'SUCCESS',
            correlationId: event.correlationId
          });
        }
      } finally {
        this.metrics.recordEventProcessed(Date.now() - startTime);
      }
    };
  }

  public subscribe(): void {
    this.eventBus.subscribe('*', this.handler);
  }

  public unsubscribe(): void {
    this.eventBus.unsubscribe('*', this.handler);
  }
}
