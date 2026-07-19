export type PolicyScope = 'GLOBAL' | 'RUNTIME' | 'PLUGIN' | 'APPLICATION';

export type PolicyLifecycleState = 'DRAFT' | 'ACTIVE' | 'DEPRECATED' | 'ARCHIVED';

export interface PolicyDefinition {
  readonly policyId: string;
  readonly name: string;
  readonly version: string;
  readonly scope: PolicyScope;
  readonly priority: number;
  readonly state: PolicyLifecycleState;
  readonly checksum: string;
}

export interface PolicyBundle {
  readonly bundleId: string;
  readonly version: string;
  readonly policies: PolicyDefinition[];
  readonly checksum: string;
  readonly createdAt: string;
}

export interface GovernanceDecision {
  readonly decisionId: string;
  readonly policyId: string;
  readonly runtimeId: string;
  readonly result: 'PASS' | 'FAIL';
  readonly reason: string;
  readonly timestamp: string;
}

export interface ComplianceViolation {
  readonly violationId: string;
  readonly policyId: string;
  readonly severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  readonly message: string;
  readonly recommendation: string;
}

export interface ComplianceResult {
  readonly runtimeId: string;
  readonly policyId: string;
  readonly score: number;
  readonly status: 'PASS' | 'FAIL' | 'WARNING';
  readonly violations: ComplianceViolation[];
  readonly recommendations: string[];
  readonly timestamp: string;
}
