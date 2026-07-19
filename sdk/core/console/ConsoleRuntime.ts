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
  public readonly id = 'aios.console';
  public readonly version = '1.0.0';
  public readonly dependsOn = ['aios.validation'];
  public readonly runtimeId = this.id;

  public readonly descriptor: RuntimeDescriptor = {
    runtimeId: this.id,
    runtimeName: 'System Console',
    version: this.version,
    contractVersion: '1.0',
    capabilities: [RuntimeCapability.CAN_DISCOVER, RuntimeCapability.CONSOLE], // Console discovers & reads
    dependencies: [
      { runtimeId: 'aios.validation', version: '1.0.0', required: true }
    ]
  };

  private subscriber: EventSubscriber;
  private services: ConsoleServices;
  public manifest?: ConsoleManifest;

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
    return this.health();
  }

  public health(): RuntimeHealth {
    return {
      status: RuntimeHealthStatus.HEALTHY,
      reason: 'Console Runtime is active and listening to events',
      lastCheckedAt: new Date().toISOString(),
      lastChecked: new Date().toISOString(),
      message: 'Console Runtime is active and listening to events'
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
    this.manifest = manifest;
    await this.services.startServer(
      manifest.configuration.port,
      manifest.configuration.apiPrefix
    );
  }

  public async start(): Promise<void> {
    if (this.manifest) {
      await this.execute(this.manifest);
    }
  }

  public async stop(): Promise<void> {
    await this.shutdown();
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
