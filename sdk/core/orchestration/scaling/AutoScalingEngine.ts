import { IRuntime } from '../../runtime/IRuntime';
import { RuntimeDescriptor } from '../../runtime/RuntimeDescriptor';
import { RuntimeCapability } from '../../runtime/RuntimeCapability';
import { RuntimeHealth, RuntimeHealthStatus } from '../../runtime/RuntimeHealth';
import { RuntimeContext } from '../../runtime/RuntimeContext';
import { AIOSEventBus } from '../../event/AIOSEventBus';
import { AIOSEvent } from '../../event/AIOSEvent';
import { OrchestrationRegistry } from '../OrchestrationRegistry';
import { ResourceMonitor } from './ResourceMonitor';
import { QueueMonitor } from './QueueMonitor';
import { ScalingPolicyEvaluator } from './ScalingPolicy';
import { ScalingDecisionManager } from './ScalingDecision';
import { ScalingDecision, ScalingPolicy } from '../models/OrchestrationModels';

export class AutoScalingEngine implements IRuntime<void, void> {
  public readonly id = 'aios.auto-scaling';
  public readonly version = '1.0.0';
  public readonly dependsOn = [];

  public readonly descriptor: RuntimeDescriptor = {
    runtimeId: this.id,
    runtimeName: 'Auto-Scaling Engine',
    version: this.version,
    contractVersion: '1.0',
    capabilities: [RuntimeCapability.AUTO_SCALING as any],
    dependencies: []
  };

  private context?: RuntimeContext;
  private readonly resourceMonitor = new ResourceMonitor();
  private readonly queueMonitor: QueueMonitor;
  private readonly decisionManager = new ScalingDecisionManager();

  constructor(
    private readonly eventBus: AIOSEventBus,
    private readonly registry: OrchestrationRegistry
  ) {
    this.queueMonitor = new QueueMonitor(registry);
  }

  public getHealth(): Promise<RuntimeHealth> {
    return Promise.resolve(this.health());
  }

  public health(): RuntimeHealth {
    return {
      status: RuntimeHealthStatus.HEALTHY,
      lastCheckedAt: new Date().toISOString(),
      reason: 'Auto-Scaling Engine is active',
      lastChecked: new Date().toISOString(),
      message: 'Auto-Scaling Engine is active'
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

  public getResourceMonitor(): ResourceMonitor {
    return this.resourceMonitor;
  }

  public getQueueMonitor(): QueueMonitor {
    return this.queueMonitor;
  }

  public getDecisionManager(): ScalingDecisionManager {
    return this.decisionManager;
  }

  public async evaluatePolicy(policy: ScalingPolicy, currentReplicas: number): Promise<ScalingDecision> {
    const metrics = this.resourceMonitor.getMetrics();
    const queueDepth = this.queueMonitor.getQueueDepth();

    const evaluation = ScalingPolicyEvaluator.evaluate(policy, metrics, queueDepth);
    let replicasDelta = 0;

    if (evaluation.action === 'SCALE_OUT' && currentReplicas < policy.maxReplicas) {
      replicasDelta = 1;
    } else if (evaluation.action === 'SCALE_IN' && currentReplicas > policy.minReplicas) {
      replicasDelta = -1;
    }

    const decision: ScalingDecision = {
      decisionId: `SCL-DEC-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      policyId: policy.policyId,
      action: evaluation.action,
      replicasDelta,
      reason: evaluation.reason,
      details: evaluation.details,
      timestamp: new Date().toISOString()
    };

    this.decisionManager.recordDecision(decision);

    if (evaluation.action !== 'NO_OP') {
      await this.publishEvent(evaluation.action === 'SCALE_OUT' ? 'ScaleOut' : 'ScaleIn', {
        decisionId: decision.decisionId,
        replicasDelta,
        reason: evaluation.reason,
        details: evaluation.details,
        state: 'RUNNING'
      });
    }

    return decision;
  }

  private async publishEvent(eventType: string, payload: any): Promise<void> {
    const event: AIOSEvent = {
      eventId: `EVT-SCALE-${eventType.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      eventType,
      eventVersion: '1.0',
      occurredAt: new Date().toISOString(),
      producerRuntimeId: this.id,
      correlationId: `COR-SCL-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      causationId: `CAU-SCL-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      payload,
      runtimeId: this.id,
      timestamp: new Date().toISOString(),
      state: payload.state
    };
    await this.eventBus.publish(event);
  }
}
