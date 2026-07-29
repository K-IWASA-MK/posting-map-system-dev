import { DispatchRule } from '../DispatchRule';
import { DispatchContext } from '../DispatchContext';
import { DispatchDecision } from '../DispatchDecision';

/**
 * LegacyDispatchRule.ts
 * 
 * Rules for routing to the POSTING MAP Legacy Handler.
 * Deterministic and Stateless.
 */
export class LegacyDispatchRule implements DispatchRule {
  public readonly ruleId = 'LEGACY_DISPATCH_RULE';

  supports(context: DispatchContext): boolean {
    return context.metadata && typeof context.metadata.legacyOperation === 'string';
  }

  evaluate(context: DispatchContext): DispatchDecision {
    if (!this.supports(context)) {
      throw new Error(`[LegacyDispatchRule] Unsupported context for Task ID: ${context.taskId}`);
    }

    return Object.freeze({
      dispatchTarget: 'LEGACY_RUNTIME',
      adapterType: 'LEGACY_CONTRACT_ADAPTER',
      executionType: 'SYNCHRONOUS_API_CALL',
      priority: context.priority,
      reason: `Task requires legacy operation: ${context.metadata.legacyOperation}`
    });
  }
}
