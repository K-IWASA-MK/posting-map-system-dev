import { IRuntime } from '../runtime/IRuntime';
import { RuntimeDescriptor } from '../runtime/RuntimeDescriptor';
import { RuntimeCapability } from '../runtime/RuntimeCapability';
import { RuntimeHealth, RuntimeHealthStatus } from '../runtime/RuntimeHealth';
import { RuntimeContext } from '../runtime/RuntimeContext';
import { AIOSEventBus } from '../event/AIOSEventBus';

import { ConsoleManifest } from './ConsoleManifest';
import { ConsoleRegistry } from './ConsoleRegistry';
import { ConsoleServices } from './services/ConsoleServices';
import { EventSubscriber } from './services/EventSubscriber';
import { ConsoleLedger } from './ledger/ConsoleLedger';
import { ConsoleMetricsCollector } from './metrics/ConsoleMetricsCollector';
import { DefaultConsolePolicy, ConsolePolicy } from './ConsolePolicy';

export class ConsoleRuntime implements IRuntime<ConsoleManifest, void> {
  public readonly runtimeId = 'aios.console';

  public readonly descriptor: RuntimeDescriptor = {
    runtimeId: this.runtimeId,
    runtimeName: 'System Console',
    version: '1.0.0',
    contractVersion: '1.0',
    capabilities: [RuntimeCapability.CAN_DISCOVER], // Console discovers & reads
    dependencies: []
  };

  private subscriber: EventSubscriber;
  private services: ConsoleServices;

  constructor(
    private readonly eventBus: AIOSEventBus,
    private readonly registry: ConsoleRegistry,
    private readonly policy: ConsolePolicy = DefaultConsolePolicy,
    ledger: ConsoleLedger = new ConsoleLedger(),
    metrics: ConsoleMetricsCollector = new ConsoleMetricsCollector()
  ) {
    this.subscriber = new EventSubscriber(this.eventBus, this.registry, metrics);
    this.services = new ConsoleServices(this.registry, metrics, ledger);
  }

  public async getHealth(): Promise<RuntimeHealth> {
    return {
      status: RuntimeHealthStatus.HEALTHY,
      reason: 'Console Runtime is active and listening to events',
      lastCheckedAt: new Date().toISOString()
    };
  }

  public async initialize(context: RuntimeContext): Promise<void> {
    console.log(`Console Runtime initializing...`);
    this.subscriber.subscribe();
  }

  public async validate(manifest: ConsoleManifest): Promise<void> {
    if (!manifest.consoleId || !manifest.configuration.port) {
      throw new Error('Invalid ConsoleManifest: Missing configuration');
    }
  }

  public async execute(manifest: ConsoleManifest): Promise<void> {
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
