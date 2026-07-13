/**
 * ExecutionRuntimeDispatcher.ts
 * 
 * Execution Runtime Dispatcher Foundation の構造および公開インターフェース定義 (SSOT)。
 * 
 * 警告：本ファイル内への実際のタスク割当、ワーク選択、負荷分散、優先度計算、ルーティング、
 * 再試行、非同期処理、API 通信、コマンド送信、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum DispatcherType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME'
}

export enum DispatcherScope {
  SYSTEM = 'SYSTEM'
}

export enum RuntimeDispatcherType {
  SYSTEM_DISPATCHER = 'SYSTEM_DISPATCHER',
  CORE_DISPATCHER = 'CORE_DISPATCHER',
  APPLICATION_DISPATCHER = 'APPLICATION_DISPATCHER',
  PLUGIN_DISPATCHER = 'PLUGIN_DISPATCHER',
  FIELD_DISPATCHER = 'FIELD_DISPATCHER'
}

export enum DispatcherLifecycleState {
  CREATED = 'CREATED',
  READY = 'READY',
  WAITING = 'WAITING',
  SEALED = 'SEALED',
  TERMINATED = 'TERMINATED'
}

export enum DispatcherCapability {
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

export enum DispatcherExecutionPolicy {
  READ_ONLY = 'READ_ONLY',
  DETERMINISTIC = 'DETERMINISTIC',
  IMMUTABLE_SCHEMA = 'IMMUTABLE_SCHEMA',
  NO_THREAD = 'NO_THREAD',
  NO_QUEUE = 'NO_QUEUE',
  NO_SCHEDULER = 'NO_SCHEDULER',
  NO_TASK = 'NO_TASK',
  NO_WORKER = 'NO_WORKER',
  NO_EVENT_LOOP = 'NO_EVENT_LOOP',
  NO_DISPATCH = 'NO_DISPATCH',
  NO_ROUTING = 'NO_ROUTING',
  NO_LOAD_BALANCING = 'NO_LOAD_BALANCING',
  NO_PRIORITY_SELECTION = 'NO_PRIORITY_SELECTION',
  NO_FAILOVER = 'NO_FAILOVER',
  NO_REMOTE_ROUTING = 'NO_REMOTE_ROUTING',
  NO_DYNAMIC_POLICY = 'NO_DYNAMIC_POLICY'
}

export enum DispatcherDependencyPolicy {
  NO_DEPENDENCY = 'NO_DEPENDENCY',
  STATIC_DEPENDENCY = 'STATIC_DEPENDENCY',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export interface RuntimeDispatcherMetadata {
  readonly id: string;
  readonly name: string;
  readonly dispatcherModelVersion: string;
  readonly dispatcherSchemaVersion: string;
  readonly description: string;
}

export interface RuntimeDispatcherModel {
  readonly dispatcherType: RuntimeDispatcherType;
  readonly modelId: string;
  readonly metadata: RuntimeDispatcherMetadata;
  readonly dispatcherOrder: number;
  readonly supportedDispatcherTypes: readonly string[];
  readonly supportedCapabilities: readonly DispatcherCapability[];
  readonly supportedDispatcherPolicies: readonly string[];
  readonly dependencyPolicy: DispatcherDependencyPolicy;
  readonly lifecycleStates: readonly DispatcherLifecycleState[];
  readonly executionPolicies: readonly DispatcherExecutionPolicy[];
  readonly allowedSteps: readonly string[];
}

export interface DispatcherMetadata {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly layer: string;
  readonly category: string;
}

export interface ExecutionRuntimeDispatcherContext {
  readonly runtimeDispatcherId: string;
}

export interface ExecutionRuntimeDispatcherData {
  readonly managerType: DispatcherType;
  readonly managerScope: DispatcherScope;
  readonly dispatcherModels: readonly RuntimeDispatcherModel[];
}

export interface ExecutionRuntimeDispatcher {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly context: ExecutionRuntimeDispatcherContext;
  readonly metadata: DispatcherMetadata;
  readonly data: ExecutionRuntimeDispatcherData;
}

export interface ExecutionRuntimeDispatcherBlueprint {
  getExecutionRuntimeDispatcher(): ExecutionRuntimeDispatcher;
  getMetadata(): DispatcherMetadata;
  getContext(): ExecutionRuntimeDispatcherContext;
  getData(): ExecutionRuntimeDispatcherData;
  getDispatcherModels(): readonly RuntimeDispatcherModel[];
  getDispatcherSequence(): readonly string[];
}

// 1. 静的実行ステップシーケンスの定義と凍結
export const DISPATCHER_SEQUENCE: readonly string[] = Object.freeze([
  'REGISTER_DISPATCHER',
  'VALIDATE_DISPATCHER_SCHEMA',
  'INITIALIZE_DISPATCHER_BLUEPRINT',
  'READY_FOR_DISPATCHER_RUNTIME',
  'DISPATCHER_SCHEMA_CONFIRMED'
]);

// 静的ポリシーリストの定義と凍結 (推奨のポリシーを含む)
const defaultPolicies: readonly DispatcherExecutionPolicy[] = Object.freeze([
  DispatcherExecutionPolicy.READ_ONLY,
  DispatcherExecutionPolicy.DETERMINISTIC,
  DispatcherExecutionPolicy.IMMUTABLE_SCHEMA,
  DispatcherExecutionPolicy.NO_THREAD,
  DispatcherExecutionPolicy.NO_QUEUE,
  DispatcherExecutionPolicy.NO_SCHEDULER,
  DispatcherExecutionPolicy.NO_TASK,
  DispatcherExecutionPolicy.NO_WORKER,
  DispatcherExecutionPolicy.NO_EVENT_LOOP,
  DispatcherExecutionPolicy.NO_DISPATCH,
  DispatcherExecutionPolicy.NO_ROUTING,
  DispatcherExecutionPolicy.NO_LOAD_BALANCING,
  DispatcherExecutionPolicy.NO_PRIORITY_SELECTION,
  DispatcherExecutionPolicy.NO_FAILOVER,
  DispatcherExecutionPolicy.NO_REMOTE_ROUTING,
  DispatcherExecutionPolicy.NO_DYNAMIC_POLICY
]);

// 静的ライフサイクル状態リストの定義と凍結
const defaultLifecycleStates: readonly DispatcherLifecycleState[] = Object.freeze([
  DispatcherLifecycleState.CREATED,
  DispatcherLifecycleState.READY,
  DispatcherLifecycleState.WAITING,
  DispatcherLifecycleState.SEALED,
  DispatcherLifecycleState.TERMINATED
]);

// 2. 静的ディスパッチャーモデルリストの定義と凍結
export const RUNTIME_DISPATCHER_MODELS: readonly RuntimeDispatcherModel[] = Object.freeze([
  Object.freeze({
    dispatcherType: RuntimeDispatcherType.SYSTEM_DISPATCHER,
    modelId: 'dispatcher-model-system-01',
    metadata: Object.freeze({
      id: 'dispatcher-meta-system-01',
      name: 'System Dispatcher Metadata',
      dispatcherModelVersion: '1.0',
      dispatcherSchemaVersion: '1.0',
      description: 'Metadata for System Dispatcher Schema'
    }),
    dispatcherOrder: 1,
    supportedDispatcherTypes: Object.freeze(['SYSTEM']),
    supportedDispatcherPolicies: Object.freeze(['StaticRouting']),
    supportedCapabilities: Object.freeze([DispatcherCapability.SYSTEM, DispatcherCapability.REMOTE]),
    dependencyPolicy: DispatcherDependencyPolicy.NO_DEPENDENCY,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: DISPATCHER_SEQUENCE
  }),
  Object.freeze({
    dispatcherType: RuntimeDispatcherType.CORE_DISPATCHER,
    modelId: 'dispatcher-model-core-01',
    metadata: Object.freeze({
      id: 'dispatcher-meta-core-01',
      name: 'Core Dispatcher Metadata',
      dispatcherModelVersion: '1.0',
      dispatcherSchemaVersion: '1.0',
      description: 'Metadata for Core Dispatcher Schema'
    }),
    dispatcherOrder: 2,
    supportedDispatcherTypes: Object.freeze(['CORE']),
    supportedDispatcherPolicies: Object.freeze([]),
    supportedCapabilities: Object.freeze([DispatcherCapability.SYSTEM, DispatcherCapability.APPLICATION]),
    dependencyPolicy: DispatcherDependencyPolicy.STATIC_DEPENDENCY,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: DISPATCHER_SEQUENCE
  }),
  Object.freeze({
    dispatcherType: RuntimeDispatcherType.APPLICATION_DISPATCHER,
    modelId: 'dispatcher-model-app-01',
    metadata: Object.freeze({
      id: 'dispatcher-meta-app-01',
      name: 'Application Dispatcher Metadata',
      dispatcherModelVersion: '1.0',
      dispatcherSchemaVersion: '1.0',
      description: 'Metadata for Application Dispatcher Schema'
    }),
    dispatcherOrder: 3,
    supportedDispatcherTypes: Object.freeze(['APPLICATION']),
    supportedDispatcherPolicies: Object.freeze(['DynamicRouting']),
    supportedCapabilities: Object.freeze([DispatcherCapability.APPLICATION, DispatcherCapability.AI, DispatcherCapability.WORKFLOW, DispatcherCapability.DISTRIBUTED]),
    dependencyPolicy: DispatcherDependencyPolicy.SCHEMA_ONLY,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: DISPATCHER_SEQUENCE
  }),
  Object.freeze({
    dispatcherType: RuntimeDispatcherType.PLUGIN_DISPATCHER,
    modelId: 'dispatcher-model-plugin-01',
    metadata: Object.freeze({
      id: 'dispatcher-meta-plugin-01',
      name: 'Plugin Dispatcher Metadata',
      dispatcherModelVersion: '1.0',
      dispatcherSchemaVersion: '1.0',
      description: 'Metadata for Plugin Dispatcher Schema'
    }),
    dispatcherOrder: 4,
    supportedDispatcherTypes: Object.freeze([]),
    supportedDispatcherPolicies: Object.freeze([]),
    supportedCapabilities: Object.freeze([DispatcherCapability.PLUGIN, DispatcherCapability.MONITORING]),
    dependencyPolicy: DispatcherDependencyPolicy.NO_DEPENDENCY,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: DISPATCHER_SEQUENCE
  }),
  Object.freeze({
    dispatcherType: RuntimeDispatcherType.FIELD_DISPATCHER,
    modelId: 'dispatcher-model-field-01',
    metadata: Object.freeze({
      id: 'dispatcher-meta-field-01',
      name: 'Field Dispatcher Metadata',
      dispatcherModelVersion: '1.0',
      dispatcherSchemaVersion: '1.0',
      description: 'Metadata for Field Dispatcher Schema'
    }),
    dispatcherOrder: 5,
    supportedDispatcherTypes: Object.freeze([]),
    supportedDispatcherPolicies: Object.freeze([]),
    supportedCapabilities: Object.freeze([DispatcherCapability.FIELD]),
    dependencyPolicy: DispatcherDependencyPolicy.NO_DEPENDENCY,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: DISPATCHER_SEQUENCE
  })
]);

// 3. メタデータオブジェクトの作成と凍結
const dispatcherMetadata: DispatcherMetadata = Object.freeze({
  id: 'runtime-dispatcher-meta-01',
  name: 'Execution Runtime Dispatcher Metadata',
  version: '1.0.0',
  description: 'Metadata for Execution Runtime Dispatcher Foundation',
  layer: 'Dispatcher Layer',
  category: 'Infrastructure'
});

// 4. コンテキストオブジェクトの作成と凍結 (ID 参照のみ、runtimeDispatcherId のみ)
const dispatcherContext: ExecutionRuntimeDispatcherContext = Object.freeze({
  runtimeDispatcherId: 'runtime-dispatcher-01'
});

// 5. データオブジェクトの作成と凍結
const dispatcherData: ExecutionRuntimeDispatcherData = Object.freeze({
  managerType: DispatcherType.FOUNDATION,
  managerScope: DispatcherScope.SYSTEM,
  dispatcherModels: RUNTIME_DISPATCHER_MODELS
});

// 6. ディスパッチャーマネージャーオブジェクト本体の作成と凍結
const runtimeDispatcherData: ExecutionRuntimeDispatcher = Object.freeze({
  id: 'runtime-dispatcher-01',
  name: 'Default Execution Runtime Dispatcher Foundation',
  description: 'The static execution runtime dispatcher structure definition',
  context: dispatcherContext,
  metadata: dispatcherMetadata,
  data: dispatcherData
});

// Blueprint コンテナの不変シングルトンインスタンス実装
export const EXECUTION_RUNTIME_DISPATCHER_BLUEPRINT: ExecutionRuntimeDispatcherBlueprint = Object.freeze({
  getExecutionRuntimeDispatcher(): ExecutionRuntimeDispatcher {
    return runtimeDispatcherData;
  },

  getMetadata(): DispatcherMetadata {
    return runtimeDispatcherData.metadata;
  },

  getContext(): ExecutionRuntimeDispatcherContext {
    return runtimeDispatcherData.context;
  },

  getData(): ExecutionRuntimeDispatcherData {
    return runtimeDispatcherData.data;
  },

  getDispatcherModels(): readonly RuntimeDispatcherModel[] {
    return RUNTIME_DISPATCHER_MODELS;
  },

  getDispatcherSequence(): readonly string[] {
    return DISPATCHER_SEQUENCE;
  }
});
