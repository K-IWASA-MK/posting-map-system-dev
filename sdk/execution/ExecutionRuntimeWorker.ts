/**
 * ExecutionRuntimeWorker.ts
 * 
 * Execution Runtime Worker Foundation の構造および公開インターフェース定義 (SSOT)。
 * 
 * 警告：本ファイル内への実際のワーカー起動、タスク実行、
 * キャンセル、スレッド割り当て、非同期処理、API 通信、コマンド送信、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum WorkerType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME'
}

export enum WorkerScope {
  SYSTEM = 'SYSTEM'
}

export enum RuntimeWorkerType {
  SYSTEM_WORKER = 'SYSTEM_WORKER',
  CORE_WORKER = 'CORE_WORKER',
  APPLICATION_WORKER = 'APPLICATION_WORKER',
  PLUGIN_WORKER = 'PLUGIN_WORKER',
  FIELD_WORKER = 'FIELD_WORKER'
}

export enum WorkerLifecycleState {
  CREATED = 'CREATED',
  READY = 'READY',
  WAITING = 'WAITING',
  SEALED = 'SEALED',
  TERMINATED = 'TERMINATED'
}

export enum WorkerCapability {
  CPU_EXECUTION = 'CPU_EXECUTION',
  IO_EXECUTION = 'IO_EXECUTION',
  SYSTEM = 'SYSTEM',
  APPLICATION = 'APPLICATION',
  PLUGIN = 'PLUGIN',
  FIELD = 'FIELD',
  AI = 'AI',
  WORKFLOW = 'WORKFLOW',
  MONITORING = 'MONITORING'
}

export enum WorkerExecutionPolicy {
  READ_ONLY = 'READ_ONLY',
  DETERMINISTIC = 'DETERMINISTIC',
  IMMUTABLE_SCHEMA = 'IMMUTABLE_SCHEMA',
  NO_THREAD = 'NO_THREAD',
  NO_SCHEDULER = 'NO_SCHEDULER',
  NO_QUEUE = 'NO_QUEUE',
  NO_TASK = 'NO_TASK',
  NO_EVENT_LOOP = 'NO_EVENT_LOOP',
  NO_EXECUTION = 'NO_EXECUTION',
  NO_DISPATCH = 'NO_DISPATCH',
  NO_THREAD_BINDING = 'NO_THREAD_BINDING'
}

export enum WorkerDependencyPolicy {
  NO_DEPENDENCY = 'NO_DEPENDENCY',
  STATIC_DEPENDENCY = 'STATIC_DEPENDENCY',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export interface RuntimeWorkerMetadata {
  readonly id: string;
  readonly name: string;
  readonly workerModelVersion: string;
  readonly workerSchemaVersion: string;
  readonly description: string;
}

export interface RuntimeWorkerModel {
  readonly workerType: RuntimeWorkerType;
  readonly modelId: string;
  readonly metadata: RuntimeWorkerMetadata;
  readonly workerOrder: number;
  readonly supportedWorkerTypes: readonly string[];
  readonly supportedCapabilities: readonly WorkerCapability[];
  readonly supportedWorkerPolicies: readonly string[];
  readonly dependencyPolicy: WorkerDependencyPolicy;
  readonly lifecycleStates: readonly WorkerLifecycleState[];
  readonly executionPolicies: readonly WorkerExecutionPolicy[];
  readonly allowedSteps: readonly string[];
}

export interface WorkerMetadata {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly layer: string;
  readonly category: string;
}

export interface ExecutionRuntimeWorkerContext {
  readonly runtimeWorkerId: string;
}

export interface ExecutionRuntimeWorkerData {
  readonly managerType: WorkerType;
  readonly managerScope: WorkerScope;
  readonly workerModels: readonly RuntimeWorkerModel[];
}

export interface ExecutionRuntimeWorker {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly context: ExecutionRuntimeWorkerContext;
  readonly metadata: WorkerMetadata;
  readonly data: ExecutionRuntimeWorkerData;
}

export interface ExecutionRuntimeWorkerBlueprint {
  getExecutionRuntimeWorker(): ExecutionRuntimeWorker;
  getMetadata(): WorkerMetadata;
  getContext(): ExecutionRuntimeWorkerContext;
  getData(): ExecutionRuntimeWorkerData;
  getWorkerModels(): readonly RuntimeWorkerModel[];
  getWorkerSequence(): readonly string[];
}

// 1. 静的実行ステップシーケンスの定義と凍結
export const WORKER_SEQUENCE: readonly string[] = Object.freeze([
  'REGISTER_WORKER',
  'VALIDATE_WORKER_SCHEMA',
  'INITIALIZE_WORKER_BLUEPRINT',
  'READY_FOR_WORKER_RUNTIME',
  'WORKER_SCHEMA_CONFIRMED'
]);

// 静的ポリシーリストの定義と凍結
const defaultPolicies: readonly WorkerExecutionPolicy[] = Object.freeze([
  WorkerExecutionPolicy.READ_ONLY,
  WorkerExecutionPolicy.DETERMINISTIC,
  WorkerExecutionPolicy.IMMUTABLE_SCHEMA,
  WorkerExecutionPolicy.NO_THREAD,
  WorkerExecutionPolicy.NO_SCHEDULER,
  WorkerExecutionPolicy.NO_QUEUE,
  WorkerExecutionPolicy.NO_TASK,
  WorkerExecutionPolicy.NO_EVENT_LOOP,
  WorkerExecutionPolicy.NO_EXECUTION,
  WorkerExecutionPolicy.NO_DISPATCH,
  WorkerExecutionPolicy.NO_THREAD_BINDING
]);

// 静的ライフサイクル状態リストの定義と凍結
const defaultLifecycleStates: readonly WorkerLifecycleState[] = Object.freeze([
  WorkerLifecycleState.CREATED,
  WorkerLifecycleState.READY,
  WorkerLifecycleState.WAITING,
  WorkerLifecycleState.SEALED,
  WorkerLifecycleState.TERMINATED
]);

// 2. 静的ワーカーモデルリストの定義と凍結
export const RUNTIME_WORKER_MODELS: readonly RuntimeWorkerModel[] = Object.freeze([
  Object.freeze({
    workerType: RuntimeWorkerType.SYSTEM_WORKER,
    modelId: 'worker-model-system-01',
    metadata: Object.freeze({
      id: 'worker-meta-system-01',
      name: 'System Worker Metadata',
      workerModelVersion: '1.0',
      workerSchemaVersion: '1.0',
      description: 'Metadata for System Worker Schema'
    }),
    workerOrder: 1,
    supportedWorkerTypes: Object.freeze(['SYSTEM']),
    supportedWorkerPolicies: Object.freeze(['StaticRouting']),
    supportedCapabilities: Object.freeze([WorkerCapability.CPU_EXECUTION, WorkerCapability.SYSTEM]),
    dependencyPolicy: WorkerDependencyPolicy.NO_DEPENDENCY,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: WORKER_SEQUENCE
  }),
  Object.freeze({
    workerType: RuntimeWorkerType.CORE_WORKER,
    modelId: 'worker-model-core-01',
    metadata: Object.freeze({
      id: 'worker-meta-core-01',
      name: 'Core Worker Metadata',
      workerModelVersion: '1.0',
      workerSchemaVersion: '1.0',
      description: 'Metadata for Core Worker Schema'
    }),
    workerOrder: 2,
    supportedWorkerTypes: Object.freeze(['CORE']),
    supportedWorkerPolicies: Object.freeze([]),
    supportedCapabilities: Object.freeze([WorkerCapability.CPU_EXECUTION, WorkerCapability.IO_EXECUTION]),
    dependencyPolicy: WorkerDependencyPolicy.STATIC_DEPENDENCY,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: WORKER_SEQUENCE
  }),
  Object.freeze({
    workerType: RuntimeWorkerType.APPLICATION_WORKER,
    modelId: 'worker-model-app-01',
    metadata: Object.freeze({
      id: 'worker-meta-app-01',
      name: 'Application Worker Metadata',
      workerModelVersion: '1.0',
      workerSchemaVersion: '1.0',
      description: 'Metadata for Application Worker Schema'
    }),
    workerOrder: 3,
    supportedWorkerTypes: Object.freeze(['APPLICATION']),
    supportedWorkerPolicies: Object.freeze(['DynamicRouting']),
    supportedCapabilities: Object.freeze([WorkerCapability.APPLICATION, WorkerCapability.AI, WorkerCapability.WORKFLOW]),
    dependencyPolicy: WorkerDependencyPolicy.SCHEMA_ONLY,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: WORKER_SEQUENCE
  }),
  Object.freeze({
    workerType: RuntimeWorkerType.PLUGIN_WORKER,
    modelId: 'worker-model-plugin-01',
    metadata: Object.freeze({
      id: 'worker-meta-plugin-01',
      name: 'Plugin Worker Metadata',
      workerModelVersion: '1.0',
      workerSchemaVersion: '1.0',
      description: 'Metadata for Plugin Worker Schema'
    }),
    workerOrder: 4,
    supportedWorkerTypes: Object.freeze([]),
    supportedWorkerPolicies: Object.freeze([]),
    supportedCapabilities: Object.freeze([WorkerCapability.PLUGIN, WorkerCapability.MONITORING]),
    dependencyPolicy: WorkerDependencyPolicy.NO_DEPENDENCY,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: WORKER_SEQUENCE
  }),
  Object.freeze({
    workerType: RuntimeWorkerType.FIELD_WORKER,
    modelId: 'worker-model-field-01',
    metadata: Object.freeze({
      id: 'worker-meta-field-01',
      name: 'Field Worker Metadata',
      workerModelVersion: '1.0',
      workerSchemaVersion: '1.0',
      description: 'Metadata for Field Worker Schema'
    }),
    workerOrder: 5,
    supportedWorkerTypes: Object.freeze([]),
    supportedWorkerPolicies: Object.freeze([]),
    supportedCapabilities: Object.freeze([WorkerCapability.FIELD, WorkerCapability.IO_EXECUTION]),
    dependencyPolicy: WorkerDependencyPolicy.NO_DEPENDENCY,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: WORKER_SEQUENCE
  })
]);

// 3. メタデータオブジェクトの作成と凍結
const workerMetadata: WorkerMetadata = Object.freeze({
  id: 'runtime-worker-meta-01',
  name: 'Execution Runtime Worker Metadata',
  version: '1.0.0',
  description: 'Metadata for Execution Runtime Worker Foundation',
  layer: 'Worker Layer',
  category: 'Infrastructure'
});

// 4. コンテキストオブジェクトの作成と凍結 (ID 参照のみ、runtimeWorkerId のみ)
const workerContext: ExecutionRuntimeWorkerContext = Object.freeze({
  runtimeWorkerId: 'runtime-worker-01'
});

// 5. データオブジェクトの作成と凍結
const workerData: ExecutionRuntimeWorkerData = Object.freeze({
  managerType: WorkerType.FOUNDATION,
  managerScope: WorkerScope.SYSTEM,
  workerModels: RUNTIME_WORKER_MODELS
});

// 6. ワーカーマネージャーオブジェクト本体の作成と凍結
const runtimeWorkerData: ExecutionRuntimeWorker = Object.freeze({
  id: 'runtime-worker-01',
  name: 'Default Execution Runtime Worker Foundation',
  description: 'The static execution runtime worker structure definition',
  context: workerContext,
  metadata: workerMetadata,
  data: workerData
});

// Blueprint コンテナの不変シングルトンインスタンス実装
export const EXECUTION_RUNTIME_WORKER_BLUEPRINT: ExecutionRuntimeWorkerBlueprint = Object.freeze({
  getExecutionRuntimeWorker(): ExecutionRuntimeWorker {
    return runtimeWorkerData;
  },

  getMetadata(): WorkerMetadata {
    return runtimeWorkerData.metadata;
  },

  getContext(): ExecutionRuntimeWorkerContext {
    return runtimeWorkerData.context;
  },

  getData(): ExecutionRuntimeWorkerData {
    return runtimeWorkerData.data;
  },

  getWorkerModels(): readonly RuntimeWorkerModel[] {
    return RUNTIME_WORKER_MODELS;
  },

  getWorkerSequence(): readonly string[] {
    return WORKER_SEQUENCE;
  }
});
