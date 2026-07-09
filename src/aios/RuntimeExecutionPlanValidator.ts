import { ExecutionPlan, RuntimeExecutionPlanState, ExecutionStrategy } from './RuntimeExecutionPlanRegistry';
import { RuntimeTaskRegistry } from './RuntimeTaskRegistry';

/**
 * RuntimeExecutionPlanValidator.ts
 * 
 * ExecutionPlan 定義の妥当性および Runtime Task 参照整合性を検証するバリデータ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export class RuntimeExecutionPlanValidator {
  /**
   * ExecutionPlan の定義が正当であるか検証する
   * 不正な場合は例外をスローする
   */
  static validate(plan: ExecutionPlan): void {
    if (!plan) {
      throw new Error('[RuntimeExecutionPlanValidator] ExecutionPlan is empty');
    }

    // 1. Plan ID 検証
    if (!plan.planId || !/^plan-\d+$/.test(plan.planId)) {
      throw new Error(`[RuntimeExecutionPlanValidator] Invalid planId format: ${plan.planId}`);
    }

    // 2. Name 検証
    if (!plan.planName || typeof plan.planName !== 'string' || plan.planName.trim() === '') {
      throw new Error('[RuntimeExecutionPlanValidator] planName is required and must be a non-empty string');
    }

    // 3. State 検証
    if (!plan.planState || !Object.values(RuntimeExecutionPlanState).includes(plan.planState)) {
      throw new Error(`[RuntimeExecutionPlanValidator] Invalid planState: ${plan.planState}`);
    }

    // 4. Strategy 検証
    if (!plan.executionStrategy || !Object.values(ExecutionStrategy).includes(plan.executionStrategy)) {
      throw new Error(`[RuntimeExecutionPlanValidator] Invalid executionStrategy: ${plan.executionStrategy}`);
    }

    // 5. Version 検証
    if (!plan.version || typeof plan.version !== 'string' || plan.version.trim() === '') {
      throw new Error('[RuntimeExecutionPlanValidator] version is required and must be a non-empty string');
    }
    if (!plan.planVersion || typeof plan.planVersion !== 'string' || plan.planVersion.trim() === '') {
      throw new Error('[RuntimeExecutionPlanValidator] planVersion is required and must be a non-empty string');
    }

    // 6. ISO8601 時刻形式検証
    const iso8601Pattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
    if (!plan.createdAt || !iso8601Pattern.test(plan.createdAt)) {
      throw new Error(`[RuntimeExecutionPlanValidator] Invalid createdAt ISO8601 format: ${plan.createdAt}`);
    }
    if (!plan.updatedAt || !iso8601Pattern.test(plan.updatedAt)) {
      throw new Error(`[RuntimeExecutionPlanValidator] Invalid updatedAt ISO8601 format: ${plan.updatedAt}`);
    }

    // 7. createdAt <= updatedAt 検証
    const createdTime = new Date(plan.createdAt).getTime();
    const updatedTime = new Date(plan.updatedAt).getTime();
    if (isNaN(createdTime) || isNaN(updatedTime) || createdTime > updatedTime) {
      throw new Error(`[RuntimeExecutionPlanValidator] Invalid plan date sequence: createdAt (${plan.createdAt}) must be less than or equal to updatedAt (${plan.updatedAt})`);
    }

    // 8. Referential Integrity: Task 存在検証 (SSOT)
    if (!plan.taskId) {
      throw new Error('[RuntimeExecutionPlanValidator] taskId is required');
    }
    const task = RuntimeTaskRegistry.get(plan.taskId);
    if (!task) {
      throw new Error(`[RuntimeExecutionPlanValidator] Task dependency not registered in RuntimeTaskRegistry: ${plan.taskId}`);
    }
  }
}
