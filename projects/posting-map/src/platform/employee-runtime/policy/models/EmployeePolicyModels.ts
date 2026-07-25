/**
 * AIOS Employee Governance Policy Foundation
 * Domain Models for Policies, Priority, Evaluation Requests, and Audit
 */

export type PolicyType =
  | 'COMMAND_SCOPE_POLICY'
  | 'TOOL_PERMISSION_POLICY'
  | 'INPUT_LOCK_POLICY'
  | 'COMPLETION_POLICY'
  | 'KNOWLEDGE_ACCESS_POLICY';

export type PolicyPriority = 'SYSTEM' | 'EMPLOYEE' | 'TASK';

export type PolicyStatus = 'ACTIVE' | 'DEPRECATED';

export interface PolicyRule {
  readonly ruleId: string;
  readonly condition: string; // e.g. "allowedActions", "checksumMatch", "statusApproved"
  readonly effect: 'ALLOW' | 'DENY';
  readonly value: any;
}

export interface PolicyRecord {
  readonly policyId: string;
  readonly policyName: string;
  readonly policyType: PolicyType;
  readonly priority: PolicyPriority;
  readonly version: number;
  readonly rules: ReadonlyArray<Readonly<PolicyRule>>;
  readonly status: PolicyStatus;
  readonly createdAt: string;
}

export interface PolicyEvaluationRequest {
  readonly requestId: string;
  readonly policyType: PolicyType;
  readonly targetEmployeeId: string;
  readonly targetRoleId?: string;
  readonly targetTaskId?: string;
  readonly action?: string;
  readonly toolName?: string;
  readonly inputSpec?: any;
  readonly statusChecked?: string;
}

export interface PolicyEvaluationResult {
  readonly requestId: string;
  readonly status: 'ALLOWED' | 'DENIED';
  readonly reason: string;
  readonly violationCode?: string;
  readonly appliedPolicyId?: string;
  readonly evaluatedAt: string;
}

export interface PolicyAuditRecord {
  readonly auditId: string;
  readonly policyId: string;
  readonly version: number;
  readonly requestId: string;
  readonly targetEmployeeId: string;
  readonly evaluationResult: 'ALLOWED' | 'DENIED';
  readonly reason: string;
  readonly timestamp: string;
}
