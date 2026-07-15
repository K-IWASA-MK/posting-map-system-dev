import { ReleaseManifest } from './ReleaseManifest';
import { ReleaseRegistry } from './ReleaseRegistry';
import { ReleaseStateMachine } from './ReleaseStateMachine';
import { ReleaseState } from './ReleaseState';
import { ReleaseService } from './services/ReleaseService';
import { ReleaseLedger } from './ledger/ReleaseLedger';
import { ReleaseLedgerEntryType } from './ledger/ReleaseLedgerEntryType';
import { ReleaseMetricsCollector } from './metrics/ReleaseMetricsCollector';
import { ExecutionRecorder } from '../ledger/ExecutionRecorder';
import { ExecutionLedgerEntryType } from '../ledger/ExecutionLedgerEntryType';

import { IRuntime } from '../runtime/IRuntime';
import { RuntimeDescriptor } from '../runtime/RuntimeDescriptor';
import { RuntimeCapability } from '../runtime/RuntimeCapability';
import { RuntimeContext } from '../runtime/RuntimeContext';
import { RuntimeEventPublisher } from '../runtime/RuntimeEventPublisher';
import { RuntimeEventSubscriber } from '../runtime/RuntimeEventSubscriber';
import { RuntimeHealth, RuntimeHealthStatus } from '../runtime/RuntimeHealth';
import { IAIOSEventBus } from '../event/AIOSEventBus';

export class ReleaseRuntime implements IRuntime<ReleaseManifest, string> {
  public readonly descriptor: RuntimeDescriptor = {
    runtimeId: 'core.runtime.release',
    runtimeName: 'Release Runtime',
    version: '1.0.0',
    contractVersion: '1.0',
    capabilities: [RuntimeCapability.CAN_RELEASE],
    dependencies: [
      { runtimeId: 'core.runtime.repository', version: '1.0.0', required: true }
    ]
  };

  private context?: RuntimeContext;
  private publisher?: RuntimeEventPublisher;
  private subscriber?: RuntimeEventSubscriber;

  constructor(
    private registry: ReleaseRegistry,
    private service: ReleaseService,
    private stateMachine: ReleaseStateMachine,
    private ledger: ReleaseLedger,
    private metrics: ReleaseMetricsCollector,
    private executionRecorder: ExecutionRecorder,
    private eventBus?: IAIOSEventBus // Optional for backward compatibility in tests
  ) {}

  public async initialize(context: RuntimeContext): Promise<void> {
    this.context = context;
    if (this.eventBus) {
      this.publisher = new RuntimeEventPublisher(this.descriptor.runtimeId, this.eventBus);
      this.subscriber = new RuntimeEventSubscriber(this.descriptor.runtimeId, this.eventBus);

      // Subscribe to RepositoryCreatedEvent to automatically trigger release creation
      this.subscriber.subscribe('RepositoryCreatedEvent', async (event: any) => {
        const repoId = event.payload.repositoryId as string;
        console.log(`[ReleaseRuntime] Received RepositoryCreatedEvent for ${repoId}`);
        // Logic to trigger release if needed based on repository creation
      });
    }
  }

  public async validate(manifest: ReleaseManifest): Promise<void> {
    // Policy execution (SemanticVersionRule etc.)
  }

  public async execute(manifest: ReleaseManifest): Promise<string> {
    return this.createRelease(manifest);
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

  public async createRelease(manifest: ReleaseManifest): Promise<string> {
    const releaseId = manifest.releaseId;

    this.registry.register({
      id: releaseId,
      manifest,
      state: ReleaseState.NEW,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    await this.ledger.record(ReleaseLedgerEntryType.RELEASE_STARTED, { releaseId });

    let currentState = ReleaseState.NEW;

    try {
      currentState = await this.stateMachine.transition(releaseId, currentState, ReleaseState.VALIDATED);
      
      const preparedManifest = await this.service.prepareRelease(manifest);
      this.registry.update(releaseId, { manifest: preparedManifest });
      
      await this.ledger.record(ReleaseLedgerEntryType.VERSION_RESOLVED, { releaseId, version: preparedManifest.version });
      await this.ledger.record(ReleaseLedgerEntryType.CHANGELOG_GENERATED, { releaseId });

      currentState = await this.stateMachine.transition(releaseId, currentState, ReleaseState.BUILDING);
      // Simulate build if any complex artifact building is needed
      
      currentState = await this.stateMachine.transition(releaseId, currentState, ReleaseState.PACKAGING);
      await this.ledger.record(ReleaseLedgerEntryType.ASSET_UPLOADED, { releaseId, assets: preparedManifest.assets });

      currentState = await this.stateMachine.transition(releaseId, currentState, ReleaseState.TAGGED);
      await this.ledger.record(ReleaseLedgerEntryType.TAG_CREATED, { releaseId, tag: preparedManifest.version });

      const url = await this.service.publishRelease(preparedManifest);
      await this.ledger.record(ReleaseLedgerEntryType.RELEASE_CREATED, { releaseId, url });

      currentState = await this.stateMachine.transition(releaseId, currentState, ReleaseState.PUBLISHED);
      await this.ledger.record(ReleaseLedgerEntryType.PUBLISHED, { releaseId, url });
      this.registry.update(releaseId, { state: ReleaseState.PUBLISHED });

      await this.executionRecorder.record(ExecutionLedgerEntryType.RELEASE_EXECUTED, { releaseId, repositoryId: manifest.repositoryId, url });

      if (this.publisher) {
        await this.publisher.publish(
          'ReleasePublishedEvent',
          { releaseId, repositoryId: manifest.repositoryId, url },
          this.context?.executionId || 'unknown',
          this.context?.executionId || 'unknown'
        );
      }

      return url;
    } catch (e: any) {
      await this.stateMachine.transition(releaseId, currentState, ReleaseState.FAILED, e);
      this.registry.update(releaseId, { state: ReleaseState.FAILED });
      throw e;
    }
  }

  public getReleaseState(releaseId: string): ReleaseState | undefined {
    const record = this.registry.getById(releaseId);
    return record?.state;
  }
}
