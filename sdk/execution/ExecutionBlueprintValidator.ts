/**
 * ExecutionBlueprintValidator.ts
 * 
 * Blueprint の構造整合性を表現する静的バリデーターの構造定義 (SSOT)。
 * 
 * 警告：本ファイル内への実際の検証・評価・エラー生成・修正、API 通信、コマンド送信、
 * AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum ValidatorType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME',
  SIMULATION = 'SIMULATION',
  PLUGIN = 'PLUGIN',
  AI = 'AI'
}

export enum ValidationStrategy {
  STATIC = 'STATIC',
  STRUCTURE = 'STRUCTURE',
  REFERENCE = 'REFERENCE',
  SCHEMA = 'SCHEMA'
}

export interface ValidatorMetadata {
  readonly author: string;
  readonly version: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly phase: string;
}

export interface ExecutionBlueprintValidatorContext {
  readonly runtimeId: string;
  readonly runtimeRegistryId: string;
  readonly hydratorId: string;
  readonly dispatcherId: string;
  readonly resolverId: string;
  readonly stateId: string;
  readonly resultId: string;
}

export interface ExecutionBlueprintValidator {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly validatorType: ValidatorType;
  readonly strategy: ValidationStrategy;
  readonly context: ExecutionBlueprintValidatorContext;
  readonly metadata: ValidatorMetadata;
}

export interface ExecutionBlueprintValidatorBlueprint {
  getValidator(): ExecutionBlueprintValidator;
  getContext(): ExecutionBlueprintValidatorContext;
  getMetadata(): ValidatorMetadata;
}

// 1. メタデータオブジェクトの作成と凍結
const validatorMetadata: ValidatorMetadata = Object.freeze({
  author: 'AIOS Team',
  version: '1.0.0',
  createdAt: '2026-07-09T17:00:00Z',
  updatedAt: '2026-07-09T17:00:00Z',
  phase: 'Phase 204-4'
});

// 2. コンテキストオブジェクトの作成と凍結 (ID 参照のみ)
const validatorContext: ExecutionBlueprintValidatorContext = Object.freeze({
  runtimeId: 'execution-runtime-01',
  runtimeRegistryId: 'registry-runtime-01',
  hydratorId: 'context-hydrator-01',
  dispatcherId: 'execution-dispatcher-01',
  resolverId: 'execution-resolver-01',
  stateId: 'execution-state-01',
  resultId: 'execution-result-01'
});

// 3. バリデーターオブジェクト本体の作成と凍結
const validatorData: ExecutionBlueprintValidator = Object.freeze({
  id: 'blueprint-validator-01',
  name: 'Default Execution Blueprint Validator',
  description: 'The static execution blueprint validation boundary specification',
  validatorType: ValidatorType.FOUNDATION,
  strategy: ValidationStrategy.STATIC,
  context: validatorContext,
  metadata: validatorMetadata
});

// Blueprint コンテナの不変シングルトンインスタンス実装
export const EXECUTION_BLUEPRINT_VALIDATOR_BLUEPRINT: ExecutionBlueprintValidatorBlueprint = Object.freeze({
  getValidator(): ExecutionBlueprintValidator {
    return validatorData;
  },

  getContext(): ExecutionBlueprintValidatorContext {
    return validatorData.context;
  },

  getMetadata(): ValidatorMetadata {
    return validatorData.metadata;
  }
});

export type { ExecutionBlueprintValidator as ExecutionBlueprintValidatorType };
