import { AIOSEventBus } from '../event/AIOSEventBus';
import { DistributedFailurePolicy } from './ExecutionToken';

export class DistributedExecutionSupervisor {
  constructor(private readonly eventBus: AIOSEventBus) {}

  public async handleNodeFailure(
    executionId: string,
    policy: DistributedFailurePolicy,
    details: string
  ): Promise<{ actionTriggered: string }> {
    
    await this.publishEvent('ExecutionNodeFailureDetected', {
      executionId,
      policy,
      details,
      state: 'RUNNING'
    });

    switch (policy) {
      case DistributedFailurePolicy.RETRY_LOCAL:
        return { actionTriggered: 'RETRY_LOCAL' };
      case DistributedFailurePolicy.RETRY_REMOTE:
        return { actionTriggered: 'RETRY_REMOTE' };
      case DistributedFailurePolicy.FAILOVER:
        return { actionTriggered: 'FAILOVER' };
      case DistributedFailurePolicy.ABORT:
      default:
        return { actionTriggered: 'ABORT' };
    }
  }

  private async publishEvent(eventType: string, payload: any): Promise<void> {
    await this.eventBus.publish({
      eventId: `EVT-SUPERV-DIST-${eventType.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      eventType,
      eventVersion: '1.0',
      occurredAt: new Date().toISOString(),
      producerRuntimeId: 'aios.distributed.supervisor',
      correlationId: `COR-DS-${Date.now()}`,
      causationId: `CAU-DS-${Date.now()}`,
      payload,
      runtimeId: 'aios.distributed.supervisor',
      timestamp: new Date().toISOString(),
      state: payload.state
    });
  }
}
