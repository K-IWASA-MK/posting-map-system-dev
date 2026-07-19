import { AIOSEventBus } from '../event/AIOSEventBus';

export enum SecretState {
  REGISTERED = 'REGISTERED',
  AUTHORIZED = 'AUTHORIZED',
  INJECTED = 'INJECTED',
  REVOKED = 'REVOKED',
  DESTROYED = 'DESTROYED'
}

export interface IsolatedSecret {
  secretId: string;
  state: SecretState;
  updatedAt: string;
}

export class SecretIsolation {
  private secrets = new Map<string, IsolatedSecret>();

  constructor(private readonly eventBus: AIOSEventBus) {}

  public registerSecret(secretId: string): void {
    this.secrets.set(secretId, {
      secretId,
      state: SecretState.REGISTERED,
      updatedAt: new Date().toISOString()
    });
  }

  public async transitionTo(secretId: string, newState: SecretState): Promise<void> {
    const entry = this.secrets.get(secretId);
    if (entry) {
      this.secrets.set(secretId, {
        secretId,
        state: newState,
        updatedAt: new Date().toISOString()
      });

      await this.eventBus.publish({
        eventId: `EVT-SEC-${newState}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        eventType: 'SecretStateTransitioned',
        eventVersion: '1.0',
        occurredAt: new Date().toISOString(),
        producerRuntimeId: 'aios.secret-isolation',
        correlationId: `COR-SEC-${Date.now()}`,
        causationId: `CAU-SEC-${Date.now()}`,
        payload: {
          secretId,
          state: newState
        },
        runtimeId: 'aios.secret-isolation',
        timestamp: new Date().toISOString(),
        state: 'RUNNING'
      });
    }
  }

  public getSecretState(secretId: string): SecretState | undefined {
    return this.secrets.get(secretId)?.state;
  }
}
