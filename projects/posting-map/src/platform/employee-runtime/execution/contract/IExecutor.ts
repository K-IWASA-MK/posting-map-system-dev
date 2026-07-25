/**
 * AIOS Employee Execution Runtime Foundation
 * Abstraction Interfaces for Executor, Gateway, Validator, and Engine
 */

import { TaskRecord } from '../../task-assignment/models/TaskAssignmentModels';
import {
  ExecutionAuditEntry,
  ExecutionRecord,
  ExecutionResult,
  ExecutionStatus,
} from '../models/ExecutionRuntimeModels';

export interface IExecutor {
  execute(task: TaskRecord, toolName: string, params: any): Promise<ExecutionResult>;
}

export interface IToolExecutionGateway {
  executeTool(
    executor: IExecutor,
    task: TaskRecord,
    toolName: string,
    params: any
  ): Promise<ExecutionResult>;
}

export interface IExecutionValidator {
  validateExecutionContract(
    task: TaskRecord,
    actualSource: string,
    actualRecordCount: number,
    actualChecksum: string
  ): { valid: boolean; reason?: string };
}

export interface IExecutionRuntimeEngine {
  createExecution(task: TaskRecord, employeeId: string): ExecutionRecord;
  getExecution(executionId: string): ExecutionRecord;
  runExecution(
    executionId: string,
    executor: IExecutor,
    toolName: string,
    params: any,
    actualSource: string,
    actualRecordCount: number,
    actualChecksum: string
  ): Promise<ExecutionRecord>;
  updateStatus(
    executionId: string,
    newStatus: ExecutionStatus,
    reason?: string
  ): ExecutionRecord;
  getAuditLogs(executionId?: string): ExecutionAuditEntry[];
}
