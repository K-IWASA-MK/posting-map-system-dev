/**
 * ExecutionPlanRegistry.ts
 * 
 * AIOS Execution Plan Registry
 * 
 * 実行計画（ExecutionPlan）の中央登録・検索・ステップ進行管理・不変境界管理・スナップショット保存を行う。
 * Controlled State Management / Immutable Boundary 設計。
 */

import {
  ExecutionPlan,
  ExecutionPlanStatus,
  ExecutionStepResult,
  ExecutionStepStatus
} from './ExecutionPlanModel';
import { ExecutionPlanValidator } from './ExecutionPlanValidator';
import { ExecutionPlanFactory } from './ExecutionPlanFactory';

export interface ExecutionPlanRegistrySnapshot {
  readonly snapshotId: string;
  readonly timestamp: string;
  readonly totalPlansCount: number;
  readonly statusCounts: Readonly<Record<ExecutionPlanStatus, number>>;
  readonly plans: readonly ExecutionPlan[];
}

export class ExecutionPlanRegistry {
  private static registry: Map<string, ExecutionPlan> = new Map();
  private static snapshotHistory: ExecutionPlanRegistrySnapshot[] = [];

  /**
   * 実行計画を登録する（重複 ID は拒否）
   */
  static register(plan: ExecutionPlan): void {
    if (!plan) {
      throw new Error('[ExecutionPlanRegistry] Plan cannot be empty');
    }

    if (!ExecutionPlanValidator.validatePlan(plan)) {
      throw new Error('[ExecutionPlanRegistry] Invalid execution plan structure');
    }

    if (this.registry.has(plan.planId)) {
      throw new Error(`[ExecutionPlanRegistry] Plan ID already registered: ${plan.planId}`);
    }

    this.registry.set(plan.planId, Object.freeze({ ...plan }));
  }

  /**
   * 複数の実行計画を一括登録する
   */
  static registerMany(plans: readonly ExecutionPlan[]): void {
    for (const p of plans) {
      this.register(p);
    }
  }

  /**
   * Plan ID から実行計画を取得する
   */
  static get(planId: string): ExecutionPlan | undefined {
    return this.registry.get(planId);
  }

  /**
   * 指定した Task ID に関連する実行計画一覧を取得する
   */
  static getByTask(taskId: string): readonly ExecutionPlan[] {
    const results: ExecutionPlan[] = [];
    for (const p of this.registry.values()) {
      if (p.taskId === taskId) {
        results.push(p);
      }
    }
    return Object.freeze(results);
  }

  /**
   * 指定した AI 社員 ID に割り当てられた実行計画一覧を取得する
   */
  static getByEmployee(employeeId: string): readonly ExecutionPlan[] {
    const results: ExecutionPlan[] = [];
    for (const p of this.registry.values()) {
      if (p.employeeId === employeeId) {
        results.push(p);
      }
    }
    return Object.freeze(results);
  }

  /**
   * 指定した Status の実行計画一覧を取得する
   */
  static getByStatus(status: ExecutionPlanStatus): readonly ExecutionPlan[] {
    const results: ExecutionPlan[] = [];
    for (const p of this.registry.values()) {
      if (p.status === status) {
        results.push(p);
      }
    }
    return Object.freeze(results);
  }

  /**
   * 登録されている全実行計画を取得する
   */
  static getAll(): readonly ExecutionPlan[] {
    return Object.freeze(Array.from(this.registry.values()));
  }

  /**
   * 計画自体のステータスを更新する
   */
  static updatePlanStatus(planId: string, status: ExecutionPlanStatus): ExecutionPlan {
    const existing = this.registry.get(planId);
    if (!existing) {
      throw new Error(`[ExecutionPlanRegistry] Plan not found: ${planId}`);
    }

    const updated = ExecutionPlanFactory.createPlan({
      planId: existing.planId,
      taskId: existing.taskId,
      employeeId: existing.employeeId,
      steps: existing.steps,
      status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
      metadata: existing.metadata
    });

    this.registry.set(planId, updated);
    return updated;
  }

  /**
   * 計画内の特定 Step のステータスおよび実行結果を更新する
   */
  static updateStepStatus(
    planId: string,
    stepId: string,
    stepStatus: ExecutionStepStatus,
    stepResult?: ExecutionStepResult
  ): ExecutionPlan {
    const existing = this.registry.get(planId);
    if (!existing) {
      throw new Error(`[ExecutionPlanRegistry] Plan not found: ${planId}`);
    }

    let stepFound = false;
    const updatedSteps = existing.steps.map((step) => {
      if (step.stepId === stepId) {
        stepFound = true;
        return Object.freeze({
          ...step,
          status: stepStatus,
          ...(stepResult ? { result: Object.freeze({ ...stepResult }) } : {})
        });
      }
      return step;
    });

    if (!stepFound) {
      throw new Error(`[ExecutionPlanRegistry] Step ID ${stepId} not found in plan ${planId}`);
    }

    const updatedPlan = ExecutionPlanFactory.createPlan({
      planId: existing.planId,
      taskId: existing.taskId,
      employeeId: existing.employeeId,
      steps: updatedSteps,
      status: existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
      metadata: existing.metadata
    });

    this.registry.set(planId, updatedPlan);
    return updatedPlan;
  }

  /**
   * 現在の実行計画スナップショットを生成し記録する
   */
  static captureSnapshot(): ExecutionPlanRegistrySnapshot {
    const plans = this.getAll();
    const statusCounts: Record<ExecutionPlanStatus, number> = {
      [ExecutionPlanStatus.DRAFT]: 0,
      [ExecutionPlanStatus.READY]: 0,
      [ExecutionPlanStatus.EXECUTING]: 0,
      [ExecutionPlanStatus.COMPLETED]: 0,
      [ExecutionPlanStatus.FAILED]: 0,
      [ExecutionPlanStatus.BLOCKED]: 0
    };

    for (const p of plans) {
      statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
    }

    const snapshot: ExecutionPlanRegistrySnapshot = Object.freeze({
      snapshotId: `snap-plan-${Date.now()}`,
      timestamp: new Date().toISOString(),
      totalPlansCount: plans.length,
      statusCounts: Object.freeze(statusCounts),
      plans
    });

    this.snapshotHistory.push(snapshot);
    return snapshot;
  }

  /**
   * 最新のスナップショットを取得する
   */
  static getLatestSnapshot(): ExecutionPlanRegistrySnapshot | undefined {
    if (this.snapshotHistory.length === 0) return undefined;
    return this.snapshotHistory[this.snapshotHistory.length - 1];
  }

  /**
   * スナップショット履歴一覧を取得する
   */
  static getSnapshotHistory(): readonly ExecutionPlanRegistrySnapshot[] {
    return Object.freeze([...this.snapshotHistory]);
  }

  /**
   * クリア（初期化）
   */
  static clear(): void {
    this.registry.clear();
    this.snapshotHistory = [];
  }
}
