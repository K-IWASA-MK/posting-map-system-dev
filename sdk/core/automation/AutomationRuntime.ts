import { IRuntime } from '../runtime/IRuntime';
import { RuntimeDescriptor } from '../runtime/RuntimeDescriptor';
import { RuntimeCapability } from '../runtime/RuntimeCapability';
import { RuntimeHealth, RuntimeHealthStatus } from '../runtime/RuntimeHealth';
import { RuntimeContext } from '../runtime/RuntimeContext';
import { AIOSEventBus } from '../event/AIOSEventBus';
import { AIOSEvent } from '../event/AIOSEvent';
import { AutomationManifest } from './AutomationManifest';
import { AutomationEngine } from './AutomationEngine';
import { AutomationActionRegistry } from './AutomationActionRegistry';
import { RuntimeState } from '../runtime/RuntimeState';
import { QueueItem } from './AutomationModels';

export class AutomationRuntime implements IRuntime<AutomationManifest, void> {
  public readonly id = 'aios.automation';
  public readonly version = '1.0.0';
  public readonly dependsOn = ['aios.quality'];

  public readonly descriptor: RuntimeDescriptor = {
    runtimeId: this.id,
    runtimeName: 'Automation Runtime',
    version: this.version,
    contractVersion: '1.0',
    capabilities: [RuntimeCapability.AUTOMATION],
    dependencies: [
      { runtimeId: 'aios.quality', version: '1.0.0', required: true }
    ]
  };

  private readonly engine = new AutomationEngine();
  private readonly registry = new AutomationActionRegistry();
  private context?: RuntimeContext;
  public manifest?: AutomationManifest;

  private qualityRuntime?: any;
  private observabilityRuntime?: any;

  constructor(private readonly eventBus: AIOSEventBus) {}

  public setQualityRuntime(quality: any): void {
    this.qualityRuntime = quality;
  }

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
      reason: 'Automation Engine is active and waiting for recommendations',
      lastChecked: new Date().toISOString(),
      message: 'Automation Engine is active and waiting for recommendations'
    };
  }

  public async initialize(context: RuntimeContext): Promise<void> {
    this.context = context;
    // Subscribe to RecommendationGenerated events
    this.eventBus.subscribe('RecommendationGenerated', async (event) => {
      await this.handleRecommendation(event);
    });
  }

  public async validate(manifest: AutomationManifest): Promise<void> {
    if (!manifest.automationId || !manifest.configuration) {
      throw new Error('Invalid AutomationManifest: Missing configuration');
    }
  }

  public async execute(manifest: AutomationManifest): Promise<void> {
    this.manifest = manifest;
  }

  public async start(): Promise<void> {}
  public async stop(): Promise<void> {}
  public async pause(): Promise<void> {}
  public async resume(): Promise<void> {}
  public async shutdown(): Promise<void> {}

  public async handleRecommendation(event: AIOSEvent): Promise<void> {
    const payload = (event.payload || {}) as any;
    const actionName = payload.suggestedAction;
    const recommendationId = payload.recommendationId;
    const priorityStr = payload.priority || 'MEDIUM';

    if (!actionName || !recommendationId) return;

    // Map Priority to numeric value
    const priority = priorityStr === 'HIGH' ? 1 : priorityStr === 'MEDIUM' ? 2 : 3;

    // Mapped rule config lookup (from manifest)
    const ruleConfig = this.manifest?.configuration.rules.find(r => r.actionName === actionName) || {
      actionName,
      cooldownMs: 1000,
      maxRetries: 3
    };

    // Construct Queue Item
    const item: QueueItem = {
      actionName,
      recommendationId,
      priority,
      scheduledAt: Date.now(),
      expiresAt: Date.now() + 60000 // 60 seconds expiration window
    };

    // Query policy and state from runtimes
    let policyPassed = true;
    let platformHealth = 'HEALTHY';

    if (this.qualityRuntime && this.observabilityRuntime) {
      const evaluation = this.qualityRuntime.getLastEvaluation();
      if (evaluation) {
        policyPassed = evaluation.policyPassed;
      }
      const projection = this.observabilityRuntime.getProjection();
      if (projection) {
        platformHealth = projection.platformHealth;
      }
    }

    // Process via Engine Safety Guards
    const decision = this.engine.queueAction(
      item,
      policyPassed,
      platformHealth,
      ruleConfig.cooldownMs,
      ruleConfig.maxRetries
    );

    // 1. Publish AutomationApproved or rejection logs
    await this.publishEvent('AutomationApproved', {
      decisionId: decision.decisionId,
      recommendationId: decision.recommendationId,
      policyResult: decision.policyResult,
      approvalResult: decision.approvalResult,
      reason: decision.reason,
      state: RuntimeState.RUNNING
    });

    if (decision.approvalResult === 'APPROVED') {
      // Execute the action immediately
      await this.publishEvent('AutomationExecuted', {
        recommendationId,
        actionName,
        state: RuntimeState.RUNNING
      });

      const result = await this.engine.executeNext(this.registry);
      if (result) {
        // 2. Publish AutomationCompleted
        await this.publishEvent('AutomationCompleted', {
          actionId: result.actionId,
          runtimeId: result.runtimeId,
          executionId: result.executionId,
          status: result.status,
          startedAt: result.startedAt,
          completedAt: result.completedAt,
          duration: result.duration,
          error: result.error,
          state: RuntimeState.READY
        });

        // 3. Publish LedgerRecorded (Event Ledger Hook!)
        await this.publishEvent('LedgerRecorded', {
          actionId: result.actionId,
          runtimeId: result.runtimeId,
          executionId: result.executionId,
          result: result.status,
          timestamp: result.completedAt,
          state: RuntimeState.READY
        });
      }
    }
  }

  public getQueueLength(): number {
    return this.engine.getQueueLength();
  }

  public clearQueue(): void {
    this.engine.clearQueue();
  }

  private async publishEvent(eventType: string, payload: any): Promise<void> {
    const event: AIOSEvent = {
      eventId: `EVT-AM-${eventType.toUpperCase()}-${Date.now()}`,
      eventType,
      eventVersion: '1.0',
      occurredAt: new Date().toISOString(),
      producerRuntimeId: this.id,
      correlationId: `COR-AM-${Date.now()}`,
      causationId: `CAU-AM-${Date.now()}`,
      payload,
      runtimeId: this.id,
      timestamp: new Date().toISOString(),
      state: payload.state
    };
    await this.eventBus.publish(event);
  }
}
