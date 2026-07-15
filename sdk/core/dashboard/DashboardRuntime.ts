import { IRuntime } from '../runtime/IRuntime';
import { RuntimeDescriptor } from '../runtime/RuntimeDescriptor';
import { RuntimeCapability } from '../runtime/RuntimeCapability';
import { RuntimeHealth, RuntimeHealthStatus } from '../runtime/RuntimeHealth';
import { RuntimeContext } from '../runtime/RuntimeContext';
import { AIOSEventBus } from '../event/AIOSEventBus';

import { DashboardManifest } from './DashboardManifest';
import { DashboardRegistry } from './DashboardRegistry';
import { DashboardServices } from './services/DashboardServices';
import { EventSubscriber } from './services/EventSubscriber';
import { DashboardLedger } from './ledger/DashboardLedger';
import { DashboardMetricsCollector } from './metrics/DashboardMetricsCollector';
import { DefaultDashboardPolicy, DashboardPolicy } from './DashboardPolicy';

export class DashboardRuntime implements IRuntime<DashboardManifest, void> {
  public readonly runtimeId = 'aios.dashboard';

  public readonly descriptor: RuntimeDescriptor = {
    runtimeId: this.runtimeId,
    runtimeName: 'System Console',
    version: '1.0.0',
    contractVersion: '1.0',
    capabilities: [RuntimeCapability.CAN_DISCOVER], // Dashboard discovers & reads
    dependencies: []
  };

  private subscriber: EventSubscriber;
  private services: DashboardServices;

  constructor(
    private readonly eventBus: AIOSEventBus,
    private readonly registry: DashboardRegistry,
    private readonly policy: DashboardPolicy = DefaultDashboardPolicy,
    ledger: DashboardLedger = new DashboardLedger(),
    metrics: DashboardMetricsCollector = new DashboardMetricsCollector()
  ) {
    this.subscriber = new EventSubscriber(this.eventBus, this.registry, metrics);
    this.services = new DashboardServices(this.registry, metrics, ledger);
  }

  public async getHealth(): Promise<RuntimeHealth> {
    return {
      status: RuntimeHealthStatus.HEALTHY,
      reason: 'Dashboard Runtime is active and listening to events',
      lastCheckedAt: new Date().toISOString()
    };
  }

  public async initialize(context: RuntimeContext): Promise<void> {
    console.log(`Dashboard Runtime initializing...`);
    this.subscriber.subscribe();
  }

  public async validate(manifest: DashboardManifest): Promise<void> {
    if (!manifest.dashboardId || !manifest.configuration.port) {
      throw new Error('Invalid DashboardManifest: Missing configuration');
    }
  }

  public async execute(manifest: DashboardManifest): Promise<void> {
    await this.services.startServer(
      manifest.configuration.port,
      manifest.configuration.apiPrefix
    );
  }

  public async pause(): Promise<void> {
    this.subscriber.unsubscribe();
  }

  public async resume(): Promise<void> {
    this.subscriber.subscribe();
  }

  public async shutdown(): Promise<void> {
    this.subscriber.unsubscribe();
    await this.services.stopServer();
  }
}
