import { TaskIntent, TaskPriority } from '../gateway/models/TaskGatewayModels';
import { WorkflowProfile } from '../gateway/models/WorkflowProfile';
import { TaskContract } from '../gateway/models/TaskContractModels';

/**
 * DispatchContext.ts
 * 
 * Immutable context object extracted from TaskContract for the purpose of
 * evaluating routing rules in the Execution Dispatcher.
 */
export interface DispatchContext {
  readonly taskId: string;
  readonly intent: TaskIntent;
  readonly workflowProfile: WorkflowProfile;
  readonly metadata: Record<string, any>;
  readonly priority: TaskPriority;
  readonly originalContract: TaskContract;
}

export class DispatchContextFactory {
  public static create(contract: TaskContract): DispatchContext {
    return Object.freeze({
      taskId: contract.taskId,
      intent: contract.intent,
      workflowProfile: contract.workflowProfile,
      metadata: contract.ceoDecision.metadata || {},
      priority: contract.priority,
      originalContract: contract
    });
  }
}
