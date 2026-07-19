import { IRuntime } from '../runtime/IRuntime';
import { RuntimeDescriptor } from '../runtime/RuntimeDescriptor';
import { RuntimeCapability } from '../runtime/RuntimeCapability';
import { RuntimeHealth, RuntimeHealthStatus } from '../runtime/RuntimeHealth';
import { RuntimeContext } from '../runtime/RuntimeContext';
import { AIOSEventBus } from '../event/AIOSEventBus';
import { AIOSEvent } from '../event/AIOSEvent';
import { WorkflowRegistry } from './WorkflowRegistry';
import { WorkflowValidator } from './WorkflowValidator';
import { WorkflowExecutor } from './WorkflowExecutor';
import { WorkflowDefinition, WorkflowVersion } from './WorkflowModels';
import { RuntimeState } from '../runtime/RuntimeState';

export class WorkflowRuntime implements IRuntime<void, void> {
  public readonly id = 'aios.workflow';
  public readonly version = '1.0.0';
  public readonly dependsOn = [];

  public readonly descriptor: RuntimeDescriptor = {
    runtimeId: this.id,
    runtimeName: 'Workflow Runtime',
    version: this.version,
    contractVersion: '1.0',
    capabilities: [RuntimeCapability.WORKFLOW],
    dependencies: []
  };

  private readonly registry = new WorkflowRegistry();
  private readonly validator = new WorkflowValidator();
  private readonly executor = new WorkflowExecutor();
  private context?: RuntimeContext;

  constructor(private readonly eventBus: AIOSEventBus) {
    this.eventBus.subscribe('WorkflowDispatched', async (event) => {
      const { workflowId } = event.payload;
      try {
        await this.startWorkflow(workflowId);
      } catch (e) {
        // Log/handle error silently to maintain decoupled architecture
      }
    });
  }

  public getHealth(): Promise<RuntimeHealth> {
    return Promise.resolve(this.health());
  }

  public health(): RuntimeHealth {
    return {
      status: RuntimeHealthStatus.HEALTHY,
      lastCheckedAt: new Date().toISOString(),
      reason: 'Workflow engine is ready',
      lastChecked: new Date().toISOString(),
      message: 'Workflow engine is ready'
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

  public getRegistry(): WorkflowRegistry {
    return this.registry;
  }

  public getExecutor(): WorkflowExecutor {
    return this.executor;
  }

  public getValidator(): WorkflowValidator {
    return this.validator;
  }

  public async registerWorkflow(workflow: WorkflowDefinition): Promise<void> {
    // 1. Verify DAG & structure validation rules
    this.validator.validate(workflow);

    this.registry.registerWorkflow(workflow);
    
    await this.publishEvent('WorkflowRegistered', {
      workflowId: workflow.workflowId,
      state: RuntimeState.RUNNING
    });

    await this.publishEvent('WorkflowValidated', {
      workflowId: workflow.workflowId,
      state: RuntimeState.RUNNING
    });
  }

  public async startWorkflow(workflowId: string, resumeCheckpointId?: string): Promise<string[]> {
    const workflow = this.registry.getWorkflow(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    await this.publishEvent('WorkflowStarted', {
      workflowId,
      state: RuntimeState.RUNNING
    });

    const result = await this.executor.executeWorkflow(workflow, resumeCheckpointId);

    await this.publishEvent('WorkflowCompleted', {
      workflowId,
      state: RuntimeState.RUNNING
    });

    return result;
  }

  public async publishEvent(eventType: string, payload: any): Promise<void> {
    const event: AIOSEvent = {
      eventId: `EVT-WF-${eventType.toUpperCase()}-${Date.now()}`,
      eventType,
      eventVersion: '1.0',
      occurredAt: new Date().toISOString(),
      producerRuntimeId: this.id,
      correlationId: `COR-WF-${Date.now()}`,
      causationId: `CAU-WF-${Date.now()}`,
      payload,
      runtimeId: this.id,
      timestamp: new Date().toISOString(),
      state: payload.state
    };
    await this.eventBus.publish(event);
  }
}
