/**
 * ExecutionRuntimeRouting.ts
 * 
 * ExecutionRuntimeRouting Foundation の構造および公開インターフェース定義 (SSOT)。
 * 
 * 警告：本ファイル内への実際のルート生成、経路選択、メッセージ配送、転送処理、
 * ルーティングテーブル更新、動的ルーティング判定、コネクション切替、エンドポイント探索、
 * 非同期処理、API 通信、コマンド送信、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum RoutingType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME'
}

export enum RoutingScope {
  SYSTEM = 'SYSTEM'
}

export enum RuntimeRoutingType {
  SYSTEM_ROUTING = 'SYSTEM_ROUTING',
  CORE_ROUTING = 'CORE_ROUTING',
  APPLICATION_ROUTING = 'APPLICATION_ROUTING',
  PLUGIN_ROUTING = 'PLUGIN_ROUTING',
  FIELD_ROUTING = 'FIELD_ROUTING'
}

export enum RoutingLifecycleState {
  CREATED = 'CREATED',
  READY = 'READY',
  WAITING = 'WAITING',
  SEALED = 'SEALED',
  TERMINATED = 'TERMINATED'
}

export enum RoutingCapability {
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

export enum RoutingCategory {
  LOCAL = 'LOCAL',
  REMOTE = 'REMOTE',
  SERVICE = 'SERVICE',
  DEVICE = 'DEVICE',
  APPLICATION = 'APPLICATION',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum RoutingValidationPolicy {
  NONE = 'NONE',
  HEADER_ONLY = 'HEADER_ONLY',
  SCHEMA = 'SCHEMA',
  FULL = 'FULL',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum RoutingExecutionPolicy {
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
  NO_ROUTE_CREATE = 'NO_ROUTE_CREATE',
  NO_ROUTE_RESOLVE = 'NO_ROUTE_RESOLVE',
  NO_ROUTE_REGISTER = 'NO_ROUTE_REGISTER',
  NO_ROUTE_OPEN = 'NO_ROUTE_OPEN',
  NO_ROUTE_CLOSE = 'NO_ROUTE_CLOSE',
  NO_ROUTE_SELECT = 'NO_ROUTE_SELECT',
  NO_ROUTE_FORWARD = 'NO_ROUTE_FORWARD',
  NO_ROUTE_REDIRECT = 'NO_ROUTE_REDIRECT',
  NO_ROUTE_DISPATCH = 'NO_ROUTE_DISPATCH'
}

export enum RoutingDependencyPolicy {
  NO_DEPENDENCY = 'NO_DEPENDENCY',
  STATIC_DEPENDENCY = 'STATIC_DEPENDENCY',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum RoutingTopology {
  LOCAL = 'LOCAL',
  PROCESS = 'PROCESS',
  NODE = 'NODE',
  CLUSTER = 'CLUSTER',
  DISTRIBUTED = 'DISTRIBUTED'
}

export interface RuntimeRoutingMetadata {
  readonly id: string;
  readonly name: string;
  readonly routingModelVersion: string;
  readonly routingSchemaVersion: string;
  readonly description: string;
}

export interface RuntimeRoutingModel {
  readonly routingType: RuntimeRoutingType;
  readonly modelId: string;
  readonly metadata: RuntimeRoutingMetadata;
  readonly routingOrder: number;
  readonly supportedCapabilities: readonly RoutingCapability[];
  readonly supportedRoutingPolicies: readonly string[];
  readonly supportedValidationPolicies: readonly RoutingValidationPolicy[];
  readonly dependencyPolicy: RoutingDependencyPolicy;
  readonly topology: RoutingTopology;
  readonly lifecycleStates: readonly RoutingLifecycleState[];
  readonly executionPolicies: readonly RoutingExecutionPolicy[];
  readonly allowedSteps: readonly string[];
  readonly supportedTransportPolicies: readonly string[];
  readonly supportedConnectionPolicies: readonly string[];
  readonly supportedIdentityPolicies: readonly string[];
}

export interface RoutingMetadata {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly layer: string;
  readonly category: string;
}

export interface ExecutionRuntimeRoutingContext {
  readonly runtimeRoutingId: string;
}

export interface ExecutionRuntimeRoutingData {
  readonly managerType: RoutingType;
  readonly managerScope: RoutingScope;
  readonly routingModels: readonly RuntimeRoutingModel[];
}

export interface ExecutionRuntimeRouting {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly context: ExecutionRuntimeRoutingContext;
  readonly metadata: RoutingMetadata;
  readonly data: ExecutionRuntimeRoutingData;
}

export interface ExecutionRuntimeRoutingBlueprint {
  getExecutionRuntimeRouting(): ExecutionRuntimeRouting;
  getMetadata(): RoutingMetadata;
  getContext(): ExecutionRuntimeRoutingContext;
  getData(): ExecutionRuntimeRoutingData;
  getRoutingModels(): readonly RuntimeRoutingModel[];
  getRoutingSequence(): readonly string[];
}

// 1. 静的実行ステップシーケンスの定義と凍結
export const ROUTING_SEQUENCE: readonly string[] = Object.freeze([
  'REGISTER_ROUTING',
  'VALIDATE_ROUTING_SCHEMA',
  'INITIALIZE_ROUTING_BLUEPRINT',
  'READY_FOR_ROUTING_RUNTIME',
  'ROUTING_SCHEMA_CONFIRMED'
]);

// 静的ポリシーリストの定義と凍結
const defaultPolicies: readonly RoutingExecutionPolicy[] = Object.freeze([
  RoutingExecutionPolicy.READ_ONLY,
  RoutingExecutionPolicy.DETERMINISTIC,
  RoutingExecutionPolicy.IMMUTABLE_SCHEMA,
  RoutingExecutionPolicy.NO_THREAD,
  RoutingExecutionPolicy.NO_QUEUE,
  RoutingExecutionPolicy.NO_TASK,
  RoutingExecutionPolicy.NO_WORKER,
  RoutingExecutionPolicy.NO_EVENT,
  RoutingExecutionPolicy.NO_EVENT_BUS,
  RoutingExecutionPolicy.NO_ROUTER,
  RoutingExecutionPolicy.NO_ROUTE_CREATE,
  RoutingExecutionPolicy.NO_ROUTE_RESOLVE,
  RoutingExecutionPolicy.NO_ROUTE_REGISTER,
  RoutingExecutionPolicy.NO_ROUTE_OPEN,
  RoutingExecutionPolicy.NO_ROUTE_CLOSE,
  RoutingExecutionPolicy.NO_ROUTE_SELECT,
  RoutingExecutionPolicy.NO_ROUTE_FORWARD,
  RoutingExecutionPolicy.NO_ROUTE_REDIRECT,
  RoutingExecutionPolicy.NO_ROUTE_DISPATCH
]);

// 静的ライフサイクル状態リストの定義と凍結
const defaultLifecycleStates: readonly RoutingLifecycleState[] = Object.freeze([
  RoutingLifecycleState.CREATED,
  RoutingLifecycleState.READY,
  RoutingLifecycleState.WAITING,
  RoutingLifecycleState.SEALED,
  RoutingLifecycleState.TERMINATED
]);

// 2. 静的ルーティングモデルリストの定義と凍結
export const RUNTIME_ROUTING_MODELS: readonly RuntimeRoutingModel[] = Object.freeze([
  Object.freeze({
    routingType: RuntimeRoutingType.SYSTEM_ROUTING,
    modelId: 'routing-model-system-01',
    metadata: Object.freeze({
      id: 'routing-meta-system-01',
      name: 'SystemRoutingMetadata',
      routingModelVersion: '1.0',
      routingSchemaVersion: '1.0',
      description: 'Metadata for SystemRouting Schema'
    }),
    routingOrder: 1,
    supportedCapabilities: Object.freeze([RoutingCapability.SYSTEM, RoutingCapability.REMOTE, RoutingCapability.LOCAL]),
    supportedRoutingPolicies: Object.freeze(['StaticRouting']),
    supportedValidationPolicies: Object.freeze([RoutingValidationPolicy.SCHEMA_ONLY]),
    dependencyPolicy: RoutingDependencyPolicy.NO_DEPENDENCY,
    topology: RoutingTopology.LOCAL,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: ROUTING_SEQUENCE,
    supportedTransportPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedIdentityPolicies: Object.freeze(['SCHEMA_ONLY'])
  }),
  Object.freeze({
    routingType: RuntimeRoutingType.CORE_ROUTING,
    modelId: 'routing-model-core-01',
    metadata: Object.freeze({
      id: 'routing-meta-core-01',
      name: 'CoreRoutingMetadata',
      routingModelVersion: '1.0',
      routingSchemaVersion: '1.0',
      description: 'Metadata for CoreRouting Schema'
    }),
    routingOrder: 2,
    supportedCapabilities: Object.freeze([RoutingCapability.SYSTEM, RoutingCapability.APPLICATION, RoutingCapability.INTER_PROCESS]),
    supportedRoutingPolicies: Object.freeze([]),
    supportedValidationPolicies: Object.freeze([RoutingValidationPolicy.HEADER_ONLY, RoutingValidationPolicy.SCHEMA_ONLY]),
    dependencyPolicy: RoutingDependencyPolicy.STATIC_DEPENDENCY,
    topology: RoutingTopology.PROCESS,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: ROUTING_SEQUENCE,
    supportedTransportPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedIdentityPolicies: Object.freeze(['SCHEMA_ONLY'])
  }),
  Object.freeze({
    routingType: RuntimeRoutingType.APPLICATION_ROUTING,
    modelId: 'routing-model-app-01',
    metadata: Object.freeze({
      id: 'routing-meta-app-01',
      name: 'ApplicationRoutingMetadata',
      routingModelVersion: '1.0',
      routingSchemaVersion: '1.0',
      description: 'Metadata for ApplicationRouting Schema'
    }),
    routingOrder: 3,
    supportedCapabilities: Object.freeze([RoutingCapability.APPLICATION, RoutingCapability.AI, RoutingCapability.WORKFLOW, RoutingCapability.DISTRIBUTED, RoutingCapability.INTER_NODE]),
    supportedRoutingPolicies: Object.freeze(['DynamicRouting']),
    supportedValidationPolicies: Object.freeze([RoutingValidationPolicy.FULL, RoutingValidationPolicy.SCHEMA_ONLY]),
    dependencyPolicy: RoutingDependencyPolicy.SCHEMA_ONLY,
    topology: RoutingTopology.NODE,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: ROUTING_SEQUENCE,
    supportedTransportPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedIdentityPolicies: Object.freeze(['SCHEMA_ONLY'])
  }),
  Object.freeze({
    routingType: RuntimeRoutingType.PLUGIN_ROUTING,
    modelId: 'routing-model-plugin-01',
    metadata: Object.freeze({
      id: 'routing-meta-plugin-01',
      name: 'PluginRoutingMetadata',
      routingModelVersion: '1.0',
      routingSchemaVersion: '1.0',
      description: 'Metadata for PluginRouting Schema'
    }),
    routingOrder: 4,
    supportedCapabilities: Object.freeze([RoutingCapability.PLUGIN, RoutingCapability.MONITORING]),
    supportedRoutingPolicies: Object.freeze([]),
    supportedValidationPolicies: Object.freeze([RoutingValidationPolicy.SCHEMA, RoutingValidationPolicy.SCHEMA_ONLY]),
    dependencyPolicy: RoutingDependencyPolicy.NO_DEPENDENCY,
    topology: RoutingTopology.CLUSTER,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: ROUTING_SEQUENCE,
    supportedTransportPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedIdentityPolicies: Object.freeze(['SCHEMA_ONLY'])
  }),
  Object.freeze({
    routingType: RuntimeRoutingType.FIELD_ROUTING,
    modelId: 'routing-model-field-01',
    metadata: Object.freeze({
      id: 'routing-meta-field-01',
      name: 'FieldRoutingMetadata',
      routingModelVersion: '1.0',
      routingSchemaVersion: '1.0',
      description: 'Metadata for FieldRouting Schema'
    }),
    routingOrder: 5,
    supportedCapabilities: Object.freeze([RoutingCapability.FIELD]),
    supportedRoutingPolicies: Object.freeze([]),
    supportedValidationPolicies: Object.freeze([RoutingValidationPolicy.FULL, RoutingValidationPolicy.SCHEMA_ONLY]),
    dependencyPolicy: RoutingDependencyPolicy.NO_DEPENDENCY,
    topology: RoutingTopology.DISTRIBUTED,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: ROUTING_SEQUENCE,
    supportedTransportPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedIdentityPolicies: Object.freeze(['SCHEMA_ONLY'])
  })
]);

// 3. メタデータオブジェクトの作成と凍結
const routingMetadata: RoutingMetadata = Object.freeze({
  id: 'runtime-routing-meta-01',
  name: 'ExecutionRuntimeRoutingMetadata',
  version: '1.0.0',
  description: 'Metadata for ExecutionRuntimeRouting Foundation',
  layer: 'RoutingLayer',
  category: 'Infrastructure'
});

// 4. コンテキストオブジェクトの作成と凍結 (ID 参照のみ、runtimeRoutingId のみ)
const routingContext: ExecutionRuntimeRoutingContext = Object.freeze({
  runtimeRoutingId: 'runtime-routing-01'
});

// 5. データオブジェクトの作成と凍結
const routingData: ExecutionRuntimeRoutingData = Object.freeze({
  managerType: RoutingType.FOUNDATION,
  managerScope: RoutingScope.SYSTEM,
  routingModels: RUNTIME_ROUTING_MODELS
});

// 6. 主体マネージャーオブジェクト本体の作成と凍結
const runtimeRoutingObj: ExecutionRuntimeRouting = Object.freeze({
  id: 'runtime-routing-01',
  name: 'DefaultExecutionRuntimeRouting Foundation',
  description: 'The static execution-routing-structure definition',
  context: routingContext,
  metadata: routingMetadata,
  data: routingData
});

// Blueprint コンテナの不変シングルトンインスタンス実装 (型固定の適用)
export const EXECUTION_RUNTIME_ROUTING_BLUEPRINT: Readonly<ExecutionRuntimeRoutingBlueprint> = Object.freeze({
  getExecutionRuntimeRouting(): ExecutionRuntimeRouting {
    return runtimeRoutingObj;
  },

  getMetadata(): RoutingMetadata {
    return runtimeRoutingObj.metadata;
  },

  getContext(): ExecutionRuntimeRoutingContext {
    return runtimeRoutingObj.context;
  },

  getData(): ExecutionRuntimeRoutingData {
    return runtimeRoutingObj.data;
  },

  getRoutingModels(): readonly RuntimeRoutingModel[] {
    return RUNTIME_ROUTING_MODELS;
  },

  getRoutingSequence(): readonly string[] {
    return ROUTING_SEQUENCE;
  }
});
