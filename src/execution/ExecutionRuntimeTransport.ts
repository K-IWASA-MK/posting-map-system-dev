/**
 * ExecutionRuntimeTransport.ts
 * 
 * Execution Runtime Transport Foundation の構造および公開インターフェース定義 (SSOT)。
 * 
 * 警告：本ファイル内への実際の接続、切断、送信、受信、伝送、ストリーム生成、再送、
 * リトライ、暗号化・復号、圧縮・展開、非同期処理、API 通信、コマンド送信、AI予測・推論・自動配置ロジックの実装は厳禁である。
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
  AI = 'AI',
  WORKFLOW = 'WORKFLOW',
  MONITORING = 'MONITORING',
  LOCAL = 'LOCAL',
  REMOTE = 'REMOTE',
  DISTRIBUTED = 'DISTRIBUTED',
  INTER_PROCESS = 'INTER_PROCESS',
  INTER_NODE = 'INTER_NODE'
}

export enum TransportCategory {
  LOCAL = 'LOCAL',
  IPC = 'IPC',
  NETWORK = 'NETWORK',
  REMOTE = 'REMOTE',
  DISTRIBUTED = 'DISTRIBUTED'
}

export enum TransportProtocolPolicy {
  LOCAL = 'LOCAL',
  IPC = 'IPC',
  TCP = 'TCP',
  UDP = 'UDP',
  HTTP = 'HTTP',
  HTTPS = 'HTTPS',
  WEBSOCKET = 'WEBSOCKET',
  GRPC = 'GRPC',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum TransportReliabilityPolicy {
  BEST_EFFORT = 'BEST_EFFORT',
  AT_MOST_ONCE = 'AT_MOST_ONCE',
  AT_LEAST_ONCE = 'AT_LEAST_ONCE',
  EXACTLY_ONCE = 'EXACTLY_ONCE',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum TransportSecurityPolicy {
  NONE = 'NONE',
  SIGNATURE = 'SIGNATURE',
  ENCRYPTION = 'ENCRYPTION',
  AUTHENTICATION = 'AUTHENTICATION',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum TransportExecutionPolicy {
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
  NO_ROUTER = 'NO_ROUTER',
  NO_CONNECTION = 'NO_CONNECTION',
  NO_SOCKET = 'NO_SOCKET',
  NO_STREAM = 'NO_STREAM',
  NO_TRANSMISSION = 'NO_TRANSMISSION',
  NO_SEND = 'NO_SEND',
  NO_RECEIVE = 'NO_RECEIVE',
  NO_RETRY = 'NO_RETRY',
  NO_ENCRYPTION = 'NO_ENCRYPTION'
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
  readonly supportedTransportProtocols: readonly TransportProtocolPolicy[];
  readonly supportedSecurityPolicies: readonly TransportSecurityPolicy[];
  readonly supportedReliabilityPolicies: readonly TransportReliabilityPolicy[];
  readonly supportedTransportPolicies: readonly string[];
  readonly supportedConnectionPolicies: readonly string[];
  readonly supportedProtocolPolicies: readonly string[];
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
  TransportExecutionPolicy.NO_SCHEDULER,
  TransportExecutionPolicy.NO_TASK,
  TransportExecutionPolicy.NO_WORKER,
  TransportExecutionPolicy.NO_DISPATCHER,
  TransportExecutionPolicy.NO_EVENT,
  TransportExecutionPolicy.NO_EVENT_BUS,
  TransportExecutionPolicy.NO_ROUTER,
  TransportExecutionPolicy.NO_CONNECTION,
  TransportExecutionPolicy.NO_SOCKET,
  TransportExecutionPolicy.NO_STREAM,
  TransportExecutionPolicy.NO_TRANSMISSION,
  TransportExecutionPolicy.NO_SEND,
  TransportExecutionPolicy.NO_RECEIVE,
  TransportExecutionPolicy.NO_RETRY,
  TransportExecutionPolicy.NO_ENCRYPTION
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
      name: 'System Transport Metadata',
      transportModelVersion: '1.0',
      transportSchemaVersion: '1.0',
      description: 'Metadata for System Transport Schema'
    }),
    transportOrder: 1,
    supportedTransportProtocols: Object.freeze([TransportProtocolPolicy.LOCAL]),
    supportedSecurityPolicies: Object.freeze([TransportSecurityPolicy.NONE]),
    supportedReliabilityPolicies: Object.freeze([TransportReliabilityPolicy.BEST_EFFORT]),
    supportedTransportPolicies: Object.freeze(['StaticRouting']),
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedProtocolPolicies: Object.freeze(['SCHEMA_ONLY']),
    dependencyPolicy: TransportDependencyPolicy.NO_DEPENDENCY,
    topology: TransportTopology.LOCAL,
    supportedCapabilities: Object.freeze([TransportCapability.SYSTEM, TransportCapability.REMOTE, TransportCapability.LOCAL]),
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: TRANSPORT_SEQUENCE
  }),
  Object.freeze({
    transportType: RuntimeTransportType.CORE_TRANSPORT,
    modelId: 'transport-model-core-01',
    metadata: Object.freeze({
      id: 'transport-meta-core-01',
      name: 'Core Transport Metadata',
      transportModelVersion: '1.0',
      transportSchemaVersion: '1.0',
      description: 'Metadata for Core Transport Schema'
    }),
    transportOrder: 2,
    supportedTransportProtocols: Object.freeze([TransportProtocolPolicy.IPC]),
    supportedSecurityPolicies: Object.freeze([TransportSecurityPolicy.SIGNATURE]),
    supportedReliabilityPolicies: Object.freeze([TransportReliabilityPolicy.AT_MOST_ONCE]),
    supportedTransportPolicies: Object.freeze([]),
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedProtocolPolicies: Object.freeze(['SCHEMA_ONLY']),
    dependencyPolicy: TransportDependencyPolicy.STATIC_DEPENDENCY,
    topology: TransportTopology.PROCESS,
    supportedCapabilities: Object.freeze([TransportCapability.SYSTEM, TransportCapability.APPLICATION, TransportCapability.INTER_PROCESS]),
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: TRANSPORT_SEQUENCE
  }),
  Object.freeze({
    transportType: RuntimeTransportType.APPLICATION_TRANSPORT,
    modelId: 'transport-model-app-01',
    metadata: Object.freeze({
      id: 'transport-meta-app-01',
      name: 'Application Transport Metadata',
      transportModelVersion: '1.0',
      transportSchemaVersion: '1.0',
      description: 'Metadata for Application Transport Schema'
    }),
    transportOrder: 3,
    supportedTransportProtocols: Object.freeze([TransportProtocolPolicy.WEBSOCKET, TransportProtocolPolicy.GRPC]),
    supportedSecurityPolicies: Object.freeze([TransportSecurityPolicy.SCHEMA_ONLY]),
    supportedReliabilityPolicies: Object.freeze([TransportReliabilityPolicy.SCHEMA_ONLY]),
    supportedTransportPolicies: Object.freeze(['DynamicRouting']),
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedProtocolPolicies: Object.freeze(['SCHEMA_ONLY']),
    dependencyPolicy: TransportDependencyPolicy.SCHEMA_ONLY,
    topology: TransportTopology.NODE,
    supportedCapabilities: Object.freeze([TransportCapability.APPLICATION, TransportCapability.AI, TransportCapability.WORKFLOW, TransportCapability.DISTRIBUTED, TransportCapability.INTER_NODE]),
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: TRANSPORT_SEQUENCE
  }),
  Object.freeze({
    transportType: RuntimeTransportType.PLUGIN_TRANSPORT,
    modelId: 'transport-model-plugin-01',
    metadata: Object.freeze({
      id: 'transport-meta-plugin-01',
      name: 'Plugin Transport Metadata',
      transportModelVersion: '1.0',
      transportSchemaVersion: '1.0',
      description: 'Metadata for Plugin Transport Schema'
    }),
    transportOrder: 4,
    supportedTransportProtocols: Object.freeze([TransportProtocolPolicy.TCP]),
    supportedSecurityPolicies: Object.freeze([TransportSecurityPolicy.ENCRYPTION]),
    supportedReliabilityPolicies: Object.freeze([TransportReliabilityPolicy.AT_LEAST_ONCE]),
    supportedTransportPolicies: Object.freeze([]),
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedProtocolPolicies: Object.freeze(['SCHEMA_ONLY']),
    dependencyPolicy: TransportDependencyPolicy.NO_DEPENDENCY,
    topology: TransportTopology.CLUSTER,
    supportedCapabilities: Object.freeze([TransportCapability.PLUGIN, TransportCapability.MONITORING]),
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: TRANSPORT_SEQUENCE
  }),
  Object.freeze({
    transportType: RuntimeTransportType.FIELD_TRANSPORT,
    modelId: 'transport-model-field-01',
    metadata: Object.freeze({
      id: 'transport-meta-field-01',
      name: 'Field Transport Metadata',
      transportModelVersion: '1.0',
      transportSchemaVersion: '1.0',
      description: 'Metadata for Field Transport Schema'
    }),
    transportOrder: 5,
    supportedTransportProtocols: Object.freeze([TransportProtocolPolicy.HTTP, TransportProtocolPolicy.HTTPS]),
    supportedSecurityPolicies: Object.freeze([TransportSecurityPolicy.AUTHENTICATION]),
    supportedReliabilityPolicies: Object.freeze([TransportReliabilityPolicy.EXACTLY_ONCE]),
    supportedTransportPolicies: Object.freeze([]),
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedProtocolPolicies: Object.freeze(['SCHEMA_ONLY']),
    dependencyPolicy: TransportDependencyPolicy.NO_DEPENDENCY,
    topology: TransportTopology.DISTRIBUTED,
    supportedCapabilities: Object.freeze([TransportCapability.FIELD]),
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: TRANSPORT_SEQUENCE
  })
]);

// 3. メタデータオブジェクトの作成と凍結
const transportMetadata: TransportMetadata = Object.freeze({
  id: 'runtime-transport-meta-01',
  name: 'Execution Runtime Transport Metadata',
  version: '1.0.0',
  description: 'Metadata for Execution Runtime Transport Foundation',
  layer: 'Transport Layer',
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

// 6. トランスポートマネージャーオブジェクト本体の作成と凍結
const runtimeTransportData: ExecutionRuntimeTransport = Object.freeze({
  id: 'runtime-transport-01',
  name: 'Default Execution Runtime Transport Foundation',
  description: 'The static execution runtime transport structure definition',
  context: transportContext,
  metadata: transportMetadata,
  data: transportData
});

// Blueprint コンテナの不変シングルトンインスタンス実装
export const EXECUTION_RUNTIME_TRANSPORT_BLUEPRINT: ExecutionRuntimeTransportBlueprint = Object.freeze({
  getExecutionRuntimeTransport(): ExecutionRuntimeTransport {
    return runtimeTransportData;
  },

  getMetadata(): TransportMetadata {
    return runtimeTransportData.metadata;
  },

  getContext(): ExecutionRuntimeTransportContext {
    return runtimeTransportData.context;
  },

  getData(): ExecutionRuntimeTransportData {
    return runtimeTransportData.data;
  },

  getTransportModels(): readonly RuntimeTransportModel[] {
    return RUNTIME_TRANSPORT_MODELS;
  },

  getTransportSequence(): readonly string[] {
    return TRANSPORT_SEQUENCE;
  }
});
