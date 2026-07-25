/**
 * AIOS Task Assignment Foundation
 * Contracts and Interfaces for Task Assignment Engine & Validator
 */

import {
  TaskApprovalStatus,
  TaskAssignmentAuditEntry,
  TaskLifecycleStatus,
  TaskRecord,
} from '../models/TaskAssignmentModels';

export interface ITaskAssignmentValidator {
  validateApproval(task: TaskRecord): { valid: boolean; reason?: string };
  validateAction(task: TaskRecord, action: string): { valid: boolean; reason?: string };
  validateInput(
    task: TaskRecord,
    actualSource: string,
    actualRecordCount: number,
    actualChecksum: string
  ): { valid: boolean; reason?: string };
  validateTool(task: TaskRecord, toolName: string): { valid: boolean; reason?: string };
}

export interface ITaskAssignmentEngine {
  createTask(task: TaskRecord): TaskRecord;
  assignEmployee(taskId: string, employeeId: string, roleId?: string): TaskRecord;
  setApprovalStatus(taskId: string, status: TaskApprovalStatus): TaskRecord;
  getTask(taskId: string): TaskRecord;
  listTasks(): TaskRecord[];
  updateTaskStatus(taskId: string, newStatus: TaskLifecycleStatus, reason?: string): TaskRecord;
  getAuditLogs(taskId?: string): TaskAssignmentAuditEntry[];
}
