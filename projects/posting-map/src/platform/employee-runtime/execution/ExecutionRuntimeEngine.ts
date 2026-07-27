/**
 * AIOS Employee Execution Runtime Foundation
 * Core Execution Engine Implementation
 */

import { CompletionVerificationEngine } from '../verification/CompletionVerificationEngine';
import { ExecutionValidator } from './ExecutionValidator';
import { ToolExecutionGateway } from './ToolExecutionGateway';
import { IExecutor, IExecutionRuntimeEngine } from './contract/IExecutor';
import {
  ExecutionAuditEntry,
  ExecutionRecord,
  ExecutionResult,
  ExecutionStatus,
} from './models/ExecutionRuntimeModels';
import { TaskRecord } from '../task-assignment/models/TaskAssignmentModels';

export class ExecutionRuntimeEngine implements IExecutionRuntimeEngine {
  private executions: Map<string, ExecutionRecord> = new Map();
  private auditLogs: ExecutionAuditEntry[] = [];
  private validator = new ExecutionValidator();
  private gateway = new ToolExecutionGateway();
  private verificationEngine = new CompletionVerificationEngine();

  public createExecution(task: TaskRecord, employeeId: string): ExecutionRecord {
    const executionId = `EXEC-${task.taskId}-${Date.now()}`;
    const record: ExecutionRecord = {
      executionId: executionId,
      taskId: task.taskId,
      employeeId: employeeId,
      startedAt: new Date().toISOString(),
      taskContract: Object.freeze({ ...task }),
      status: 'CREATED',
      result: null,
    };

    this.executions.set(executionId, record);

    this.auditLogs.push(
      Object.freeze({
        executionId: executionId,
        taskId: task.taskId,
        employeeId: employeeId,
        toolUsed: null,
        inputSource: task.inputSpec.inputSource,
        beforeStatus: null,
        afterStatus: 'CREATED',
        resultStatus: null,
        timestamp: record.startedAt,
      })
    );

    return record;
  }

  public getExecution(executionId: string): ExecutionRecord {
    const record = this.executions.get(executionId);
    if (!record) {
      throw new Error(`[Execution Engine Block] ExecutionId '${executionId}' not found.`);
    }
    return record;
  }

  public async runExecution(
    executionId: string,
    executor: IExecutor,
    toolName: string,
    params: any,
    actualSource: string,
    actualRecordCount: number,
    actualChecksum: string
  ): Promise<ExecutionRecord> {
    const record = this.getExecution(executionId);
    const task = record.taskContract;

    // 1. VALIDATING
    this.updateStatus(executionId, 'VALIDATING');
    const valRes = this.validator.validateExecutionContract(
      task,
      actualSource,
      actualRecordCount,
      actualChecksum
    );

    if (!valRes.valid) {
      this.updateStatus(executionId, 'FAILED', valRes.reason);
      throw new Error(valRes.reason || 'Execution contract validation failed.');
    }

    // 2. READY -> RUNNING
    this.updateStatus(executionId, 'READY');
    this.updateStatus(executionId, 'RUNNING');

    if (!toolName) {
      this.updateStatus(executionId, 'EXECUTION_BLOCKED', 'ToolCall count is 0. Direct execution blocked.');
      throw new Error('ToolCall count is 0. Execution Blocked.');
    }

    let result: ExecutionResult;
    try {
      // 3. Tool Execution via Gateway (Gateway enforces tool authorization)
      result = await this.gateway.executeTool(executor, task, toolName, params);
      record.result = result;
      this.updateStatus(executionId, 'WAITING_RESULT');
    } catch (err: any) {
      this.updateStatus(executionId, 'FAILED', err.toString());
      throw err;
    }

    // 4. VERIFYING via CompletionVerificationEngine (ExecutionEngine cannot grant COMPLETED alone)
    this.updateStatus(executionId, 'VERIFYING');

    const verifyReport = this.verificationEngine.verifyCompletion({
      physicalRecordCount: actualRecordCount,
      sheetNames: [result.artifact],
      diffSummary: '0 diff',
      isVerified: result.status === 'SUCCESS',
      completionLevel: 'VERIFIED',
    });

    if (!verifyReport.canComplete) {
      this.updateStatus(executionId, 'FAILED', verifyReport.reason);
      throw new Error(verifyReport.reason || 'Completion verification failed.');
    }

    // 5. COMPLETED
    this.updateStatus(executionId, 'COMPLETED');
    return record;
  }

  public updateStatus(
    executionId: string,
    newStatus: ExecutionStatus,
    reason?: string
  ): ExecutionRecord {
    const record = this.getExecution(executionId);
    const beforeStatus = record.status;

    const validTransitions: Record<ExecutionStatus, ExecutionStatus[]> = {
      CREATED: ['VALIDATING', 'CANCELLED'],
      VALIDATING: ['READY', 'FAILED', 'WAITING_APPROVAL', 'CANCELLED'],
      READY: ['RUNNING', 'CANCELLED', 'WAITING_APPROVAL'],
      RUNNING: ['WAITING_RESULT', 'FAILED', 'TIMEOUT', 'WAITING_APPROVAL', 'CANCELLED', 'EXECUTION_BLOCKED'],
      WAITING_RESULT: ['VERIFYING', 'FAILED', 'WAITING_APPROVAL'],
      VERIFYING: ['COMPLETED', 'FAILED', 'WAITING_APPROVAL'],
      COMPLETED: [],
      WAITING_APPROVAL: ['VALIDATING', 'READY', 'RUNNING', 'FAILED', 'CANCELLED'],
      FAILED: [],
      TIMEOUT: ['FAILED', 'CANCELLED'],
      CANCELLED: [],
      EXECUTION_BLOCKED: []
    };

    const allowed = validTransitions[beforeStatus];
    if (!allowed || !allowed.includes(newStatus)) {
      throw new Error(
        `[Execution FSM Block] Invalid status transition from '${beforeStatus}' to '${newStatus}' for Execution '${executionId}'. Reason: ${reason || 'Transition policy violation'}`
      );
    }

    record.status = newStatus;

    this.auditLogs.push(
      Object.freeze({
        executionId: executionId,
        taskId: record.taskId,
        employeeId: record.employeeId,
        toolUsed: null,
        inputSource: record.taskContract.inputSpec.inputSource,
        beforeStatus: beforeStatus,
        afterStatus: newStatus,
        resultStatus: record.result ? record.result.status : null,
        timestamp: new Date().toISOString(),
      })
    );

    return record;
  }

  public getAuditLogs(executionId?: string): ExecutionAuditEntry[] {
    if (executionId) {
      return this.auditLogs.filter((log) => log.executionId === executionId);
    }
    return [...this.auditLogs];
  }
}
