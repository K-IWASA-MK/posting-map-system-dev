/**
 * EnforcementResult.ts
 * 
 * Immutable evaluation result for a set of items passed through Constitution Enforcement.
 */

import { ConstitutionViolation } from './ConstitutionViolation';
import { EnforcementDecisionDescriptor } from './EnforcementDecision';

export interface EnforcementResult {
  readonly evaluatedItemCount: number;
  readonly allowedForAIOS: boolean;
  readonly decisions: readonly EnforcementDecisionDescriptor[];
  readonly violations: readonly ConstitutionViolation[];
  readonly evaluatedAt: string;
}

export class EnforcementResultBuilder {
  public static build(
    decisions: EnforcementDecisionDescriptor[],
    violations: ConstitutionViolation[] = []
  ): EnforcementResult {
    const hasRejections = decisions.some(d => d.aiosRetention === 'REJECT_AIOS_RETENTION');
    const hasViolations = violations.length > 0;

    return Object.freeze({
      evaluatedItemCount: decisions.length,
      allowedForAIOS: !hasRejections && !hasViolations,
      decisions: Object.freeze([...decisions]),
      violations: Object.freeze([...violations]),
      evaluatedAt: new Date().toISOString()
    });
  }
}
