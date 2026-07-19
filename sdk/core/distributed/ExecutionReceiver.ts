import { ExecutionToken, RemoteAttestation, AttestationState } from './ExecutionToken';
import { AIOSEventBus } from '../event/AIOSEventBus';
import { ContainerRuntime } from '../container/ContainerRuntime';
import { ContainerDefinition } from '../container/ContainerDefinition';

export class ExecutionReceiver {
  private processedTokens = new Set<string>();

  constructor(
    private readonly eventBus: AIOSEventBus,
    private readonly containerRuntime: ContainerRuntime
  ) {}

  public async receive(token: ExecutionToken, attestation: RemoteAttestation): Promise<void> {
    // 1. Replay attack check
    if (this.processedTokens.has(token.nonce)) {
      throw new Error(`Replay Attack Detected: Token nonce ${token.nonce} already processed`);
    }
    this.processedTokens.add(token.nonce);

    // 2. Token expiration check
    if (Date.now() > token.expiresAt) {
      throw new Error('Token Expired: The provided ExecutionToken has expired');
    }

    // 3. Node Trust Score validation (minimum score of 70 for delegation)
    if (attestation.trustScore < 70) {
      throw new Error(`Trust Score Insufficient: Node trust score ${attestation.trustScore} is below threshold 70`);
    }

    // 4. Remote verification integrity check
    if (attestation.state === AttestationState.REJECTED || !attestation.runtimeIntegrity) {
      throw new Error('Remote Attestation Failed: Target node integrity check failed');
    }

    await this.publishEvent('ExecutionAccepted', {
      executionId: token.executionId,
      tokenId: token.tokenId,
      state: 'RUNNING'
    });

    // 5. Instantiation of local container runtime
    const quota = {
      quotaId: `Q-DIST-${token.executionId}`,
      cpuLimit: 75,
      memoryLimit: 1024,
      gpuLimit: 0,
      storageLimit: 15,
      networkLimit: 100
    };

    const containerDef: ContainerDefinition = {
      containerId: `C-DIST-${token.executionId}`,
      image: 'node:18-alpine',
      entrypoint: ['node'],
      environment: { AIOS_EXECUTION_ID: token.executionId },
      volumes: [],
      network: 'bridge',
      resourceQuota: quota,
      sandboxProfile: 'LIMITED_NETWORK'
    };

    // Prepare container Launcher & trigger build
    await this.containerRuntime.getLauncher().launch(containerDef);

    await this.publishEvent('ContainerStarted', {
      executionId: token.executionId,
      containerId: containerDef.containerId,
      state: 'RUNNING'
    });
  }

  private async publishEvent(eventType: string, payload: any): Promise<void> {
    await this.eventBus.publish({
      eventId: `EVT-REC-${eventType.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      eventType,
      eventVersion: '1.0',
      occurredAt: new Date().toISOString(),
      producerRuntimeId: 'aios.execution-receiver',
      correlationId: `COR-REC-${Date.now()}`,
      causationId: `CAU-REC-${Date.now()}`,
      payload,
      runtimeId: 'aios.execution-receiver',
      timestamp: new Date().toISOString(),
      state: payload.state
    });
  }
}
