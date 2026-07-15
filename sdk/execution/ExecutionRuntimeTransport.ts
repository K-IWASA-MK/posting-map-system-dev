/**
 * ExecutionRuntimeTransport.ts
 * 
 * ExecutionRuntimeTransport Foundation の構造および公開インターフェース定義 (SSOT)。
 * 
 * 警告：本ファイル内への実際のトランスポート生成、接続、切断、送受信、Listen、Bind、
 * 非同期処理、API 通信、コマンド送信、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum TransportType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME'
}

export enum TransportScope {
  SYSTEM = 'SYSTEM'
}

export enum RuntimeTransportType {
  SYSTEM_TRANSPORT = 'SYSTEM_TRANSPORT',
  CORE_TRANSPORT = 'CORE_TRANSPORT',
  APPLICATION_TRANSPORT = 'APPLICATION_TRANSPORT',
  PLUGIN_TRANSPORT = 'PLUGIN_TRANSPORT',
  FIELD_TRANSPORT = 'FIELD_TRANSPORT'
}

export enum TransportLifecycleState {
  CREATED = 'CREATED',
  READY = 'READY',
  WAITING = 'WAITING',
  SEALED = 'SEALED',
  TERMINATED = 'TERMINATED'
}

export enum TransportCapability {
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

export enum TransportCategory {
  NETWORK = 'NETWORK',
  IPC = 'IPC',
  LOCAL = 'LOCAL',
  REMOTE = 'REMOTE',
  DISTRIBUTED = 'DISTRIBUTED',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum TransportProtocolPolicy {
  STATIC_ONLY = 'STATIC_ONLY',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum TransportConnectionPolicy {
  NO_CONNECTION = 'NO_CONNECTION',
  STATIC_REFERENCE = 'STATIC_REFERENCE',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum TransportValidationPolicy {
  NONE = 'NONE',
  HEADER_ONLY = 'HEADER_ONLY',
  SCHEMA = 'SCHEMA',
  FULL = 'FULL',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum TransportExecutionPolicy {
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
  NO_TRANSPORT_CREATE = 'NO_TRANSPORT_CREATE',
  NO_TRANSPORT_OPEN = 'NO_TRANSPORT_OPEN',
  NO_TRANSPORT_CLOSE = 'NO_TRANSPORT_CLOSE',
  NO_CONNECT = 'NO_CONNECT',
  NO_DISCONNECT = 'NO_DISCONNECT',
  NO_LISTEN = 'NO_LISTEN',
  NO_BIND = 'NO_BIND',
  NO_SEND = 'NO_SEND',
  NO_RECEIVE = 'NO_RECEIVE',
  NO_ROUTE = 'NO_ROUTE',
  NO_DISPATCH = 'NO_DISPATCH'
}

export enum TransportDependencyPolicy {
  NO_DEPENDENCY = 'NO_DEPENDENCY',
  STATIC_DEPENDENCY = 'STATIC_DEPENDENCY',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum TransportTopology {
  LOCAL = 'LOCAL',
  PROCESS = 'PROCESS',
  NODE = 'NODE',
  CLUSTER = 'CLUSTER',
  DISTRIBUTED = 'DISTRIBUTED'
}

export interface RuntimeTransportMetadata {
  readonly id: string;
  readonly name: string;
  readonly transportModelVersion: string;
  readonly transportSchemaVersion: string;
  readonly description: string;
}

export interface RuntimeTransportModel {
  readonly transportType: RuntimeTransportType;
  readonly modelId: string;
  readonly metadata: RuntimeTransportMetadata;
  readonly transportOrder: number;
  readonly supportedCapabilities: readonly TransportCapability[];
  readonly supportedTransportPolicies: readonly string[];
  readonly supportedValidationPolicies: readonly TransportValidationPolicy[];
  readonly supportedConnectionPolicies: readonly TransportConnectionPolicy[];
  readonly supportedProtocolPolicies: readonly TransportProtocolPolicy[];
  readonly dependencyPolicy: TransportDependencyPolicy;
  readonly topology: TransportTopology;
  readonly lifecycleStates: readonly TransportLifecycleState[];
  readonly executionPolicies: readonly TransportExecutionPolicy[];
  readonly allowedSteps: readonly string[];
}

export interface TransportMetadata {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly layer: string;
  readonly category: string;
}

export interface ExecutionRuntimeTransportContext {
  readonly runtimeTransportId: string;
}

export interface ExecutionRuntimeTransportData {
  readonly managerType: TransportType;
  readonly managerScope: TransportScope;
  readonly transportModels: readonly RuntimeTransportModel[];
}

export interface ExecutionRuntimeTransport {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly context: ExecutionRuntimeTransportContext;
  readonly metadata: TransportMetadata;
  readonly data: ExecutionRuntimeTransportData;
}

export interface ExecutionRuntimeTransportBlueprint {
  getExecutionRuntimeTransport(): ExecutionRuntimeTransport;
  getMetadata(): TransportMetadata;
  getContext(): ExecutionRuntimeTransportContext;
  getData(): ExecutionRuntimeTransportData;
  getTransportModels(): readonly RuntimeTransportModel[];
  getTransportSequence(): readonly string[];
}

// 1. 静的実行ステップシーケンスの定義と凍結
export const TRANSPORT_SEQUENCE: readonly string[] = Object.freeze([
  'REGISTER_TRANSPORT',
  'VALIDATE_TRANSPORT_SCHEMA',
  'INITIALIZE_TRANSPORT_BLUEPRINT',
  'READY_FOR_TRANSPORT_RUNTIME',
  'TRANSPORT_SCHEMA_CONFIRMED'
]);

// 静的ポリシーリストの定義と凍結
const defaultPolicies: readonly TransportExecutionPolicy[] = Object.freeze([
  TransportExecutionPolicy.READ_ONLY,
  TransportExecutionPolicy.DETERMINISTIC,
  TransportExecutionPolicy.IMMUTABLE_SCHEMA,
  TransportExecutionPolicy.NO_THREAD,
  TransportExecutionPolicy.NO_QUEUE,
  TransportExecutionPolicy.NO_TASK,
  TransportExecutionPolicy.NO_WORKER,
  TransportExecutionPolicy.NO_EVENT,
  TransportExecutionPolicy.NO_EVENT_BUS,
  TransportExecutionPolicy.NO_ROUTER,
  TransportExecutionPolicy.NO_TRANSPORT_CREATE,
  TransportExecutionPolicy.NO_TRANSPORT_OPEN,
  TransportExecutionPolicy.NO_TRANSPORT_CLOSE,
  TransportExecutionPolicy.NO_CONNECT,
  TransportExecutionPolicy.NO_DISCONNECT,
  TransportExecutionPolicy.NO_LISTEN,
  TransportExecutionPolicy.NO_BIND,
  TransportExecutionPolicy.NO_SEND,
  TransportExecutionPolicy.NO_RECEIVE,
  TransportExecutionPolicy.NO_ROUTE,
  TransportExecutionPolicy.NO_DISPATCH
]);

// 静的ライフサイクル状態リストの定義と凍結
const defaultLifecycleStates: readonly TransportLifecycleState[] = Object.freeze([
  TransportLifecycleState.CREATED,
  TransportLifecycleState.READY,
  TransportLifecycleState.WAITING,
  TransportLifecycleState.SEALED,
  TransportLifecycleState.TERMINATED
]);

// 2. 静的トランスポートモデルリストの定義と凍結
export const RUNTIME_TRANSPORT_MODELS: readonly RuntimeTransportModel[] = Object.freeze([
  Object.freeze({
    transportType: RuntimeTransportType.SYSTEM_TRANSPORT,
    modelId: 'transport-model-system-01',
    metadata: Object.freeze({
      id: 'transport-meta-system-01',
      name: 'SystemTransportMetadata',
      transportModelVersion: '1.0',
      transportSchemaVersion: '1.0',
      description: 'Metadata for SystemTransport Schema'
    }),
    transportOrder: 1,
    supportedCapabilities: Object.freeze([TransportCapability.SYSTEM, TransportCapability.REMOTE, TransportCapability.LOCAL]),
    supportedTransportPolicies: Object.freeze(['StaticRouting']),
    supportedValidationPolicies: Object.freeze([TransportValidationPolicy.SCHEMA_ONLY]),
    supportedConnectionPolicies: Object.freeze([TransportConnectionPolicy.SCHEMA_ONLY]),
    supportedProtocolPolicies: Object.freeze([TransportProtocolPolicy.SCHEMA_ONLY]),
    dependencyPolicy: TransportDependencyPolicy.NO_DEPENDENCY,
    topology: TransportTopology.LOCAL,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: TRANSPORT_SEQUENCE
  }),
  Object.freeze({
    transportType: RuntimeTransportType.CORE_TRANSPORT,
    modelId: 'transport-model-core-01',
    metadata: Object.freeze({
      id: 'transport-meta-core-01',
      name: 'CoreTransportMetadata',
      transportModelVersion: '1.0',
      transportSchemaVersion: '1.0',
      description: 'Metadata for CoreTransport Schema'
    }),
    transportOrder: 2,
    supportedCapabilities: Object.freeze([TransportCapability.SYSTEM, TransportCapability.APPLICATION, TransportCapability.INTER_PROCESS]),
    supportedTransportPolicies: Object.freeze([]),
    supportedValidationPolicies: Object.freeze([TransportValidationPolicy.HEADER_ONLY, TransportValidationPolicy.SCHEMA_ONLY]),
    supportedConnectionPolicies: Object.freeze([TransportConnectionPolicy.SCHEMA_ONLY]),
    supportedProtocolPolicies: Object.freeze([TransportProtocolPolicy.SCHEMA_ONLY]),
    dependencyPolicy: TransportDependencyPolicy.STATIC_DEPENDENCY,
    topology: TransportTopology.PROCESS,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: TRANSPORT_SEQUENCE
  }),
  Object.freeze({
    transportType: RuntimeTransportType.APPLICATION_TRANSPORT,
    modelId: 'transport-model-app-01',
    metadata: Object.freeze({
      id: 'transport-meta-app-01',
      name: 'ApplicationTransportMetadata',
      transportModelVersion: '1.0',
      transportSchemaVersion: '1.0',
      description: 'Metadata for ApplicationTransport Schema'
    }),
    transportOrder: 3,
    supportedCapabilities: Object.freeze([TransportCapability.APPLICATION, TransportCapability.AI, TransportCapability.WORKFLOW, TransportCapability.DISTRIBUTED, TransportCapability.INTER_NODE]),
    supportedTransportPolicies: Object.freeze(['DynamicRouting']),
    supportedValidationPolicies: Object.freeze([TransportValidationPolicy.FULL, TransportValidationPolicy.SCHEMA_ONLY]),
    supportedConnectionPolicies: Object.freeze([TransportConnectionPolicy.SCHEMA_ONLY]),
    supportedProtocolPolicies: Object.freeze([TransportProtocolPolicy.SCHEMA_ONLY]),
    dependencyPolicy: TransportDependencyPolicy.SCHEMA_ONLY,
    topology: TransportTopology.NODE,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: TRANSPORT_SEQUENCE
  }),
  Object.freeze({
    transportType: RuntimeTransportType.PLUGIN_TRANSPORT,
    modelId: 'transport-model-plugin-01',
    metadata: Object.freeze({
      id: 'transport-meta-plugin-01',
      name: 'PluginTransportMetadata',
      transportModelVersion: '1.0',
      transportSchemaVersion: '1.0',
      description: 'Metadata for PluginTransport Schema'
    }),
    transportOrder: 4,
    supportedCapabilities: Object.freeze([TransportCapability.PLUGIN, TransportCapability.MONITORING]),
    supportedTransportPolicies: Object.freeze([]),
    supportedValidationPolicies: Object.freeze([TransportValidationPolicy.SCHEMA, TransportValidationPolicy.SCHEMA_ONLY]),
    supportedConnectionPolicies: Object.freeze([TransportConnectionPolicy.SCHEMA_ONLY]),
    supportedProtocolPolicies: Object.freeze([TransportProtocolPolicy.SCHEMA_ONLY]),
    dependencyPolicy: TransportDependencyPolicy.NO_DEPENDENCY,
    topology: TransportTopology.CLUSTER,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: TRANSPORT_SEQUENCE
  }),
  Object.freeze({
    transportType: RuntimeTransportType.FIELD_TRANSPORT,
    modelId: 'transport-model-field-01',
    metadata: Object.freeze({
      id: 'transport-meta-field-01',
      name: 'FieldTransportMetadata',
      transportModelVersion: '1.0',
      transportSchemaVersion: '1.0',
      description: 'Metadata for FieldTransport Schema'
    }),
    transportOrder: 5,
    supportedCapabilities: Object.freeze([TransportCapability.FIELD]),
    supportedTransportPolicies: Object.freeze([]),
    supportedValidationPolicies: Object.freeze([TransportValidationPolicy.FULL, TransportValidationPolicy.SCHEMA_ONLY]),
    supportedConnectionPolicies: Object.freeze([TransportConnectionPolicy.SCHEMA_ONLY]),
    supportedProtocolPolicies: Object.freeze([TransportProtocolPolicy.SCHEMA_ONLY]),
    dependencyPolicy: TransportDependencyPolicy.NO_DEPENDENCY,
    topology: TransportTopology.DISTRIBUTED,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: TRANSPORT_SEQUENCE
  })
]);

// 3. メタデータオブジェクトの作成と凍結
const transportMetadata: TransportMetadata = Object.freeze({
  id: 'runtime-transport-meta-01',
  name: 'ExecutionRuntimeTransportMetadata',
  version: '1.0.0',
  description: 'Metadata for ExecutionRuntimeTransport Foundation',
  layer: 'TransportLayer',
  category: 'Infrastructure'
});

// 4. コンテキストオブジェクトの作成と凍結 (ID 参照のみ、runtimeTransportId のみ)
const transportContext: ExecutionRuntimeTransportContext = Object.freeze({
  runtimeTransportId: 'runtime-transport-01'
});

// 5. データオブジェクトの作成と凍結
const transportData: ExecutionRuntimeTransportData = Object.freeze({
  managerType: TransportType.FOUNDATION,
  managerScope: TransportScope.SYSTEM,
  transportModels: RUNTIME_TRANSPORT_MODELS
});

// 6. 主体マネージャーオブジェクト本体の作成と凍結
const runtimeTransportObj: ExecutionRuntimeTransport = Object.freeze({
  id: 'runtime-transport-01',
  name: 'DefaultExecutionRuntimeTransport Foundation',
  description: 'The static execution-runtime-transport structure definition',
  context: transportContext,
  metadata: transportMetadata,
  data: transportData
});

// Blueprint コンテナの不変シングルトンインスタンス実装 (型固定の適用)
export const EXECUTION_RUNTIME_TRANSPORT_BLUEPRINT: Readonly<ExecutionRuntimeTransportBlueprint> = Object.freeze({
  getExecutionRuntimeTransport(): ExecutionRuntimeTransport {
    return runtimeTransportObj;
  },

  getMetadata(): TransportMetadata {
    return runtimeTransportObj.metadata;
  },

  getContext(): ExecutionRuntimeTransportContext {
    return runtimeTransportObj.context;
  },

  getData(): ExecutionRuntimeTransportData {
    return runtimeTransportObj.data;
  },

  getTransportModels(): readonly RuntimeTransportModel[] {
    return RUNTIME_TRANSPORT_MODELS;
  },

  getTransportSequence(): readonly string[] {
    return TRANSPORT_SEQUENCE;
  }
});
