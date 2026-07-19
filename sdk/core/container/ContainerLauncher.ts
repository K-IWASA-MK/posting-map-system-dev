import { ContainerDefinition } from './ContainerDefinition';
import { AIOSEventBus } from '../event/AIOSEventBus';
import { SandboxEngine } from '../sandbox/SandboxEngine';

export class ContainerLauncher {
  constructor(
    private readonly eventBus: AIOSEventBus,
    private readonly sandboxEngine: SandboxEngine
  ) {}

  public async launch(definition: ContainerDefinition): Promise<void> {
    // Event Flow: ExecutionQueued -> ContainerPrepared -> SandboxValidated -> SandboxCreated -> QuotaApplied -> SecretsInjected -> ProcessStarted
    
    await this.publishEvent('ContainerPrepared', {
      containerId: definition.containerId,
      state: 'PREPARING'
    });

    // 1. Policy validation and verification order check
    const policyResult = this.sandboxEngine.validatePolicyForContainer(definition);
    if (!policyResult.success) {
      throw new Error(`Sandbox Policy Validation Failed: ${policyResult.reason}`);
    }

    await this.publishEvent('SandboxValidated', {
      containerId: definition.containerId,
      state: 'STARTING'
    });

    await this.publishEvent('SandboxCreated', {
      containerId: definition.containerId,
      state: 'STARTING'
    });

    await this.publishEvent('QuotaApplied', {
      containerId: definition.containerId,
      quotaId: definition.resourceQuota.quotaId,
      state: 'STARTING'
    });

    await this.publishEvent('SecretsInjected', {
      containerId: definition.containerId,
      state: 'STARTING'
    });

    await this.publishEvent('ProcessStarted', {
      containerId: definition.containerId,
      state: 'RUNNING'
    });
  }

  public async destroy(containerId: string): Promise<void> {
    await this.publishEvent('ContainerDestroyed', {
      containerId,
      state: 'TERMINATED'
    });
  }

  private async publishEvent(eventType: string, payload: any): Promise<void> {
    await this.eventBus.publish({
      eventId: `EVT-CONT-${eventType.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      eventType,
      eventVersion: '1.0',
      occurredAt: new Date().toISOString(),
      producerRuntimeId: 'aios.container.launcher',
      correlationId: `COR-CONT-${Date.now()}`,
      causationId: `CAU-CONT-${Date.now()}`,
      payload,
      runtimeId: 'aios.container.launcher',
      timestamp: new Date().toISOString(),
      state: payload.state
    });
  }
}
