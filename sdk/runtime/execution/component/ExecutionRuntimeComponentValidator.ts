/**
 * ExecutionRuntimeComponentValidator.ts
 * 
 * Execution Runtime Component Validator Foundation (SSOT).
 * 実行コンポーネントバリデータの静的 Blueprint を表現する。
 * 
 * 警告：本ファイル内への実際のコンポーネント検証、評価、ルール適用、判定
 * （validate, evaluate, verify, check, inspect, enforce, register, resolve, dispatch, schedule, execute 等）、
 * 外部連携、Event、Queue、Thread、Timer、非同期処理（Async, Promise）の実装は厳禁である。
 */

export enum ValidatorType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME',
  SIMULATION = 'SIMULATION',
  PLUGIN = 'PLUGIN',
  AI = 'AI'
}

export enum ValidatorScope {
  SYNTAX = 'SYNTAX',
  SEMANTIC = 'SEMANTIC',
  INTEGRITY = 'INTEGRITY'
}

export interface RuntimeComponentValidatorMetadata {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly layer: string;
  readonly category: string;
}

export interface ExecutionRuntimeComponentValidatorContext {
  readonly runtimeComponentValidatorId: string;
}

export interface ExecutionRuntimeComponentValidatorData {
  readonly validatorType: ValidatorType;
  readonly validatorScope: ValidatorScope;
}

export interface ExecutionRuntimeComponentValidator {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly context: ExecutionRuntimeComponentValidatorContext;
  readonly metadata: RuntimeComponentValidatorMetadata;
  readonly data: ExecutionRuntimeComponentValidatorData;
}

export interface ExecutionRuntimeComponentValidatorBlueprint {
  getExecutionRuntimeComponentValidator(): ExecutionRuntimeComponentValidator;
  getMetadata(): RuntimeComponentValidatorMetadata;
  getContext(): ExecutionRuntimeComponentValidatorContext;
  getData(): ExecutionRuntimeComponentValidatorData;
}

// 1. メタデータの作成と凍結
const validatorMetadata: RuntimeComponentValidatorMetadata = Object.freeze({
  id: 'runtime-component-validator-spec-01',
  name: 'Default Execution Runtime Component Validator Specification',
  version: '1.0.0',
  description: 'The static execution runtime component validator foundation specification',
  layer: 'Runtime Layer',
  category: 'Execution Component Validator'
});

// 2. コンテキストの作成と凍結 (IDのみ保持)
const validatorContext: ExecutionRuntimeComponentValidatorContext = Object.freeze({
  runtimeComponentValidatorId: 'runtime-component-validator-01'
});

// 3. データの作成と凍結
const validatorData: ExecutionRuntimeComponentValidatorData = Object.freeze({
  validatorType: ValidatorType.FOUNDATION,
  validatorScope: ValidatorScope.SYNTAX
});

// 4. バリデータ本体の作成と凍結
const validatorInstance: ExecutionRuntimeComponentValidator = Object.freeze({
  id: 'runtime-component-validator-01',
  name: 'Default Execution Runtime Component Validator',
  description: 'The static execution runtime component validator instance definition',
  context: validatorContext,
  metadata: validatorMetadata,
  data: validatorData
});

// Blueprint コンテナの不変シングルトンインスタンス実装 (型固定の適用)
export const EXECUTION_RUNTIME_COMPONENT_VALIDATOR_BLUEPRINT: Readonly<ExecutionRuntimeComponentValidatorBlueprint> = Object.freeze({
  getExecutionRuntimeComponentValidator(): ExecutionRuntimeComponentValidator {
    return validatorInstance;
  },

  getMetadata(): RuntimeComponentValidatorMetadata {
    return validatorInstance.metadata;
  },

  getContext(): ExecutionRuntimeComponentValidatorContext {
    return validatorInstance.context;
  },

  getData(): ExecutionRuntimeComponentValidatorData {
    return validatorInstance.data;
  }
});

export type { ExecutionRuntimeComponentValidator as ExecutionRuntimeComponentValidatorType };
export type { ExecutionRuntimeComponentValidatorContext as ExecutionRuntimeComponentValidatorContextType };
export type { ExecutionRuntimeComponentValidatorData as ExecutionRuntimeComponentValidatorDataType };
