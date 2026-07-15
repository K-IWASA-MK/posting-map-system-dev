/**
 * ExecutionRuntimeQueue.ts
 * 
 * Execution Runtime Queue Foundation の構造および公開インターフェース定義 (SSOT)。
 * 
 * 警告：本ファイル内への実際のキュー操作、キュー投入、タスク実行、
 * スケジューリング、非同期処理、API 通信、コマンド送信、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum QueueType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME'
}

export enum QueueScope {
  SYSTEM = 'SYSTEM'
}

export enum RuntimeQueueType {
  SYSTEM_QUEUE = 'SYSTEM_QUEUE',
  CORE_QUEUE = 'CORE_QUEUE',
  APPLICATION_QUEUE = 'APPLICATION_QUEUE',
  PLUGIN_QUEUE = 'PLUGIN_QUEUE',
  FIELD_QUEUE = 'FIELD_QUEUE'
}

export enum QueueLifecycleState {
  CREATED = 'CREATED',
  READY = 'READY',
  WAITING = 'WAITING',
  SEALED = 'SEALED',
  TERMINATED = 'TERMINATED'
}

export enum QueueExecutionPolicy {
  READ_ONLY = 'READ_ONLY',
  DETERMINISTIC = 'DETERMINISTIC',
  IMMUTABLE_SCHEMA = 'IMMUTABLE_SCHEMA',
  NO_THREAD = 'NO_THREAD',
  NO_SCHEDULER = 'NO_SCHEDULER',
  NO_TASK = 'NO_TASK',
  NO_WORKER = 'NO_WORKER',
  NO_EVENT_LOOP = 'NO_EVENT_LOOP',
  NO_ENQUEUE = 'NO_ENQUEUE',
  NO_DEQUEUE = 'NO_DEQUEUE',
  NO_QUEUE_OPERATION = 'NO_QUEUE_OPERATION',
  NO_PRIORITY = 'NO_PRIORITY',
  NO_SORT = 'NO_SORT',
  NO_REORDER = 'NO_REORDER'
}

export interface RuntimeQueueMetadata {
  readonly id: string;
  readonly name: string;
  readonly queueModelVersion: string;
  readonly queueSchemaVersion: string;
  readonly description: string;
}

export interface RuntimeQueueModel {
  readonly queueType: RuntimeQueueType;
  readonly modelId: string;
  readonly metadata: RuntimeQueueMetadata;
  readonly queueOrder: number;
  readonly supportedQueueTypes: readonly string[];
  readonly supportedQueuePolicies: readonly string[];
  readonly lifecycleStates: readonly QueueLifecycleState[];
  readonly executionPolicies: readonly QueueExecutionPolicy[];
  readonly allowedSteps: readonly string[];
}

export interface QueueMetadata {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly layer: string;
  readonly category: string;
}

export interface ExecutionRuntimeQueueContext {
  readonly runtimeQueueId: string;
}

export interface ExecutionRuntimeQueueData {
  readonly managerType: QueueType;
  readonly managerScope: QueueScope;
  readonly queueModels: readonly RuntimeQueueModel[];
}

export interface ExecutionRuntimeQueue {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly context: ExecutionRuntimeQueueContext;
  readonly metadata: QueueMetadata;
  readonly data: ExecutionRuntimeQueueData;
}

export interface ExecutionRuntimeQueueBlueprint {
  getExecutionRuntimeQueue(): ExecutionRuntimeQueue;
  getMetadata(): QueueMetadata;
  getContext(): ExecutionRuntimeQueueContext;
  getData(): ExecutionRuntimeQueueData;
  getQueueModels(): readonly RuntimeQueueModel[];
  getQueueSequence(): readonly string[];
}

// 1. 静的実行ステップシーケンスの定義と凍結
export const QUEUE_SEQUENCE: readonly string[] = Object.freeze([
  'REGISTER_QUEUE',
  'VALIDATE_QUEUE_SCHEMA',
  'INITIALIZE_QUEUE_BLUEPRINT',
  'READY_FOR_QUEUE_RUNTIME',
  'QUEUE_SCHEMA_CONFIRMED'
]);

// 静的ポリシーリストの定義と凍結 (推奨のポリシーを含む)
const defaultPolicies: readonly QueueExecutionPolicy[] = Object.freeze([
  QueueExecutionPolicy.READ_ONLY,
  QueueExecutionPolicy.DETERMINISTIC,
  QueueExecutionPolicy.IMMUTABLE_SCHEMA,
  QueueExecutionPolicy.NO_THREAD,
  QueueExecutionPolicy.NO_SCHEDULER,
  QueueExecutionPolicy.NO_TASK,
  QueueExecutionPolicy.NO_WORKER,
  QueueExecutionPolicy.NO_EVENT_LOOP,
  QueueExecutionPolicy.NO_ENQUEUE,
  QueueExecutionPolicy.NO_DEQUEUE,
  QueueExecutionPolicy.NO_QUEUE_OPERATION,
  QueueExecutionPolicy.NO_PRIORITY,
  QueueExecutionPolicy.NO_SORT,
  QueueExecutionPolicy.NO_REORDER
]);

// 静的ライフサイクル状態リストの定義と凍結 (SEALED を含む)
const defaultLifecycleStates: readonly QueueLifecycleState[] = Object.freeze([
  QueueLifecycleState.CREATED,
  QueueLifecycleState.READY,
  QueueLifecycleState.WAITING,
  QueueLifecycleState.SEALED,
  QueueLifecycleState.TERMINATED
]);

// 2. 静的キューモデルリストの定義と凍結
export const RUNTIME_QUEUE_MODELS: readonly RuntimeQueueModel[] = Object.freeze([
  Object.freeze({
    queueType: RuntimeQueueType.SYSTEM_QUEUE,
    modelId: 'queue-model-system-01',
    metadata: Object.freeze({
      id: 'queue-meta-system-01',
      name: 'System Queue Metadata',
      queueModelVersion: '1.0',
      queueSchemaVersion: '1.0',
      description: 'Metadata for System Queue Schema'
    }),
    queueOrder: 1,
    supportedQueueTypes: Object.freeze(['SYSTEM']),
    supportedQueuePolicies: Object.freeze(['FIFO', 'Priority']),
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: QUEUE_SEQUENCE
  }),
  Object.freeze({
    queueType: RuntimeQueueType.CORE_QUEUE,
    modelId: 'queue-model-core-01',
    metadata: Object.freeze({
      id: 'queue-meta-core-01',
      name: 'Core Queue Metadata',
      queueModelVersion: '1.0',
      queueSchemaVersion: '1.0',
      description: 'Metadata for Core Queue Schema'
    }),
    queueOrder: 2,
    supportedQueueTypes: Object.freeze(['CORE']),
    supportedQueuePolicies: Object.freeze(['FIFO']),
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: QUEUE_SEQUENCE
  }),
  Object.freeze({
    queueType: RuntimeQueueType.APPLICATION_QUEUE,
    modelId: 'queue-model-app-01',
    metadata: Object.freeze({
      id: 'queue-meta-app-01',
      name: 'Application Queue Metadata',
      queueModelVersion: '1.0',
      queueSchemaVersion: '1.0',
      description: 'Metadata for Application Queue Schema'
    }),
    queueOrder: 3,
    supportedQueueTypes: Object.freeze(['APPLICATION']),
    supportedQueuePolicies: Object.freeze(['FIFO', 'RoundRobin']),
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: QUEUE_SEQUENCE
  }),
  Object.freeze({
    queueType: RuntimeQueueType.PLUGIN_QUEUE,
    modelId: 'queue-model-plugin-01',
    metadata: Object.freeze({
      id: 'queue-meta-plugin-01',
      name: 'Plugin Queue Metadata',
      queueModelVersion: '1.0',
      queueSchemaVersion: '1.0',
      description: 'Metadata for Plugin Queue Schema'
    }),
    queueOrder: 4,
    supportedQueueTypes: Object.freeze([]),
    supportedQueuePolicies: Object.freeze([]),
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: QUEUE_SEQUENCE
  }),
  Object.freeze({
    queueType: RuntimeQueueType.FIELD_QUEUE,
    modelId: 'queue-model-field-01',
    metadata: Object.freeze({
      id: 'queue-meta-field-01',
      name: 'Field Queue Metadata',
      queueModelVersion: '1.0',
      queueSchemaVersion: '1.0',
      description: 'Metadata for Field Queue Schema'
    }),
    queueOrder: 5,
    supportedQueueTypes: Object.freeze([]),
    supportedQueuePolicies: Object.freeze([]),
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: QUEUE_SEQUENCE
  })
]);

// 3. メタデータオブジェクトの作成と凍結
const queueMetadata: QueueMetadata = Object.freeze({
  id: 'runtime-queue-meta-01',
  name: 'Execution Runtime Queue Metadata',
  version: '1.0.0',
  description: 'Metadata for Execution Runtime Queue Foundation',
  layer: 'Queue Layer',
  category: 'Infrastructure'
});

// 4. コンテキストオブジェクトの作成と凍結 (ID 参照のみ、runtimeQueueId のみ)
const queueContext: ExecutionRuntimeQueueContext = Object.freeze({
  runtimeQueueId: 'runtime-queue-01'
});

// 5. データオブジェクトの作成と凍結
const queueData: ExecutionRuntimeQueueData = Object.freeze({
  managerType: QueueType.FOUNDATION,
  managerScope: QueueScope.SYSTEM,
  queueModels: RUNTIME_QUEUE_MODELS
});

// 6. キューマネージャーオブジェクト本体の作成と凍結
const runtimeQueueData: ExecutionRuntimeQueue = Object.freeze({
  id: 'runtime-queue-01',
  name: 'Default Execution Runtime Queue Foundation',
  description: 'The static execution runtime queue structure definition',
  context: queueContext,
  metadata: queueMetadata,
  data: queueData
});

// Blueprint コンテナの不変シングルトンインスタンス実装
export const EXECUTION_RUNTIME_QUEUE_BLUEPRINT: ExecutionRuntimeQueueBlueprint = Object.freeze({
  getExecutionRuntimeQueue(): ExecutionRuntimeQueue {
    return runtimeQueueData;
  },

  getMetadata(): QueueMetadata {
    return runtimeQueueData.metadata;
  },

  getContext(): ExecutionRuntimeQueueContext {
    return runtimeQueueData.context;
  },

  getData(): ExecutionRuntimeQueueData {
    return runtimeQueueData.data;
  },

  getQueueModels(): readonly RuntimeQueueModel[] {
    return RUNTIME_QUEUE_MODELS;
  },

  getQueueSequence(): readonly string[] {
    return QUEUE_SEQUENCE;
  }
});
