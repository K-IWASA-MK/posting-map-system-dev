/**
 * ExecutionTaskFactory.ts
 * 
 * Execution Task 不変ファクトリ
 * 
 * AIOS 規格に従った Task ID（例: TASK-20260728-XXXX）および不変オブジェクト（Object.freeze）を生成する。
 */

import { VerificationCapabilityType } from '../verification/VerificationCapabilityModel';
import {
  ExecutionTask,
  ExecutionTaskMetadata,
  ExecutionTaskPriority,
  ExecutionTaskStatus
} from './ExecutionTaskModel';
import { ExecutionTaskValidator } from './ExecutionTaskValidator';

export interface CreateTaskParams {
  taskId?: string;
  title: string;
  description?: string;
  priority?: ExecutionTaskPriority;
  assignedEmployeeId?: string;
  requiredCapabilities?: readonly VerificationCapabilityType[];
  status?: ExecutionTaskStatus;
  createdAt?: string;
  updatedAt?: string;
  metadata?: ExecutionTaskMetadata;
}

export class ExecutionTaskFactory {
  /**
   * 不変な ExecutionTask インスタンスを生成する
   */
  static createTask(params: CreateTaskParams): ExecutionTask {
    const nowIso = new Date().toISOString();
    const dateFormatted = nowIso.slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const taskId = params.taskId || `TASK-${dateFormatted}-${randomSuffix}`;

    const requiredCapabilities = Object.freeze([...(params.requiredCapabilities || [])]);
    const metadata = params.metadata ? Object.freeze({ ...params.metadata }) : undefined;

    const task: ExecutionTask = Object.freeze({
      taskId,
      title: params.title,
      description: params.description || '',
      priority: params.priority || ExecutionTaskPriority.NORMAL,
      ...(params.assignedEmployeeId ? { assignedEmployeeId: params.assignedEmployeeId } : {}),
      requiredCapabilities,
      status: params.status || ExecutionTaskStatus.CREATED,
      createdAt: params.createdAt || nowIso,
      updatedAt: params.updatedAt || params.createdAt || nowIso,
      ...(metadata ? { metadata } : {})
    });

    if (!ExecutionTaskValidator.validateTask(task)) {
      throw new Error(`[ExecutionTaskFactory] Invalid task parameters for title: ${params.title}`);
    }

    return task;
  }
}
