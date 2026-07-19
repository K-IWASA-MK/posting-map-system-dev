import { ExecutionToken, RemoteAttestation, AttestationState } from './ExecutionToken';
import { AIOSEventBus } from '../event/AIOSEventBus';
import { FederationRuntime } from '../federation/FederationRuntime';

export class ExecutionDelegator {
  private usedNonces = new Set<string>();

  constructor(
    private readonly eventBus: AIOSEventBus,
    private readonly federationRuntime: FederationRuntime
  ) {}

  public async delegate(
    executionId: string,
    sessionId: string,
    targetNodeId: string,
    workflowId: string,
    applicationId: string,
    attestation: RemoteAttestation
  ): Promise<ExecutionToken> {
    
    await this.publishEvent('ExecutionRequested', {
      executionId,
      targetNodeId,
      state: 'STARTING'
    });

    // 1. Verify remote attestation
    if (attestation.state === AttestationState.REJECTED || !attestation.runtimeIntegrity || !attestation.containerIntegrity) {
      throw new Error(`Remote Attestation verification failed for node ${targetNodeId}`);
    }

    await this.publishEvent('RemoteAttestationVerified', {
      executionId,
      targetNodeId,
      state: 'STARTING'
    });

    // 2. Issue ExecutionToken
    const nonce = `nonce-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    this.usedNonces.add(nonce);

    const token: ExecutionToken = {
      tokenId: `TOK-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      executionId,
      sessionId,
      issuerNode: 'aios.master.node',
      targetNode: targetNodeId,
      workflowId,
      applicationId,
      issuedAt: Date.now(),
      expiresAt: Date.now() + 300000, // 5 min expiry
      nonce,
      signature: `SIG-TOK-${Date.now()}`
    };

    await this.publishEvent('ExecutionDelegated', {
      executionId,
      targetNodeId,
      tokenId: token.tokenId,
      state: 'RUNNING'
    });

    return token;
  }

  public checkReplayAttack(nonce: string): boolean {
    return this.usedNonces.has(nonce);
  }

  private async publishEvent(eventType: string, payload: any): Promise<void> {
    await this.eventBus.publish({
      eventId: `EVT-DEL-${eventType.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      eventType,
      eventVersion: '1.0',
      occurredAt: new Date().toISOString(),
      producerRuntimeId: 'aios.execution-delegator',
      correlationId: `COR-DEL-${Date.now()}`,
      causationId: `CAU-DEL-${Date.now()}`,
      payload,
      runtimeId: 'aios.execution-delegator',
      timestamp: new Date().toISOString(),
      state: payload.state
    });
  }
}
