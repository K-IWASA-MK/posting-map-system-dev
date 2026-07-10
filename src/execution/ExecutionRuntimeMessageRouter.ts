/**
 * ExecutionRuntimeMessageRouter.ts
 * 
 * Execution Runtime Message Router Foundation の構造および公開インターフェース定義 (SSOT)。
 * 
 * 警告：本ファイル内への実際のメッセージ転送、フォワード、リダイレクト、配送、解決、
 * リトライ、フェイルオーバー、ロードバランシング、非同期処理、API 通信、コマンド送信、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum RouterType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME'
}

export enum RouterScope {
  SYSTEM = 'SYSTEM'
}

export enum RuntimeMessageRouterType {
  SYSTEM_ROUTER = 'SYSTEM_ROUTER',
  CORE_ROUTER = 'CORE_ROUTER',
  APPLICATION_ROUTER = 'APPLICATION_ROUTER',
  PLUGIN_ROUTER = 'PLUGIN_ROUTER',
  FIELD_ROUTER = 'FIELD_ROUTER'
}

export enum RouterLifecycleState {
  CREATED = 'CREATED',
  READY = 'READY',
  WAITING = 'WAITING',
  SEALED = 'SEALED',
  TERMINATED = 'TERMINATED'
}

export enum RouterCapability {
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

export enum RoutingStrategy {
  DIRECT = 'DIRECT',
  STATIC = 'STATIC',
  BROADCAST = 'BROADCAST',
  MULTICAST = 'MULTICAST',
  UNICAST = 'UNICAST',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum RoutingPolicy {
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
  NO_EVENT_BUS = 'NO_EVENT_BUS',
  NO_TRANSPORT = 'NO_TRANSPORT',
  NO_ROUTE = 'NO_ROUTE',
  NO_FORWARD = 'NO_FORWARD',
  NO_REDIRECT = 'NO_REDIRECT',
  NO_FAILOVER = 'NO_FAILOVER',
  NO_LOAD_BALANCING = 'NO_LOAD_BALANCING'
}

export enum RouterDependencyPolicy {
  NO_DEPENDENCY = 'NO_DEPENDENCY',
  STATIC_DEPENDENCY = 'STATIC_DEPENDENCY',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum RouterTopology {
  LOCAL = 'LOCAL',
  PROCESS = 'PROCESS',
  NODE = 'NODE',
  CLUSTER = 'CLUSTER',
  DISTRIBUTED = 'DISTRIBUTED'
}

export enum RouterReliabilityPolicy {
  BEST_EFFORT = 'BEST_EFFORT',
  AT_MOST_ONCE = 'AT_MOST_ONCE',
  AT_LEAST_ONCE = 'AT_LEAST_ONCE',
  EXACTLY_ONCE = 'EXACTLY_ONCE',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum RouterCategory {
  SYSTEM = 'SYSTEM',
  RUNTIME = 'RUNTIME',
  PLUGIN = 'PLUGIN',
  FIELD = 'FIELD',
  AI = 'AI',
  WORKFLOW = 'WORKFLOW',
  MONITORING = 'MONITORING',
  GOVERNANCE = 'GOVERNANCE'
}

export enum RouterSelectionPolicy {
  STATIC = 'STATIC',
  HASH = 'HASH',
  ROUND_ROBIN = 'ROUND_ROBIN',
  CONSISTENT_HASH = 'CONSISTENT_HASH',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum RouterTransportPolicy {
  LOCAL = 'LOCAL',
  IPC = 'IPC',
  TCP = 'TCP',
  UDP = 'UDP',
  HTTP = 'HTTP',
  HTTPS = 'HTTPS',
  WEBSOCKET = 'WEBSOCKET',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum RouterSecurityPolicy {
  NONE = 'NONE',
  SIGNATURE = 'SIGNATURE',
  ENCRYPTION = 'ENCRYPTION',
  AUTHENTICATION = 'AUTHENTICATION',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export interface RuntimeMessageRouterMetadata {
  readonly id: string;
  readonly name: string;
  readonly routerModelVersion: string;
  readonly routerSchemaVersion: string;
  readonly description: string;
}

export interface RuntimeMessageRouterModel {
  readonly routerType: RuntimeMessageRouterType;
  readonly modelId: string;
  readonly metadata: RuntimeMessageRouterMetadata;
  readonly routerOrder: number;
  readonly supportedCapabilities: readonly RouterCapability[];
  readonly supportedRoutingStrategies: readonly RoutingStrategy[];
  readonly supportedRoutingPolicies: readonly string[];
  readonly dependencyPolicy: RouterDependencyPolicy;
  readonly topology: RouterTopology;
  readonly reliabilityPolicy: RouterReliabilityPolicy;
  readonly routerCategory: RouterCategory;
  readonly selectionPolicy: RouterSelectionPolicy;
  readonly transportPolicy: RouterTransportPolicy;
  readonly securityPolicy: RouterSecurityPolicy;
  readonly lifecycleStates: readonly RouterLifecycleState[];
  readonly executionPolicies: readonly RoutingPolicy[];
  readonly allowedSteps: readonly string[];
}

export interface RouterMetadata {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly layer: string;
  readonly category: string;
}

export interface ExecutionRuntimeMessageRouterContext {
  readonly runtimeMessageRouterId: string;
}

export interface ExecutionRuntimeMessageRouterData {
  readonly managerType: RouterType;
  readonly managerScope: RouterScope;
  readonly routerModels: readonly RuntimeMessageRouterModel[];
}

export interface ExecutionRuntimeMessageRouter {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly context: ExecutionRuntimeMessageRouterContext;
  readonly metadata: RouterMetadata;
  readonly data: ExecutionRuntimeMessageRouterData;
}

export interface ExecutionRuntimeMessageRouterBlueprint {
  getExecutionRuntimeMessageRouter(): ExecutionRuntimeMessageRouter;
  getMetadata(): RouterMetadata;
  getContext(): ExecutionRuntimeMessageRouterContext;
  getData(): ExecutionRuntimeMessageRouterData;
  getRouterModels(): readonly RuntimeMessageRouterModel[];
  getRouterSequence(): readonly string[];
}

// 1. 静的実行ステップシーケンスの定義と凍結
export const MESSAGE_ROUTER_SEQUENCE: readonly string[] = Object.freeze([
  'REGISTER_MESSAGE_ROUTER',
  'VALIDATE_MESSAGE_ROUTER_SCHEMA',
  'INITIALIZE_MESSAGE_ROUTER_BLUEPRINT',
  'READY_FOR_MESSAGE_ROUTER_RUNTIME',
  'MESSAGE_ROUTER_SCHEMA_CONFIRMED'
]);

// 静的ポリシーリストの定義と凍結
const defaultPolicies: readonly RoutingPolicy[] = Object.freeze([
  RoutingPolicy.READ_ONLY,
  RoutingPolicy.DETERMINISTIC,
  RoutingPolicy.IMMUTABLE_SCHEMA,
  RoutingPolicy.NO_THREAD,
  RoutingPolicy.NO_QUEUE,
  RoutingPolicy.NO_SCHEDULER,
  RoutingPolicy.NO_TASK,
  RoutingPolicy.NO_WORKER,
  RoutingPolicy.NO_DISPATCHER,
  RoutingPolicy.NO_EVENT,
  RoutingPolicy.NO_EVENT_BUS,
  RoutingPolicy.NO_TRANSPORT,
  RoutingPolicy.NO_ROUTE,
  RoutingPolicy.NO_FORWARD,
  RoutingPolicy.NO_REDIRECT,
  RoutingPolicy.NO_FAILOVER,
  RoutingPolicy.NO_LOAD_BALANCING
]);

// 静的ライフサイクル状態リストの定義と凍結
const defaultLifecycleStates: readonly RouterLifecycleState[] = Object.freeze([
  RouterLifecycleState.CREATED,
  RouterLifecycleState.READY,
  RouterLifecycleState.WAITING,
  RouterLifecycleState.SEALED,
  RouterLifecycleState.TERMINATED
]);

// 2. 静的メッセージルーターモデルリストの定義と凍結
export const RUNTIME_MESSAGE_ROUTER_MODELS: readonly RuntimeMessageRouterModel[] = Object.freeze([
  Object.freeze({
    routerType: RuntimeMessageRouterType.SYSTEM_ROUTER,
    modelId: 'router-model-system-01',
    metadata: Object.freeze({
      id: 'router-meta-system-01',
      name: 'System Router Metadata',
      routerModelVersion: '1.0',
      routerSchemaVersion: '1.0',
      description: 'Metadata for System Router Schema'
    }),
    routerOrder: 1,
    supportedRoutingStrategies: Object.freeze([RoutingStrategy.BROADCAST]),
    supportedRoutingPolicies: Object.freeze(['StaticRouting']),
    dependencyPolicy: RouterDependencyPolicy.NO_DEPENDENCY,
    topology: RouterTopology.LOCAL,
    reliabilityPolicy: RouterReliabilityPolicy.BEST_EFFORT,
    routerCategory: RouterCategory.SYSTEM,
    selectionPolicy: RouterSelectionPolicy.STATIC,
    transportPolicy: RouterTransportPolicy.LOCAL,
    securityPolicy: RouterSecurityPolicy.NONE,
    supportedCapabilities: Object.freeze([RouterCapability.SYSTEM, RouterCapability.REMOTE, RouterCapability.LOCAL]),
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: MESSAGE_ROUTER_SEQUENCE
  }),
  Object.freeze({
    routerType: RuntimeMessageRouterType.CORE_ROUTER,
    modelId: 'router-model-core-01',
    metadata: Object.freeze({
      id: 'router-meta-core-01',
      name: 'Core Router Metadata',
      routerModelVersion: '1.0',
      routerSchemaVersion: '1.0',
      description: 'Metadata for Core Router Schema'
    }),
    routerOrder: 2,
    supportedRoutingStrategies: Object.freeze([RoutingStrategy.UNICAST]),
    supportedRoutingPolicies: Object.freeze([]),
    dependencyPolicy: RouterDependencyPolicy.STATIC_DEPENDENCY,
    topology: RouterTopology.PROCESS,
    reliabilityPolicy: RouterReliabilityPolicy.AT_MOST_ONCE,
    routerCategory: RouterCategory.RUNTIME,
    selectionPolicy: RouterSelectionPolicy.ROUND_ROBIN,
    transportPolicy: RouterTransportPolicy.IPC,
    securityPolicy: RouterSecurityPolicy.SIGNATURE,
    supportedCapabilities: Object.freeze([RouterCapability.SYSTEM, RouterCapability.APPLICATION, RouterCapability.INTER_PROCESS]),
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: MESSAGE_ROUTER_SEQUENCE
  }),
  Object.freeze({
    routerType: RuntimeMessageRouterType.APPLICATION_ROUTER,
    modelId: 'router-model-app-01',
    metadata: Object.freeze({
      id: 'router-meta-app-01',
      name: 'Application Router Metadata',
      routerModelVersion: '1.0',
      routerSchemaVersion: '1.0',
      description: 'Metadata for Application Router Schema'
    }),
    routerOrder: 3,
    supportedRoutingStrategies: Object.freeze([RoutingStrategy.SCHEMA_ONLY]),
    supportedRoutingPolicies: Object.freeze(['DynamicRouting']),
    dependencyPolicy: RouterDependencyPolicy.SCHEMA_ONLY,
    topology: RouterTopology.NODE,
    reliabilityPolicy: RouterReliabilityPolicy.SCHEMA_ONLY,
    routerCategory: RouterCategory.AI,
    selectionPolicy: RouterSelectionPolicy.SCHEMA_ONLY,
    transportPolicy: RouterTransportPolicy.SCHEMA_ONLY,
    securityPolicy: RouterSecurityPolicy.SCHEMA_ONLY,
    supportedCapabilities: Object.freeze([RouterCapability.APPLICATION, RouterCapability.AI, RouterCapability.WORKFLOW, RouterCapability.DISTRIBUTED, RouterCapability.INTER_NODE]),
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: MESSAGE_ROUTER_SEQUENCE
  }),
  Object.freeze({
    routerType: RuntimeMessageRouterType.PLUGIN_ROUTER,
    modelId: 'router-model-plugin-01',
    metadata: Object.freeze({
      id: 'router-meta-plugin-01',
      name: 'Plugin Router Metadata',
      routerModelVersion: '1.0',
      routerSchemaVersion: '1.0',
      description: 'Metadata for Plugin Router Schema'
    }),
    routerOrder: 4,
    supportedRoutingStrategies: Object.freeze([RoutingStrategy.MULTICAST]),
    supportedRoutingPolicies: Object.freeze([]),
    dependencyPolicy: RouterDependencyPolicy.NO_DEPENDENCY,
    topology: RouterTopology.CLUSTER,
    reliabilityPolicy: RouterReliabilityPolicy.AT_LEAST_ONCE,
    routerCategory: RouterCategory.PLUGIN,
    selectionPolicy: RouterSelectionPolicy.HASH,
    transportPolicy: RouterTransportPolicy.TCP,
    securityPolicy: RouterSecurityPolicy.ENCRYPTION,
    supportedCapabilities: Object.freeze([RouterCapability.PLUGIN, RouterCapability.MONITORING]),
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: MESSAGE_ROUTER_SEQUENCE
  }),
  Object.freeze({
    routerType: RuntimeMessageRouterType.FIELD_ROUTER,
    modelId: 'router-model-field-01',
    metadata: Object.freeze({
      id: 'router-meta-field-01',
      name: 'Field Router Metadata',
      routerModelVersion: '1.0',
      routerSchemaVersion: '1.0',
      description: 'Metadata for Field Router Schema'
    }),
    routerOrder: 5,
    supportedRoutingStrategies: Object.freeze([RoutingStrategy.DIRECT]),
    supportedRoutingPolicies: Object.freeze([]),
    dependencyPolicy: RouterDependencyPolicy.NO_DEPENDENCY,
    topology: RouterTopology.DISTRIBUTED,
    reliabilityPolicy: RouterReliabilityPolicy.EXACTLY_ONCE,
    routerCategory: RouterCategory.FIELD,
    selectionPolicy: RouterSelectionPolicy.CONSISTENT_HASH,
    transportPolicy: RouterTransportPolicy.HTTP,
    securityPolicy: RouterSecurityPolicy.AUTHENTICATION,
    supportedCapabilities: Object.freeze([RouterCapability.FIELD]),
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: MESSAGE_ROUTER_SEQUENCE
  })
]);

// 3. メタデータオブジェクトの作成と凍結
const routerMetadata: RouterMetadata = Object.freeze({
  id: 'runtime-router-meta-01',
  name: 'Execution Runtime Message Router Metadata',
  version: '1.0.0',
  description: 'Metadata for Execution Runtime Message Router Foundation',
  layer: 'Message Router Layer',
  category: 'Infrastructure'
});

// 4. コンテキストオブジェクトの作成と凍結 (ID 参照のみ、runtimeMessageRouterId のみ)
const routerContext: ExecutionRuntimeMessageRouterContext = Object.freeze({
  runtimeMessageRouterId: 'runtime-message-router-01'
});

// 5. データオブジェクトの作成と凍結
const routerData: ExecutionRuntimeMessageRouterData = Object.freeze({
  managerType: RouterType.FOUNDATION,
  managerScope: RouterScope.SYSTEM,
  routerModels: RUNTIME_MESSAGE_ROUTER_MODELS
});

// 6. ルーターマネージャーオブジェクト本体の作成と凍結
const runtimeRouterData: ExecutionRuntimeMessageRouter = Object.freeze({
  id: 'runtime-message-router-01',
  name: 'Default Execution Runtime Message Router Foundation',
  description: 'The static execution runtime message router structure definition',
  context: routerContext,
  metadata: routerMetadata,
  data: routerData
});

// Blueprint コンテナの不変シングルトンインスタンス実装
export const EXECUTION_RUNTIME_MESSAGE_ROUTER_BLUEPRINT: ExecutionRuntimeMessageRouterBlueprint = Object.freeze({
  getExecutionRuntimeMessageRouter(): ExecutionRuntimeMessageRouter {
    return runtimeRouterData;
  },

  getMetadata(): RouterMetadata {
    return runtimeRouterData.metadata;
  },

  getContext(): ExecutionRuntimeMessageRouterContext {
    return runtimeRouterData.context;
  },

  getData(): ExecutionRuntimeMessageRouterData {
    return runtimeRouterData.data;
  },

  getRouterModels(): readonly RuntimeMessageRouterModel[] {
    return RUNTIME_MESSAGE_ROUTER_MODELS;
  },

  getRouterSequence(): readonly string[] {
    return MESSAGE_ROUTER_SEQUENCE;
  }
});
