import { Action, DiagnosticCode, ValidationResult } from './evaluation';

/**
 * Execution Pipeline Foundation
 * 
 * Defines the critical boundary between the generic Evaluation Engine and the specific Runtime.
 * The Runtime only understands ExecutionDecision and knows nothing about rules or diagnostics.
 */

/**
 * A resolved decision representing the system's execution path.
 * - proceed: true means the event is clean (or violations are purely IGNORE-level) and should execute normally.
 * - proceed: false means the event is halted. The runtime will execute the fallback `action` (e.g. REJECT, ESCALATE)
 *   and can log the underlying `diagnostics` that caused the halt.
 */
export type ExecutionDecision =
  | { readonly proceed: true }
  | {
      readonly proceed: false;
      readonly action: Action;
      readonly diagnostics: readonly DiagnosticCode[];
    };

/**
 * The planner acts as the bridge between ValidationResult and ExecutionDecision.
 * It is responsible for taking the pure diagnostic violations, querying the 
 * Diagnostic Catalog (the Single Source of Truth for action mappings), and 
 * returning a single, unified ExecutionDecision to the Runtime.
 */
export interface IExecutionPlanner {
  createPlan(result: ValidationResult): ExecutionDecision;
}
