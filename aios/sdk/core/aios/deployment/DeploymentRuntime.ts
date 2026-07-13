import { IRuntime } from '../runtime/IRuntime';
import { RuntimeDescriptor } from '../runtime/RuntimeDescriptor';
import { RuntimeHealth, RuntimeHealthStatus } from '../runtime/RuntimeHealth';
import { RuntimeContext } from '../runtime/RuntimeContext';
import { AIOSEventBus } from '../event/AIOSEventBus';
import { DeploymentManifest } from './DeploymentManifest';
import { PipelineExecutor } from './services/PipelineExecutor';
import { DeploymentStartedEvent, DeploymentCompletedEvent } from './DeploymentEvents';

import { RuntimeCapability } from '../runtime/RuntimeCapability';

export class DeploymentRuntime implements IRuntime<DeploymentManifest, void> {
  public readonly runtimeId = 'aios.deployment';
  
  public readonly descriptor: RuntimeDescriptor = {
    runtimeId: this.runtimeId,
    runtimeName: 'Deployment Orchestrator',
    version: '1.0.0',
    contractVersion: '1.0',
    capabilities: [RuntimeCapability.CAN_DEPLOY],
    dependencies: [
      { runtimeId: 'aios.repository', version: '1.0.0', required: true }, 
      { runtimeId: 'aios.release', version: '1.0.0', required: true }
    ],
  };

  constructor(
    private readonly eventBus: AIOSEventBus,
    private readonly pipelineExecutor: PipelineExecutor
  ) {}

  public async getHealth(): Promise<RuntimeHealth> {
    return {
      status: RuntimeHealthStatus.HEALTHY,
      reason: 'Deployment Runtime is active',
      lastCheckedAt: new Date().toISOString()
    };
  }

  public async initialize(context: RuntimeContext): Promise<void> {
    // Initialization logic
  }

  public async validate(manifest: DeploymentManifest): Promise<void> {
    if (!manifest.pipeline || manifest.pipeline.length === 0) {
      throw new Error('Pipeline must contain at least one stage');
    }
  }

  public async execute(manifest: DeploymentManifest): Promise<void> {
    // Basic implementation that will be called by orchestrator
    await this.runDeployment(manifest, `exec-${Date.now()}`);
  }

  public async pause(): Promise<void> {}
  public async resume(): Promise<void> {}
  public async shutdown(): Promise<void> {}

  public async runDeployment(manifest: DeploymentManifest, correlationId: string): Promise<void> {
    const startedEvent: DeploymentStartedEvent = {
      eventId: `evt-dep-${Date.now()}`,
      eventType: 'DeploymentStartedEvent',
      eventVersion: '1.0',
      occurredAt: new Date().toISOString(),
      producerRuntimeId: this.runtimeId,
      correlationId,
      causationId: correlationId,
      payload: {
        jobId: `job-${Date.now()}`,
        projectId: manifest.projectId
      }
    };

    await this.eventBus.publish(startedEvent);

    await this.pipelineExecutor.executePipeline(manifest);

    const completedEvent: DeploymentCompletedEvent = {
      eventId: `evt-dep-comp-${Date.now()}`,
      eventType: 'DeploymentCompletedEvent',
      eventVersion: '1.0',
      occurredAt: new Date().toISOString(),
      producerRuntimeId: this.runtimeId,
      correlationId,
      causationId: startedEvent.eventId,
      payload: {
        jobId: startedEvent.payload.jobId,
        projectId: manifest.projectId,
        deploymentUrl: 'https://example.com/deployment'
      }
    };

    await this.eventBus.publish(completedEvent);
  }
}
