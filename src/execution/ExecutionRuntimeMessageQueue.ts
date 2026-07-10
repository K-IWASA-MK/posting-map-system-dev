/**
 * ExecutionRuntimeMessageQueue.ts
 * 
 * ExecutionRuntimeMessageQueue Foundation の構造および公開インターフェース定義 (SSOT)。
 * 
 * 警告：本ファイル内への実際のメッセージキュー生成、メッセージのプッシュ・ポップ、エンキュー・デキュー、
 * キュークリア、メッセージ処理、ディスパッチ、非同期処理、API 通信、コマンド送信、
 * AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum MessageQueueType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME'
}

export enum MessageQueueScope {
  SYSTEM = 'SYSTEM'
}

export enum RuntimeMessageQueueType {
  SYSTEM_QUEUE = 'SYSTEM_QUEUE',
  CORE_QUEUE = 'CORE_QUEUE',
  APPLICATION_QUEUE = 'APPLICATION_QUEUE',
  PLUGIN_QUEUE = 'PLUGIN_QUEUE',
  FIELD_QUEUE = 'FIELD_QUEUE'
}

export enum MessageQueueLifecycleState {
  CREATED = 'CREATED',
  READY = 'READY',
  WAITING = 'WAITING',
  SEALED = 'SEALED',
  TERMINATED = 'TERMINATED'
}

export enum MessageQueueCapability {
  SYSTEM = 'SYSTEM',
  APPLICATION = 'APPLICATION',
  PLUGIN = 'PLUGIN',
  FIELD = 'FIELD',
  LOCAL = 'LOCAL',
  REMOTE = 'REMOTE',
  DISTRIBUTED = 'DISTRIBUTED',
  INTER_PROCESS = 'INTER_PROCESS',
  INTER_NODE = 'INTER_NODE',
  AI = 'AI',
  WORKFLOW = 'WORKFLOW',
  MONITORING = 'MONITORING'
}

export enum MessageQueueCategory {
  LOCAL = 'LOCAL',
  REMOTE = 'REMOTE',
  SERVICE = 'SERVICE',
  DEVICE = 'DEVICE',
  APPLICATION = 'APPLICATION',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum MessageQueueOrderingPolicy {
  FIFO = 'FIFO',
  LIFO = 'LIFO',
  PRIORITY = 'PRIORITY',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum MessageQueueValidationPolicy {
  NONE = 'NONE',
  HEADER_ONLY = 'HEADER_ONLY',
  SCHEMA = 'SCHEMA',
  FULL = 'FULL',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum MessageQueueExecutionPolicy {
  READ_ONLY = 'READ_ONLY',
  DETERMINISTIC = 'DETERMINISTIC',
  IMMUTABLE_SCHEMA = 'IMMUTABLE_SCHEMA',
  NO_THREAD = 'NO_THREAD',
  NO_QUEUE = 'NO_QUEUE',
  NO_TASK = 'NO_TASK',
  NO_WORKER = 'NO_WORKER',
  NO_EVENT = 'NO_EVENT',
  NO_EVENT_BUS = 'NO_EVENT_BUS',
  NO_ROUTER = 'NO_ROUTER',
  NO_QUEUE_CREATE = 'NO_QUEUE_CREATE',
  NO_QUEUE_RESOLVE = 'NO_QUEUE_RESOLVE',
  NO_QUEUE_REGISTER = 'NO_QUEUE_REGISTER',
  NO_QUEUE_OPEN = 'NO_QUEUE_OPEN',
  NO_QUEUE_CLOSE = 'NO_QUEUE_CLOSE',
  NO_ENQUEUE = 'NO_ENQUEUE',
  NO_DEQUEUE = 'NO_DEQUEUE',
  NO_PUSH = 'NO_PUSH',
  NO_POP = 'NO_POP',
  NO_PEEK = 'NO_PEEK',
  NO_QUEUE_CLEAR = 'NO_QUEUE_CLEAR',
  NO_QUEUE_REMOVE = 'NO_QUEUE_REMOVE',
  NO_QUEUE_PROCESS = 'NO_QUEUE_PROCESS',
  NO_QUEUE_SCHEDULE = 'NO_QUEUE_SCHEDULE',
  NO_QUEUE_DISPATCH = 'NO_QUEUE_DISPATCH',
  NO_QUEUE_CONSUME = 'NO_QUEUE_CONSUME',
  NO_QUEUE_PRODUCE = 'NO_QUEUE_PRODUCE'
}

export enum MessageQueueDependencyPolicy {
  NO_DEPENDENCY = 'NO_DEPENDENCY',
  STATIC_DEPENDENCY = 'STATIC_DEPENDENCY',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum MessageQueueTopology {
  LOCAL = 'LOCAL',
  PROCESS = 'PROCESS',
  NODE = 'NODE',
  CLUSTER = 'CLUSTER',
  DISTRIBUTED = 'DISTRIBUTED'
}

export interface RuntimeMessageQueueMetadata {
  readonly id: string;
  readonly name: string;
  readonly queueModelVersion: string;
  readonly queueSchemaVersion: string;
  readonly description: string;
}

export interface RuntimeMessageQueueModel {
  readonly queueType: RuntimeMessageQueueType;
  readonly modelId: string;
  readonly metadata: RuntimeMessageQueueMetadata;
  readonly queueOrder: number;
  readonly supportedCapabilities: readonly MessageQueueCapability[];
  readonly supportedQueuePolicies: readonly string[];
  readonly supportedOrderingPolicies: readonly MessageQueueOrderingPolicy[];
  readonly supportedValidationPolicies: readonly MessageQueueValidationPolicy[];
  readonly dependencyPolicy: MessageQueueDependencyPolicy;
  readonly topology: MessageQueueTopology;
  readonly lifecycleStates: readonly MessageQueueLifecycleState[];
  readonly executionPolicies: readonly MessageQueueExecutionPolicy[];
  readonly allowedSteps: readonly string[];
  readonly supportedTransportPolicies: readonly string[];
  readonly supportedConnectionPolicies: readonly string[];
  readonly supportedIdentityPolicies: readonly string[];
}

export interface MessageQueueMetadata {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly layer: string;
  readonly category: string;
}

export interface ExecutionRuntimeMessageQueueContext {
  readonly runtimeMessageQueueId: string;
}

export interface ExecutionRuntimeMessageQueueData {
  readonly managerType: MessageQueueType;
  readonly managerScope: MessageQueueScope;
  readonly queueModels: readonly RuntimeMessageQueueModel[];
}

export interface ExecutionRuntimeMessageQueue {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly context: ExecutionRuntimeMessageQueueContext;
  readonly metadata: MessageQueueMetadata;
  readonly data: ExecutionRuntimeMessageQueueData;
}

export interface ExecutionRuntimeMessageQueueBlueprint {
  getExecutionRuntimeMessageQueue(): ExecutionRuntimeMessageQueue;
  getMetadata(): MessageQueueMetadata;
  getContext(): ExecutionRuntimeMessageQueueContext;
  getData(): ExecutionRuntimeMessageQueueData;
  getQueueModels(): readonly RuntimeMessageQueueModel[];
  getQueueSequence(): readonly string[];
}

// 1. 静的実行ステップシーケンスの定義と凍結
export const MESSAGE_QUEUE_SEQUENCE: readonly string[] = Object.freeze([
  'REGISTER_QUEUE',
  'VALIDATE_QUEUE_SCHEMA',
  'INITIALIZE_QUEUE_BLUEPRINT',
  'READY_FOR_QUEUE_RUNTIME',
  'QUEUE_SCHEMA_CONFIRMED'
]);

// 静的ポリシーリストの定義と凍結
const defaultPolicies: readonly MessageQueueExecutionPolicy[] = Object.freeze([
  MessageQueueExecutionPolicy.READ_ONLY,
  MessageQueueExecutionPolicy.DETERMINISTIC,
  MessageQueueExecutionPolicy.IMMUTABLE_SCHEMA,
  MessageQueueExecutionPolicy.NO_THREAD,
  MessageQueueExecutionPolicy.NO_QUEUE,
  MessageQueueExecutionPolicy.NO_TASK,
  MessageQueueExecutionPolicy.NO_WORKER,
  MessageQueueExecutionPolicy.NO_EVENT,
  MessageQueueExecutionPolicy.NO_EVENT_BUS,
  MessageQueueExecutionPolicy.NO_ROUTER,
  MessageQueueExecutionPolicy.NO_QUEUE_CREATE,
  MessageQueueExecutionPolicy.NO_QUEUE_RESOLVE,
  MessageQueueExecutionPolicy.NO_QUEUE_REGISTER,
  MessageQueueExecutionPolicy.NO_QUEUE_OPEN,
  MessageQueueExecutionPolicy.NO_QUEUE_CLOSE,
  MessageQueueExecutionPolicy.NO_ENQUEUE,
  MessageQueueExecutionPolicy.NO_DEQUEUE,
  MessageQueueExecutionPolicy.NO_PUSH,
  MessageQueueExecutionPolicy.NO_POP,
  MessageQueueExecutionPolicy.NO_PEEK,
  MessageQueueExecutionPolicy.NO_QUEUE_CLEAR,
  MessageQueueExecutionPolicy.NO_QUEUE_REMOVE,
  MessageQueueExecutionPolicy.NO_QUEUE_PROCESS,
  MessageQueueExecutionPolicy.NO_QUEUE_SCHEDULE,
  MessageQueueExecutionPolicy.NO_QUEUE_DISPATCH,
  MessageQueueExecutionPolicy.NO_QUEUE_CONSUME,
  MessageQueueExecutionPolicy.NO_QUEUE_PRODUCE
]);

// 静的ライフサイクル状態リストの定義と凍結
const defaultLifecycleStates: readonly MessageQueueLifecycleState[] = Object.freeze([
  MessageQueueLifecycleState.CREATED,
  MessageQueueLifecycleState.READY,
  MessageQueueLifecycleState.WAITING,
  MessageQueueLifecycleState.SEALED,
  MessageQueueLifecycleState.TERMINATED
]);

// 2. 静的キューモデルリストの定義と凍結
export const RUNTIME_MESSAGE_QUEUE_MODELS: readonly RuntimeMessageQueueModel[] = Object.freeze([
  Object.freeze({
    queueType: RuntimeMessageQueueType.SYSTEM_QUEUE,
    modelId: 'queue-model-system-01',
    metadata: Object.freeze({
      id: 'queue-meta-system-01',
      name: 'SystemQueueMetadata',
      queueModelVersion: '1.0',
      queueSchemaVersion: '1.0',
      description: 'Metadata for SystemQueue Schema'
    }),
    queueOrder: 1,
    supportedCapabilities: Object.freeze([MessageQueueCapability.SYSTEM, MessageQueueCapability.REMOTE, MessageQueueCapability.LOCAL]),
    supportedQueuePolicies: Object.freeze(['StaticRouting']),
    supportedOrderingPolicies: Object.freeze([MessageQueueOrderingPolicy.SCHEMA_ONLY]),
    supportedValidationPolicies: Object.freeze([MessageQueueValidationPolicy.SCHEMA_ONLY]),
    dependencyPolicy: MessageQueueDependencyPolicy.NO_DEPENDENCY,
    topology: MessageQueueTopology.LOCAL,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: MESSAGE_QUEUE_SEQUENCE,
    supportedTransportPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedIdentityPolicies: Object.freeze(['SCHEMA_ONLY'])
  }),
  Object.freeze({
    queueType: RuntimeMessageQueueType.CORE_QUEUE,
    modelId: 'queue-model-core-01',
    metadata: Object.freeze({
      id: 'queue-meta-core-01',
      name: 'CoreQueueMetadata',
      queueModelVersion: '1.0',
      queueSchemaVersion: '1.0',
      description: 'Metadata for CoreQueue Schema'
    }),
    queueOrder: 2,
    supportedCapabilities: Object.freeze([MessageQueueCapability.SYSTEM, MessageQueueCapability.APPLICATION, MessageQueueCapability.INTER_PROCESS]),
    supportedQueuePolicies: Object.freeze([]),
    supportedOrderingPolicies: Object.freeze([MessageQueueOrderingPolicy.SCHEMA_ONLY]),
    supportedValidationPolicies: Object.freeze([MessageQueueValidationPolicy.HEADER_ONLY, MessageQueueValidationPolicy.SCHEMA_ONLY]),
    dependencyPolicy: MessageQueueDependencyPolicy.STATIC_DEPENDENCY,
    topology: MessageQueueTopology.PROCESS,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: MESSAGE_QUEUE_SEQUENCE,
    supportedTransportPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedIdentityPolicies: Object.freeze(['SCHEMA_ONLY'])
  }),
  Object.freeze({
    queueType: RuntimeMessageQueueType.APPLICATION_QUEUE,
    modelId: 'queue-model-app-01',
    metadata: Object.freeze({
      id: 'queue-meta-app-01',
      name: 'ApplicationQueueMetadata',
      queueModelVersion: '1.0',
      queueSchemaVersion: '1.0',
      description: 'Metadata for ApplicationQueue Schema'
    }),
    queueOrder: 3,
    supportedCapabilities: Object.freeze([MessageQueueCapability.APPLICATION, MessageQueueCapability.AI, MessageQueueCapability.WORKFLOW, MessageQueueCapability.DISTRIBUTED, MessageQueueCapability.INTER_NODE]),
    supportedQueuePolicies: Object.freeze(['DynamicRouting']),
    supportedOrderingPolicies: Object.freeze([MessageQueueOrderingPolicy.SCHEMA_ONLY]),
    supportedValidationPolicies: Object.freeze([MessageQueueValidationPolicy.FULL, MessageQueueValidationPolicy.SCHEMA_ONLY]),
    dependencyPolicy: MessageQueueDependencyPolicy.SCHEMA_ONLY,
    topology: MessageQueueTopology.NODE,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: MESSAGE_QUEUE_SEQUENCE,
    supportedTransportPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedIdentityPolicies: Object.freeze(['SCHEMA_ONLY'])
  }),
  Object.freeze({
    queueType: RuntimeMessageQueueType.PLUGIN_QUEUE,
    modelId: 'queue-model-plugin-01',
    metadata: Object.freeze({
      id: 'queue-meta-plugin-01',
      name: 'PluginQueueMetadata',
      queueModelVersion: '1.0',
      queueSchemaVersion: '1.0',
      description: 'Metadata for PluginQueue Schema'
    }),
    queueOrder: 4,
    supportedCapabilities: Object.freeze([MessageQueueCapability.PLUGIN, MessageQueueCapability.MONITORING]),
    supportedQueuePolicies: Object.freeze([]),
    supportedOrderingPolicies: Object.freeze([MessageQueueOrderingPolicy.SCHEMA_ONLY]),
    supportedValidationPolicies: Object.freeze([MessageQueueValidationPolicy.SCHEMA, MessageQueueValidationPolicy.SCHEMA_ONLY]),
    dependencyPolicy: MessageQueueDependencyPolicy.NO_DEPENDENCY,
    topology: MessageQueueTopology.CLUSTER,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: MESSAGE_QUEUE_SEQUENCE,
    supportedTransportPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedIdentityPolicies: Object.freeze(['SCHEMA_ONLY'])
  }),
  Object.freeze({
    queueType: RuntimeMessageQueueType.FIELD_QUEUE,
    modelId: 'queue-model-field-01',
    metadata: Object.freeze({
      id: 'queue-meta-field-01',
      name: 'FieldQueueMetadata',
      queueModelVersion: '1.0',
      queueSchemaVersion: '1.0',
      description: 'Metadata for FieldQueue Schema'
    }),
    queueOrder: 5,
    supportedCapabilities: Object.freeze([MessageQueueCapability.FIELD]),
    supportedQueuePolicies: Object.freeze([]),
    supportedOrderingPolicies: Object.freeze([MessageQueueOrderingPolicy.SCHEMA_ONLY]),
    supportedValidationPolicies: Object.freeze([MessageQueueValidationPolicy.FULL, MessageQueueValidationPolicy.SCHEMA_ONLY]),
    dependencyPolicy: MessageQueueDependencyPolicy.NO_DEPENDENCY,
    topology: MessageQueueTopology.DISTRIBUTED,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: MESSAGE_QUEUE_SEQUENCE,
    supportedTransportPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedIdentityPolicies: Object.freeze(['SCHEMA_ONLY'])
  })
]);

// 3. メタデータオブジェクトの作成と凍結
const queueMetadata: MessageQueueMetadata = Object.freeze({
  id: 'runtime-queue-meta-01',
  name: 'ExecutionRuntimeQueueMetadata',
  version: '1.0.0',
  description: 'Metadata for ExecutionRuntimeQueue Foundation',
  layer: 'QueueLayer',
  category: 'Infrastructure'
});

// 4. コンテキストオブジェクトの作成と凍結 (ID 参照のみ、runtimeMessageQueueId のみ)
const queueContext: ExecutionRuntimeMessageQueueContext = Object.freeze({
  runtimeMessageQueueId: 'runtime-queue-01'
});

// 5. データオブジェクトの作成と凍結
const queueData: ExecutionRuntimeMessageQueueData = Object.freeze({
  managerType: MessageQueueType.FOUNDATION,
  managerScope: MessageQueueScope.SYSTEM,
  queueModels: RUNTIME_MESSAGE_QUEUE_MODELS
});

// 6. 主体マネージャーオブジェクト本体の作成と凍結
const runtimeQueueObj: ExecutionRuntimeMessageQueue = Object.freeze({
  id: 'runtime-queue-01',
  name: 'DefaultExecutionRuntimeMessageQueue Foundation',
  description: 'The static execution-runtime-queue structure definition',
  context: queueContext,
  metadata: queueMetadata,
  data: queueData
});

// Blueprint コンテナの不変シングルトンインスタンス実装 (型固定の適用)
export const EXECUTION_RUNTIME_MESSAGE_QUEUE_BLUEPRINT: Readonly<ExecutionRuntimeMessageQueueBlueprint> = Object.freeze({
  getExecutionRuntimeMessageQueue(): ExecutionRuntimeMessageQueue {
    return runtimeQueueObj;
  },

  getMetadata(): MessageQueueMetadata {
    return runtimeQueueObj.metadata;
  },

  getContext(): ExecutionRuntimeMessageQueueContext {
    return runtimeQueueObj.context;
  },

  getData(): ExecutionRuntimeMessageQueueData {
    return runtimeQueueObj.data;
  },

  getQueueModels(): readonly RuntimeMessageQueueModel[] {
    return RUNTIME_MESSAGE_QUEUE_MODELS;
  },

  getQueueSequence(): readonly string[] {
    return MESSAGE_QUEUE_SEQUENCE;
  }
});
