import { IRuntime } from '../runtime/IRuntime';
import { RuntimeDescriptor } from '../runtime/RuntimeDescriptor';
import { RuntimeCapability } from '../runtime/RuntimeCapability';
import { RuntimeHealth, RuntimeHealthStatus } from '../runtime/RuntimeHealth';
import { RuntimeContext } from '../runtime/RuntimeContext';
import { AIOSEventBus } from '../event/AIOSEventBus';
import { AIOSEvent } from '../event/AIOSEvent';
import { GovernanceManifest } from './GovernanceManifest';
import { GovernanceRegistry } from './GovernanceRegistry';
import { GovernancePolicyLoader } from './GovernancePolicyLoader';
import { PolicyBundle } from './GovernanceModels';
import { RuntimeState } from '../runtime/RuntimeState';

export class GovernanceRuntime implements IRuntime<GovernanceManifest, void> {
  public readonly id = 'aios.governance';
  public readonly version = '1.0.0';
  public readonly dependsOn = [];

  public readonly descriptor: RuntimeDescriptor = {
    runtimeId: this.id,
    runtimeName: 'Governance Runtime',
    version: this.version,
    contractVersion: '1.0',
    capabilities: [RuntimeCapability.GOVERNANCE],
    dependencies: []
  };

  private readonly registry = new GovernanceRegistry();
  private readonly loader = new GovernancePolicyLoader(this.registry);
  private context?: RuntimeContext;
  public manifest?: GovernanceManifest;

  constructor(private readonly eventBus: AIOSEventBus) {}

  public getHealth(): Promise<RuntimeHealth> {
    return Promise.resolve(this.health());
  }

  public health(): RuntimeHealth {
    return {
      status: RuntimeHealthStatus.HEALTHY,
      lastCheckedAt: new Date().toISOString(),
      reason: 'Governance Policy Registry is active',
      lastChecked: new Date().toISOString(),
      message: 'Governance Policy Registry is active'
    };
  }

  public async initialize(context: RuntimeContext): Promise<void> {
    this.context = context;
  }

  public async validate(manifest: GovernanceManifest): Promise<void> {
    if (!manifest.governanceId || !manifest.configuration) {
      throw new Error('Invalid GovernanceManifest: Missing configuration');
    }
  }

  public async execute(manifest: GovernanceManifest): Promise<void> {
    this.manifest = manifest;
  }

  public async start(): Promise<void> {
    // Automatically load and activate default bundle on start
    const bundle = this.loader.loadDefaultBundle();
    await this.loadBundle(bundle);
    await this.activateBundle(bundle.version);
  }

  public async stop(): Promise<void> {}
  public async pause(): Promise<void> {}
  public async resume(): Promise<void> {}
  public async shutdown(): Promise<void> {}

  public async loadBundle(bundle: PolicyBundle): Promise<void> {
    this.registry.registerBundle(bundle);
    await this.publishEvent('PolicyLoaded', {
      bundleId: bundle.bundleId,
      version: bundle.version,
      state: RuntimeState.RUNNING
    });
  }

  public async activateBundle(version: string): Promise<void> {
    this.registry.activateBundle(version);
    const bundle = this.registry.getActiveBundle();
    if (bundle) {
      await this.publishEvent('PolicyActivated', {
        bundleId: bundle.bundleId,
        version: bundle.version,
        state: RuntimeState.RUNNING
      });
    }
  }

  public getActiveBundle(): PolicyBundle | undefined {
    return this.registry.getActiveBundle();
  }

  public getRegistry(): GovernanceRegistry {
    return this.registry;
  }

  private async publishEvent(eventType: string, payload: any): Promise<void> {
    const event: AIOSEvent = {
      eventId: `EVT-GV-${eventType.toUpperCase()}-${Date.now()}`,
      eventType,
      eventVersion: '1.0',
      occurredAt: new Date().toISOString(),
      producerRuntimeId: this.id,
      correlationId: `COR-GV-${Date.now()}`,
      causationId: `CAU-GV-${Date.now()}`,
      payload,
      runtimeId: this.id,
      timestamp: new Date().toISOString(),
      state: payload.state
    };
    await this.eventBus.publish(event);
  }
}
