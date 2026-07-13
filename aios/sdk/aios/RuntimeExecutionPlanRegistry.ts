import { RuntimeExecutionPlanValidator } from './RuntimeExecutionPlanValidator';

/**
 * RuntimeExecutionPlanRegistry.ts
 * 
 * Development OS における実行計画の状態および定義を一元管理する不変レジストリ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum RuntimeExecutionPlanState {
  CREATED = 'CREATED',
  READY = 'READY',
  PLANNED = 'PLANNED',
  EXECUTING = 'EXECUTING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export enum ExecutionStrategy {
  SEQUENTIAL = 'SEQUENTIAL',
  PARALLEL = 'PARALLEL',
  CONDITIONAL = 'CONDITIONAL',
  MANUAL = 'MANUAL'
}

export interface ExecutionPlan {
  readonly planId: string;
  readonly planName: string;
  readonly taskId: string;
  readonly executionStrategy: ExecutionStrategy;
  readonly planState: RuntimeExecutionPlanState;
  readonly description: string;
  readonly planVersion: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly version: string;
}

export interface RegistryMetadata {
  readonly registryId: string;
  readonly registryVersion: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export class RuntimeExecutionPlanRegistry {
  private static registry: Map<string, ExecutionPlan> = new Map();

  // レジストリメタデータの定義
  public static readonly metadata: RegistryMetadata = Object.freeze({
    registryId: 'reg-runtime-execution-plan-01',
    registryVersion: '1.0.0',
    createdAt: new Date('2026-07-09T10:30:00Z').toISOString(),
    updatedAt: new Date('2026-07-09T10:30:00Z').toISOString()
  });

  /**
   * ExecutionPlan を登録する
   */
  static register(plan: ExecutionPlan): void {
    if (!plan) {
      throw new Error('[RuntimeExecutionPlanRegistry] ExecutionPlan cannot be empty');
    }
    if (!plan.planId) {
      throw new Error('[RuntimeExecutionPlanRegistry] planId is required');
    }
    if (!plan.planName) {
      throw new Error('[RuntimeExecutionPlanRegistry] planName is required');
    }

    // ID重複チェック
    if (this.registry.has(plan.planId)) {
      throw new Error(`[RuntimeExecutionPlanRegistry] ExecutionPlan ID already registered: ${plan.planId}`);
    }

    // 名前重複チェック
    for (const item of this.registry.values()) {
      if (item.planName === plan.planName) {
        throw new Error(`[RuntimeExecutionPlanRegistry] ExecutionPlan Name already registered: ${plan.planName}`);
      }
    }

    // バリデーションの実行
    RuntimeExecutionPlanValidator.validate(plan);

    // 完全な不変性を担保して格納
    this.registry.set(plan.planId, Object.freeze({
      ...plan
    }));
  }

  /**
   * IDから ExecutionPlan を取得する
   */
  static get(id: string): ExecutionPlan | undefined {
    return this.registry.get(id);
  }

  /**
   * Task ID から関連する ExecutionPlan のリストを検索する
   */
  static findByTask(taskId: string): ExecutionPlan[] {
    const results: ExecutionPlan[] = [];
    for (const plan of this.registry.values()) {
      if (plan.taskId === taskId) {
        results.push(plan);
      }
    }
    return results;
  }

  /**
   * State から関連する ExecutionPlan のリストを検索する
   */
  static findByState(state: RuntimeExecutionPlanState): ExecutionPlan[] {
    const results: ExecutionPlan[] = [];
    for (const plan of this.registry.values()) {
      if (plan.planState === state) {
        results.push(plan);
      }
    }
    return results;
  }

  /**
   * Strategy から関連する ExecutionPlan のリストを検索する
   */
  static findByStrategy(strategy: ExecutionStrategy): ExecutionPlan[] {
    const results: ExecutionPlan[] = [];
    for (const plan of this.registry.values()) {
      if (plan.executionStrategy === strategy) {
        results.push(plan);
      }
    }
    return results;
  }

  /**
   * すべての ExecutionPlan を取得する
   */
  static findAll(): ExecutionPlan[] {
    return Array.from(this.registry.values());
  }

  /**
   * レジストリをクリアする (テスト用)
   */
  static clear(): void {
    this.registry.clear();
  }
}
