/**
 * ExecutionRuntimeComponentLifecycleValidator.ts
 * 
 * Execution Runtime Component Lifecycle Validator Foundation (SSOT).
 * 実行コンポーネントライフサイクル検証器の静的 Blueprint を表現する。
 * 
 * 警告：本ファイル内への実際の検証・整合性チェック・状態評価・ポリシー判定処理
 * （validate, verify, check, evaluate, assert, inspect, execute 等）、
 * ランタイム検証器、イベント、キュー、スレッド、タイマー、非同期処理（Async, Promise）、プラグイン・AI ランタイムの実装は厳禁である。
 */

export enum ValidatorType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME',
  SIMULATION = 'SIMULATION',
  PLUGIN = 'PLUGIN',
  AI = 'AI'
}

export enum ValidatorScope {
  SINGLETON = 'SINGLETON',
  TRANSIENT = 'TRANSIENT',
  SCOPED = 'SCOPED'
}

export interface ValidatorMetadata {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly layer: string;
  readonly category: string;
}

export interface ExecutionRuntimeComponentLifecycleValidatorContext {
  readonly runtimeComponentLifecycleValidatorId: string;
}

export interface ExecutionRuntimeComponentLifecycleValidatorData {
  readonly validatorType: ValidatorType;
  readonly validatorScope: ValidatorScope;
}

export interface ExecutionRuntimeComponentLifecycleValidator {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly context: ExecutionRuntimeComponentLifecycleValidatorContext;
  readonly metadata: ValidatorMetadata;
  readonly data: ExecutionRuntimeComponentLifecycleValidatorData;
}

export interface ExecutionRuntimeComponentLifecycleValidatorBlueprint {
  getExecutionRuntimeComponentLifecycleValidator(): ExecutionRuntimeComponentLifecycleValidator;
  getMetadata(): ValidatorMetadata;
  getContext(): ExecutionRuntimeComponentLifecycleValidatorContext;
  getData(): ExecutionRuntimeComponentLifecycleValidatorData;
}

// 1. メタデータの作成と凍結
const componentLifecycleValidatorMetadata: ValidatorMetadata = Object.freeze({
  id: 'runtime-component-lifecycle-validator-spec-01',
  name: 'Default Execution Runtime Component Lifecycle Validator Specification',
  version: '1.0.0',
  description: 'The static execution runtime component lifecycle validator foundation specification',
  layer: 'Runtime Layer',
  category: 'Execution Component Lifecycle Validator'
});

// 2. コンテキストの作成と凍結 (IDのみ保持)
const componentLifecycleValidatorContext: ExecutionRuntimeComponentLifecycleValidatorContext = Object.freeze({
  runtimeComponentLifecycleValidatorId: 'runtime-component-lifecycle-validator-01'
});

// 3. データの作成と凍結
const componentLifecycleValidatorData: ExecutionRuntimeComponentLifecycleValidatorData = Object.freeze({
  validatorType: ValidatorType.FOUNDATION,
  validatorScope: ValidatorScope.SINGLETON
});

// 4. 検証器本体の作成と凍結
const componentLifecycleValidatorInstance: ExecutionRuntimeComponentLifecycleValidator = Object.freeze({
  id: 'runtime-component-lifecycle-validator-01',
  name: 'Default Execution Runtime Component Lifecycle Validator',
  description: 'The static execution runtime component lifecycle validator instance definition',
  context: componentLifecycleValidatorContext,
  metadata: componentLifecycleValidatorMetadata,
  data: componentLifecycleValidatorData
});

// Blueprint コンテナの不変シングルトンインスタンス実装 (型固定の適用)
export const EXECUTION_RUNTIME_COMPONENT_LIFECYCLE_VALIDATOR_BLUEPRINT: Readonly<ExecutionRuntimeComponentLifecycleValidatorBlueprint> = Object.freeze({
  getExecutionRuntimeComponentLifecycleValidator(): ExecutionRuntimeComponentLifecycleValidator {
    return componentLifecycleValidatorInstance;
  },

  getMetadata(): ValidatorMetadata {
    return componentLifecycleValidatorInstance.metadata;
  },

  getContext(): ExecutionRuntimeComponentLifecycleValidatorContext {
    return componentLifecycleValidatorInstance.context;
  },

  getData(): ExecutionRuntimeComponentLifecycleValidatorData {
    return componentLifecycleValidatorInstance.data;
  }
});

export type { ExecutionRuntimeComponentLifecycleValidator as ExecutionRuntimeComponentLifecycleValidatorType };
export type { ExecutionRuntimeComponentLifecycleValidatorContext as ExecutionRuntimeComponentLifecycleValidatorContextType };
export type { ExecutionRuntimeComponentLifecycleValidatorData as ExecutionRuntimeComponentLifecycleValidatorDataType };
