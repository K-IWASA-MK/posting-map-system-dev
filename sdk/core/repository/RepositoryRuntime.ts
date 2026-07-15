import { RepositoryRegistry } from './RepositoryRegistry';
import { RepositoryLifecycleService } from './RepositoryLifecycleService';
import { RepositoryProvisioningService } from './RepositoryProvisioningService';
import { RepositorySynchronizationService } from './RepositorySynchronizationService';
import { RepositoryHealthMonitor } from './health/RepositoryHealthMonitor';
import { RepositoryMetricsService } from './metrics/RepositoryMetricsService';
import { RepositoryRecord } from './RepositoryRecord';
import { RepositoryManifest } from './RepositoryManifest';
import { RepositoryState } from './RepositoryState';
import { RepositoryHealthStatus } from './RepositoryHealth';
import { ProjectBootstrapManifest } from '../bootstrap/ProjectBootstrapManifest';
import { BootstrapContext } from '../bootstrap/BootstrapContext';
import { BootstrapPlan } from '../bootstrap/BootstrapPlan';
import { ProjectBootstrapOrchestrator } from '../bootstrap/ProjectBootstrapOrchestrator';
import { IRuntime } from '../runtime/IRuntime';
import { RuntimeDescriptor } from '../runtime/RuntimeDescriptor';
import { RuntimeCapability } from '../runtime/RuntimeCapability';
import { RuntimeContext } from '../runtime/RuntimeContext';
import { RuntimeEventPublisher } from '../runtime/RuntimeEventPublisher';
import { RuntimeHealth, RuntimeHealthStatus } from '../runtime/RuntimeHealth';
import { IAIOSEventBus } from '../event/AIOSEventBus';

export class RepositoryRuntime implements IRuntime<RepositoryManifest, RepositoryRecord> {
  public readonly descriptor: RuntimeDescriptor = {
    runtimeId: 'core.runtime.repository',
    runtimeName: 'Repository Runtime',
    version: '1.0.0',
    contractVersion: '1.0',
    capabilities: [RuntimeCapability.CAN_CREATE_REPOSITORY],
    dependencies: []
  };

  private context?: RuntimeContext;
  private publisher?: RuntimeEventPublisher;

  constructor(
    private registry: RepositoryRegistry,
    private lifecycle: RepositoryLifecycleService,
    private provisioning: RepositoryProvisioningService,
    private sync: RepositorySynchronizationService,
    private health: RepositoryHealthMonitor,
    private metrics: RepositoryMetricsService,
    private bootstrapOrchestrator: ProjectBootstrapOrchestrator,
    private eventBus?: IAIOSEventBus // Optional for backward compatibility in tests
  ) {}

  public async initialize(context: RuntimeContext): Promise<void> {
    this.context = context;
    if (this.eventBus) {
      this.publisher = new RuntimeEventPublisher(this.descriptor.runtimeId, this.eventBus);
    }
  }

  public async validate(manifest: RepositoryManifest): Promise<void> {
    // Validation logic (in a real system, handled by rules engine)
  }

  public async execute(manifest: RepositoryManifest): Promise<RepositoryRecord> {
    return this.provision(manifest);
  }

  public async pause(): Promise<void> {}
  public async resume(): Promise<void> {}
  public async shutdown(): Promise<void> {}

  public async getHealth(): Promise<RuntimeHealth> {
    return {
      status: RuntimeHealthStatus.HEALTHY,
      lastCheckedAt: new Date().toISOString()
    };
  }

  public async bootstrapProject(manifest: ProjectBootstrapManifest, context: BootstrapContext): Promise<BootstrapPlan | void> {
    return this.bootstrapOrchestrator.bootstrap(manifest, context);
  }

  public async provision(manifest: RepositoryManifest): Promise<RepositoryRecord> {
    const record: RepositoryRecord = {
      id: manifest.repositoryName,
      manifest,
      state: RepositoryState.NEW,
      health: {
        status: RepositoryHealthStatus.UNKNOWN,
        gitHubStatus: RepositoryHealthStatus.UNKNOWN,
        gitStatus: RepositoryHealthStatus.UNKNOWN,
        networkStatus: RepositoryHealthStatus.UNKNOWN,
        authStatus: RepositoryHealthStatus.UNKNOWN,
        lastCheckedAt: new Date().toISOString(),
        issues: []
      },
      metrics: {
        branchCount: 0, tagCount: 0, commitCount: 0, remoteReachability: false,
        aheadOfRemote: 0, behindRemote: 0, divergence: false, cloneSizeBytes: 0, diskUsageBytes: 0,
        lastMeasuredAt: new Date().toISOString()
      },
      history: { lastEventId: '' }
    };

    this.registry.register(record);

    await this.provisioning.provision(record);
    
    // Setup git remotely (sync push)
    // Normally we'd do addRemote and pushInitial, which are Git commands.
    // For the facade, we just trigger the synchronization service
    await this.sync.push('.', manifest.defaultBranch || 'main');
    await this.lifecycle.transition(record, RepositoryState.READY);

    if (this.publisher) {
      await this.publisher.publish(
        'RepositoryCreatedEvent',
        { repositoryId: record.id },
        this.context?.executionId || 'unknown',
        this.context?.executionId || 'unknown'
      );
    }

    return record;
  }

  public async clone(id: string, path: string): Promise<void> {
    // Uses gitAdapter via sync service
    console.log(`[RepositoryRuntime] Cloning ${id} to ${path}`);
  }

  public async archive(id: string): Promise<void> {
    const record = this.registry.getById(id);
    if (record) {
      await this.lifecycle.transition(record, RepositoryState.ARCHIVED);
    }
  }

  public async delete(id: string): Promise<void> {
    const record = this.registry.getById(id);
    if (record) {
      await this.lifecycle.transition(record, RepositoryState.DELETED);
      this.registry.unregister(id);
    }
  }

  public async syncRepo(id: string, path: string): Promise<void> {
    await this.sync.sync(path);
  }

  public async checkHealth(id: string): Promise<void> {
    const record = this.registry.getById(id);
    if (record) {
      record.health = await this.health.checkHealth(record);
    }
  }

  public async collectMetrics(id: string, path?: string): Promise<void> {
    const record = this.registry.getById(id);
    if (record) {
      record.metrics = await this.metrics.collectMetrics(record, path);
    }
  }
}
