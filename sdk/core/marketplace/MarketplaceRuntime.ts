import { IRuntime } from '../runtime/IRuntime';
import { RuntimeDescriptor } from '../runtime/RuntimeDescriptor';
import { RuntimeCapability } from '../runtime/RuntimeCapability';
import { RuntimeHealth, RuntimeHealthStatus } from '../runtime/RuntimeHealth';
import { RuntimeContext } from '../runtime/RuntimeContext';
import { AIOSEventBus } from '../event/AIOSEventBus';
import { AIOSEvent } from '../event/AIOSEvent';
import { MarketplaceRegistry } from './MarketplaceRegistry';
import { MarketplaceCatalog } from './MarketplaceCatalog';
import { MarketplaceSearch } from './MarketplaceSearch';
import { MarketplacePolicy } from './MarketplacePolicy';
import { MarketplaceEntry, MarketplaceReview } from '../service/ServiceModels';
import { RuntimeState } from '../runtime/RuntimeState';

export class MarketplaceRuntime implements IRuntime<void, void> {
  public readonly id = 'aios.marketplace';
  public readonly version = '1.0.0';
  public readonly dependsOn = [];

  public readonly descriptor: RuntimeDescriptor = {
    runtimeId: this.id,
    runtimeName: 'Marketplace Runtime',
    version: this.version,
    contractVersion: '1.0',
    capabilities: [RuntimeCapability.MARKETPLACE],
    dependencies: []
  };

  private readonly registry = new MarketplaceRegistry();
  private readonly catalog = new MarketplaceCatalog(this.registry);
  private readonly search = new MarketplaceSearch(this.registry);
  private readonly policy = new MarketplacePolicy();
  private context?: RuntimeContext;

  constructor(private readonly eventBus: AIOSEventBus) {}

  public getHealth(): Promise<RuntimeHealth> {
    return Promise.resolve(this.health());
  }

  public health(): RuntimeHealth {
    return {
      status: RuntimeHealthStatus.HEALTHY,
      lastCheckedAt: new Date().toISOString(),
      reason: 'Marketplace catalog index is synchronized',
      lastChecked: new Date().toISOString(),
      message: 'Marketplace catalog index is synchronized'
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

  public getRegistry(): MarketplaceRegistry {
    return this.registry;
  }

  public getCatalog(): MarketplaceCatalog {
    return this.catalog;
  }

  public getSearch(): MarketplaceSearch {
    return this.search;
  }

  public async publishService(entry: MarketplaceEntry): Promise<void> {
    if (!this.policy.validateEntry(entry)) {
      throw new Error(`Marketplace validation policy failed for entry: ${entry.entryId}`);
    }

    this.catalog.publishEntry(entry);
    
    await this.publishEvent('MarketplacePublished', {
      entryId: entry.entryId,
      serviceId: entry.serviceId,
      state: RuntimeState.RUNNING
    });
  }

  public async unpublishService(entryId: string): Promise<void> {
    this.catalog.unpublishEntry(entryId);
  }

  public async addServiceReview(review: MarketplaceReview): Promise<void> {
    this.catalog.addReview(review);
  }

  public async publishEvent(eventType: string, payload: any): Promise<void> {
    const event: AIOSEvent = {
      eventId: `EVT-MK-${eventType.toUpperCase()}-${Date.now()}`,
      eventType,
      eventVersion: '1.0',
      occurredAt: new Date().toISOString(),
      producerRuntimeId: this.id,
      correlationId: `COR-MK-${Date.now()}`,
      causationId: `CAU-MK-${Date.now()}`,
      payload,
      runtimeId: this.id,
      timestamp: new Date().toISOString(),
      state: payload.state
    };
    await this.eventBus.publish(event);
  }
}
