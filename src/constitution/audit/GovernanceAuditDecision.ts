/**
 * GovernanceAuditDecision.ts
 * 
 * Immutable decision model for governance audit triggers.
 */

export type GovernanceAuditDecision =
  | 'REQUIRES_REAUDIT'
  | 'NO_REAUDIT_REQUIRED';

export const GovernanceAuditDecisions = Object.freeze({
  REQUIRES_REAUDIT: 'REQUIRES_REAUDIT' as GovernanceAuditDecision,
  NO_REAUDIT_REQUIRED: 'NO_REAUDIT_REQUIRED' as GovernanceAuditDecision,
});
