/**
 * GovernanceAuditReason.ts
 * 
 * Immutable reason definitions for governance reaudit triggers.
 */

export type GovernanceAuditReason =
  | 'Constitution Modified'
  | 'Enforcement Logic Changed'
  | 'Runtime Boundary Changed'
  | 'Retention Matrix Modified'
  | 'New Retention Category Added'
  | 'Multiple Governance Changes Detected'
  | 'Non-governance Change';

export const GovernanceAuditReasons = Object.freeze({
  CONSTITUTION_MODIFIED: 'Constitution Modified' as GovernanceAuditReason,
  ENFORCEMENT_LOGIC_CHANGED: 'Enforcement Logic Changed' as GovernanceAuditReason,
  RUNTIME_BOUNDARY_CHANGED: 'Runtime Boundary Changed' as GovernanceAuditReason,
  RETENTION_MATRIX_MODIFIED: 'Retention Matrix Modified' as GovernanceAuditReason,
  NEW_RETENTION_CATEGORY_ADDED: 'New Retention Category Added' as GovernanceAuditReason,
  MULTIPLE_GOVERNANCE_CHANGES_DETECTED: 'Multiple Governance Changes Detected' as GovernanceAuditReason,
  NON_GOVERNANCE_CHANGE: 'Non-governance Change' as GovernanceAuditReason,
});
