import { DispatchContext } from './DispatchContext';
import { DispatchDecision } from './DispatchDecision';

/**
 * DispatchRule.ts
 * 
 * Interface for routing rules evaluated by the Execution Dispatcher.
 * Rules must be completely stateless, deterministic, and side-effect free.
 */
export interface DispatchRule {
  /**
   * Rule Identifier for auditing and result matching.
   */
  readonly ruleId: string;

  /**
   * Determines if this rule supports the given context.
   */
  supports(context: DispatchContext): boolean;

  /**
   * Evaluates the context and deterministically produces a DispatchDecision.
   * Should throw an error if called on an unsupported context.
   */
  evaluate(context: DispatchContext): DispatchDecision;
}
