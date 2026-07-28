/**
 * ExecutionTaskRegistry.ts
 * 
 * AIOS Execution Runtime Foundation - Execution Task Registry
 * 
 * タスク（ExecutionTask）の中央動的管理、重複ID判定、状態遷移・割り当て管理、
 * 多角系インデクシング検索、およびスナップショット履歴管理を行う。
 * 
 * アーキテクチャ原則: Controlled State Management / Immutable Boundary
 * - 内部状態（Map / History）は制御して安全に保持。
 * - 外部出力は常に Object.freeze された不変境界を保証。
 */

import { VerificationCapabilityType } from '../verification/VerificationCapabilityModel';
import {
  ExecutionTask,
  ExecutionTaskPriority,
  ExecutionTaskStatus
} from './ExecutionTaskModel';
import { ExecutionTaskValidator } from './ExecutionTaskValidator';
import { ExecutionTaskFactory } from './ExecutionTaskFactory';

export interface ExecutionTaskRegistrySnapshot {
  readonly snapshotId: string;
  readonly timestamp: string;
  readonly totalTasksCount: number;
  readonly statusCounts: Readonly<Record<ExecutionTaskStatus, number>>;
  readonly tasks: readonly ExecutionTask[];
}

export class ExecutionTaskRegistry {
  private static registry: Map<string, ExecutionTask> = new Map();
  private static snapshotHistory: ExecutionTaskRegistrySnapshot[] = [];

  /**
   * 単一の ExecutionTask を登録する
   * 重複 ID が存在する場合は Error をスローする
   */
  static register(task: ExecutionTask): void {
    if (!task) {
      throw new Error('[ExecutionTaskRegistry] Task cannot be empty');
    }

    if (!ExecutionTaskValidator.validateTask(task)) {
      throw new Error('[ExecutionTaskRegistry] Invalid task structure');
    }

    if (this.registry.has(task.taskId)) {
      throw new Error(`[ExecutionTaskRegistry] Task ID already registered: ${task.taskId}`);
    }

    this.registry.set(task.taskId, Object.freeze({ ...task }));
  }

  /**
   * 複数の ExecutionTask を一括登録する
   */
  static registerMany(tasks: readonly ExecutionTask[]): void {
    if (!Array.isArray(tasks)) {
      throw new Error('[ExecutionTaskRegistry] tasks must be an array');
    }

    for (const t of tasks) {
      this.register(t);
    }
  }

  /**
   * 既存タスクのステータスを更新する
   * 更新時に updatedAt タイムスタンプを自動再セットする
   */
  static updateStatus(
    taskId: string,
    status: ExecutionTaskStatus,
    metadata?: Record<string, any>
  ): ExecutionTask {
    const existing = this.registry.get(taskId);
    if (!existing) {
      throw new Error(`[ExecutionTaskRegistry] Task not found: ${taskId}`);
    }

    const mergedMetadata = {
      ...(existing.metadata || {}),
      ...(metadata || {})
    };

    const updated = ExecutionTaskFactory.createTask({
      taskId: existing.taskId,
      title: existing.title,
      description: existing.description,
      priority: existing.priority,
      assignedEmployeeId: existing.assignedEmployeeId,
      requiredCapabilities: existing.requiredCapabilities,
      status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
      metadata: Object.keys(mergedMetadata).length > 0 ? mergedMetadata : undefined
    });

    this.registry.set(taskId, updated);
    return updated;
  }

  /**
   * タスクに AI 社員を割り当てる
   * CREATED ステータスの場合は自動的に ASSIGNED ステータスへ遷移する
   */
  static assignEmployee(taskId: string, employeeId: string): ExecutionTask {
    if (!employeeId || employeeId.trim() === '') {
      throw new Error('[ExecutionTaskRegistry] employeeId is required for assignment');
    }

    const existing = this.registry.get(taskId);
    if (!existing) {
      throw new Error(`[ExecutionTaskRegistry] Task not found: ${taskId}`);
    }

    const newStatus = existing.status === ExecutionTaskStatus.CREATED
      ? ExecutionTaskStatus.ASSIGNED
      : existing.status;

    const updated = ExecutionTaskFactory.createTask({
      taskId: existing.taskId,
      title: existing.title,
      description: existing.description,
      priority: existing.priority,
      assignedEmployeeId: employeeId,
      requiredCapabilities: existing.requiredCapabilities,
      status: newStatus,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
      metadata: existing.metadata
    });

    this.registry.set(taskId, updated);
    return updated;
  }

