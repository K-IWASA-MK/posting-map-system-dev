/**
 * ExecutionRuntimeExecutor.ts
 * 
 * Execution Runtime Executor Foundation の構造および公開インターフェース定義 (SSOT)。
 * 
 * 警告：本ファイル内への実際の Runtime 実行、起動、停止、制御、プロセス/スレッド割り当て、
 * スケジューリング、非同期処理、キュー処理、リトライ、API 通信、コマンド送信、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum ExecutorType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME',
  SIMULATION = 'SIMULATION',
  PLUGIN = 'PLUGIN',
  AI = 'AI'
}

export enum ExecutorScope {
  SYSTEM = 'SYSTEM',
  USER = 'USER',
  TENANT = 'TENANT'
}

export enum RuntimeExecutionType {
  SYSTEM_EXECUTION = 'SYSTEM_EXECUTION',
  ENGINE_EXECUTION = 'ENGINE_EXECUTION',
  SERVICE_EXECUTION = 'SERVICE_EXECUTION',
  COMPONENT_EXECUTION = 'COMPONENT_EXECUTION',
  APPLICATION_EXECUTION = 'APPLICATION_EXECUTION'
}

export enum ExecutionStep {
  VALIDATE_LAYOUT = 'VALIDATE_LAYOUT',
  PREPARE_EXECUTION = 'PREPARE_EXECUTION',
  BUILD_EXECUTION_SCHEMA = 'BUILD_EXECUTION_SCHEMA',
  READY_FOR_EXECUTION = 'READY_FOR_EXECUTION',
  EXECUTION_SCHEMA_READY = 'EXECUTION_SCHEMA_READY'
}

export interface RuntimeExecutionModelMetadata {
  readonly id: string;
  readonly name: string;
  readonly executionModelVersion: string;
  readonly description: string;
}

export interface RuntimeExecutionModel {
  readonly executionType: RuntimeExecutionType;
  readonly modelId: string;
  readonly metadata: RuntimeExecutionModelMetadata;
  readonly executionOrder: number;
  readonly targetLayouts: readonly string[];
  readonly allowedSteps: readonly ExecutionStep[];
}

export interface ExecutorMetadata {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly layer: string;
  readonly category: string;
}

export interface ExecutionRuntimeExecutorContext {
  readonly runtimeExecutorId: string;
}

export interface ExecutionRuntimeExecutorData {
  readonly managerType: ExecutorType;
  readonly managerScope: ExecutorScope;
  readonly executionModels: readonly RuntimeExecutionModel[];
}

export interface ExecutionRuntimeExecutor {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly context: ExecutionRuntimeExecutorContext;
  readonly metadata: ExecutorMetadata;
  readonly data: ExecutionRuntimeExecutorData;
}

export interface ExecutionRuntimeExecutorBlueprint {
  getExecutionRuntimeExecutor(): ExecutionRuntimeExecutor;
  getMetadata(): ExecutorMetadata;
  getContext(): ExecutionRuntimeExecutorContext;
  getData(): ExecutionRuntimeExecutorData;
  getExecutionModels(): readonly RuntimeExecutionModel[];
  getExecutionSequence(): readonly ExecutionStep[];
}

// 1. 静的実行手順リストの定義と凍結 (EXECUTION_SCHEMA_READY を含む)
export const EXECUTION_SEQUENCE: readonly ExecutionStep[] = Object.freeze([
  ExecutionStep.VALIDATE_LAYOUT,
  ExecutionStep.PREPARE_EXECUTION,
  ExecutionStep.BUILD_EXECUTION_SCHEMA,
  ExecutionStep.READY_FOR_EXECUTION,
  ExecutionStep.EXECUTION_SCHEMA_READY
]);

// 2. 静的実行モデルリストの定義と凍結 (executionModelVersion 1.0, executionOrder 1〜5, targetLayouts を含む)
export const RUNTIME_EXECUTION_MODELS: readonly RuntimeExecutionModel[] = Object.freeze([
  Object.freeze({
    executionType: RuntimeExecutionType.SYSTEM_EXECUTION,
    modelId: 'execution-model-system-01',
    metadata: Object.freeze({
      id: 'execution-model-meta-system-01',
      name: 'System Execution Model Metadata',
      executionModelVersion: '1.0',
      description: 'Metadata for System Execution Model Schema'
    }),
    executionOrder: 1,
    targetLayouts: Object.freeze(['system-layout-blueprint-id']),
    allowedSteps: EXECUTION_SEQUENCE
  }),
  Object.freeze({
    executionType: RuntimeExecutionType.ENGINE_EXECUTION,
    modelId: 'execution-model-engine-01',
    metadata: Object.freeze({
      id: 'execution-model-meta-engine-01',
      name: 'Engine Execution Model Metadata',
      executionModelVersion: '1.0',
      description: 'Metadata for Engine Execution Model Schema'
    }),
    executionOrder: 2,
    targetLayouts: Object.freeze(['engine-layout-blueprint-id']),
    allowedSteps: EXECUTION_SEQUENCE
  }),
  Object.freeze({
    executionType: RuntimeExecutionType.SERVICE_EXECUTION,
    modelId: 'execution-model-service-01',
    metadata: Object.freeze({
      id: 'execution-model-meta-service-01',
      name: 'Service Execution Model Metadata',
      executionModelVersion: '1.0',
      description: 'Metadata for Service Execution Model Schema'
    }),
    executionOrder: 3,
    targetLayouts: Object.freeze(['service-layout-blueprint-id']),
    allowedSteps: EXECUTION_SEQUENCE
  }),
  Object.freeze({
    executionType: RuntimeExecutionType.COMPONENT_EXECUTION,
    modelId: 'execution-model-component-01',
    metadata: Object.freeze({
      id: 'execution-model-meta-component-01',
      name: 'Component Execution Model Metadata',
      executionModelVersion: '1.0',
      description: 'Metadata for Component Execution Model Schema'
    }),
    executionOrder: 4,
    targetLayouts: Object.freeze(['component-layout-blueprint-id']),
    allowedSteps: EXECUTION_SEQUENCE
  }),
  Object.freeze({
    executionType: RuntimeExecutionType.APPLICATION_EXECUTION,
    modelId: 'execution-model-app-01',
    metadata: Object.freeze({
      id: 'execution-model-meta-app-01',
      name: 'Application Execution Model Metadata',
      executionModelVersion: '1.0',
      description: 'Metadata for Application Execution Model Schema'
    }),
    executionOrder: 5,
    targetLayouts: Object.freeze(['application-layout-blueprint-id']),
    allowedSteps: EXECUTION_SEQUENCE
  })
]);

// 3. メタデータオブジェクトの作成と凍結
const managerMetadata: ExecutorMetadata = Object.freeze({
  id: 'runtime-executor-manager-meta-01',
  name: 'Execution Runtime Executor Manager Metadata',
  version: '1.0.0',
  description: 'Metadata for Execution Runtime Executor Manager Foundation',
  layer: 'Executor Manager Layer',
  category: 'Infrastructure'
});

// 4. コンテキストオブジェクトの作成と凍結 (ID 参照のみ、runtimeExecutorId のみ)
const managerContext: ExecutionRuntimeExecutorContext = Object.freeze({
  runtimeExecutorId: 'runtime-executor-01'
});

// 5. データオブジェクトの作成と凍結
const managerData: ExecutionRuntimeExecutorData = Object.freeze({
  managerType: ExecutorType.FOUNDATION,
  managerScope: ExecutorScope.SYSTEM,
  executionModels: RUNTIME_EXECUTION_MODELS
});

// 6. エグゼキューターマネージャーオブジェクト本体の作成と凍結
const runtimeExecutorData: ExecutionRuntimeExecutor = Object.freeze({
  id: 'runtime-executor-01',
  name: 'Default Execution Runtime Executor Foundation',
  description: 'The static execution runtime executor manager structure definition',
  context: managerContext,
  metadata: managerMetadata,
  data: managerData
});

// Blueprint コンテナの不変シングルトンインスタンス実装
export const EXECUTION_RUNTIME_EXECUTOR_BLUEPRINT: ExecutionRuntimeExecutorBlueprint = Object.freeze({
  getExecutionRuntimeExecutor(): ExecutionRuntimeExecutor {
    return runtimeExecutorData;
  },

  getMetadata(): ExecutorMetadata {
    return runtimeExecutorData.metadata;
  },

  getContext(): ExecutionRuntimeExecutorContext {
    return runtimeExecutorData.context;
  },

  getData(): ExecutionRuntimeExecutorData {
    return runtimeExecutorData.data;
  },

  getExecutionModels(): readonly RuntimeExecutionModel[] {
    return RUNTIME_EXECUTION_MODELS;
  },

  getExecutionSequence(): readonly ExecutionStep[] {
    return EXECUTION_SEQUENCE;
  }
});
