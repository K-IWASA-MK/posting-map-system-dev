/**
 * AIOS Employee Execution Runtime Foundation
 * Domain Models for Task Execution Instances, Gateway Control, and Results
 */

import { TaskRecord } from '../../task-assignment/models/TaskAssignmentModels';

export type ExecutionStatus =
  | 'CREATED'
  | 'VALIDATING'
  | 'READY'
  | 'RUNNING'
  | 'WAITING_RESULT'
  | 'VERIFYING'
  | 'COMPLETED'
  | 'WAITING_APPROVAL'
  | 'FAILED'
  | 'TIMEOUT'
  | 'CANCELLED'
  | 'EXECUTION_BLOCKED';

export interface ExecutionResult {
  readonly output: any;
  readonly status: 'SUCCESS' | 'FAILURE';
  readonly artifact: string;
  readonly timestamp: string;
}

export interface ExecutionRecord {
  readonly executionId: string;
  readonly taskId: string;
  readonly employeeId: string;
  readonly startedAt: string;

  readonly taskContract: Readonly<TaskRecord>;
  status: ExecutionStatus;
  result: ExecutionResult | null;
}

export interface ExecutionAuditEntry {
  readonly executionId: string;
  readonly taskId: string;
  readonly employeeId: string;
  readonly toolUsed: string | null;
  readonly inputSource: string;
  readonly beforeStatus: ExecutionStatus | null;
  readonly afterStatus: ExecutionStatus;
  readonly resultStatus: 'SUCCESS' | 'FAILURE' | null;
  readonly timestamp: string;
}
