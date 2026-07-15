/**
 * ExecutionRuntimeEvent.ts
 * 
 * Execution Runtime Event Foundation の構造および公開インターフェース定義 (SSOT)。
 * 
 * 警告：本ファイル内への実際のイベント生成、発行、購読、配送、
 * イベントループ駆動、コールバック実行、非同期処理、API 通信、コマンド送信、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum EventType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME'
}

export enum EventScope {
  SYSTEM = 'SYSTEM'
}

export enum RuntimeEventType {
  SYSTEM_EVENT = 'SYSTEM_EVENT',
  CORE_EVENT = 'CORE_EVENT',
  APPLICATION_EVENT = 'APPLICATION_EVENT',
  PLUGIN_EVENT = 'PLUGIN_EVENT',
  FIELD_EVENT = 'FIELD_EVENT'
}

export enum EventLifecycleState {
  CREATED = 'CREATED',
  READY = 'READY',
  WAITING = 'WAITING',
  SEALED = 'SEALED',
  TERMINATED = 'TERMINATED'
}

export enum EventCapability {
  SYSTEM = 'SYSTEM',
  APPLICATION = 'APPLICATION',
  PLUGIN = 'PLUGIN',
  FIELD = 'FIELD',
  AI = 'AI',
  WORKFLOW = 'WORKFLOW',
  MONITORING = 'MONITORING',
  REMOTE = 'REMOTE',
  DISTRIBUTED = 'DISTRIBUTED'
}

export enum EventExecutionPolicy {
  READ_ONLY = 'READ_ONLY',
  DETERMINISTIC = 'DETERMINISTIC',
  IMMUTABLE_SCHEMA = 'IMMUTABLE_SCHEMA',
  NO_THREAD = 'NO_THREAD',
  NO_QUEUE = 'NO_QUEUE',
  NO_SCHEDULER = 'NO_SCHEDULER',
  NO_TASK = 'NO_TASK',
  NO_WORKER = 'NO_WORKER',
  NO_DISPATCHER = 'NO_DISPATCHER',
  NO_EVENT_LOOP = 'NO_EVENT_LOOP',
  NO_EVENT_BUS = 'NO_EVENT_BUS',
  NO_PUBLISH = 'NO_PUBLISH',
  NO_SUBSCRIBE = 'NO_SUBSCRIBE',
  NO_NOTIFICATION = 'NO_NOTIFICATION',
  NO_CALLBACK = 'NO_CALLBACK',
  NO_BROADCAST = 'NO_BROADCAST',
  NO_MULTICAST = 'NO_MULTICAST'
}

export enum EventDependencyPolicy {
  NO_DEPENDENCY = 'NO_DEPENDENCY',
  STATIC_DEPENDENCY = 'STATIC_DEPENDENCY',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum EventCategory {
  SYSTEM = 'SYSTEM',
  RUNTIME = 'RUNTIME',
  APPLICATION = 'APPLICATION',
  PLUGIN = 'PLUGIN',
  FIELD = 'FIELD',
  AI = 'AI',
  MONITORING = 'MONITORING',
  GOVERNANCE = 'GOVERNANCE'
}

export enum EventDirection {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND',
  INTERNAL = 'INTERNAL'
}

export enum EventPriorityPolicy {
  NO_PRIORITY = 'NO_PRIORITY',
  STATIC_PRIORITY = 'STATIC_PRIORITY',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export interface RuntimeEventMetadata {
  readonly id: string;
  readonly name: string;
  readonly eventModelVersion: string;
  readonly eventSchemaVersion: string;
  readonly description: string;
}

export interface RuntimeEventModel {
  readonly eventType: RuntimeEventType;
  readonly modelId: string;
  readonly metadata: RuntimeEventMetadata;
  readonly eventOrder: number;
  readonly supportedEventTypes: readonly string[];
  readonly supportedCapabilities: readonly EventCapability[];
  readonly supportedEventPolicies: readonly string[];
  readonly dependencyPolicy: EventDependencyPolicy;
  readonly eventCategory: EventCategory;
  readonly eventDirection: EventDirection;
  readonly priorityPolicy: EventPriorityPolicy;
  readonly lifecycleStates: readonly EventLifecycleState[];
  readonly executionPolicies: readonly EventExecutionPolicy[];
  readonly allowedSteps: readonly string[];
}

export interface EventMetadata {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly layer: string;
  readonly category: string;
}

export interface ExecutionRuntimeEventContext {
  readonly runtimeEventId: string;
}

export interface ExecutionRuntimeEventData {
  readonly managerType: EventType;
  readonly managerScope: EventScope;
  readonly eventModels: readonly RuntimeEventModel[];
}

export interface ExecutionRuntimeEvent {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly context: ExecutionRuntimeEventContext;
  readonly metadata: EventMetadata;
  readonly data: ExecutionRuntimeEventData;
}

export interface ExecutionRuntimeEventBlueprint {
  getExecutionRuntimeEvent(): ExecutionRuntimeEvent;
  getMetadata(): EventMetadata;
  getContext(): ExecutionRuntimeEventContext;
  getData(): ExecutionRuntimeEventData;
  getEventModels(): readonly RuntimeEventModel[];
  getEventSequence(): readonly string[];
}

// 1. 静的実行ステップシーケンスの定義と凍結
export const EVENT_SEQUENCE: readonly string[] = Object.freeze([
  'REGISTER_EVENT',
  'VALIDATE_EVENT_SCHEMA',
  'INITIALIZE_EVENT_BLUEPRINT',
  'READY_FOR_EVENT_RUNTIME',
  'EVENT_SCHEMA_CONFIRMED'
]);

// 静的ポリシーリストの定義と凍結
const defaultPolicies: readonly EventExecutionPolicy[] = Object.freeze([
  EventExecutionPolicy.READ_ONLY,
  EventExecutionPolicy.DETERMINISTIC,
  EventExecutionPolicy.IMMUTABLE_SCHEMA,
  EventExecutionPolicy.NO_THREAD,
  EventExecutionPolicy.NO_QUEUE,
  EventExecutionPolicy.NO_SCHEDULER,
  EventExecutionPolicy.NO_TASK,
  EventExecutionPolicy.NO_WORKER,
  EventExecutionPolicy.NO_DISPATCHER,
  EventExecutionPolicy.NO_EVENT_LOOP,
  EventExecutionPolicy.NO_EVENT_BUS,
  EventExecutionPolicy.NO_PUBLISH,
  EventExecutionPolicy.NO_SUBSCRIBE,
  EventExecutionPolicy.NO_NOTIFICATION,
  EventExecutionPolicy.NO_CALLBACK,
  EventExecutionPolicy.NO_BROADCAST,
  EventExecutionPolicy.NO_MULTICAST
]);

// 静的ライフサイクル状態リストの定義と凍結
const defaultLifecycleStates: readonly EventLifecycleState[] = Object.freeze([
  EventLifecycleState.CREATED,
  EventLifecycleState.READY,
  EventLifecycleState.WAITING,
  EventLifecycleState.SEALED,
  EventLifecycleState.TERMINATED
]);

// 2. 静的イベントモデルリストの定義と凍結
export const RUNTIME_EVENT_MODELS: readonly RuntimeEventModel[] = Object.freeze([
  Object.freeze({
    eventType: RuntimeEventType.SYSTEM_EVENT,
    modelId: 'event-model-system-01',
    metadata: Object.freeze({
      id: 'event-meta-system-01',
      name: 'System Event Metadata',
      eventModelVersion: '1.0',
      eventSchemaVersion: '1.0',
      description: 'Metadata for System Event Schema'
    }),
    eventOrder: 1,
    supportedEventTypes: Object.freeze(['SYSTEM']),
    supportedEventPolicies: Object.freeze(['BroadcastRouting']),
    supportedCapabilities: Object.freeze([EventCapability.SYSTEM, EventCapability.REMOTE]),
    dependencyPolicy: EventDependencyPolicy.NO_DEPENDENCY,
    eventCategory: EventCategory.SYSTEM,
    eventDirection: EventDirection.INTERNAL,
    priorityPolicy: EventPriorityPolicy.NO_PRIORITY,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: EVENT_SEQUENCE
  }),
  Object.freeze({
    eventType: RuntimeEventType.CORE_EVENT,
    modelId: 'event-model-core-01',
    metadata: Object.freeze({
      id: 'event-meta-core-01',
      name: 'Core Event Metadata',
      eventModelVersion: '1.0',
      eventSchemaVersion: '1.0',
      description: 'Metadata for Core Event Schema'
    }),
    eventOrder: 2,
    supportedEventTypes: Object.freeze(['CORE']),
    supportedEventPolicies: Object.freeze([]),
    supportedCapabilities: Object.freeze([EventCapability.SYSTEM, EventCapability.APPLICATION]),
    dependencyPolicy: EventDependencyPolicy.STATIC_DEPENDENCY,
    eventCategory: EventCategory.RUNTIME,
    eventDirection: EventDirection.INTERNAL,
    priorityPolicy: EventPriorityPolicy.STATIC_PRIORITY,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: EVENT_SEQUENCE
  }),
  Object.freeze({
    eventType: RuntimeEventType.APPLICATION_EVENT,
    modelId: 'event-model-app-01',
    metadata: Object.freeze({
      id: 'event-meta-app-01',
      name: 'Application Event Metadata',
      eventModelVersion: '1.0',
      eventSchemaVersion: '1.0',
      description: 'Metadata for Application Event Schema'
    }),
    eventOrder: 3,
    supportedEventTypes: Object.freeze(['APPLICATION']),
    supportedEventPolicies: Object.freeze(['UnicastRouting']),
    supportedCapabilities: Object.freeze([EventCapability.APPLICATION, EventCapability.AI, EventCapability.WORKFLOW, EventCapability.DISTRIBUTED]),
    dependencyPolicy: EventDependencyPolicy.SCHEMA_ONLY,
    eventCategory: EventCategory.APPLICATION,
    eventDirection: EventDirection.INBOUND,
    priorityPolicy: EventPriorityPolicy.SCHEMA_ONLY,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: EVENT_SEQUENCE
  }),
  Object.freeze({
    eventType: RuntimeEventType.PLUGIN_EVENT,
    modelId: 'event-model-plugin-01',
    metadata: Object.freeze({
      id: 'event-meta-plugin-01',
      name: 'Plugin Event Metadata',
      eventModelVersion: '1.0',
      eventSchemaVersion: '1.0',
      description: 'Metadata for Plugin Event Schema'
    }),
    eventOrder: 4,
    supportedEventTypes: Object.freeze([]),
    supportedEventPolicies: Object.freeze([]),
    supportedCapabilities: Object.freeze([EventCapability.PLUGIN, EventCapability.MONITORING]),
    dependencyPolicy: EventDependencyPolicy.NO_DEPENDENCY,
    eventCategory: EventCategory.PLUGIN,
    eventDirection: EventDirection.OUTBOUND,
    priorityPolicy: EventPriorityPolicy.NO_PRIORITY,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: EVENT_SEQUENCE
  }),
  Object.freeze({
    eventType: RuntimeEventType.FIELD_EVENT,
    modelId: 'event-model-field-01',
    metadata: Object.freeze({
      id: 'event-meta-field-01',
      name: 'Field Event Metadata',
      eventModelVersion: '1.0',
      eventSchemaVersion: '1.0',
      description: 'Metadata for Field Event Schema'
    }),
    eventOrder: 5,
    supportedEventTypes: Object.freeze([]),
    supportedEventPolicies: Object.freeze([]),
    supportedCapabilities: Object.freeze([EventCapability.FIELD]),
    dependencyPolicy: EventDependencyPolicy.NO_DEPENDENCY,
    eventCategory: EventCategory.FIELD,
    eventDirection: EventDirection.INTERNAL,
    priorityPolicy: EventPriorityPolicy.NO_PRIORITY,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: EVENT_SEQUENCE
  })
]);

// 3. メタデータオブジェクトの作成と凍結
const eventMetadata: EventMetadata = Object.freeze({
  id: 'runtime-event-meta-01',
  name: 'Execution Runtime Event Metadata',
  version: '1.0.0',
  description: 'Metadata for Execution Runtime Event Foundation',
  layer: 'Event Layer',
  category: 'Infrastructure'
});

// 4. コンテキストオブジェクトの作成と凍結 (ID 参照のみ、runtimeEventId のみ)
const eventContext: ExecutionRuntimeEventContext = Object.freeze({
  runtimeEventId: 'runtime-event-01'
});

// 5. データオブジェクトの作成と凍結
const eventData: ExecutionRuntimeEventData = Object.freeze({
  managerType: EventType.FOUNDATION,
  managerScope: EventScope.SYSTEM,
  eventModels: RUNTIME_EVENT_MODELS
});

// 6. イベントマネージャーオブジェクト本体の作成と凍結
const runtimeEventData: ExecutionRuntimeEvent = Object.freeze({
  id: 'runtime-event-01',
  name: 'Default Execution Runtime Event Foundation',
  description: 'The static execution runtime event structure definition',
  context: eventContext,
  metadata: eventMetadata,
  data: eventData
});

// Blueprint コンテナの不変シングルトンインスタンス実装
export const EXECUTION_RUNTIME_EVENT_BLUEPRINT: ExecutionRuntimeEventBlueprint = Object.freeze({
  getExecutionRuntimeEvent(): ExecutionRuntimeEvent {
    return runtimeEventData;
  },

  getMetadata(): EventMetadata {
    return runtimeEventData.metadata;
  },

  getContext(): ExecutionRuntimeEventContext {
    return runtimeEventData.context;
  },

  getData(): ExecutionRuntimeEventData {
    return runtimeEventData.data;
  },

  getEventModels(): readonly RuntimeEventModel[] {
    return RUNTIME_EVENT_MODELS;
  },

  getEventSequence(): readonly string[] {
    return EVENT_SEQUENCE;
  }
});
