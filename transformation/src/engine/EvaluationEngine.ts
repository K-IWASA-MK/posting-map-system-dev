import { RuleSet, ValidationResult, ViolationResult } from '../models/evaluation';

/**
 * Evaluation Engine
 * 
 * The universal, OS-wide evaluation executor.
 * 
 * Constraints (MUST NOT):
 * - MUST NOT modify Rules, RuleSets, or Input.
 * - MUST NOT "Fail Fast" (all rules must be evaluated).
 * - MUST NOT look at the Diagnostic Catalog or interpret Actions.
 * - MUST NOT have side effects like Publish, EventStore save, or Logging.
 */
export class EvaluationEngine {
  
  /**
   * Evaluates an input against a provided RuleSet.
   * 
   * @param input The context/data to be evaluated
   * @param ruleSet The cohesive set of rules to apply
   * @returns A ValidationResult containing all matched diagnostics
   */
  public evaluate<T>(input: T, ruleSet: RuleSet<T>): ValidationResult {
    const violations: ViolationResult[] = [];

    // The Engine is the ONLY place allowed to loop over rules.
    for (const rule of ruleSet.rules) {
      const evaluation = rule.match(input);

      // Collect matched diagnostics. No fail-fast, evaluate everything.
      if (evaluation.matched) {
        violations.push({
          ruleId: evaluation.ruleId,
          code: evaluation.code
        });
      }
    }

    return {
      violations: Object.freeze(violations)
    };
  }
}
