/**
 * GovernanceImpactType.ts
 * 
 * Immutable type definitions for governance-impacting change types in AIOS.
 */

export type GovernanceImpactType =
  | 'CONSTITUTION_CHANGE'
  | 'ENFORCEMENT_CHANGE'
  | 'RUNTIME_INTEGRATION_CHANGE'
  | 'RETENTION_CATEGORY_CHANGE'
  | 'DOCUMENTATION_ONLY'
  | 'TEST_ONLY'
  | 'MULTIPLE_GOVERNANCE_CHANGES';

export const GovernanceImpactTypes = Object.freeze({
  CONSTITUTION_CHANGE: 'CONSTITUTION_CHANGE' as GovernanceImpactType,
  ENFORCEMENT_CHANGE: 'ENFORCEMENT_CHANGE' as GovernanceImpactType,
  RUNTIME_INTEGRATION_CHANGE: 'RUNTIME_INTEGRATION_CHANGE' as GovernanceImpactType,
  RETENTION_CATEGORY_CHANGE: 'RETENTION_CATEGORY_CHANGE' as GovernanceImpactType,
  DOCUMENTATION_ONLY: 'DOCUMENTATION_ONLY' as GovernanceImpactType,
  TEST_ONLY: 'TEST_ONLY' as GovernanceImpactType,
  MULTIPLE_GOVERNANCE_CHANGES: 'MULTIPLE_GOVERNANCE_CHANGES' as GovernanceImpactType,
});
