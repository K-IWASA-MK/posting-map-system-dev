/**
 * AIOS Employee Workflow Orchestration Foundation
 * Domain Models for Workflow Definitions, Dependencies, Assignments, and Audit Logs
 */

export type WorkflowStatus =
  | 'CREATED'
  | 'ACTIVE'
  | 'RUNNING'
  | 'PAUSED'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export interface TaskDependency {
  readonly taskId: string;
  readonly dependsOnTaskId: string;
}

export interface WorkflowTask {
  readonly taskId: string;
  readonly taskName: string;
  readonly assignedEmployeeId: string;
  readonly assignedRoleId: string;
  readonly status: 'PENDING' | 'READY' | 'RUNNING' | 'COMPLETED' | 'FAILED';
}

export interface WorkflowRecord {
  readonly workflowId: string;
  readonly workflowName: string;
  readonly version: number;
  readonly tasks: ReadonlyArray<Readonly<WorkflowTask>>;
  readonly dependencies: ReadonlyArray<Readonly<TaskDependency>>;
  readonly completionCriteria: string;
  readonly status: WorkflowStatus;
  readonly createdAt: string;
}

export interface WorkflowAuditRecord {
  readonly auditId: string;
  readonly workflowId: string;
  readonly taskId?: string;
  readonly employeeId?: string;
  readonly status: WorkflowStatus;
  readonly executionId?: string;
  readonly reason?: string;
  readonly timestamp: string;
}
