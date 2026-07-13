/**
 * ExecutionRuntimeEventBus.ts
 * 
 * Execution Runtime Event Bus Foundation の構造および公開インターフェース定義 (SSOT)。
 * 
 * 警告：本ファイル内への実際のイベント配送、購読、通知、チャネル管理、
 * メッセージ転送、イベントループ同期、非同期処理、API 通信、コマンド送信、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum EventBusType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME'
}

export enum EventBusScope {
  SYSTEM = 'SYSTEM'
}

export enum RuntimeEventBusType {
  SYSTEM_EVENT_BUS = 'SYSTEM_EVENT_BUS',
  CORE_EVENT_BUS = 'CORE_EVENT_BUS',
  APPLICATION_EVENT_BUS = 'APPLICATION_EVENT_BUS',
  PLUGIN_EVENT_BUS = 'PLUGIN_EVENT_BUS',
  FIELD_EVENT_BUS = 'FIELD_EVENT_BUS'
}

export enum EventBusLifecycleState {
  CREATED = 'CREATED',
  READY = 'READY',
  WAITING = 'WAITING',
  SEALED = 'SEALED',
  TERMINATED = 'TERMINATED'
}

export enum EventBusCapability {
  SYSTEM = 'SYSTEM',
  APPLICATION = 'APPLICATION',
  PLUGIN = 'PLUGIN',
  FIELD = 'FIELD',
  AI = 'AI',
  WORKFLOW = 'WORKFLOW',
  MONITORING = 'MONITORING',
  REMOTE = 'REMOTE',
  DISTRIBUTED = 'DISTRIBUTED',
  LOCAL = 'LOCAL',
  INTER_PROCESS = 'INTER_PROCESS',
  INTER_NODE = 'INTER_NODE'
}

export enum EventBusExecutionPolicy {
  READ_ONLY = 'READ_ONLY',
  DETERMINISTIC = 'DETERMINISTIC',
  IMMUTABLE_SCHEMA = 'IMMUTABLE_SCHEMA',
  NO_THREAD = 'NO_THREAD',
  NO_QUEUE = 'NO_QUEUE',
  NO_SCHEDULER = 'NO_SCHEDULER',
  NO_TASK = 'NO_TASK',
  NO_WORKER = 'NO_WORKER',
  NO_DISPATCHER = 'NO_DISPATCHER',
  NO_EVENT = 'NO_EVENT',
  NO_EVENT_LOOP = 'NO_EVENT_LOOP',
  NO_EVENT_BUS = 'NO_EVENT_BUS',
  NO_PUBLISH = 'NO_PUBLISH',
  NO_SUBSCRIBE = 'NO_SUBSCRIBE',
  NO_NOTIFICATION = 'NO_NOTIFICATION',
  NO_ROUTING = 'NO_ROUTING',
  NO_CHANNEL_OPERATION = 'NO_CHANNEL_OPERATION'
}

export enum EventBusDependencyPolicy {
  NO_DEPENDENCY = 'NO_DEPENDENCY',
  STATIC_DEPENDENCY = 'STATIC_DEPENDENCY',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum EventBusChannelPolicy {
  NO_CHANNEL = 'NO_CHANNEL',
  STATIC_CHANNEL = 'STATIC_CHANNEL',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum EventBusTopology {
  LOCAL = 'LOCAL',
  PROCESS = 'PROCESS',
  NODE = 'NODE',
  CLUSTER = 'CLUSTER',
  DISTRIBUTED = 'DISTRIBUTED'
}

export enum EventBusDeliveryPolicy {
  DIRECT = 'DIRECT',
  BROADCAST = 'BROADCAST',
  MULTICAST = 'MULTICAST',
  UNICAST = 'UNICAST',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum EventBusReliabilityPolicy {
  BEST_EFFORT = 'BEST_EFFORT',
  AT_MOST_ONCE = 'AT_MOST_ONCE',
  AT_LEAST_ONCE = 'AT_LEAST_ONCE',
  EXACTLY_ONCE = 'EXACTLY_ONCE',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum EventBusCategory {
  SYSTEM = 'SYSTEM',
  RUNTIME = 'RUNTIME',
  PLUGIN = 'PLUGIN',
  FIELD = 'FIELD',
  AI = 'AI',
  WORKFLOW = 'WORKFLOW',
  MONITORING = 'MONITORING',
  GOVERNANCE = 'GOVERNANCE'
}

export interface RuntimeEventBusMetadata {
  readonly id: string;
  readonly name: string;
  readonly eventBusModelVersion: string;
  readonly eventBusSchemaVersion: string;
  readonly description: string;
}

export interface RuntimeEventBusModel {
  readonly eventBusType: RuntimeEventBusType;
  readonly modelId: string;
  readonly metadata: RuntimeEventBusMetadata;
  readonly eventBusOrder: number;
  readonly supportedEventBusTypes: readonly string[];
  readonly supportedCapabilities: readonly EventBusCapability[];
  readonly supportedEventBusPolicies: readonly string[];
  readonly supportedChannelPolicies: readonly string[];
  readonly dependencyPolicy: EventBusDependencyPolicy;
  readonly channelPolicy: EventBusChannelPolicy;
  readonly topology: EventBusTopology;
  readonly deliveryPolicy: EventBusDeliveryPolicy;
  readonly reliabilityPolicy: EventBusReliabilityPolicy;
  readonly eventBusCategory: EventBusCategory;
  readonly lifecycleStates: readonly EventBusLifecycleState[];
  readonly executionPolicies: readonly EventBusExecutionPolicy[];
  readonly allowedSteps: readonly string[];
}

export interface EventBusMetadata {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly layer: string;
  readonly category: string;
}

export interface ExecutionRuntimeEventBusContext {
  readonly runtimeEventBusId: string;
}

export interface ExecutionRuntimeEventBusData {
  readonly managerType: EventBusType;
  readonly managerScope: EventBusScope;
  readonly eventBusModels: readonly RuntimeEventBusModel[];
}

export interface ExecutionRuntimeEventBus {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly context: ExecutionRuntimeEventBusContext;
  readonly metadata: EventBusMetadata;
  readonly data: ExecutionRuntimeEventBusData;
}

export interface ExecutionRuntimeEventBusBlueprint {
  getExecutionRuntimeEventBus(): ExecutionRuntimeEventBus;
  getMetadata(): EventBusMetadata;
  getContext(): ExecutionRuntimeEventBusContext;
  getData(): ExecutionRuntimeEventBusData;
  getEventBusModels(): readonly RuntimeEventBusModel[];
  getEventBusSequence(): readonly string[];
}

// 1. 静的実行ステップシーケンスの定義と凍結
export const EVENT_BUS_SEQUENCE: readonly string[] = Object.freeze([
  'REGISTER_EVENT_BUS',
  'VALIDATE_EVENT_BUS_SCHEMA',
  'INITIALIZE_EVENT_BUS_BLUEPRINT',
  'READY_FOR_EVENT_BUS_RUNTIME',
  'EVENT_BUS_SCHEMA_CONFIRMED'
]);

// 静的ポリシーリストの定義と凍結
const defaultPolicies: readonly EventBusExecutionPolicy[] = Object.freeze([
  EventBusExecutionPolicy.READ_ONLY,
  EventBusExecutionPolicy.DETERMINISTIC,
  EventBusExecutionPolicy.IMMUTABLE_SCHEMA,
  EventBusExecutionPolicy.NO_THREAD,
  EventBusExecutionPolicy.NO_QUEUE,
  EventBusExecutionPolicy.NO_SCHEDULER,
  EventBusExecutionPolicy.NO_TASK,
  EventBusExecutionPolicy.NO_WORKER,
  EventBusExecutionPolicy.NO_DISPATCHER,
  EventBusExecutionPolicy.NO_EVENT,
  EventBusExecutionPolicy.NO_EVENT_LOOP,
  EventBusExecutionPolicy.NO_EVENT_BUS,
  EventBusExecutionPolicy.NO_PUBLISH,
  EventBusExecutionPolicy.NO_SUBSCRIBE,
  EventBusExecutionPolicy.NO_NOTIFICATION,
  EventBusExecutionPolicy.NO_ROUTING,
  EventBusExecutionPolicy.NO_CHANNEL_OPERATION
]);

// 静的ライフサイクル状態リストの定義と凍結
const defaultLifecycleStates: readonly EventBusLifecycleState[] = Object.freeze([
  EventBusLifecycleState.CREATED,
  EventBusLifecycleState.READY,
  EventBusLifecycleState.WAITING,
  EventBusLifecycleState.SEALED,
  EventBusLifecycleState.TERMINATED
]);

// 2. 静的イベントバスモデルリストの定義と凍結
export const RUNTIME_EVENT_BUS_MODELS: readonly RuntimeEventBusModel[] = Object.freeze([
  Object.freeze({
    eventBusType: RuntimeEventBusType.SYSTEM_EVENT_BUS,
    modelId: 'event-bus-model-system-01',
    metadata: Object.freeze({
      id: 'event-bus-meta-system-01',
      name: 'System Event Bus Metadata',
      eventBusModelVersion: '1.0',
      eventBusSchemaVersion: '1.0',
      description: 'Metadata for System Event Bus Schema'
    }),
    eventBusOrder: 1,
    supportedEventBusTypes: Object.freeze(['SYSTEM']),
    supportedEventBusPolicies: Object.freeze(['StaticRouting']),
    supportedChannelPolicies: Object.freeze(['NO_CHANNEL']),
    dependencyPolicy: EventBusDependencyPolicy.NO_DEPENDENCY,
    channelPolicy: EventBusChannelPolicy.NO_CHANNEL,
    topology: EventBusTopology.LOCAL,
    deliveryPolicy: EventBusDeliveryPolicy.BROADCAST,
    reliabilityPolicy: EventBusReliabilityPolicy.BEST_EFFORT,
    eventBusCategory: EventBusCategory.SYSTEM,
    supportedCapabilities: Object.freeze([EventBusCapability.SYSTEM, EventBusCapability.REMOTE, EventBusCapability.LOCAL]),
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: EVENT_BUS_SEQUENCE
  }),
  Object.freeze({
    eventBusType: RuntimeEventBusType.CORE_EVENT_BUS,
    modelId: 'event-bus-model-core-01',
    metadata: Object.freeze({
      id: 'event-bus-meta-core-01',
      name: 'Core Event Bus Metadata',
      eventBusModelVersion: '1.0',
      eventBusSchemaVersion: '1.0',
      description: 'Metadata for Core Event Bus Schema'
    }),
    eventBusOrder: 2,
    supportedEventBusTypes: Object.freeze(['CORE']),
    supportedEventBusPolicies: Object.freeze([]),
    supportedChannelPolicies: Object.freeze(['STATIC_CHANNEL']),
    dependencyPolicy: EventBusDependencyPolicy.STATIC_DEPENDENCY,
    channelPolicy: EventBusChannelPolicy.STATIC_CHANNEL,
    topology: EventBusTopology.PROCESS,
    deliveryPolicy: EventBusDeliveryPolicy.UNICAST,
    reliabilityPolicy: EventBusReliabilityPolicy.AT_MOST_ONCE,
    eventBusCategory: EventBusCategory.RUNTIME,
    supportedCapabilities: Object.freeze([EventBusCapability.SYSTEM, EventBusCapability.APPLICATION, EventBusCapability.INTER_PROCESS]),
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: EVENT_BUS_SEQUENCE
  }),
  Object.freeze({
    eventBusType: RuntimeEventBusType.APPLICATION_EVENT_BUS,
    modelId: 'event-bus-model-app-01',
    metadata: Object.freeze({
      id: 'event-bus-meta-app-01',
      name: 'Application Event Bus Metadata',
      eventBusModelVersion: '1.0',
      eventBusSchemaVersion: '1.0',
      description: 'Metadata for Application Event Bus Schema'
    }),
    eventBusOrder: 3,
    supportedEventBusTypes: Object.freeze(['APPLICATION']),
    supportedEventBusPolicies: Object.freeze(['DynamicRouting']),
    supportedChannelPolicies: Object.freeze(['SCHEMA_ONLY']),
    dependencyPolicy: EventBusDependencyPolicy.SCHEMA_ONLY,
    channelPolicy: EventBusChannelPolicy.SCHEMA_ONLY,
    topology: EventBusTopology.NODE,
    deliveryPolicy: EventBusDeliveryPolicy.SCHEMA_ONLY,
    reliabilityPolicy: EventBusReliabilityPolicy.SCHEMA_ONLY,
    eventBusCategory: EventBusCategory.AI,
    supportedCapabilities: Object.freeze([EventBusCapability.APPLICATION, EventBusCapability.AI, EventBusCapability.WORKFLOW, EventBusCapability.DISTRIBUTED, EventBusCapability.INTER_NODE]),
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: EVENT_BUS_SEQUENCE
  }),
  Object.freeze({
    eventBusType: RuntimeEventBusType.PLUGIN_EVENT_BUS,
    modelId: 'event-bus-model-plugin-01',
    metadata: Object.freeze({
      id: 'event-bus-meta-plugin-01',
      name: 'Plugin Event Bus Metadata',
      eventBusModelVersion: '1.0',
      eventBusSchemaVersion: '1.0',
      description: 'Metadata for Plugin Event Bus Schema'
    }),
    eventBusOrder: 4,
    supportedEventBusTypes: Object.freeze([]),
    supportedEventBusPolicies: Object.freeze([]),
    supportedChannelPolicies: Object.freeze([]),
    dependencyPolicy: EventBusDependencyPolicy.NO_DEPENDENCY,
    channelPolicy: EventBusChannelPolicy.NO_CHANNEL,
    topology: EventBusTopology.CLUSTER,
    deliveryPolicy: EventBusDeliveryPolicy.MULTICAST,
    reliabilityPolicy: EventBusReliabilityPolicy.AT_LEAST_ONCE,
    eventBusCategory: EventBusCategory.PLUGIN,
    supportedCapabilities: Object.freeze([EventBusCapability.PLUGIN, EventBusCapability.MONITORING]),
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: EVENT_BUS_SEQUENCE
  }),
  Object.freeze({
    eventBusType: RuntimeEventBusType.FIELD_EVENT_BUS,
    modelId: 'event-bus-model-field-01',
    metadata: Object.freeze({
      id: 'event-bus-meta-field-01',
      name: 'Field Event Bus Metadata',
      eventBusModelVersion: '1.0',
      eventBusSchemaVersion: '1.0',
      description: 'Metadata for Field Event Bus Schema'
    }),
    eventBusOrder: 5,
    supportedEventBusTypes: Object.freeze([]),
    supportedEventBusPolicies: Object.freeze([]),
    supportedChannelPolicies: Object.freeze([]),
    dependencyPolicy: EventBusDependencyPolicy.NO_DEPENDENCY,
    channelPolicy: EventBusChannelPolicy.NO_CHANNEL,
    topology: EventBusTopology.DISTRIBUTED,
    deliveryPolicy: EventBusDeliveryPolicy.DIRECT,
    reliabilityPolicy: EventBusReliabilityPolicy.EXACTLY_ONCE,
    eventBusCategory: EventBusCategory.FIELD,
    supportedCapabilities: Object.freeze([EventBusCapability.FIELD]),
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: EVENT_BUS_SEQUENCE
  })
]);

// 3. メタデータオブジェクトの作成と凍結
const eventBusMetadata: EventBusMetadata = Object.freeze({
  id: 'runtime-event-bus-meta-01',
  name: 'Execution Runtime Event Bus Metadata',
  version: '1.0.0',
  description: 'Metadata for Execution Runtime Event Bus Foundation',
  layer: 'Event Bus Layer',
  category: 'Infrastructure'
});

// 4. コンテキストオブジェクトの作成と凍結 (ID 参照のみ、runtimeEventBusId のみ)
const eventBusContext: ExecutionRuntimeEventBusContext = Object.freeze({
  runtimeEventBusId: 'runtime-event-bus-01'
});

// 5. データオブジェクトの作成と凍結
const eventBusData: ExecutionRuntimeEventBusData = Object.freeze({
  managerType: EventBusType.FOUNDATION,
  managerScope: EventBusScope.SYSTEM,
  eventBusModels: RUNTIME_EVENT_BUS_MODELS
});

// 6. イベントバスマネージャーオブジェクト本体の作成と凍結
const runtimeEventBusData: ExecutionRuntimeEventBus = Object.freeze({
  id: 'runtime-event-bus-01',
  name: 'Default Execution Runtime Event Bus Foundation',
  description: 'The static execution runtime event bus structure definition',
  context: eventBusContext,
  metadata: eventBusMetadata,
  data: eventBusData
});

// Blueprint コンテナの不変シングルトンインスタンス実装
export const EXECUTION_RUNTIME_EVENT_BUS_BLUEPRINT: ExecutionRuntimeEventBusBlueprint = Object.freeze({
  getExecutionRuntimeEventBus(): ExecutionRuntimeEventBus {
    return runtimeEventBusData;
  },

  getMetadata(): EventBusMetadata {
    return runtimeEventBusData.metadata;
  },

  getContext(): ExecutionRuntimeEventBusContext {
    return runtimeEventBusData.context;
  },

  getData(): ExecutionRuntimeEventBusData {
    return runtimeEventBusData.data;
  },

  getEventBusModels(): readonly RuntimeEventBusModel[] {
    return RUNTIME_EVENT_BUS_MODELS;
  },

  getEventBusSequence(): readonly string[] {
    return EVENT_BUS_SEQUENCE;
  }
});
