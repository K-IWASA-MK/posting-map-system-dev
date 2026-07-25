/**
 * AIOS Employee Workflow Orchestration Foundation
 * Integrated Workflow Orchestration Engine Implementation
 */

import { DependencyResolver } from './DependencyResolver';
import { WorkflowRegistryEngine } from './WorkflowRegistryEngine';
import { WorkflowStateEngine } from './WorkflowStateEngine';
import { IEmployeeWorkflowOrchestrationEngine } from './contract/IEmployeeWorkflow';
import {
  WorkflowAuditRecord,
  WorkflowRecord,
  WorkflowTask,
} from './models/EmployeeWorkflowModels';
import { EnforcementRecord } from '../enforcement/models/EmployeeEnforcementModels';

export class EmployeeWorkflowOrchestrationEngine implements IEmployeeWorkflowOrchestrationEngine {
  private registry = new WorkflowRegistryEngine();
  private resolver = new DependencyResolver();
  private stateEngine = new WorkflowStateEngine();
  private auditLogs: WorkflowAuditRecord[] = [];

  public registerWorkflow(workflow: WorkflowRecord): WorkflowRecord {
    const reg = this.registry.registerWorkflow(workflow);
    this.recordAudit(reg.workflowId, undefined, undefined, reg.status, undefined, 'Workflow registered.');
    return reg;
  }

  public startWorkflow(workflowId: string): WorkflowRecord {
    const wf = this.registry.getWorkflow(workflowId);
    const newStatus = this.stateEngine.transitionState(wf.status, 'ACTIVE');

    // Update workflow status and set initial ready tasks
    const readyTasks = this.resolver.getReadyTasks(wf);
    const updatedTasks: WorkflowTask[] = wf.tasks.map((t) => {
      const isReady = readyTasks.some((rt) => rt.taskId === t.taskId);
      return isReady ? { ...t, status: 'READY' } : t;
    });

    const updatedRecord: WorkflowRecord = Object.freeze({
      ...wf,
      status: this.stateEngine.transitionState(newStatus, 'RUNNING'),
      tasks: Object.freeze(updatedTasks.map((t) => Object.freeze({ ...t }))),
    });

    // Save active record back in internal storage via re-freeze
    (this.registry as any).workflows.set(workflowId, updatedRecord);

    this.recordAudit(
      workflowId,
      undefined,
      undefined,
      updatedRecord.status,
      undefined,
      'Workflow started and transitioned to RUNNING.'
    );

    return updatedRecord;
  }

  public processNextStep(
    workflowId: string,
    taskId: string,
    enforcementRecord: Readonly<EnforcementRecord>
  ): WorkflowRecord {
    const wf = this.registry.getWorkflow(workflowId);

    const task = wf.tasks.find((t) => t.taskId === taskId);
    if (!task) {
      throw new Error(`[Workflow Orchestrator Block] TaskId '${taskId}' not found in Workflow '${workflowId}'.`);
    }

    // Enforcement Layer Integration Check (Gate 3)
    if (enforcementRecord.gateResult === 'BLOCK') {
      const failedStatus = enforcementRecord.status === 'WAITING_APPROVAL' ? 'PAUSED' : 'FAILED';
      const newWfStatus = this.stateEngine.transitionState(wf.status, failedStatus);

      const failedTasks: WorkflowTask[] = wf.tasks.map((t) =>
        t.taskId === taskId ? { ...t, status: 'FAILED' } : t
      );

      const failedRecord: WorkflowRecord = Object.freeze({
        ...wf,
        status: newWfStatus,
        tasks: Object.freeze(failedTasks.map((t) => Object.freeze({ ...t }))),
      });

      (this.registry as any).workflows.set(workflowId, failedRecord);

      this.recordAudit(
        workflowId,
        taskId,
        task.assignedEmployeeId,
        newWfStatus,
        enforcementRecord.enforcementId,
        `Enforcement Gate BLOCKED task execution: ${enforcementRecord.blockedReason}`
      );

      return failedRecord;
    }

    // Enforcement PASS -> Task COMPLETED
    const updatedTasks: WorkflowTask[] = wf.tasks.map((t) =>
      t.taskId === taskId ? { ...t, status: 'COMPLETED' } : t
    );

    let nextRecord: WorkflowRecord = Object.freeze({
      ...wf,
      tasks: Object.freeze(updatedTasks.map((t) => Object.freeze({ ...t }))),
    });

    // Check for next ready tasks
    const nextReady = this.resolver.getReadyTasks(nextRecord);
    if (nextReady.length > 0) {
      const readyTasks: WorkflowTask[] = nextRecord.tasks.map((t) => {
        const isReady = nextReady.some((rt) => rt.taskId === t.taskId);
        return isReady ? { ...t, status: 'READY' } : t;
      });
      nextRecord = Object.freeze({
        ...nextRecord,
        tasks: Object.freeze(readyTasks.map((t) => Object.freeze({ ...t }))),
      });
    }

    // Check if ALL tasks are COMPLETED
    const allCompleted = nextRecord.tasks.every((t) => t.status === 'COMPLETED');
    if (allCompleted) {
      const finalStatus = this.stateEngine.transitionState(nextRecord.status, 'COMPLETED');
      nextRecord = Object.freeze({
        ...nextRecord,
        status: finalStatus,
      });
    }

    (this.registry as any).workflows.set(workflowId, nextRecord);

    this.recordAudit(
      workflowId,
      taskId,
      task.assignedEmployeeId,
      nextRecord.status,
      enforcementRecord.enforcementId,
      `Task '${taskId}' completed successfully via Enforcement PASS.`
    );

    return nextRecord;
  }

  public getWorkflow(workflowId: string): WorkflowRecord {
    return this.registry.getWorkflow(workflowId);
  }

  public getAuditLogs(workflowId?: string): WorkflowAuditRecord[] {
    if (workflowId) {
      return this.auditLogs.filter((log) => log.workflowId === workflowId);
    }
    return [...this.auditLogs];
  }

  private recordAudit(
    workflowId: string,
    taskId?: string,
    employeeId?: string,
    status?: WorkflowRecord['status'],
    executionId?: string,
    reason?: string
  ) {
    this.auditLogs.push(
      Object.freeze({
        auditId: `AUD-WF-${Date.now()}`,
        workflowId: workflowId,
        taskId: taskId,
        employeeId: employeeId,
        status: status || 'CREATED',
        executionId: executionId,
        reason: reason,
        timestamp: new Date().toISOString(),
      })
    );
  }
}
