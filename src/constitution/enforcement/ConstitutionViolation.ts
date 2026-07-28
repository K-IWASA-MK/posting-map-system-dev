/**
 * ConstitutionViolation.ts
 * 
 * Represents a violation of the AIOS Constitution detected during enforcement analysis.
 */

export interface ConstitutionViolation {
  readonly violationId: string;
  readonly ruleId: string;
  readonly principleId: string;
  readonly itemCategory: string;
  readonly itemIdentifier: string;
  readonly reason: string;
  readonly detectedAt: string;
}

export class ConstitutionViolationFactory {
  public static createViolation(
    ruleId: string,
    principleId: string,
    itemCategory: string,
    itemIdentifier: string,
    reason: string
  ): ConstitutionViolation {
    return Object.freeze({
      violationId: `viol-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      ruleId,
      principleId,
      itemCategory,
      itemIdentifier,
      reason,
      detectedAt: new Date().toISOString()
    });
  }
}
