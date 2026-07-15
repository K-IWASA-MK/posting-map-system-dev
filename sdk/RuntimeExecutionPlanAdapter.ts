import { ExecutionPlan } from './RuntimeExecutionPlanRegistry';

/**
 * RuntimeExecutionPlanAdapter.ts
 * 
 * ExecutionPlan レコードを UI 表示用の Immutable な ViewModel へ変換するアダプター。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export interface ExecutionPlanViewModel {
  readonly id: string;
  readonly name: string;
  readonly taskId: string;
  readonly descriptionText: string;
  readonly planSpecVersion: string;
  readonly stateLabel: string;
  readonly strategyLabel: string;
  readonly displayName: string;
  readonly createdTimestamp: string;
  readonly updatedTimestamp: string;
}

export class RuntimeExecutionPlanAdapter {
  /**
   * ExecutionPlan レコードを不変な ExecutionPlanViewModel へ変換する
   */
  static toViewModel(plan: ExecutionPlan): ExecutionPlanViewModel {
    if (!plan) {
      throw new Error('[RuntimeExecutionPlanAdapter] ExecutionPlan cannot be empty');
    }

    const viewModel: ExecutionPlanViewModel = {
      id: plan.planId,
      name: plan.planName,
      taskId: plan.taskId,
      descriptionText: plan.description || '',
      planSpecVersion: plan.planVersion,
      stateLabel: String(plan.planState),
      strategyLabel: String(plan.executionStrategy),
      displayName: `Execution Plan: ${plan.planName} [Strategy: ${plan.executionStrategy}] (${plan.planId})`,
      createdTimestamp: plan.createdAt,
      updatedTimestamp: plan.updatedAt
    };

    return Object.freeze(viewModel);
  }
}
