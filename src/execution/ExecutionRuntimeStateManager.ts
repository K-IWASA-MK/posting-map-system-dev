/**
 * ExecutionRuntimeStateManager.ts
 * 
 * Execution Runtime State Manager Foundation の構造および公開インターフェース定義 (SSOT)。
 * 
 * 警告：本ファイル内への実際の状態更新、状態遷移、同期、復旧、非同期処理、キュー処理、リトライ、
 * API 通信、コマンド送信、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum StateManagerType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME',
  SIMULATION = 'SIMULATION',
  PLUGIN = 'PLUGIN',
  AI = 'AI'
}

export enum StateManagerScope {
  SYSTEM = 'SYSTEM',
  USER = 'USER',
  TENANT = 'TENANT'
}

export enum RuntimeStateType {
  BOOT_STATE = 'BOOT_STATE',
  PIPELINE_STATE = 'PIPELINE_STATE',
  CONTEXT_STATE = 'CONTEXT_STATE',
  RUNTIME_STATE = 'RUNTIME_STATE'
}

export interface RuntimeStateModelMetadata {
  readonly id: string;
  readonly name: string;
  readonly stateModelVersion: string;
  readonly description: string;
}

export interface RuntimeStateModel {
  readonly stateType: RuntimeStateType;
  readonly modelId: string;
  readonly metadata: RuntimeStateModelMetadata;
  readonly allowedTransitions: readonly string[];
}

export interface StateManagerMetadata {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly layer: string;
  readonly category: string;
}

export interface ExecutionRuntimeStateManagerContext {
  readonly runtimeStateManagerId: string;
}

export interface ExecutionRuntimeStateManagerData {
  readonly managerType: StateManagerType;
  readonly managerScope: StateManagerScope;
  readonly stateModels: readonly RuntimeStateModel[];
}

export interface ExecutionRuntimeStateManager {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly context: ExecutionRuntimeStateManagerContext;
  readonly metadata: StateManagerMetadata;
  readonly data: ExecutionRuntimeStateManagerData;
}

export interface ExecutionRuntimeStateManagerBlueprint {
  getExecutionRuntimeStateManager(): ExecutionRuntimeStateManager;
  getMetadata(): StateManagerMetadata;
  getContext(): ExecutionRuntimeStateManagerContext;
  getData(): ExecutionRuntimeStateManagerData;
  getStateModels(): readonly RuntimeStateModel[];
}

// 1. 静的状態モデルリストの定義と凍結 (stateModelVersion 1.0 を追加)
export const RUNTIME_STATE_MODELS: readonly RuntimeStateModel[] = Object.freeze([
  Object.freeze({
    stateType: RuntimeStateType.BOOT_STATE,
    modelId: 'state-model-boot-01',
    metadata: Object.freeze({
      id: 'state-model-meta-boot-01',
      name: 'Boot State Model Metadata',
      stateModelVersion: '1.0',
      description: 'Metadata for Boot State Model Schema'
    }),
    allowedTransitions: Object.freeze(['UNINITIALIZED', 'INITIALIZING', 'READY', 'FAILED'])
  }),
  Object.freeze({
    stateType: RuntimeStateType.PIPELINE_STATE,
    modelId: 'state-model-pipeline-01',
    metadata: Object.freeze({
      id: 'state-model-meta-pipeline-01',
      name: 'Pipeline State Model Metadata',
      stateModelVersion: '1.0',
      description: 'Metadata for Pipeline State Model Schema'
    }),
    allowedTransitions: Object.freeze(['IDLE', 'RUNNING', 'COMPLETED', 'ERROR'])
  }),
  Object.freeze({
    stateType: RuntimeStateType.CONTEXT_STATE,
    modelId: 'state-model-context-01',
    metadata: Object.freeze({
      id: 'state-model-meta-context-01',
      name: 'Context State Model Metadata',
      stateModelVersion: '1.0',
      description: 'Metadata for Context State Model Schema'
    }),
    allowedTransitions: Object.freeze(['EMPTY', 'HYDRATED', 'DIRTY', 'SYNCED'])
  }),
  Object.freeze({
    stateType: RuntimeStateType.RUNTIME_STATE,
    modelId: 'state-model-runtime-01',
    metadata: Object.freeze({
      id: 'state-model-meta-runtime-01',
      name: 'Runtime State Model Metadata',
      stateModelVersion: '1.0',
      description: 'Metadata for Runtime State Model Schema'
    }),
    allowedTransitions: Object.freeze(['CREATED', 'BOOTING', 'ACTIVE', 'PAUSED', 'TERMINATED'])
  })
]);

// 2. メタデータオブジェクトの作成と凍結
const managerMetadata: StateManagerMetadata = Object.freeze({
  id: 'runtime-state-manager-meta-01',
  name: 'Execution Runtime State Manager Metadata',
  version: '1.0.0',
  description: 'Metadata for Execution Runtime State Manager Foundation',
  layer: 'State Manager Layer',
  category: 'Infrastructure'
});

// 3. コンテキストオブジェクトの作成と凍結 (ID 参照のみ、runtimeStateManagerId のみ)
const managerContext: ExecutionRuntimeStateManagerContext = Object.freeze({
  runtimeStateManagerId: 'runtime-state-manager-01'
});

// 4. データオブジェクトの作成と凍結
const managerData: ExecutionRuntimeStateManagerData = Object.freeze({
  managerType: StateManagerType.FOUNDATION,
  managerScope: StateManagerScope.SYSTEM,
  stateModels: RUNTIME_STATE_MODELS
});

// 5. 状態マネージャーオブジェクト本体の作成と凍結
const runtimeStateManagerData: ExecutionRuntimeStateManager = Object.freeze({
  id: 'runtime-state-manager-01',
  name: 'Default Execution Runtime State Manager Foundation',
  description: 'The static execution runtime state manager structure definition',
  context: managerContext,
  metadata: managerMetadata,
  data: managerData
});

// Blueprint コンテナの不変シングルトンインスタンス実装
export const EXECUTION_RUNTIME_STATE_MANAGER_BLUEPRINT: ExecutionRuntimeStateManagerBlueprint = Object.freeze({
  getExecutionRuntimeStateManager(): ExecutionRuntimeStateManager {
    return runtimeStateManagerData;
  },

  getMetadata(): StateManagerMetadata {
    return runtimeStateManagerData.metadata;
  },

  getContext(): ExecutionRuntimeStateManagerContext {
    return runtimeStateManagerData.context;
  },

  getData(): ExecutionRuntimeStateManagerData {
    return runtimeStateManagerData.data;
  },

  getStateModels(): readonly RuntimeStateModel[] {
    return RUNTIME_STATE_MODELS;
  }
});
