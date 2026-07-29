import { DispatchRule } from '../DispatchRule';
import { DispatchContext } from '../DispatchContext';
import { DispatchDecision } from '../DispatchDecision';

/**
 * NativeDispatchRule.ts
 * 
 * Rules for routing to the AIOS Native Runtime.
 * Currently a stub for Generation 10.
 */
export class NativeDispatchRule implements DispatchRule {
  public readonly ruleId = 'NATIVE_DISPATCH_RULE';

  supports(context: DispatchContext): boolean {
    // Stub: Assume it supports it if it's explicitly marked as native
    return context.metadata && context.metadata.targetSystem === 'AIOS_NATIVE';
  }

  evaluate(context: DispatchContext): DispatchDecision {
    if (!this.supports(context)) {
      throw new Error(`[NativeDispatchRule] Unsupported context for Task ID: ${context.taskId}`);
    }

    return Object.freeze({
      runtimeType: 'NATIVE_RUNTIME',
      adapterType: 'NATIVE_ADAPTER',
      executionType: 'ASYNC_AI_EXECUTION',
      priority: context.priority,
      reason: 'Task is explicitly designated for Native AIOS Execution'
    });
  }
}
