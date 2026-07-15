import { ExecutionPlan, RuntimeExecutionPlanState, ExecutionStrategy } from './RuntimeExecutionPlanRegistry';

/**
 * RuntimeExecutionPlanFactory.ts
 * 
 * 不変な ExecutionPlan レコードを決定論的かつ安全に生成するファクトリ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export class RuntimeExecutionPlanFactory {
  private static counter = 0;

  /**
   * 決定論的な ID（plan-1, plan-2...）を持つ不変な ExecutionPlan を生成する
   */
  static create(
    name: string,
    taskId: string,
    executionStrategy: ExecutionStrategy,
    planState: RuntimeExecutionPlanState,
    description: string = '',
    planVersion: string = '1.0.0',
    version: string = '1.0.0'
  ): ExecutionPlan {
    if (!name) {
      throw new Error('[RuntimeExecutionPlanFactory] planName is required');
    }
    if (!taskId) {
      throw new Error('[RuntimeExecutionPlanFactory] taskId is required');
    }
    if (!executionStrategy) {
      throw new Error('[RuntimeExecutionPlanFactory] executionStrategy is required');
    }
    if (!planState) {
      throw new Error('[RuntimeExecutionPlanFactory] planState is required');
    }

    this.counter++;
    const id = `plan-${this.counter}`;
    const now = new Date().toISOString();

    const plan: ExecutionPlan = {
      planId: id,
      planName: name,
      taskId: taskId,
      executionStrategy: executionStrategy,
      planState: planState,
      description: description || '',
      planVersion: planVersion,
      createdAt: now,
      updatedAt: now,
      version: version
    };

    return Object.freeze(plan);
  }

  /**
   * カウンターをリセットする (テスト用)
   */
  static resetCounter(): void {
    this.counter = 0;
  }
}
