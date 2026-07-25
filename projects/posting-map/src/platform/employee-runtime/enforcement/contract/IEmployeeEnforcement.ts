/**
 * AIOS Employee Governance Enforcement Runtime Foundation
 * Abstraction Interfaces for Gates and Enforcement Engine
 */

import {
  EnforcementAuditRecord,
  EnforcementRecord,
  EnforcementRequest,
  GateResult,
} from '../models/EmployeeEnforcementModels';

export interface IExecutionGate {
  validateExecution(request: EnforcementRequest): { result: GateResult; reason?: string };
}

export interface IToolGate {
  validateToolExecution(request: EnforcementRequest): { result: GateResult; reason?: string };
}

export interface IApprovalGate {
  validateApproval(request: EnforcementRequest): { result: GateResult; reason?: string };
}

export interface IEmployeeGovernanceEnforcementEngine {
  enforce(request: EnforcementRequest): EnforcementRecord;
  getEnforcement(enforcementId: string): EnforcementRecord;
  getAuditLogs(enforcementId?: string): EnforcementAuditRecord[];
}
