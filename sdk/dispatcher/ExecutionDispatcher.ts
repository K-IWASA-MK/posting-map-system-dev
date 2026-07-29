import { TaskContract } from '../gateway/models/TaskContractModels';
import { DispatchContext, DispatchContextFactory } from './DispatchContext';
import { DispatchDecision } from './DispatchDecision';
import { DispatchResult } from './DispatchResult';
import { DispatchRule } from './DispatchRule';
import { IntentDispatchRule } from './rules/IntentDispatchRule';
import { LegacyDispatchRule } from './rules/LegacyDispatchRule';
import { NativeDispatchRule } from './rules/NativeDispatchRule';

/**
 * ExecutionDispatcher.ts
 * 
 * AIOS Execution Dispatcher Foundation (Routing Layer)
 * 
 * Determines WHERE a TaskContract should be executed (Execution Target)
 * by evaluating DispatchRules.
 * 
 * Foundation Rules:
 * - Stateless: Contains no instance or mutable module state.
 * - Immutable: All returned decisions and contexts are fully frozen.
 * - Deterministic: Pure function execution.
 * - Side Effect Free: No execution, no DB access, no API calls.
 */
export class ExecutionDispatcher {
  
  private static readonly DEFAULT_RULES: ReadonlyArray<DispatchRule> = [
    new LegacyDispatchRule(),
    new NativeDispatchRule(),
    new IntentDispatchRule()
  ];

  /**
   * Deterministically dispatches a TaskContract to an Execution Target.
   */
  public static dispatch(
    contract: TaskContract,
    rules: ReadonlyArray<DispatchRule> = ExecutionDispatcher.DEFAULT_RULES
  ): DispatchResult {
    if (!contract || !contract.taskId) {
      throw new Error('[ExecutionDispatcher] Request rejected: Invalid TaskContract.');
    }

    const context = DispatchContextFactory.create(contract);

    // Evaluate rules in order. First match wins.
    for (const rule of rules) {
      if (rule.supports(context)) {
        const decision = rule.evaluate(context);
        return Object.freeze({
          decision,
          matchedRule: rule.ruleId,
          timestamp: new Date().toISOString(),
          dispatcherVersion: '1.0.0'
        });
      }
    }

    throw new Error(`[ExecutionDispatcher] No matching dispatch rule found for Task ID: ${contract.taskId}`);
  }
}
