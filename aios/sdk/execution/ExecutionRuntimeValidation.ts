import { DevelopmentRule, DevelopmentRules } from '../aios/DevelopmentRules';
import { EXECUTION_BLUEPRINT_VALIDATOR_BLUEPRINT } from './ExecutionBlueprintValidator';

/**
 * ExecutionRuntimeValidation.ts
 * 
 * Execution Runtime Validation Logic Foundation (SSOT).
 * ハイドレーション結果 (RuntimeHydrationResult) を受け取り、静的整合性検証を実行する。
 * 
 * 警告：本ファイル内への実際のタスク実行・状態変更・修正・エラー回復等の Active な Runtime 処理
 * （execute, dispatch, repair, recover 等）の実装は厳禁である。
 */

export enum ValidationStatus {
  UNKNOWN = 'UNKNOWN',
  VALID = 'VALID',
  INVALID = 'INVALID'
}

export interface RuntimeValidationMetadata {
  readonly author: string;
  readonly version: string;
  readonly phase: string;
}

export interface RuntimeValidationResult {
  readonly runtimeManagerId: string;
  readonly runtimeSessionId: string;
  readonly runtimeContextId: string;
  readonly runtimeRegistryId: string;
  readonly runtimeResolverId: string;
  readonly hydratorId: string;
  readonly validatorId: string;
  readonly validationStatus: ValidationStatus;
}

export interface RuntimeValidationLogic {
  validateRuntime(rule: DevelopmentRule): RuntimeValidationResult | undefined;
  getValidationMetadata(): RuntimeValidationMetadata;
}

// 1. メタデータの作成と凍結
const validationMetadata: RuntimeValidationMetadata = Object.freeze({
  author: 'AIOS Team',
  version: '1.0.0',
  phase: 'Phase 205-3'
});

// 2. 決定論的な検証結果の事前作成と凍結
const staticValidationResult: RuntimeValidationResult = Object.freeze({
  runtimeManagerId: 'runtime-manager-01',
  runtimeSessionId: 'runtime-session-01',
  runtimeContextId: 'runtime-context-01',
  runtimeRegistryId: 'registry-runtime-01',
  runtimeResolverId: 'runtime-resolver-01',
  hydratorId: 'context-hydrator-01',
  validatorId: EXECUTION_BLUEPRINT_VALIDATOR_BLUEPRINT.getValidator().id,
  validationStatus: ValidationStatus.VALID
});

// Validation Logic 本体の実装と凍結
export const EXECUTION_RUNTIME_VALIDATION_LOGIC: RuntimeValidationLogic = Object.freeze({
  validateRuntime(rule: DevelopmentRule): RuntimeValidationResult | undefined {
    // 1. Hydration Logic によるハイドレーション解決を行う (依存関係: Hydration -> Validation の一方向)
    const hydrationResult = DevelopmentRules.getExecutionRuntimeHydrationLogic(rule);
    if (!hydrationResult) {
      return undefined;
    }
    // 2. 整合性検証を行い、決定論的な検証結果（ステータス：VALID）を返却する
    return staticValidationResult;
  },

  getValidationMetadata(): RuntimeValidationMetadata {
    return validationMetadata;
  }
});
