/**
 * AIOS Employee Governance Decision Foundation
 * Domain Models for Pre-Execution Governance Decisions, Risk, and Approval States
 */

import { TaskRecord } from '../../task-assignment/models/TaskAssignmentModels';
import { PolicyEvaluationResult } from '../../policy/models/EmployeePolicyModels';

export type DecisionStatus = 'ALLOWED' | 'DENIED' | 'WAITING_APPROVAL';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ApprovalStatus = 'NOT_REQUIRED' | 'REQUIRED' | 'APPROVED' | 'REJECTED';

export interface DecisionContext {
  readonly taskContract: Readonly<TaskRecord>;
  readonly employeeId: string;
  readonly policyResult: Readonly<PolicyEvaluationResult>;
  readonly actualInputSource: string;
  readonly actualRecordCount: number;
  readonly actualChecksum: string;
  readonly toolRequested: string;
  readonly requestedAction: string;
}

export interface DecisionRecord {
  readonly decisionId: string;
  readonly requestId: string;
  readonly taskId: string;
  readonly employeeId: string;
  readonly status: DecisionStatus;
  readonly riskLevel: RiskLevel;
  readonly approvalStatus: ApprovalStatus;
  readonly appliedPolicies: ReadonlyArray<string>;
  readonly reason: string;
  readonly evaluatedAt: string;
}

export interface DecisionAuditRecord {
  readonly auditId: string;
  readonly decisionId: string;
  readonly taskId: string;
  readonly employeeId: string;
  readonly decisionStatus: DecisionStatus;
  readonly riskLevel: RiskLevel;
  readonly approvalStatus: ApprovalStatus;
  readonly reason: string;
  readonly timestamp: string;
}
