/**
 * RuntimeEventModel.ts
 * 
 * AIOS Autonomous Runtime Event Models
 * 
 * イベント駆動型自律実行ランタイムの標準イベント種別および不変イベントオブジェクト構造の定義。
 */

export enum RuntimeEventType {
  TASK_CREATED = 'TASK_CREATED',
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_EXECUTION_STARTED = 'TASK_EXECUTION_STARTED',
  TASK_COMPLETED = 'TASK_COMPLETED',
  TASK_FAILED = 'TASK_FAILED',
  TASK_BLOCKED = 'TASK_BLOCKED'
}

export interface RuntimeEvent<T = Record<string, unknown>> {
  readonly eventId: string;
  readonly type: RuntimeEventType;
  readonly timestamp: string;
  readonly payload: Readonly<T>;
}

export interface TaskCreatedPayload {
  readonly taskId: string;
  readonly title: string;
  readonly priority: string;
  readonly requiredCapabilities: readonly string[];
  readonly metadata?: Readonly<Record<string, any>>;
}

export interface TaskCompletionPayload {
  readonly taskId: string;
  readonly planId?: string;
  readonly assignedEmployeeId?: string;
  readonly status: string;
  readonly governanceDecision?: 'ALLOW' | 'BLOCK';
  readonly evidencePath?: string;
  readonly reason?: string;
}
