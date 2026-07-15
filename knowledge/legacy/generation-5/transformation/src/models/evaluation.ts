/**
 * Evaluation Engine Foundation
 * 
 * This file defines the core, runtime-agnostic evaluation types.
 * It is a universal base for any ruleset (Protocol, Governance, Billing, etc.).
 * 
 * Type First Rule applies: NO implementations, pure definitions only.
 */

export type DiagnosticCode = string; // e.g., 'V1001', 'G2001'
export type Action = 'PANIC' | 'REJECT' | 'IGNORE' | 'RETRY' | 'QUARANTINE' | 'ESCALATE';

/**
 * A normalized diagnostic result referencing a Catalog.
 */
export interface ViolationResult {
  readonly ruleId: string;
  readonly code: DiagnosticCode;
}

/**
 * The final output of the Evaluation Engine.
 */
export interface ValidationResult {
  readonly violations: readonly ViolationResult[];
}

/**
 * The result returned by a single Rule's match() predicate.
 */
export type RuleEvaluation =
  | {
      readonly matched: true;
      readonly ruleId: string;
      readonly code: DiagnosticCode;
    }
  | {
      readonly matched: false;
      readonly ruleId: string;
    };

/**
 * A discrete, pure predicate rule that evaluates an input.
 * Holds an identity (id) to allow decoupling Rules from Diagnostic Codes.
 */
export interface Rule<T> {
  readonly id: string;
  match(input: T): RuleEvaluation;
}

/**
 * A cohesive collection of rules intended to be evaluated together by the Engine.
 * Rules are stored in a Record mapped by ruleId for direct O(1) access.
 */
export interface RuleSet<T> {
  readonly id: string;
  readonly version: string;
  readonly rules: readonly Rule<T>[];
}
