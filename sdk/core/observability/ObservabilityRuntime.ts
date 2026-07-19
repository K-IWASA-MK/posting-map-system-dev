import { IRuntime } from '../runtime/IRuntime';
import { RuntimeDescriptor } from '../runtime/RuntimeDescriptor';
import { RuntimeCapability } from '../runtime/RuntimeCapability';
import { RuntimeHealth, RuntimeHealthStatus } from '../runtime/RuntimeHealth';
import { RuntimeContext } from '../runtime/RuntimeContext';
import { RuntimeState } from '../runtime/RuntimeState';
import { ObservabilityManifest } from './ObservabilityManifest';
import { ObservabilityRegistry } from './ObservabilityRegistry';
import { TelemetryPipeline } from './pipeline/TelemetryPipeline';
import { AIOSEventBus } from '../event/AIOSEventBus';
import { AlertRule } from './ObservabilityRecord';

export class ObservabilityRuntime implements IRuntime<ObservabilityManifest, void> {
  public readonly id = 'aios.observability';
  public readonly version = '1.0.0';
  public readonly dependsOn = [];

  public readonly descriptor: RuntimeDescriptor = {
    runtimeId: this.id,
    runtimeName: 'Observability Runtime',
    version: this.version,
    contractVersion: '1.0',
    capabilities: [RuntimeCapability.OBSERVABILITY],
    dependencies: []
  };

  private readonly registry = new ObservabilityRegistry();
  private readonly pipeline: TelemetryPipeline;
  private context?: RuntimeContext;
  public manifest?: ObservabilityManifest;

  constructor(
    private readonly eventBus: AIOSEventBus,
    private readonly alertRules: AlertRule[] = []
  ) {
    this.pipeline = new TelemetryPipeline(this.registry, this.alertRules);
  }

  public getHealth(): Promise<RuntimeHealth> {
    return Promise.resolve(this.health());
  }

  public health(): RuntimeHealth {
    return {
      status: RuntimeHealthStatus.HEALTHY,
      lastCheckedAt: new Date().toISOString(),
      reason: 'Observability Runtime is active and monitoring telemetry pipeline',
      lastChecked: new Date().toISOString(),
      message: 'Observability Runtime is active and monitoring telemetry pipeline'
    };
  }

  public async initialize(context: RuntimeContext): Promise<void> {
    this.context = context;
    // Subscribe to EventBus as a passive consumer
    this.eventBus.subscribe('*', async (event) => {
      this.pipeline.processEvent(event);
    });
  }

  public async validate(manifest: ObservabilityManifest): Promise<void> {
    if (!manifest.observabilityId) {
      throw new Error('Invalid ObservabilityManifest: missing observabilityId');
    }
  }

  public async execute(manifest: ObservabilityManifest): Promise<void> {
    this.manifest = manifest;
  }

  public async start(): Promise<void> {}
  public async stop(): Promise<void> {}
  public async pause(): Promise<void> {}
  public async resume(): Promise<void> {}
  public async shutdown(): Promise<void> {}

  public getProjection(): any {
    return this.pipeline.generateProjection();
  }

  public forceProcessEvent(event: any): void {
    this.pipeline.processEvent(event);
  }
}
