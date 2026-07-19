import { IRuntime } from '../runtime/IRuntime';
import { RuntimeDescriptor } from '../runtime/RuntimeDescriptor';
import { RuntimeCapability } from '../runtime/RuntimeCapability';
import { RuntimeHealth, RuntimeHealthStatus } from '../runtime/RuntimeHealth';
import { RuntimeContext } from '../runtime/RuntimeContext';
import { AIOSEventBus } from '../event/AIOSEventBus';
import { AIOSEvent } from '../event/AIOSEvent';
import { QualityManifest } from './QualityManifest';
import { QualityPolicyEngine } from './QualityPolicyEngine';
import { QualityEvaluation } from './QualityEvaluation';
import { RuntimeState } from '../runtime/RuntimeState';

export class QualityRuntime implements IRuntime<QualityManifest, void> {
  public readonly id = 'aios.quality';
  public readonly version = '1.0.0';
  public readonly dependsOn = ['aios.observability'];

  public readonly descriptor: RuntimeDescriptor = {
    runtimeId: this.id,
    runtimeName: 'Quality Runtime',
    version: this.version,
    contractVersion: '1.0',
    capabilities: [RuntimeCapability.QUALITY],
    dependencies: [
      { runtimeId: 'aios.observability', version: '1.0.0', required: true }
    ]
  };

  private readonly policyEngine = new QualityPolicyEngine();
  private context?: RuntimeContext;
  public manifest?: QualityManifest;
  private observabilityRuntime?: any;

  constructor(private readonly eventBus: AIOSEventBus) {}

  public setObservabilityRuntime(obs: any): void {
    this.observabilityRuntime = obs;
  }

  public getHealth(): Promise<RuntimeHealth> {
    return Promise.resolve(this.health());
  }

  public health(): RuntimeHealth {
    return {
      status: RuntimeHealthStatus.HEALTHY,
      lastCheckedAt: new Date().toISOString(),
      reason: 'Quality Policy Engine is active',
      lastChecked: new Date().toISOString(),
      message: 'Quality Policy Engine is active'
    };
  }

  public async initialize(context: RuntimeContext): Promise<void> {
    this.context = context;
    // Subscribe to TelemetryCollected events to evaluate quality rules
    this.eventBus.subscribe('TelemetryCollected', async (event) => {
      await this.evaluateQuality(event);
    });
  }

  public async validate(manifest: QualityManifest): Promise<void> {
    if (!manifest.qualityId || !manifest.configuration) {
      throw new Error('Invalid QualityManifest: Missing configuration');
    }
  }

  public async execute(manifest: QualityManifest): Promise<void> {
    this.manifest = manifest;
  }

  public async start(): Promise<void> {}
  public async stop(): Promise<void> {}
  public async pause(): Promise<void> {}
  public async resume(): Promise<void> {}
  public async shutdown(): Promise<void> {}

  private lastEvaluation?: QualityEvaluation;

  public getLastEvaluation(): QualityEvaluation | undefined {
    return this.lastEvaluation;
  }

  public async evaluateQuality(triggerEvent: AIOSEvent): Promise<QualityEvaluation | undefined> {
    if (!this.observabilityRuntime) return undefined;

    const projection = this.observabilityRuntime.getProjection();
    const config = this.manifest?.configuration || {
      minPassingOverallScore: 80,
      minPassingHealthScore: 80,
      minPassingStabilityScore: 90
    };

    const evaluation = this.policyEngine.evaluate(projection, config);
    this.lastEvaluation = evaluation;

    // 1. Publish QualityEvaluated
    await this.publishEvent('QualityEvaluated', {
      qualityEvaluationId: evaluation.qualityEvaluationId,
      scores: evaluation.scores,
      policyPassed: evaluation.policyPassed,
      state: RuntimeState.RUNNING
    });

    // 2. Publish RecommendationGenerated for each recommendation
    for (const rec of evaluation.recommendations) {
      await this.publishEvent('RecommendationGenerated', {
        recommendationId: rec.recommendationId,
        qualityEvaluationId: rec.qualityEvaluationId,
        suggestedAction: rec.suggestedAction,
        reason: rec.reason,
        priority: rec.priority,
        state: RuntimeState.RUNNING
      });
    }

    return evaluation;
  }

  private async publishEvent(eventType: string, payload: any): Promise<void> {
    const event: AIOSEvent = {
      eventId: `EVT-QL-${eventType.toUpperCase()}-${Date.now()}`,
      eventType,
      eventVersion: '1.0',
      occurredAt: new Date().toISOString(),
      producerRuntimeId: this.id,
      correlationId: `COR-QL-${Date.now()}`,
      causationId: `CAU-QL-${Date.now()}`,
      payload,
      runtimeId: this.id,
      timestamp: new Date().toISOString(),
      state: payload.state
    };
    await this.eventBus.publish(event);
  }
}