  /**
   * Task ID から ExecutionTask を取得する
   */
  static get(taskId: string): ExecutionTask | undefined {
    return this.registry.get(taskId);
  }

  /**
   * 指定した Status のタスク一覧を取得する
   */
  static getByStatus(status: ExecutionTaskStatus): readonly ExecutionTask[] {
    const results: ExecutionTask[] = [];
    for (const t of this.registry.values()) {
      if (t.status === status) {
        results.push(t);
      }
    }
    return Object.freeze(results);
  }

  /**
   * 指定した Priority のタスク一覧を取得する
   */
  static getByPriority(priority: ExecutionTaskPriority): readonly ExecutionTask[] {
    const results: ExecutionTask[] = [];
    for (const t of this.registry.values()) {
      if (t.priority === priority) {
        results.push(t);
      }
    }
    return Object.freeze(results);
  }

  /**
   * 指定した AI 社員 ID に割り当てられたタスク一覧を取得する
   */
  static getByAssignedEmployee(employeeId: string): readonly ExecutionTask[] {
    const results: ExecutionTask[] = [];
    for (const t of this.registry.values()) {
      if (t.assignedEmployeeId === employeeId) {
        results.push(t);
      }
    }
    return Object.freeze(results);
  }

  /**
   * 特定の検証能力（VerificationCapabilityType）を要件とするタスク一覧を取得する
   */
  static getByCapability(capability: VerificationCapabilityType): readonly ExecutionTask[] {
    const results: ExecutionTask[] = [];
    for (const t of this.registry.values()) {
      if (t.requiredCapabilities.includes(capability)) {
        results.push(t);
      }
    }
    return Object.freeze(results);
  }

  /**
   * 登録されているすべてのタスクを取得する
   */
  static getAll(): readonly ExecutionTask[] {
    return Object.freeze(Array.from(this.registry.values()));
  }

  /**
   * 現在の全タスクから状況スナップショットを生成し履歴に記録する
   */
  static captureSnapshot(): ExecutionTaskRegistrySnapshot {
    const tasks = this.getAll();
    const statusCounts: Record<ExecutionTaskStatus, number> = {
      [ExecutionTaskStatus.CREATED]: 0,
      [ExecutionTaskStatus.ASSIGNED]: 0,
      [ExecutionTaskStatus.RUNNING]: 0,
      [ExecutionTaskStatus.VERIFYING]: 0,
      [ExecutionTaskStatus.COMPLETED]: 0,
      [ExecutionTaskStatus.FAILED]: 0,
      [ExecutionTaskStatus.BLOCKED]: 0
    };

    for (const t of tasks) {
      statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
    }

    const snapshot: ExecutionTaskRegistrySnapshot = Object.freeze({
      snapshotId: `snap-task-${Date.now()}`,
      timestamp: new Date().toISOString(),
      totalTasksCount: tasks.length,
      statusCounts: Object.freeze(statusCounts),
      tasks
    });

    this.snapshotHistory.push(snapshot);
    return snapshot;
  }

  /**
   * 最新のタスクスナップショットを取得する
   */
  static getLatestSnapshot(): ExecutionTaskRegistrySnapshot | undefined {
    if (this.snapshotHistory.length === 0) {
      return undefined;
    }
    return this.snapshotHistory[this.snapshotHistory.length - 1];
  }

  /**
   * スナップショット履歴の一覧を取得する
   */
  static getSnapshotHistory(): readonly ExecutionTaskRegistrySnapshot[] {
    return Object.freeze([...this.snapshotHistory]);
  }

  /**
   * レジストリ状態および履歴をクリアする（テスト用・初期化用）
   */
  static clear(): void {
    this.registry.clear();
    this.snapshotHistory = [];
  }
}
