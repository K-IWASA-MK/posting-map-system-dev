import { DispatchDecision } from '../dispatcher/DispatchDecision';
import { TaskContract } from '../gateway/models/TaskContractModels';

/**
 * ExecutionContext.ts
 * 
 * Immutable context object passed to RuntimeExecutors.
 * Contains only the information necessary for a Runtime to execute.
 */
export interface ExecutionContext {
  readonly executionId: string;
  readonly correlationId: string;
  readonly decision: DispatchDecision;
  readonly contract: TaskContract;
  readonly metadata: Record<string, any>;
  readonly createdAt: string;
}

export class ExecutionContextFactory {
  public static create(
    decision: DispatchDecision,
    contract: TaskContract,
    metadata: Record<string, any> = {}
  ): ExecutionContext {
    return Object.freeze({
      executionId: `EXEC-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      correlationId: contract.taskId,
      decision: Object.freeze({ ...decision }),
      contract: Object.freeze({ ...contract }),
      metadata: Object.freeze({ ...metadata }),
      createdAt: new Date().toISOString()
    });
  }
}
