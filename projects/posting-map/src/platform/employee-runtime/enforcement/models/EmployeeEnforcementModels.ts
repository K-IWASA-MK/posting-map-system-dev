/**
 * AIOS Employee Governance Enforcement Runtime Foundation
 * Domain Models for Enforcement Records, Gates, and Audit Logs
 */

import { DecisionRecord } from '../../decision/models/EmployeeDecisionModels';

export type EnforcementStatus =
  | 'CREATED'
  | 'VALIDATING'
  | 'ALLOWED'
  | 'EXECUTING'
  | 'DENIED'
  | 'WAITING_APPROVAL'
  | 'BLOCKED'
  | 'FAILED';

export type GateResult = 'PASS' | 'BLOCK';

export interface EnforcementRequest {
  readonly requestId: string;
  readonly decisionRecord: Readonly<DecisionRecord>;
  readonly toolName?: string;
  readonly allowedToolsWhitelist?: ReadonlyArray<string>;
  readonly authorizedByHuman?: boolean;
}

export interface EnforcementRecord {
  readonly enforcementId: string;
  readonly decisionId: string;
  readonly taskId: string;
  readonly employeeId: string;
  readonly status: EnforcementStatus;
  readonly gateResult: GateResult;
  readonly blockedReason?: string;
  readonly timestamp: string;
}

export interface EnforcementAuditRecord {
  readonly auditId: string;
  readonly enforcementId: string;
  readonly decisionId: string;
  readonly taskId: string;
  readonly employeeId: string;
  readonly decisionStatus: string;
  readonly enforcementResult: GateResult;
  readonly blockedReason: string;
  readonly timestamp: string;
}
