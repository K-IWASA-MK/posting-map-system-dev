/**
 * AIOS Task Assignment Foundation
 * Models for Task Command Contracts, Lifecycle, and Approval States
 */

import { CommandScope, InputLockSpec } from '../../models/EmployeeDomainModels';

export type TaskLifecycleStatus =
  | 'CREATED'
  | 'ASSIGNED'
  | 'VALIDATING'
  | 'READY'
  | 'EXECUTING'
  | 'VERIFYING'
  | 'COMPLETED'
  | 'WAITING_APPROVAL'
  | 'FAILED'
  | 'CANCELLED';

export type TaskApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface TaskRecord {
  readonly taskId: string;
  readonly taskName: string;
  readonly taskType: string;
  readonly description: string;
  readonly createdAt: string;

  assignedEmployeeId: string | null;
  assignedRoleId: string | null;

  readonly scope: CommandScope;
  readonly inputSpec: InputLockSpec;
  readonly allowedTools: ReadonlyArray<string>;

  status: TaskLifecycleStatus;
  approvalStatus: TaskApprovalStatus;
}

export interface TaskAssignmentAuditEntry {
  readonly taskId: string;
  readonly employeeId: string | null;
  readonly action: 'CREATE' | 'ASSIGN' | 'APPROVE' | 'UPDATE_STATUS';
  readonly beforeStatus: TaskLifecycleStatus | null;
  readonly afterStatus: TaskLifecycleStatus;
  readonly approvalStatus: TaskApprovalStatus;
  readonly timestamp: string;
}
