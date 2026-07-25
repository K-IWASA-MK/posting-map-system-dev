/**
 * AIOS Basic AI Employee Governance Foundation (v1)
 * Runtime Contracts and Interfaces
 */

import {
  AuditLogEntry,
  CommandScope,
  ExecutionState,
  InputLockSpec,
  ToolPermission,
  VerificationReport,
} from '../models/EmployeeDomainModels';

export interface ICommandBoundaryGuard {
  validateAction(scope: CommandScope, action: string): { allowed: boolean; reason?: string };
}

export interface IToolPermissionGuard {
  validateToolUsage(
    permission: ToolPermission,
    toolName: string,
    isCodeModification: boolean
  ): { allowed: boolean; reason?: string };
}

export interface IInputLockGuard {
  validateInput(
    spec: InputLockSpec,
    actualSource: string,
    actualRecordCount: number,
    actualChecksum: string
  ): { valid: boolean; reason?: string };
}

export interface ICompletionVerificationEngine {
  verifyCompletion(report: VerificationReport): { canComplete: boolean; reason?: string };
}

export interface IAuditTrailLogger {
  logEvent(entry: AuditLogEntry): void;
  getLogs(taskId?: string): AuditLogEntry[];
}
