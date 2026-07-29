import { DispatchRule } from '../DispatchRule';
import { DispatchContext } from '../DispatchContext';
import { DispatchDecision } from '../DispatchDecision';

/**
 * IntentDispatchRule.ts
 * 
 * Rules for routing based purely on TaskIntent.
 * Deterministic and Stateless.
 */
export class IntentDispatchRule implements DispatchRule {
  public readonly ruleId = 'INTENT_DISPATCH_RULE';

  supports(context: DispatchContext): boolean {
    // We can support routing based on known intents if no other rule matched
    return context.intent === 'PLANNING' || context.intent === 'RESEARCH';
  }

  evaluate(context: DispatchContext): DispatchDecision {
    if (!this.supports(context)) {
      throw new Error(`[IntentDispatchRule] Unsupported context for Task ID: ${context.taskId}`);
    }

    return Object.freeze({
      runtimeType: 'NATIVE_RUNTIME',
      adapterType: 'NONE',
      executionType: 'AI_INTERNAL_PROCESSING',
      priority: context.priority,
      reason: `Routing to Native Runtime based on Intent: ${context.intent}`
    });
  }
}
