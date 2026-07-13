import { WorkflowManifest, WorkflowStep } from '../WorkflowManifest';
import { WorkflowContext } from '../WorkflowContext';
import { ConditionEngine } from '../engine/ConditionEngine';
import { ICapabilityResolver } from '../resolver/CapabilityResolver';
import { AIOSEventBus } from '../../event/AIOSEventBus';
import { 
  WorkflowStepStartedEvent, 
  WorkflowStepCompletedEvent 
} from '../WorkflowEvents';

export class WorkflowEngine {
  constructor(
    private readonly conditionEngine: ConditionEngine,
    private readonly capabilityResolver: ICapabilityResolver,
    private readonly eventBus: AIOSEventBus
  ) {}

  public async execute(manifest: WorkflowManifest, context: WorkflowContext): Promise<void> {
    const executedSteps = new Set<string>();
    let pendingSteps = [...manifest.steps];

    while (pendingSteps.length > 0) {
      // Find all steps whose dependencies have been met
      const executableSteps = pendingSteps.filter(step => {
        if (!step.dependsOn || step.dependsOn.length === 0) {
          return true;
        }
        return step.dependsOn.every(depId => executedSteps.has(depId));
      });

      if (executableSteps.length === 0) {
        // DAG is stuck (circular dependency or missing dependency)
        throw new Error('Workflow DAG execution stalled. Check dependencies.');
      }

      // Execute them in parallel (DAG level parallelization)
      await Promise.all(executableSteps.map(step => this.executeStep(step, context, manifest)));

      executableSteps.forEach(step => {
        executedSteps.add(step.id);
        pendingSteps = pendingSteps.filter(s => s.id !== step.id);
      });
    }
  }

  private async executeStep(step: WorkflowStep, context: WorkflowContext, manifest: WorkflowManifest): Promise<void> {
    // 1. Condition check
    if (step.condition) {
      const shouldRun = this.conditionEngine.evaluate(step.condition, context);
      if (!shouldRun) {
        console.log(`Skipping step ${step.id} (condition not met)`);
        return;
      }
    }

    // 2. Publish Step Started
    const startedEvent: WorkflowStepStartedEvent = {
      eventId: `evt-wf-step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventType: 'WorkflowStepStartedEvent',
      eventVersion: '1.0',
      occurredAt: new Date().toISOString(),
      producerRuntimeId: 'aios.workflow',
      correlationId: context.correlationId,
      causationId: context.correlationId, // In real scenario, might be the previous step's event ID
      payload: {
        workflowId: context.workflowId,
        jobId: context.workflowId, // Same as workflowId for now
        stepId: step.id
      }
    };
    await this.eventBus.publish(startedEvent);

    // 3. Resolve Capability or SubWorkflow
    let targetRuntimeId: string | null = null;

    if (step.subWorkflow) {
      console.log(`Executing sub-workflow ${step.subWorkflow} for step ${step.id}`);
      // In Foundation, we just log. The OS would recursively invoke WorkflowRuntime here.
    } else if (step.capability) {
      targetRuntimeId = this.capabilityResolver.resolve(step.capability);
      if (!targetRuntimeId) {
        throw new Error(`Cannot resolve capability: ${step.capability} for step ${step.id}`);
      }
      console.log(`Delegating step ${step.id} to Runtime: ${targetRuntimeId}`);
      // The actual delegation would be invoking the target runtime via Event Bus or direct call
    } else {
      console.log(`Executing step ${step.id} (no capability or subworkflow defined)`);
    }

    // 4. Update Context
    context.runtimeResults[step.id] = { status: 'SUCCESS', targetRuntimeId };

    // 5. Publish Step Completed
    const completedEvent: WorkflowStepCompletedEvent = {
      eventId: `evt-wf-step-comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventType: 'WorkflowStepCompletedEvent',
      eventVersion: '1.0',
      occurredAt: new Date().toISOString(),
      producerRuntimeId: 'aios.workflow',
      correlationId: context.correlationId,
      causationId: startedEvent.eventId,
      payload: {
        workflowId: context.workflowId,
        jobId: context.workflowId,
        stepId: step.id,
        result: context.runtimeResults[step.id] as Record<string, unknown>
      }
    };
    await this.eventBus.publish(completedEvent);
  }
}
