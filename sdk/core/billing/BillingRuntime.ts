import { IRuntime } from '../runtime/IRuntime';
import { RuntimeDescriptor } from '../runtime/RuntimeDescriptor';
import { RuntimeCapability } from '../runtime/RuntimeCapability';
import { RuntimeHealth, RuntimeHealthStatus } from '../runtime/RuntimeHealth';
import { RuntimeContext } from '../runtime/RuntimeContext';
import { AIOSEventBus } from '../event/AIOSEventBus';
import { AIOSEvent } from '../event/AIOSEvent';
import { BillingProviderRegistry } from './BillingProvider';
import { BillingTransactionRegistry } from './BillingTransaction';
import { BillingPolicy } from './BillingPolicy';
import { BillingTransaction } from '../service/ServiceModels';
import { RuntimeState } from '../runtime/RuntimeState';

export class BillingRuntime implements IRuntime<void, void> {
  public readonly id = 'aios.billing';
  public readonly version = '1.0.0';
  public readonly dependsOn = [];

  public readonly descriptor: RuntimeDescriptor = {
    runtimeId: this.id,
    runtimeName: 'Billing Runtime',
    version: this.version,
    contractVersion: '1.0',
    capabilities: [RuntimeCapability.BILLING],
    dependencies: []
  };

  private readonly registry = new BillingProviderRegistry();
  private readonly transactions = new BillingTransactionRegistry();
  private readonly policy = new BillingPolicy();
  private context?: RuntimeContext;

  constructor(private readonly eventBus: AIOSEventBus) {}

  public getHealth(): Promise<RuntimeHealth> {
    return Promise.resolve(this.health());
  }

  public health(): RuntimeHealth {
    return {
      status: RuntimeHealthStatus.HEALTHY,
      lastCheckedAt: new Date().toISOString(),
      reason: 'Billing transaction provider is online',
      lastChecked: new Date().toISOString(),
      message: 'Billing transaction provider is online'
    };
  }

  public async initialize(context: RuntimeContext): Promise<void> {
    this.context = context;
  }

  public async validate(): Promise<void> {}
  public async execute(): Promise<void> {}
  public async start(): Promise<void> {}
  public async stop(): Promise<void> {}
  public async pause(): Promise<void> {}
  public async resume(): Promise<void> {}
  public async shutdown(): Promise<void> {}

  public getRegistry(): BillingProviderRegistry {
    return this.registry;
  }

  public getTransactions(): BillingTransactionRegistry {
    return this.transactions;
  }

  public async processPayment(
    providerId: string,
    licenseeId: string,
    serviceId: string,
    amount: number
  ): Promise<BillingTransaction> {
    if (!this.policy.validateBillingRequest(amount)) {
      throw new Error(`Invalid billing request amount: ${amount}`);
    }

    const provider = this.registry.getProvider(providerId);
    if (!provider) {
      throw new Error(`Billing provider ${providerId} not found`);
    }

    // Charge customer via provider
    const success = await provider.charge(licenseeId, amount);
    const txId = `TX-BILL-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    
    const tx: BillingTransaction = {
      txId,
      serviceId,
      providerId,
      amount,
      status: success ? 'PAID' : 'FAILED'
    };

    this.transactions.recordTransaction(tx);

    if (success) {
      await this.publishEvent('BillingAuthorized', {
        txId,
        serviceId,
        licenseeId,
        amount,
        state: RuntimeState.RUNNING
      });
    }

    return tx;
  }

  public async publishEvent(eventType: string, payload: any): Promise<void> {
    const event: AIOSEvent = {
      eventId: `EVT-BL-${eventType.toUpperCase()}-${Date.now()}`,
      eventType,
      eventVersion: '1.0',
      occurredAt: new Date().toISOString(),
      producerRuntimeId: this.id,
      correlationId: `COR-BL-${Date.now()}`,
      causationId: `CAU-BL-${Date.now()}`,
      payload,
      runtimeId: this.id,
      timestamp: new Date().toISOString(),
      state: payload.state
    };
    await this.eventBus.publish(event);
  }
}
