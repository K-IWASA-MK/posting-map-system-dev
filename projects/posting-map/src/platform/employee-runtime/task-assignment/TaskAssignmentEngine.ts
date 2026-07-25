/**
 * AIOS Task Assignment Foundation
 * Task Assignment Engine Implementation
 */

import { IEmployeeRegistry } from '../registry/contract/IEmployeeRegistry';
import { ITaskAssignmentEngine } from './contract/ITaskAssignment';
import {
  TaskApprovalStatus,
  TaskAssignmentAuditEntry,
  TaskLifecycleStatus,
  TaskRecord,
} from './models/TaskAssignmentModels';

export class TaskAssignmentEngine implements ITaskAssignmentEngine {
  private tasks: Map<string, TaskRecord> = new Map();
  private auditLogs: TaskAssignmentAuditEntry[] = [];

  constructor(private readonly employeeRegistry?: IEmployeeRegistry) {}

  public createTask(task: TaskRecord): TaskRecord {
    if (this.tasks.has(task.taskId)) {
      throw new Error(`[Task Block] TaskId '${task.taskId}' already exists.`);
    }

    const createdRecord: TaskRecord = {
      ...task,
      allowedTools: Object.freeze([...task.allowedTools]),
      status: 'CREATED',
      approvalStatus: task.approvalStatus || 'PENDING',
    };

    this.tasks.set(task.taskId, createdRecord);

    this.auditLogs.push(
      Object.freeze({
        taskId: task.taskId,
        employeeId: task.assignedEmployeeId,
        action: 'CREATE',
        beforeStatus: null,
        afterStatus: 'CREATED',
        approvalStatus: createdRecord.approvalStatus,
        timestamp: new Date().toISOString(),
      })
    );

    return createdRecord;
  }

  public assignEmployee(taskId: string, employeeId: string, roleId?: string): TaskRecord {
    const task = this.getTask(taskId);

    // Verify Employee in Employee Registry if provided
    if (this.employeeRegistry) {
      const emp = this.employeeRegistry.get(employeeId);
      if (emp.status !== 'ACTIVE' && emp.status !== 'REGISTERED') {
        throw new Error(
          `[Task Assignment Block] Cannot assign Employee '${employeeId}' in status '${emp.status}'.`
        );
      }
    }

    const beforeStatus = task.status;
    task.assignedEmployeeId = employeeId;
    if (roleId) {
      task.assignedRoleId = roleId;
    }
    task.status = 'ASSIGNED';

    this.auditLogs.push(
      Object.freeze({
        taskId: taskId,
        employeeId: employeeId,
        action: 'ASSIGN',
        beforeStatus: beforeStatus,
        afterStatus: 'ASSIGNED',
        approvalStatus: task.approvalStatus,
        timestamp: new Date().toISOString(),
      })
    );

    return task;
  }

  public setApprovalStatus(taskId: string, status: TaskApprovalStatus): TaskRecord {
    const task = this.getTask(taskId);
    task.approvalStatus = status;

    this.auditLogs.push(
      Object.freeze({
        taskId: taskId,
        employeeId: task.assignedEmployeeId,
        action: 'APPROVE',
        beforeStatus: task.status,
        afterStatus: task.status,
        approvalStatus: status,
        timestamp: new Date().toISOString(),
      })
    );

    return task;
  }

  public getTask(taskId: string): TaskRecord {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`[Task Block] TaskId '${taskId}' not found.`);
    }
    return task;
  }

  public listTasks(): TaskRecord[] {
    return Array.from(this.tasks.values());
  }

  public updateTaskStatus(
    taskId: string,
    newStatus: TaskLifecycleStatus,
    reason?: string
  ): TaskRecord {
    const task = this.getTask(taskId);
    const beforeStatus = task.status;

    const validTransitions: Record<TaskLifecycleStatus, TaskLifecycleStatus[]> = {
      CREATED: ['ASSIGNED', 'CANCELLED'],
      ASSIGNED: ['VALIDATING', 'CANCELLED', 'WAITING_APPROVAL'],
      VALIDATING: ['READY', 'FAILED', 'WAITING_APPROVAL', 'CANCELLED'],
      READY: ['EXECUTING', 'CANCELLED', 'WAITING_APPROVAL'],
      EXECUTING: ['VERIFYING', 'FAILED', 'WAITING_APPROVAL', 'CANCELLED'],
      VERIFYING: ['COMPLETED', 'FAILED', 'WAITING_APPROVAL'],
      COMPLETED: [],
      WAITING_APPROVAL: ['VALIDATING', 'READY', 'EXECUTING', 'CANCELLED', 'FAILED'],
      FAILED: [],
      CANCELLED: [],
    };

    const allowed = validTransitions[beforeStatus];
    if (!allowed || !allowed.includes(newStatus)) {
      throw new Error(
        `[Task Lifecycle Block] Invalid status transition from '${beforeStatus}' to '${newStatus}' for Task '${taskId}'. Reason: ${reason || 'Transition policy violation'}`
      );
    }

    task.status = newStatus;

    this.auditLogs.push(
      Object.freeze({
        taskId: taskId,
        employeeId: task.assignedEmployeeId,
        action: 'UPDATE_STATUS',
        beforeStatus: beforeStatus,
        afterStatus: newStatus,
        approvalStatus: task.approvalStatus,
        timestamp: new Date().toISOString(),
      })
    );

    return task;
  }

  public getAuditLogs(taskId?: string): TaskAssignmentAuditEntry[] {
    if (taskId) {
      return this.auditLogs.filter((log) => log.taskId === taskId);
    }
    return [...this.auditLogs];
  }
}
