import { WorkspaceRegistry } from './WorkspaceRegistry';
import { WorkspaceDiscoveryService } from './WorkspaceDiscoveryService';
import { WorkspaceHealthService } from './health/WorkspaceHealthService';
import { WorkspaceMetricsService } from './metrics/WorkspaceMetricsService';
import { WorkspaceRecord } from './WorkspaceRecord';
import { WorkspaceManifest } from './WorkspaceManifest';
import { WorkspaceState } from './WorkspaceState';
import { WorkspaceHealthStatus } from './health/WorkspaceHealth';
import { DependencyGraph } from './graph/DependencyGraph';
import { DevelopmentRuleEngine } from '../engine/DevelopmentRuleEngine';
import { DevelopmentDecisionStatus } from '../governance/DevelopmentDecisionStatus';

import { IRuntime } from '../runtime/IRuntime';
import { RuntimeDescriptor } from '../runtime/RuntimeDescriptor';
import { RuntimeCapability } from '../runtime/RuntimeCapability';
import { RuntimeContext } from '../runtime/RuntimeContext';
import { RuntimeEventPublisher } from '../runtime/RuntimeEventPublisher';
import { RuntimeEventSubscriber } from '../runtime/RuntimeEventSubscriber';
import { RuntimeHealth, RuntimeHealthStatus } from '../runtime/RuntimeHealth';
import { IAIOSEventBus } from '../event/AIOSEventBus';

export class WorkspaceRuntime implements IRuntime<WorkspaceManifest, WorkspaceRecord> {
  public readonly descriptor: RuntimeDescriptor = {
    runtimeId: 'core.runtime.workspace',
    runtimeName: 'Workspace Runtime',
    version: '1.0.0',
    contractVersion: '1.0',
    capabilities: [RuntimeCapability.CAN_DISCOVER],
    dependencies: []
  };

  private context?: RuntimeContext;
  private publisher?: RuntimeEventPublisher;
  private subscriber?: RuntimeEventSubscriber;

  constructor(
    private registry: WorkspaceRegistry,
    private discovery: WorkspaceDiscoveryService,
    private healthService: WorkspaceHealthService,
    private metricsService: WorkspaceMetricsService,
    private ruleEngine: DevelopmentRuleEngine,
    private eventBus?: IAIOSEventBus
  ) {}

  public async initialize(context: RuntimeContext): Promise<void> {
    this.context = context;
    if (this.eventBus) {
      this.publisher = new RuntimeEventPublisher(this.descriptor.runtimeId, this.eventBus);
      this.subscriber = new RuntimeEventSubscriber(this.descriptor.runtimeId, this.eventBus);
    }
  }

  public async validate(manifest: WorkspaceManifest): Promise<void> {
    const decision = this.ruleEngine.evaluateWorkspace(manifest);
    if (decision.status !== DevelopmentDecisionStatus.PASS) {
      throw new Error(`Workspace Policy Validation Failed: ${decision.reason}`);
    }
  }

  public async execute(manifest: WorkspaceManifest): Promise<WorkspaceRecord> {
    return this.initializeWorkspace(manifest);
  }

  public async pause(): Promise<void> {}
  public async resume(): Promise<void> {}
  
  public async shutdown(): Promise<void> {
    if (this.subscriber) {
      this.subscriber.unsubscribeAll();
    }
  }

  public async getHealth(): Promise<RuntimeHealth> {
    return {
      status: RuntimeHealthStatus.HEALTHY,
      lastCheckedAt: new Date().toISOString()
    };
  }

  public async initializeWorkspace(manifest: WorkspaceManifest): Promise<WorkspaceRecord> {
    await this.validate(manifest);

    const record: WorkspaceRecord = {
      id: manifest.workspaceId,
      manifest,
      state: WorkspaceState.INITIALIZING,
      health: {
        status: WorkspaceHealthStatus.UNKNOWN,
        fsStatus: WorkspaceHealthStatus.UNKNOWN,
        dependencyStatus: WorkspaceHealthStatus.UNKNOWN,
        lastCheckedAt: new Date().toISOString(),
        issues: []
      },
      metrics: {
        totalRepositories: 0, totalPlugins: 0, totalSDKs: 0, totalWorkers: 0, totalApplications: 0,
        totalPackages: 0, totalTemplates: 0, dependencyCount: 0, unresolvedDependencies: 0, diskUsageBytes: 0
      },
      dependencyGraph: new DependencyGraph()
    };

    this.registry.register(record);
    record.state = WorkspaceState.READY;

    if (this.publisher) {
      await this.publisher.publish(
        'WorkspaceInitializedEvent',
        { workspaceId: record.id },
        this.context?.executionId || 'unknown',
        this.context?.executionId || 'unknown'
      );
    }

    return record;
  }

  public async scan(workspaceId: string): Promise<void> {
    const record = this.registry.getById(workspaceId);
    if (!record) throw new Error(`Workspace ${workspaceId} not found`);

    record.state = WorkspaceState.SCANNING;
    await this.discovery.discover(workspaceId);
    record.state = WorkspaceState.READY;
  }

  public async checkHealth(workspaceId: string): Promise<void> {
    const record = this.registry.getById(workspaceId);
    if (record) {
      record.health = await this.healthService.checkHealth(record);
    }
  }

  public async collectMetrics(workspaceId: string): Promise<void> {
    const record = this.registry.getById(workspaceId);
    if (record) {
      record.metrics = await this.metricsService.collectMetrics(record);
    }
  }
}
