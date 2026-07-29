import { DispatchDecision } from '../dispatcher/DispatchDecision';
import { TaskContract } from '../gateway/models/TaskContractModels';
import { ExecutionContextFactory } from './ExecutionContext';
import { ExecutionResult } from './ExecutionResult';
import { RuntimeRegistry } from './RuntimeRegistry';

/**
 * ExecutionRuntime.ts
 * 
 * Standard entry point for executing TaskContracts based on DispatchDecisions.
 * Resolves the appropriate RuntimeExecutor from the RuntimeRegistry and executes it.
 */
export class ExecutionRuntime {
  constructor(private readonly registry: RuntimeRegistry) {}

  /**
   * Evaluates the DispatchDecision and executes the appropriate Runtime.
   * Throws an error if no registered runtime supports the decision.
   */
  public async execute(
    decision: DispatchDecision,
    contract: TaskContract,
    metadata: Record<string, any> = {}
  ): Promise<ExecutionResult> {
    
    if (!decision || !contract) {
      throw new Error('[ExecutionRuntime] Invalid arguments: Decision and Contract are required.');
    }

    const context = ExecutionContextFactory.create(decision, contract, metadata);
    const executor = this.registry.lookup(context);

    if (!executor) {
      throw new Error(`[ExecutionRuntime] No registered runtime supports the runtimeType: ${decision.runtimeType}`);
    }

    return executor.execute(context);
  }
}
