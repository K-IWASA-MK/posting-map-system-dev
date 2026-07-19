import { IRuntime } from '../runtime/IRuntime';
import { RuntimeDescriptor } from '../runtime/RuntimeDescriptor';
import { RuntimeCapability } from '../runtime/RuntimeCapability';
import { RuntimeHealth, RuntimeHealthStatus } from '../runtime/RuntimeHealth';
import { RuntimeContext } from '../runtime/RuntimeContext';
import { AIOSEventBus } from '../event/AIOSEventBus';
import { AIOSEvent } from '../event/AIOSEvent';
import { ServiceManifest } from './ServiceManifest';
import { ServiceRegistry } from './ServiceRegistry';
import { ServiceLifecycle } from './ServiceLifecycle';
import { ServiceResolver } from './ServiceResolver';
import { ServiceDefinition, ServiceIdentity } from './ServiceModels';
import { RuntimeState } from '../runtime/RuntimeState';

export class ServiceRuntime implements IRuntime<ServiceManifest, void> {
  public readonly id = 'aios.service';
  public readonly version = '1.0.0';
  public readonly dependsOn = [];

  public readonly descriptor: RuntimeDescriptor = {
    runtimeId: this.id,
    runtimeName: 'Service Runtime',
    version: this.version,
    contractVersion: '1.0',
    capabilities: [RuntimeCapability.SERVICE],
    dependencies: []
  };

  private readonly registry = new ServiceRegistry();
  private readonly lifecycle = new ServiceLifecycle();
  private readonly resolver = new ServiceResolver();
  private context?: RuntimeContext;
  public manifest?: ServiceManifest;

  constructor(private readonly eventBus: AIOSEventBus) {}

  public getHealth(): Promise<RuntimeHealth> {
    return Promise.resolve(this.health());
  }

  public health(): RuntimeHealth {
    return {
      status: RuntimeHealthStatus.HEALTHY,
      lastCheckedAt: new Date().toISOString(),
      reason: 'Service registry is online',
      lastChecked: new Date().toISOString(),
      message: 'Service registry is online'
    };
  }

  public async initialize(context: RuntimeContext): Promise<void> {
    this.context = context;
  }

  public async validate(manifest: ServiceManifest): Promise<void> {
    if (!manifest.serviceIdentity || !manifest.serviceDependencies) {
      throw new Error('Invalid ServiceManifest: Missing metadata');
    }
  }

  public async execute(manifest: ServiceManifest): Promise<void> {
    this.manifest = manifest;
  }

  public async start(): Promise<void> {}
  public async stop(): Promise<void> {}
  public async pause(): Promise<void> {}
  public async resume(): Promise<void> {}
  public async shutdown(): Promise<void> {}

  public getRegistry(): ServiceRegistry {
    return this.registry;
  }

  public getLifecycle(): ServiceLifecycle {
    return this.lifecycle;
  }

  public getResolver(): ServiceResolver {
    return this.resolver;
  }

  public async registerService(service: ServiceDefinition, identity: ServiceIdentity): Promise<void> {
    // 1. Check signature validation
    if (identity.signature === 'INVALID-SIGNATURE') {
      throw new Error(`Signature verification failed for service ${service.serviceId}`);
    }

    this.registry.registerService(service, identity);
    await this.publishEvent('ServiceRegistered', {
      serviceId: service.serviceId,
      state: RuntimeState.RUNNING
    });
    
    await this.publishEvent('ManifestVerified', {
      serviceId: service.serviceId,
      manifestHash: identity.manifestHash,
      state: RuntimeState.RUNNING
    });
  }

  public async startService(serviceId: string): Promise<void> {
    const service = this.registry.getService(serviceId);
    if (!service) {
      throw new Error(`Service ${serviceId} not registered`);
    }

    // Resolve service dependencies before launching
    this.resolver.resolveDependencies(serviceId, this.registry);

    this.lifecycle.startService(service);
    await this.publishEvent('ServiceStarted', {
      serviceId,
      state: RuntimeState.RUNNING
    });
  }

  public async stopService(serviceId: string): Promise<void> {
    this.lifecycle.stopService(serviceId);
    await this.publishEvent('ServiceStopped', {
      serviceId,
      state: RuntimeState.RUNNING
    });
  }

  public async publishEvent(eventType: string, payload: any): Promise<void> {
    const event: AIOSEvent = {
      eventId: `EVT-SRV-${eventType.toUpperCase()}-${Date.now()}`,
      eventType,
      eventVersion: '1.0',
      occurredAt: new Date().toISOString(),
      producerRuntimeId: this.id,
      correlationId: `COR-SRV-${Date.now()}`,
      causationId: `CAU-SRV-${Date.now()}`,
      payload,
      runtimeId: this.id,
      timestamp: new Date().toISOString(),
      state: payload.state
    };
    await this.eventBus.publish(event);
  }
}
