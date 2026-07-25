/**
 * AIOS Basic AI Employee Governance Foundation (v1)
 * Domain Models and Value Objects
 */

export type AuthorityLevel = 'READ_ONLY' | 'EXECUTE' | 'MODIFY';

export type ExecutionState =
  | 'IDLE'
  | 'ASSIGNED'
  | 'VALIDATING'
  | 'EXECUTING'
  | 'VERIFYING'
  | 'COMPLETED'
  | 'WAITING_APPROVAL'
  | 'TIMEOUT'
  | 'ABORTED';

export type CompletionLevel = 'SIMULATED' | 'EXECUTED' | 'VERIFIED' | 'COMPLETED';

export interface CommandScope {
  taskObjective: string;
  allowedActions: string[];
  forbiddenActions: string[];
  expectedOutput: string;
}

export interface ToolPermission {
  allowedTools: string[];
  authorityLevel: AuthorityLevel;
}

export interface InputLockSpec {
  inputSource: string;
  fileId: string;
  checksum: string;
  expectedRecordCount: number;
}

export interface AuditLogEntry {
  taskId: string;
  employeeId: string;
  command: string;
  inputSpec: InputLockSpec;
  toolUsed: string;
  actionTaken: string;
  resultStatus: ExecutionState;
  timestamp: string;
  approvalState: 'APPROVED' | 'WAITING_APPROVAL' | 'REJECTED';
}

export interface VerificationReport {
  physicalRecordCount: number;
  sheetNames: string[];
  diffSummary: string;
  isVerified: boolean;
  completionLevel: CompletionLevel;
}
