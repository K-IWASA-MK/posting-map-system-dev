/**
 * ExecutionPlanModel.ts
 * 
 * AIOS Execution Runtime Foundation - Execution Plan & Step Models
 * 
 * アサイン完了後のタスク（ExecutionTask）に対し、決定論的・順序付き実行計画（ExecutionPlan & ExecutionStep）を定義する。
 */

import { ExecutionPermissionScope } from './ExecutionPermissionGate';

export enum ExecutionPlanStatus {
  DRAFT = 'DRAFT',
  READY = 'READY',
  EXECUTING = 'EXECUTING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  BLOCKED = 'BLOCKED'
}

export enum ExecutionStepStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED'
}

export interface ExecutionStepResult {
  readonly success: boolean;
  readonly output?: string;
  readonly error?: string;
  readonly durationMs?: number;
}

export interface ExecutionStep {
  readonly stepId: string;
  readonly order: number; // 1, 2, 3...
  readonly title: string;
  readonly actionType: string; // e.g. 'probe_capability', 'git_status_check', 'code_execution', 'ci_monitor', 'browser_verify'
  readonly requiredPermissionScope?: ExecutionPermissionScope;
  readonly status: ExecutionStepStatus;
  readonly result?: Readonly<ExecutionStepResult>;
}

export interface ExecutionPlan {
  readonly planId: string;
  readonly taskId: string;
  readonly employeeId: string;
  readonly steps: readonly ExecutionStep[];
  readonly status: ExecutionPlanStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata?: Readonly<Record<string, any>>;
}
