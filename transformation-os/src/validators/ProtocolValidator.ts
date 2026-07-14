import { EvaluationEngine } from '../engine/EvaluationEngine';
import { RuleSet, ValidationResult } from '../models/evaluation';
import { ProtocolContext } from '../rules/protocol/RequiredFieldRule';

/**
 * Protocol Validator
 * 
 * A Facade that orchestrates the OS-wide Evaluation Engine against the Protocol Rule Set.
 * 
 * Constraints (MUST NOT):
 * - MUST NOT contain any if/switch logic or conditional evaluation.
 * - MUST NOT instantiate its own RuleSet (dependency injection required).
 * - MUST NOT build the ProtocolContext (it must be provided by the caller).
 * - MUST NOT look at the Diagnostic Catalog or interpret Actions.
 * - MUST NOT perform any side-effects (e.g., Logging, EventStore save, Publish).
 */
export class ProtocolValidator {
  
  /**
   * @param engine The universal OS evaluation engine
   * @param ruleSet The specific ProtocolRuleSet version (e.g., v1, v2)
   */
  constructor(
    private readonly engine: EvaluationEngine,
    private readonly ruleSet: RuleSet<ProtocolContext>
  ) {}

  /**
   * Evaluates the provided ProtocolContext against the injected RuleSet.
   * 
   * @param context The fully constructed ProtocolContext
   * @returns A ValidationResult containing all matched diagnostics
   */
  public validate(context: ProtocolContext): ValidationResult {
    return this.engine.evaluate(context, this.ruleSet);
  }
}
