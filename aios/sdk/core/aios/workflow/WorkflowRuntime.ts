import { IRuntime } from '../runtime/IRuntime';
import { RuntimeDescriptor, RuntimeDependency } from '../runtime/RuntimeDescriptor';
import { RuntimeCapability } from '../runtime/RuntimeCapability';
import { RuntimeHealth, RuntimeHealthStatus } from '../runtime/RuntimeHealth';
import { RuntimeContext } from '../runtime/RuntimeContext';
import { AIOSEventBus } from '../event/AIOSEventBus';

import { WorkflowManifest } from './WorkflowManifest';
import { WorkflowRegistry } from './WorkflowRegistry';
import { WorkflowEngine } from './services/WorkflowEngine';
import { WorkflowContext } from './WorkflowContext';
import { WorkflowLedger } from './ledger/WorkflowLedger';
import { WorkflowMetricsCollector } from './metrics/WorkflowMetricsCollector';
import { WorkflowPolicy, DefaultWorkflowPolicy, WorkflowFailurePolicy } from './policy/WorkflowPolicy';
import { 
  WorkflowStartedEvent, 
  WorkflowCompletedEvent, 
  WorkflowFailedEvent 
} from './WorkflowEvents';
import { WorkflowState, WorkflowJob } from './WorkflowModels';

export class WorkflowRuntime implements IRuntime<WorkflowManifest, WorkflowContext> {
  public readonly runtimeId = 'aios.workflow';

  public readonly descriptor: RuntimeDescriptor = {
    runtimeId: this.runtimeId,
    runtimeName: 'Workflow Orchestrator',
    version: '1.0.0',
    contractVersion: '1.0',
    capabilities: [RuntimeCapability.CAN_PLAN], // Acts as a master planner
    dependencies: []
  };

  constructor(
    private readonly eventBus: AIOSEventBus,
    private readonly registry: WorkflowRegistry,
    private readonly engine: WorkflowEngine,
    private readonly ledger: WorkflowLedger,
    private readonly metrics: WorkflowMetricsCollector,
    private readonly policy: WorkflowPolicy = DefaultWorkflowPolicy
  ) {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
  }

  public async getHealth(): Promise<RuntimeHealth> {
    return {
      status: RuntimeHealthStatus.HEALTHY,
      reason: 'Workflow Runtime is active',
      lastCheckedAt: new Date().toISOString()
    };
  }

  public async initialize(context: RuntimeContext): Promise<void> {
    console.log(`Workflow Runtime initialized`);
  }

  public async validate(manifest: WorkflowManifest): Promise<void> {
    if (!manifest.workflowId || !manifest.steps || manifest.steps.length === 0) {
      throw new Error('Invalid WorkflowManifest: Missing workflowId or steps');
    }
  }

  public async execute(manifest: WorkflowManifest, context?: WorkflowContext): Promise<WorkflowContext> {
    const startTime = Date.now();
    const wfContext: WorkflowContext = context || {
      workflowId: manifest.workflowId,
      correlationId: `corr-${Date.now()}`,
      artifacts: {},
      variables: {},
      outputs: {},
      environment: {},
      runtimeResults: {}
    };

    const jobId = `job-${manifest.workflowId}-${Date.now()}`;
    const job: WorkflowJob = {
      id: jobId,
      workflowId: manifest.workflowId,
      state: WorkflowState.RUNNING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.registry.registerJob(job);
    this.ledger.recordStart(
      manifest.workflowId, 
      manifest.workflowId, 
      'MANUAL', 
      JSON.stringify(wfContext)
    );

    const startedEvent: WorkflowStartedEvent = {
      eventId: `evt-wf-${Date.now()}`,
      eventType: 'WorkflowStartedEvent',
      eventVersion: '1.0',
      occurredAt: new Date().toISOString(),
      producerRuntimeId: this.runtimeId,
      correlationId: wfContext.correlationId,
      causationId: wfContext.correlationId,
      payload: {
        workflowId: manifest.workflowId,
        jobId: job.id
      }
    };
    await this.eventBus.publish(startedEvent);

    try {
      let attempts = 0;
      let success = false;
      let lastError: any = null;

      while (attempts <= this.policy.maxRetries && !success) {
        try {
          attempts++;
          await this.engine.execute(manifest, wfContext);
          success = true;
        } catch (error) {
          lastError = error;
          if (this.policy.failurePolicy === WorkflowFailurePolicy.FAIL_FAST) {
            break;
          } else if (this.policy.failurePolicy === WorkflowFailurePolicy.RETRY) {
            this.metrics.recordRetry();
            console.log(`Retrying workflow... attempt ${attempts}`);
          } else {
            break;
          }
        }
      }

      const durationMs = Date.now() - startTime;

      if (!success) {
        throw lastError;
      }

      job.state = WorkflowState.COMPLETED;
      job.completedAt = new Date().toISOString();
      job.updatedAt = job.completedAt;

      this.metrics.recordExecution(durationMs, true);
      this.ledger.recordCompletion(manifest.workflowId, 'COMPLETED', durationMs);

      const completedEvent: WorkflowCompletedEvent = {
        eventId: `evt-wf-comp-${Date.now()}`,
        eventType: 'WorkflowCompletedEvent',
        eventVersion: '1.0',
        occurredAt: new Date().toISOString(),
        producerRuntimeId: this.runtimeId,
        correlationId: wfContext.correlationId,
        causationId: startedEvent.eventId,
        payload: {
          workflowId: manifest.workflowId,
          jobId: job.id
        }
      };
      await this.eventBus.publish(completedEvent);
      
      return wfContext;

    } catch (error: any) {
      const durationMs = Date.now() - startTime;
      job.state = WorkflowState.FAILED;
      job.updatedAt = new Date().toISOString();
      job.errorReason = error.message;

      this.metrics.recordExecution(durationMs, false);
      this.ledger.recordCompletion(manifest.workflowId, 'FAILED', durationMs);

      const failedEvent: WorkflowFailedEvent = {
        eventId: `evt-wf-fail-${Date.now()}`,
        eventType: 'WorkflowFailedEvent',
        eventVersion: '1.0',
        occurredAt: new Date().toISOString(),
        producerRuntimeId: this.runtimeId,
        correlationId: wfContext.correlationId,
        causationId: startedEvent.eventId,
        payload: {
          workflowId: manifest.workflowId,
          jobId: job.id,
          reason: error.message
        }
      };
      await this.eventBus.publish(failedEvent);
      throw error;
    }
  }

  public async pause(): Promise<void> {}
  public async resume(): Promise<void> {}
  public async shutdown(): Promise<void> {}
}
