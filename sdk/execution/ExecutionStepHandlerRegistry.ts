/**
 * ExecutionStepHandlerRegistry.ts
 * 
 * AIOS Execution Step Handler Registry
 * 
 * アクション種別（actionType）ごとのステップ実行関数（StepActionHandler）および
 * 必須権限スコープ・必須能力要件の中央登録・検索管理を行う。
 */

import { VerificationCapabilityType } from '../verification/VerificationCapabilityModel';
import { ExecutionPermissionScope } from './ExecutionPermissionGate';
import { ExecutionStep, ExecutionStepResult, ExecutionTask } from './index';

export type StepActionHandler = (
  step: ExecutionStep,
  task: ExecutionTask
) => Promise<ExecutionStepResult>;

export interface ExecutionStepHandlerDefinition {
  readonly actionType: string;
  readonly handler: StepActionHandler;
  readonly requiredPermissionScope?: ExecutionPermissionScope;
  readonly requiredCapability?: VerificationCapabilityType;
}

export class ExecutionStepHandlerRegistry {
  private static handlers: Map<string, ExecutionStepHandlerDefinition> = new Map();

  /**
   * ステップアクションハンドラを登録する
   */
  static registerHandler(definition: ExecutionStepHandlerDefinition): void {
    if (!definition || !definition.actionType || typeof definition.actionType !== 'string') {
      throw new Error('[ExecutionStepHandlerRegistry] Invalid handler definition');
    }
    if (typeof definition.handler !== 'function') {
      throw new Error(`[ExecutionStepHandlerRegistry] Handler must be a function for actionType: ${definition.actionType}`);
    }

    this.handlers.set(definition.actionType, Object.freeze({ ...definition }));
  }

  /**
   * アクション種別からハンドラ定義を取得する
   */
  static getHandler(actionType: string): ExecutionStepHandlerDefinition | undefined {
    return this.handlers.get(actionType);
  }

  /**
   * アクション種別が登録されているか判定する
   */
  static hasHandler(actionType: string): boolean {
    return this.handlers.has(actionType);
  }

  /**
   * ハンドラレジストリをクリアする（初期化用・テスト用）
   */
  static clear(): void {
    this.handlers.clear();
  }
}
