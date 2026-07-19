import { AIOSEventBus } from '../event/AIOSEventBus';
import { ContainerDefinition } from './ContainerDefinition';

export class ContainerSupervisor {
  constructor(private readonly eventBus: AIOSEventBus) {}

  public async monitor(definition: ContainerDefinition, metrics: { cpu: number; memory: number }): Promise<void> {
    const quota = definition.resourceQuota;
    
    if (metrics.cpu > quota.cpuLimit || metrics.memory > quota.memoryLimit) {
      await this.publishEvent('QuotaExceeded', {
        containerId: definition.containerId,
        details: `Usage: CPU ${metrics.cpu}%, Memory ${metrics.memory}MB. Limit: CPU ${quota.cpuLimit}%, Memory ${quota.memoryLimit}MB.`,
        state: 'RUNNING'
      });
    }
  }

  public async triggerCrash(containerId: string, error: string): Promise<void> {
    await this.publishEvent('ProcessCrashed', {
      containerId,
      error,
      state: 'STOPPED'
    });
  }

  public async triggerHealthFailure(containerId: string, reason: string): Promise<void> {
    await this.publishEvent('HealthCheckFailed', {
      containerId,
      reason,
      state: 'RUNNING'
    });
  }

  private async publishEvent(eventType: string, payload: any): Promise<void> {
    await this.eventBus.publish({
      eventId: `EVT-SUPERV-${eventType.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      eventType,
      eventVersion: '1.0',
      occurredAt: new Date().toISOString(),
      producerRuntimeId: 'aios.container.supervisor',
      correlationId: `COR-SUP-${Date.now()}`,
      causationId: `CAU-SUP-${Date.now()}`,
      payload,
      runtimeId: 'aios.container.supervisor',
      timestamp: new Date().toISOString(),
      state: payload.state
    });
  }
}
