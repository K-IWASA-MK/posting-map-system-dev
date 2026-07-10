/**
 * ExecutionRuntimeProtocol.ts
 * 
 * Execution Runtime Protocol Foundation の構造および公開インターフェース定義 (SSOT)。
 * 
 * 警告：本ファイル内への実際のプロトコル交渉、ネゴシエーション、シリアライズ、デシリアライズ、
 * パケット生成、フレーム生成、エンコード、デコード、通信開始、ソケット・コネクション操作、
 * 非同期処理、API 通信、コマンド送信、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum ProtocolType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME'
}

export enum ProtocolScope {
  SYSTEM = 'SYSTEM'
}

export enum RuntimeProtocolType {
  SYSTEM_PROTOCOL = 'SYSTEM_PROTOCOL',
  CORE_PROTOCOL = 'CORE_PROTOCOL',
  APPLICATION_PROTOCOL = 'APPLICATION_PROTOCOL',
  PLUGIN_PROTOCOL = 'PLUGIN_PROTOCOL',
  FIELD_PROTOCOL = 'FIELD_PROTOCOL'
}

export enum ProtocolLifecycleState {
  CREATED = 'CREATED',
  READY = 'READY',
  WAITING = 'WAITING',
  SEALED = 'SEALED',
  TERMINATED = 'TERMINATED'
}

export enum ProtocolCapability {
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

export enum ProtocolCategory {
  IPC = 'IPC',
  TCP = 'TCP',
  UDP = 'UDP',
  HTTP = 'HTTP',
  HTTPS = 'HTTPS',
  WEBSOCKET = 'WEBSOCKET',
  GRPC = 'GRPC',
  CUSTOM = 'CUSTOM'
}

export enum ProtocolVersionPolicy {
  STATIC = 'STATIC',
  VERSIONED = 'VERSIONED',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum ProtocolSerializationPolicy {
  JSON = 'JSON',
  BINARY = 'BINARY',
  PROTOBUF = 'PROTOBUF',
  MSGPACK = 'MSGPACK',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum ProtocolMessageFormatPolicy {
  TEXT = 'TEXT',
  BINARY = 'BINARY',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum ProtocolCompatibilityPolicy {
  STRICT = 'STRICT',
  BACKWARD_COMPATIBLE = 'BACKWARD_COMPATIBLE',
  FORWARD_COMPATIBLE = 'FORWARD_COMPATIBLE',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum ProtocolValidationPolicy {
  NONE = 'NONE',
  SCHEMA_ONLY = 'SCHEMA_ONLY',
  STRICT_SCHEMA = 'STRICT_SCHEMA'
}

export enum ProtocolExecutionPolicy {
  READ_ONLY = 'READ_ONLY',
  DETERMINISTIC = 'DETERMINISTIC',
  IMMUTABLE_SCHEMA = 'IMMUTABLE_SCHEMA',
  NO_THREAD = 'NO_THREAD',
  NO_QUEUE = 'NO_QUEUE',
  NO_TASK = 'NO_TASK',
  NO_WORKER = 'NO_WORKER',
  NO_DISPATCHER = 'NO_DISPATCHER',
  NO_EVENT = 'NO_EVENT',
  NO_EVENT_BUS = 'NO_EVENT_BUS',
  NO_ROUTER = 'NO_ROUTER',
  NO_TRANSPORT = 'NO_TRANSPORT',
  NO_CONNECTION = 'NO_CONNECTION',
  NO_SOCKET = 'NO_SOCKET',
  NO_PACKET = 'NO_PACKET',
  NO_FRAME = 'NO_FRAME',
  NO_SERIALIZATION = 'NO_SERIALIZATION',
  NO_DESERIALIZATION = 'NO_DESERIALIZATION',
  NO_NEGOTIATION = 'NO_NEGOTIATION'
}

export enum ProtocolDependencyPolicy {
  NO_DEPENDENCY = 'NO_DEPENDENCY',
  STATIC_DEPENDENCY = 'STATIC_DEPENDENCY',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum ProtocolTopology {
  LOCAL = 'LOCAL',
  PROCESS = 'PROCESS',
  NODE = 'NODE',
  CLUSTER = 'CLUSTER',
  DISTRIBUTED = 'DISTRIBUTED'
}

export interface RuntimeProtocolMetadata {
  readonly id: string;
  readonly name: string;
  readonly protocolModelVersion: string;
  readonly protocolSchemaVersion: string;
  readonly description: string;
}

export interface RuntimeProtocolModel {
  readonly protocolType: RuntimeProtocolType;
  readonly modelId: string;
  readonly metadata: RuntimeProtocolMetadata;
  readonly protocolOrder: number;
  readonly supportedCapabilities: readonly ProtocolCapability[];
  readonly supportedProtocolPolicies: readonly string[];
  readonly supportedSerializationPolicies: readonly ProtocolSerializationPolicy[];
  readonly supportedVersionPolicies: readonly ProtocolVersionPolicy[];
  readonly supportedMessageFormatPolicies: readonly ProtocolMessageFormatPolicy[];
  readonly supportedCompatibilityPolicies: readonly ProtocolCompatibilityPolicy[];
  readonly supportedValidationPolicies: readonly ProtocolValidationPolicy[];
  readonly dependencyPolicy: ProtocolDependencyPolicy;
  readonly topology: ProtocolTopology;
  readonly lifecycleStates: readonly ProtocolLifecycleState[];
  readonly executionPolicies: readonly ProtocolExecutionPolicy[];
  readonly allowedSteps: readonly string[];
  readonly supportedConnectionPolicies: readonly string[];
  readonly supportedTransportPolicies: readonly string[];
}

export interface ProtocolMetadata {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly layer: string;
  readonly category: string;
}

export interface ExecutionRuntimeProtocolContext {
  readonly runtimeProtocolId: string;
}

export interface ExecutionRuntimeProtocolData {
  readonly managerType: ProtocolType;
  readonly managerScope: ProtocolScope;
  readonly protocolModels: readonly RuntimeProtocolModel[];
}

export interface ExecutionRuntimeProtocol {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly context: ExecutionRuntimeProtocolContext;
  readonly metadata: ProtocolMetadata;
  readonly data: ExecutionRuntimeProtocolData;
}

export interface ExecutionRuntimeProtocolBlueprint {
  getExecutionRuntimeProtocol(): ExecutionRuntimeProtocol;
  getMetadata(): ProtocolMetadata;
  getContext(): ExecutionRuntimeProtocolContext;
  getData(): ExecutionRuntimeProtocolData;
  getProtocolModels(): readonly RuntimeProtocolModel[];
  getProtocolSequence(): readonly string[];
}

// 1. 静的実行ステップシーケンスの定義と凍結
export const PROTOCOL_SEQUENCE: readonly string[] = Object.freeze([
  'REGISTER_PROTOCOL',
  'VALIDATE_PROTOCOL_SCHEMA',
  'INITIALIZE_PROTOCOL_BLUEPRINT',
  'READY_FOR_PROTOCOL_RUNTIME',
  'PROTOCOL_SCHEMA_CONFIRMED'
]);

// 静的ポリシーリストの定義と凍結
const defaultPolicies: readonly ProtocolExecutionPolicy[] = Object.freeze([
  ProtocolExecutionPolicy.READ_ONLY,
  ProtocolExecutionPolicy.DETERMINISTIC,
  ProtocolExecutionPolicy.IMMUTABLE_SCHEMA,
  ProtocolExecutionPolicy.NO_THREAD,
  ProtocolExecutionPolicy.NO_QUEUE,
  ProtocolExecutionPolicy.NO_TASK,
  ProtocolExecutionPolicy.NO_WORKER,
  ProtocolExecutionPolicy.NO_DISPATCHER,
  ProtocolExecutionPolicy.NO_EVENT,
  ProtocolExecutionPolicy.NO_EVENT_BUS,
  ProtocolExecutionPolicy.NO_ROUTER,
  ProtocolExecutionPolicy.NO_TRANSPORT,
  ProtocolExecutionPolicy.NO_CONNECTION,
  ProtocolExecutionPolicy.NO_SOCKET,
  ProtocolExecutionPolicy.NO_PACKET,
  ProtocolExecutionPolicy.NO_FRAME,
  ProtocolExecutionPolicy.NO_SERIALIZATION,
  ProtocolExecutionPolicy.NO_DESERIALIZATION,
  ProtocolExecutionPolicy.NO_NEGOTIATION
]);

// 静的ライフサイクル状態リストの定義と凍結
const defaultLifecycleStates: readonly ProtocolLifecycleState[] = Object.freeze([
  ProtocolLifecycleState.CREATED,
  ProtocolLifecycleState.READY,
  ProtocolLifecycleState.WAITING,
  ProtocolLifecycleState.SEALED,
  ProtocolLifecycleState.TERMINATED
]);

// 2. 静的プロトコルモデルリストの定義と凍結
export const RUNTIME_PROTOCOL_MODELS: readonly RuntimeProtocolModel[] = Object.freeze([
  Object.freeze({
    protocolType: RuntimeProtocolType.SYSTEM_PROTOCOL,
    modelId: 'protocol-model-system-01',
    metadata: Object.freeze({
      id: 'protocol-meta-system-01',
      name: 'System Protocol Metadata',
      protocolModelVersion: '1.0',
      protocolSchemaVersion: '1.0',
      description: 'Metadata for System Protocol Schema'
    }),
    protocolOrder: 1,
    supportedProtocolPolicies: Object.freeze(['StaticRouting']),
    supportedSerializationPolicies: Object.freeze([ProtocolSerializationPolicy.JSON]),
    supportedVersionPolicies: Object.freeze([ProtocolVersionPolicy.STATIC]),
    supportedMessageFormatPolicies: Object.freeze([ProtocolMessageFormatPolicy.TEXT]),
    supportedCompatibilityPolicies: Object.freeze([ProtocolCompatibilityPolicy.STRICT]),
    supportedValidationPolicies: Object.freeze([ProtocolValidationPolicy.SCHEMA_ONLY]),
    dependencyPolicy: ProtocolDependencyPolicy.NO_DEPENDENCY,
    topology: ProtocolTopology.LOCAL,
    supportedCapabilities: Object.freeze([ProtocolCapability.SYSTEM, ProtocolCapability.REMOTE, ProtocolCapability.LOCAL]),
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: PROTOCOL_SEQUENCE,
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedTransportPolicies: Object.freeze(['SCHEMA_ONLY'])
  }),
  Object.freeze({
    protocolType: RuntimeProtocolType.CORE_PROTOCOL,
    modelId: 'protocol-model-core-01',
    metadata: Object.freeze({
      id: 'protocol-meta-core-01',
      name: 'Core Protocol Metadata',
      protocolModelVersion: '1.0',
      protocolSchemaVersion: '1.0',
      description: 'Metadata for Core Protocol Schema'
    }),
    protocolOrder: 2,
    supportedProtocolPolicies: Object.freeze([]),
    supportedSerializationPolicies: Object.freeze([ProtocolSerializationPolicy.BINARY]),
    supportedVersionPolicies: Object.freeze([ProtocolVersionPolicy.VERSIONED]),
    supportedMessageFormatPolicies: Object.freeze([ProtocolMessageFormatPolicy.BINARY]),
    supportedCompatibilityPolicies: Object.freeze([ProtocolCompatibilityPolicy.BACKWARD_COMPATIBLE]),
    supportedValidationPolicies: Object.freeze([ProtocolValidationPolicy.STRICT_SCHEMA]),
    dependencyPolicy: ProtocolDependencyPolicy.STATIC_DEPENDENCY,
    topology: ProtocolTopology.PROCESS,
    supportedCapabilities: Object.freeze([ProtocolCapability.SYSTEM, ProtocolCapability.APPLICATION, ProtocolCapability.INTER_PROCESS]),
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: PROTOCOL_SEQUENCE,
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedTransportPolicies: Object.freeze(['SCHEMA_ONLY'])
  }),
  Object.freeze({
    protocolType: RuntimeProtocolType.APPLICATION_PROTOCOL,
    modelId: 'protocol-model-app-01',
    metadata: Object.freeze({
      id: 'protocol-meta-app-01',
      name: 'Application Protocol Metadata',
      protocolModelVersion: '1.0',
      protocolSchemaVersion: '1.0',
      description: 'Metadata for Application Protocol Schema'
    }),
    protocolOrder: 3,
    supportedProtocolPolicies: Object.freeze(['DynamicRouting']),
    supportedSerializationPolicies: Object.freeze([ProtocolSerializationPolicy.PROTOBUF]),
    supportedVersionPolicies: Object.freeze([ProtocolVersionPolicy.SCHEMA_ONLY]),
    supportedMessageFormatPolicies: Object.freeze([ProtocolMessageFormatPolicy.SCHEMA_ONLY]),
    supportedCompatibilityPolicies: Object.freeze([ProtocolCompatibilityPolicy.SCHEMA_ONLY]),
    supportedValidationPolicies: Object.freeze([ProtocolValidationPolicy.NONE]),
    dependencyPolicy: ProtocolDependencyPolicy.SCHEMA_ONLY,
    topology: ProtocolTopology.NODE,
    supportedCapabilities: Object.freeze([ProtocolCapability.APPLICATION, ProtocolCapability.AI, ProtocolCapability.WORKFLOW, ProtocolCapability.DISTRIBUTED, ProtocolCapability.INTER_NODE]),
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: PROTOCOL_SEQUENCE,
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedTransportPolicies: Object.freeze(['SCHEMA_ONLY'])
  }),
  Object.freeze({
    protocolType: RuntimeProtocolType.PLUGIN_PROTOCOL,
    modelId: 'protocol-model-plugin-01',
    metadata: Object.freeze({
      id: 'protocol-meta-plugin-01',
      name: 'Plugin Protocol Metadata',
      protocolModelVersion: '1.0',
      protocolSchemaVersion: '1.0',
      description: 'Metadata for Plugin Protocol Schema'
    }),
    protocolOrder: 4,
    supportedProtocolPolicies: Object.freeze([]),
    supportedSerializationPolicies: Object.freeze([ProtocolSerializationPolicy.MSGPACK]),
    supportedVersionPolicies: Object.freeze([ProtocolVersionPolicy.STATIC]),
    supportedMessageFormatPolicies: Object.freeze([ProtocolMessageFormatPolicy.SCHEMA_ONLY]),
    supportedCompatibilityPolicies: Object.freeze([ProtocolCompatibilityPolicy.FORWARD_COMPATIBLE]),
    supportedValidationPolicies: Object.freeze([ProtocolValidationPolicy.SCHEMA_ONLY]),
    dependencyPolicy: ProtocolDependencyPolicy.NO_DEPENDENCY,
    topology: ProtocolTopology.CLUSTER,
    supportedCapabilities: Object.freeze([ProtocolCapability.PLUGIN, ProtocolCapability.MONITORING]),
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: PROTOCOL_SEQUENCE,
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedTransportPolicies: Object.freeze(['SCHEMA_ONLY'])
  }),
  Object.freeze({
    protocolType: RuntimeProtocolType.FIELD_PROTOCOL,
    modelId: 'protocol-model-field-01',
    metadata: Object.freeze({
      id: 'protocol-meta-field-01',
      name: 'Field Protocol Metadata',
      protocolModelVersion: '1.0',
      protocolSchemaVersion: '1.0',
      description: 'Metadata for Field Protocol Schema'
    }),
    protocolOrder: 5,
    supportedProtocolPolicies: Object.freeze([]),
    supportedSerializationPolicies: Object.freeze([ProtocolSerializationPolicy.JSON]),
    supportedVersionPolicies: Object.freeze([ProtocolVersionPolicy.VERSIONED]),
    supportedMessageFormatPolicies: Object.freeze([ProtocolMessageFormatPolicy.TEXT]),
    supportedCompatibilityPolicies: Object.freeze([ProtocolCompatibilityPolicy.SCHEMA_ONLY]),
    supportedValidationPolicies: Object.freeze([ProtocolValidationPolicy.STRICT_SCHEMA]),
    dependencyPolicy: ProtocolDependencyPolicy.NO_DEPENDENCY,
    topology: ProtocolTopology.DISTRIBUTED,
    supportedCapabilities: Object.freeze([ProtocolCapability.FIELD]),
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: PROTOCOL_SEQUENCE,
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedTransportPolicies: Object.freeze(['SCHEMA_ONLY'])
  })
]);

// 3. メタデータオブジェクトの作成と凍結
const protocolMetadata: ProtocolMetadata = Object.freeze({
  id: 'runtime-protocol-meta-01',
  name: 'Execution Runtime Protocol Metadata',
  version: '1.0.0',
  description: 'Metadata for Execution Runtime Protocol Foundation',
  layer: 'Protocol Layer',
  category: 'Infrastructure'
});

// 4. コンテキストオブジェクトの作成と凍結 (ID 参照のみ、runtimeProtocolId のみ)
const protocolContext: ExecutionRuntimeProtocolContext = Object.freeze({
  runtimeProtocolId: 'runtime-protocol-01'
});

// 5. データオブジェクトの作成と凍結
const protocolData: ExecutionRuntimeProtocolData = Object.freeze({
  managerType: ProtocolType.FOUNDATION,
  managerScope: ProtocolScope.SYSTEM,
  protocolModels: RUNTIME_PROTOCOL_MODELS
});

// 6. プロトコルマネージャーオブジェクト本体の作成と凍結
const runtimeProtocolData: ExecutionRuntimeProtocol = Object.freeze({
  id: 'runtime-protocol-01',
  name: 'Default Execution Runtime Protocol Foundation',
  description: 'The static execution runtime protocol structure definition',
  context: protocolContext,
  metadata: protocolMetadata,
  data: protocolData
});

// Blueprint コンテナの不変シングルトンインスタンス実装
export const EXECUTION_RUNTIME_PROTOCOL_BLUEPRINT: ExecutionRuntimeProtocolBlueprint = Object.freeze({
  getExecutionRuntimeProtocol(): ExecutionRuntimeProtocol {
    return runtimeProtocolData;
  },

  getMetadata(): ProtocolMetadata {
    return runtimeProtocolData.metadata;
  },

  getContext(): ExecutionRuntimeProtocolContext {
    return runtimeProtocolData.context;
  },

  getData(): ExecutionRuntimeProtocolData {
    return runtimeProtocolData.data;
  },

  getProtocolModels(): readonly RuntimeProtocolModel[] {
    return RUNTIME_PROTOCOL_MODELS;
  },

  getProtocolSequence(): readonly string[] {
    return PROTOCOL_SEQUENCE;
  }
});
