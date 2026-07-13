/**
 * ExecutionRuntimeEngine.ts
 * 
 * Execution Runtime Engine Foundation の構造および公開インターフェース定義 (SSOT)。
 * 
 * 警告：本ファイル内への実際の Runtime 起動・解釈・実行・ディスパッチ、
 * スケジューリング、非同期処理、キュー処理、リトライ、API 通信、コマンド送信、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

// ============================================================================
// 下位互換性確保のための定義 (Compatibility Layers)
// ============================================================================

export enum EngineType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME',
  SIMULATION = 'SIMULATION',
  PLUGIN = 'PLUGIN',
  AI = 'AI'
}

export interface RuntimeEngineMetadata {
  readonly author: string;
  readonly version: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly phase: string;
}

// ============================================================================
// 新規定義 (Phase 227 - Blueprint Schema Specifications)
// ============================================================================

export enum EngineManagerType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME',
  SIMULATION = 'SIMULATION',
  PLUGIN = 'PLUGIN',
  AI = 'AI'
}

export enum EngineManagerScope {
  SYSTEM = 'SYSTEM',
  USER = 'USER',
  TENANT = 'TENANT'
}

export enum RuntimeEngineType {
  SYSTEM_ENGINE = 'SYSTEM_ENGINE',
  CORE_ENGINE = 'CORE_ENGINE',
  APPLICATION_ENGINE = 'APPLICATION_ENGINE',
  PLUGIN_ENGINE = 'PLUGIN_ENGINE',
  FIELD_ENGINE = 'FIELD_ENGINE'
}

export enum EngineStep {
  REGISTER_BLUEPRINTS = 'REGISTER_BLUEPRINTS',
  VALIDATE_BLUEPRINTS = 'VALIDATE_BLUEPRINTS',
  BUILD_ENGINE_SCHEMA = 'BUILD_ENGINE_SCHEMA',
  READY_FOR_INTERPRETER = 'READY_FOR_INTERPRETER',
  ENGINE_SCHEMA_READY = 'ENGINE_SCHEMA_READY'
}

export interface RuntimeEngineModelMetadata {
  readonly id: string;
  readonly name: string;
  readonly engineModelVersion: string;
  readonly description: string;
}

export interface RuntimeEngineModel {
  readonly engineType: RuntimeEngineType;
  readonly modelId: string;
  readonly metadata: RuntimeEngineModelMetadata;
  readonly engineOrder: number;
  readonly targetBlueprints: readonly string[];
  readonly allowedSteps: readonly EngineStep[];
}

export interface EngineManagerMetadata {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly layer: string;
  readonly category: string;
}

export interface ExecutionRuntimeEngineContext {
  readonly runtimeEngineId: string;
}

export interface ExecutionRuntimeEngineData {
  readonly managerType: EngineManagerType;
  readonly managerScope: EngineManagerScope;
  readonly engineModels: readonly RuntimeEngineModel[];
}

export interface ExecutionRuntimeEngine {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly context: ExecutionRuntimeEngineContext;
  readonly metadata: EngineManagerMetadata;
  readonly data: ExecutionRuntimeEngineData;
}

export interface ExecutionRuntimeEngineBlueprint {
  getExecutionRuntimeEngine(): ExecutionRuntimeEngine;
  getMetadata(): EngineManagerMetadata;
  getContext(): ExecutionRuntimeEngineContext;
  getData(): ExecutionRuntimeEngineData;
  getEngineModels(): readonly RuntimeEngineModel[];
  getEngineSequence(): readonly EngineStep[];

  // 以前の API との互換性維持のためのエイリアスメソッド
  getEngine(): any;
}

// 1. 静的エンジンステップ手順リストの定義と凍結 (ENGINE_SCHEMA_READY を含む)
export const ENGINE_SEQUENCE: readonly EngineStep[] = Object.freeze([
  EngineStep.REGISTER_BLUEPRINTS,
  EngineStep.VALIDATE_BLUEPRINTS,
  EngineStep.BUILD_ENGINE_SCHEMA,
  EngineStep.READY_FOR_INTERPRETER,
  EngineStep.ENGINE_SCHEMA_READY
]);

// 2. 静的エンジンモデルリストの定義と凍結 (engineModelVersion 1.0, engineOrder 1〜5, targetBlueprints を含む)
export const RUNTIME_ENGINE_MODELS: readonly RuntimeEngineModel[] = Object.freeze([
  Object.freeze({
    engineType: RuntimeEngineType.SYSTEM_ENGINE,
    modelId: 'engine-model-system-01',
    metadata: Object.freeze({
      id: 'engine-model-meta-system-01',
      name: 'System Engine Model Metadata',
      engineModelVersion: '1.0',
      description: 'Metadata for System Engine Model Schema'
    }),
    engineOrder: 1,
    targetBlueprints: Object.freeze(['executor-blueprint-id']),
    allowedSteps: ENGINE_SEQUENCE
  }),
  Object.freeze({
    engineType: RuntimeEngineType.CORE_ENGINE,
    modelId: 'engine-model-core-01',
    metadata: Object.freeze({
      id: 'engine-model-meta-core-01',
      name: 'Core Engine Model Metadata',
      engineModelVersion: '1.0',
      description: 'Metadata for Core Engine Model Schema'
    }),
    engineOrder: 2,
    targetBlueprints: Object.freeze(['composer-blueprint-id']),
    allowedSteps: ENGINE_SEQUENCE
  }),
  Object.freeze({
    engineType: RuntimeEngineType.APPLICATION_ENGINE,
    modelId: 'engine-model-app-01',
    metadata: Object.freeze({
      id: 'engine-model-meta-app-01',
      name: 'Application Engine Model Metadata',
      engineModelVersion: '1.0',
      description: 'Metadata for Application Engine Model Schema'
    }),
    engineOrder: 3,
    targetBlueprints: Object.freeze(['builder-blueprint-id']),
    allowedSteps: ENGINE_SEQUENCE
  }),
  Object.freeze({
    engineType: RuntimeEngineType.PLUGIN_ENGINE,
    modelId: 'engine-model-plugin-01',
    metadata: Object.freeze({
      id: 'engine-model-meta-plugin-01',
      name: 'Plugin Engine Model Metadata',
      engineModelVersion: '1.0',
      description: 'Metadata for Plugin Engine Model Schema'
    }),
    engineOrder: 4,
    targetBlueprints: Object.freeze(['loader-blueprint-id']),
    allowedSteps: ENGINE_SEQUENCE
  }),
  Object.freeze({
    engineType: RuntimeEngineType.FIELD_ENGINE,
    modelId: 'engine-model-field-01',
    metadata: Object.freeze({
      id: 'engine-model-meta-field-01',
      name: 'Field Engine Model Metadata',
      engineModelVersion: '1.0',
      description: 'Metadata for Field Engine Model Schema'
    }),
    engineOrder: 5,
    targetBlueprints: Object.freeze([]),
    allowedSteps: ENGINE_SEQUENCE
  })
]);

// 3. メタデータオブジェクトの作成と凍結
const managerMetadata: EngineManagerMetadata = Object.freeze({
  id: 'runtime-engine-manager-meta-01',
  name: 'Execution Runtime Engine Manager Metadata',
  version: '1.0.0',
  description: 'Metadata for Execution Runtime Engine Manager Foundation',
  layer: 'Engine Manager Layer',
  category: 'Infrastructure'
});

// 4. コンテキストオブジェクトの作成と凍結 (ID 参照のみ、runtimeEngineId のみ)
const managerContext: ExecutionRuntimeEngineContext = Object.freeze({
  runtimeEngineId: 'runtime-engine-01'
});

// 5. データオブジェクトの作成と凍結
const managerData: ExecutionRuntimeEngineData = Object.freeze({
  managerType: EngineManagerType.FOUNDATION,
  managerScope: EngineManagerScope.SYSTEM,
  engineModels: RUNTIME_ENGINE_MODELS
});

// 6. エンジンマネージャーオブジェクト本体の作成と凍結
const runtimeEngineData: ExecutionRuntimeEngine = Object.freeze({
  id: 'runtime-engine-01',
  name: 'Default Execution Runtime Engine Foundation',
  description: 'The static execution runtime engine manager structure definition',
  context: managerContext,
  metadata: managerMetadata,
  data: managerData
});

// 7. 以前の API (getEngine) との互換性を完全に保証するための互換オブジェクト
const compatibilityMetadata: RuntimeEngineMetadata = Object.freeze({
  author: 'AIOS Team',
  version: '1.0.0',
  createdAt: '2026-07-10T05:30:00Z',
  updatedAt: '2026-07-10T05:30:00Z',
  phase: 'Phase 206-1'
});

const compatibilityContext = Object.freeze({
  runtimeManagerId: 'runtime-manager-01',
  runtimeSessionId: 'runtime-session-01',
  runtimeContextId: 'runtime-context-01',
  runtimeRegistryId: 'registry-runtime-01',
  runtimeResolverId: 'runtime-resolver-01',
  hydratorId: 'context-hydrator-01',
  validatorId: 'blueprint-validator-01',
  dispatcherId: 'runtime-dispatcher-01',
  queueId: 'queue-1',
  schedulerId: 'scheduler-1',
  executorId: 'executor-1'
});

const compatibilityEngine = Object.freeze({
  id: 'runtime-engine-01',
  name: 'Default Execution Runtime Engine',
  description: 'The static execution runtime engine entry point specification',
  engineType: EngineType.FOUNDATION,
  context: compatibilityContext,
  metadata: compatibilityMetadata
});

// Blueprint コンテナの不変シングルトンインスタンス実装
export const EXECUTION_RUNTIME_ENGINE_BLUEPRINT: ExecutionRuntimeEngineBlueprint = Object.freeze({
  getExecutionRuntimeEngine(): ExecutionRuntimeEngine {
    return runtimeEngineData;
  },

  getMetadata(): any {
    // 互換性のため、呼び出し側の期待値に合わせて compatibilityMetadata も提供できるが、
    // 新しい EngineManagerMetadata を基本としつつ、型キャストで吸収可能にする。
    return managerMetadata;
  },

  getContext(): any {
    // 互換性のための compatibilityContext ではなく、新 context を返す。
    return managerContext;
  },

  getData(): ExecutionRuntimeEngineData {
    return runtimeEngineData.data;
  },

  getEngineModels(): readonly RuntimeEngineModel[] {
    return RUNTIME_ENGINE_MODELS;
  },

  getEngineSequence(): readonly EngineStep[] {
    return ENGINE_SEQUENCE;
  },

  // 以前の getEngine 呼び出しとの下位互換性確保のためのメソッド
  getEngine(): any {
    return compatibilityEngine;
  }
});
