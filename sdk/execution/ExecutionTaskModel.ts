/**
 * ExecutionTaskModel.ts
 * 
 * AIOS Execution Runtime Foundation - Task Contract Model
 * 
 * AI社員が受領・理解する「仕事（タスク）」の標準不変契約モデル。
 * タスク自体が必要能力（requiredCapabilities）を保持し、割り当て前に能力照合を可能にする。
 */

import { VerificationCapabilityType } from '../verification/VerificationCapabilityModel';

export enum ExecutionTaskPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum ExecutionTaskStatus {
  CREATED = 'CREATED',
  ASSIGNED = 'ASSIGNED',
  RUNNING = 'RUNNING',
  VERIFYING = 'VERIFYING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  BLOCKED = 'BLOCKED'
}

export interface ExecutionTaskMetadata {
  readonly source?: string;
  readonly requester?: string;
  readonly project?: string;
  readonly evidenceRequired?: boolean;
  readonly [key: string]: any;
}

export interface ExecutionTask {
  readonly taskId: string;
  readonly title: string;
  readonly description: string;
  readonly priority: ExecutionTaskPriority;
  readonly assignedEmployeeId?: string;
  readonly requiredCapabilities: readonly VerificationCapabilityType[];
  readonly status: ExecutionTaskStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata?: Readonly<ExecutionTaskMetadata>;
}
