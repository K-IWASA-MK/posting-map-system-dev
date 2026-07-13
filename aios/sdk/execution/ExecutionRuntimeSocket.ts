/**
 * ExecutionRuntimeSocket.ts
 * 
 * ExecutionRuntimeSocket Foundation の構造および公開インターフェース定義 (SSOT)。
 * 
 * 警告：本ファイル内への実際のソケット生成、接続開始、Listen, Accept, Read, Write, Close,
 * Poll/Select などの監視処理、非同期処理、API 通信、コマンド送信、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum SocketType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME'
}

export enum SocketScope {
  SYSTEM = 'SYSTEM'
}

export enum RuntimeSocketType {
  SYSTEM_SOCKET = 'SYSTEM_SOCKET',
  CORE_SOCKET = 'CORE_SOCKET',
  APPLICATION_SOCKET = 'APPLICATION_SOCKET',
  PLUGIN_SOCKET = 'PLUGIN_SOCKET',
  FIELD_SOCKET = 'FIELD_SOCKET'
}

export enum SocketLifecycleState {
  CREATED = 'CREATED',
  READY = 'READY',
  WAITING = 'WAITING',
  SEALED = 'SEALED',
  TERMINATED = 'TERMINATED'
}

export enum SocketCapability {
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

export enum SocketCategory {
  STREAM = 'STREAM',
  DATAGRAM = 'DATAGRAM',
  RAW = 'RAW',
  CONTROL = 'CONTROL',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum SocketValidationPolicy {
  NONE = 'NONE',
  HEADER_ONLY = 'HEADER_ONLY',
  SCHEMA = 'SCHEMA',
  FULL = 'FULL',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum SocketExecutionPolicy {
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
  NO_TRANSPORT = 'NO_TRANSPORT',
  NO_CONNECTION = 'NO_CONNECTION',
  NO_PROTOCOL = 'NO_PROTOCOL',
  NO_SESSION = 'NO_SESSION',
  NO_SOCKET_CREATE = 'NO_SOCKET_CREATE',
  NO_SOCKET_OPEN = 'NO_SOCKET_OPEN',
  NO_SOCKET_CLOSE = 'NO_SOCKET_CLOSE',
  NO_LISTEN = 'NO_LISTEN',
  NO_ACCEPT = 'NO_ACCEPT',
  NO_CONNECT = 'NO_CONNECT',
  NO_DISCONNECT = 'NO_DISCONNECT',
  NO_READ = 'NO_READ',
  NO_WRITE = 'NO_WRITE',
  NO_SEND = 'NO_SEND',
  NO_RECEIVE = 'NO_RECEIVE',
  NO_BIND = 'NO_BIND',
  NO_POLL = 'NO_POLL',
  NO_SELECT = 'NO_SELECT',
  NO_EPOLL = 'NO_EPOLL',
  NO_KQUEUE = 'NO_KQUEUE'
}

export enum SocketDependencyPolicy {
  NO_DEPENDENCY = 'NO_DEPENDENCY',
  STATIC_DEPENDENCY = 'STATIC_DEPENDENCY',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum SocketTopology {
  LOCAL = 'LOCAL',
  PROCESS = 'PROCESS',
  NODE = 'NODE',
  CLUSTER = 'CLUSTER',
  DISTRIBUTED = 'DISTRIBUTED'
}

export interface RuntimeSocketMetadata {
  readonly id: string;
  readonly name: string;
  readonly socketModelVersion: string;
  readonly socketSchemaVersion: string;
  readonly description: string;
}

export interface RuntimeSocketModel {
  readonly socketType: RuntimeSocketType;
  readonly modelId: string;
  readonly metadata: RuntimeSocketMetadata;
  readonly socketOrder: number;
  readonly supportedCapabilities: readonly SocketCapability[];
  readonly supportedSocketPolicies: readonly string[];
  readonly supportedValidationPolicies: readonly SocketValidationPolicy[];
  readonly dependencyPolicy: SocketDependencyPolicy;
  readonly topology: SocketTopology;
  readonly lifecycleStates: readonly SocketLifecycleState[];
  readonly executionPolicies: readonly SocketExecutionPolicy[];
  readonly allowedSteps: readonly string[];
  readonly supportedIdentityPolicies: readonly string[];
  readonly supportedSecureChannelPolicies: readonly string[];
  readonly supportedConnectionPolicies: readonly string[];
  readonly supportedTransportPolicies: readonly string[];
}

export interface SocketMetadata {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly layer: string;
  readonly category: string;
}

export interface ExecutionRuntimeSocketContext {
  readonly runtimeSocketId: string;
}

export interface ExecutionRuntimeSocketData {
  readonly managerType: SocketType;
  readonly managerScope: SocketScope;
  readonly socketModels: readonly RuntimeSocketModel[];
}

export interface ExecutionRuntimeSocket {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly context: ExecutionRuntimeSocketContext;
  readonly metadata: SocketMetadata;
  readonly data: ExecutionRuntimeSocketData;
}

export interface ExecutionRuntimeSocketBlueprint {
  getExecutionRuntimeSocket(): ExecutionRuntimeSocket;
  getMetadata(): SocketMetadata;
  getContext(): ExecutionRuntimeSocketContext;
  getData(): ExecutionRuntimeSocketData;
  getSocketModels(): readonly RuntimeSocketModel[];
  getSocketSequence(): readonly string[];
}

// 1. 静的実行ステップシーケンスの定義と凍結
export const SOCKET_SEQUENCE: readonly string[] = Object.freeze([
  'REGISTER_SOCKET',
  'VALIDATE_SOCKET_SCHEMA',
  'INITIALIZE_SOCKET_BLUEPRINT',
  'READY_FOR_SOCKET_RUNTIME',
  'SOCKET_SCHEMA_CONFIRMED'
]);

// 静的ポリシーリストの定義と凍結
const defaultPolicies: readonly SocketExecutionPolicy[] = Object.freeze([
  SocketExecutionPolicy.READ_ONLY,
  SocketExecutionPolicy.DETERMINISTIC,
  SocketExecutionPolicy.IMMUTABLE_SCHEMA,
  SocketExecutionPolicy.NO_THREAD,
  SocketExecutionPolicy.NO_QUEUE,
  SocketExecutionPolicy.NO_TASK,
  SocketExecutionPolicy.NO_WORKER,
  SocketExecutionPolicy.NO_EVENT,
  SocketExecutionPolicy.NO_EVENT_BUS,
  SocketExecutionPolicy.NO_ROUTER,
  SocketExecutionPolicy.NO_TRANSPORT,
  SocketExecutionPolicy.NO_CONNECTION,
  SocketExecutionPolicy.NO_PROTOCOL,
  SocketExecutionPolicy.NO_SESSION,
  SocketExecutionPolicy.NO_SOCKET_CREATE,
  SocketExecutionPolicy.NO_SOCKET_OPEN,
  SocketExecutionPolicy.NO_SOCKET_CLOSE,
  SocketExecutionPolicy.NO_LISTEN,
  SocketExecutionPolicy.NO_ACCEPT,
  SocketExecutionPolicy.NO_CONNECT,
  SocketExecutionPolicy.NO_DISCONNECT,
  SocketExecutionPolicy.NO_READ,
  SocketExecutionPolicy.NO_WRITE,
  SocketExecutionPolicy.NO_SEND,
  SocketExecutionPolicy.NO_RECEIVE,
  SocketExecutionPolicy.NO_BIND,
  SocketExecutionPolicy.NO_POLL,
  SocketExecutionPolicy.NO_SELECT,
  SocketExecutionPolicy.NO_EPOLL,
  SocketExecutionPolicy.NO_KQUEUE
]);

// 静的ライフサイクル状態リストの定義と凍結
const defaultLifecycleStates: readonly SocketLifecycleState[] = Object.freeze([
  SocketLifecycleState.CREATED,
  SocketLifecycleState.READY,
  SocketLifecycleState.WAITING,
  SocketLifecycleState.SEALED,
  SocketLifecycleState.TERMINATED
]);

// 2. 静的ソケットモデルリストの定義と凍結
export const RUNTIME_SOCKET_MODELS: readonly RuntimeSocketModel[] = Object.freeze([
  Object.freeze({
    socketType: RuntimeSocketType.SYSTEM_SOCKET,
    modelId: 'socket-model-system-01',
    metadata: Object.freeze({
      id: 'socket-meta-system-01',
      name: 'SystemSocket Metadata',
      socketModelVersion: '1.0',
      socketSchemaVersion: '1.0',
      description: 'Metadata for SystemSocket Schema'
    }),
    socketOrder: 1,
    supportedCapabilities: Object.freeze([SocketCapability.SYSTEM, SocketCapability.REMOTE, SocketCapability.LOCAL]),
    supportedSocketPolicies: Object.freeze(['StaticRouting']),
    supportedValidationPolicies: Object.freeze([SocketValidationPolicy.SCHEMA_ONLY]),
    dependencyPolicy: SocketDependencyPolicy.NO_DEPENDENCY,
    topology: SocketTopology.LOCAL,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: SOCKET_SEQUENCE,
    supportedIdentityPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedSecureChannelPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedTransportPolicies: Object.freeze(['SCHEMA_ONLY'])
  }),
  Object.freeze({
    socketType: RuntimeSocketType.CORE_SOCKET,
    modelId: 'socket-model-core-01',
    metadata: Object.freeze({
      id: 'socket-meta-core-01',
      name: 'CoreSocket Metadata',
      socketModelVersion: '1.0',
      socketSchemaVersion: '1.0',
      description: 'Metadata for CoreSocket Schema'
    }),
    socketOrder: 2,
    supportedCapabilities: Object.freeze([SocketCapability.SYSTEM, SocketCapability.APPLICATION, SocketCapability.INTER_PROCESS]),
    supportedSocketPolicies: Object.freeze([]),
    supportedValidationPolicies: Object.freeze([SocketValidationPolicy.HEADER_ONLY, SocketValidationPolicy.SCHEMA_ONLY]),
    dependencyPolicy: SocketDependencyPolicy.STATIC_DEPENDENCY,
    topology: SocketTopology.PROCESS,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: SOCKET_SEQUENCE,
    supportedIdentityPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedSecureChannelPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedTransportPolicies: Object.freeze(['SCHEMA_ONLY'])
  }),
  Object.freeze({
    socketType: RuntimeSocketType.APPLICATION_SOCKET,
    modelId: 'socket-model-app-01',
    metadata: Object.freeze({
      id: 'socket-meta-app-01',
      name: 'ApplicationSocket Metadata',
      socketModelVersion: '1.0',
      socketSchemaVersion: '1.0',
      description: 'Metadata for ApplicationSocket Schema'
    }),
    socketOrder: 3,
    supportedCapabilities: Object.freeze([SocketCapability.APPLICATION, SocketCapability.AI, SocketCapability.WORKFLOW, SocketCapability.DISTRIBUTED, SocketCapability.INTER_NODE]),
    supportedSocketPolicies: Object.freeze(['DynamicRouting']),
    supportedValidationPolicies: Object.freeze([SocketValidationPolicy.FULL, SocketValidationPolicy.SCHEMA_ONLY]),
    dependencyPolicy: SocketDependencyPolicy.SCHEMA_ONLY,
    topology: SocketTopology.NODE,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: SOCKET_SEQUENCE,
    supportedIdentityPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedSecureChannelPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedTransportPolicies: Object.freeze(['SCHEMA_ONLY'])
  }),
  Object.freeze({
    socketType: RuntimeSocketType.PLUGIN_SOCKET,
    modelId: 'socket-model-plugin-01',
    metadata: Object.freeze({
      id: 'socket-meta-plugin-01',
      name: 'PluginSocket Metadata',
      socketModelVersion: '1.0',
      socketSchemaVersion: '1.0',
      description: 'Metadata for PluginSocket Schema'
    }),
    socketOrder: 4,
    supportedCapabilities: Object.freeze([SocketCapability.PLUGIN, SocketCapability.MONITORING]),
    supportedSocketPolicies: Object.freeze([]),
    supportedValidationPolicies: Object.freeze([SocketValidationPolicy.SCHEMA, SocketValidationPolicy.SCHEMA_ONLY]),
    dependencyPolicy: SocketDependencyPolicy.NO_DEPENDENCY,
    topology: SocketTopology.CLUSTER,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: SOCKET_SEQUENCE,
    supportedIdentityPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedSecureChannelPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedTransportPolicies: Object.freeze(['SCHEMA_ONLY'])
  }),
  Object.freeze({
    socketType: RuntimeSocketType.FIELD_SOCKET,
    modelId: 'socket-model-field-01',
    metadata: Object.freeze({
      id: 'socket-meta-field-01',
      name: 'FieldSocket Metadata',
      socketModelVersion: '1.0',
      socketSchemaVersion: '1.0',
      description: 'Metadata for FieldSocket Schema'
    }),
    socketOrder: 5,
    supportedCapabilities: Object.freeze([SocketCapability.FIELD]),
    supportedSocketPolicies: Object.freeze([]),
    supportedValidationPolicies: Object.freeze([SocketValidationPolicy.FULL, SocketValidationPolicy.SCHEMA_ONLY]),
    dependencyPolicy: SocketDependencyPolicy.NO_DEPENDENCY,
    topology: SocketTopology.DISTRIBUTED,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: SOCKET_SEQUENCE,
    supportedIdentityPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedSecureChannelPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedTransportPolicies: Object.freeze(['SCHEMA_ONLY'])
  })
]);

// 3. メタデータオブジェクトの作成と凍結
const socketMetadata: SocketMetadata = Object.freeze({
  id: 'runtime-socket-meta-01',
  name: 'ExecutionRuntimeSocket Metadata',
  version: '1.0.0',
  description: 'Metadata for ExecutionRuntimeSocket Foundation',
  layer: 'SocketLayer',
  category: 'Infrastructure'
});

// 4. コンテキストオブジェクトの作成と凍結 (ID 参照のみ、runtimeSocketId のみ)
const socketContext: ExecutionRuntimeSocketContext = Object.freeze({
  runtimeSocketId: 'runtime-socket-01'
});

// 5. データオブジェクトの作成と凍結
const socketData: ExecutionRuntimeSocketData = Object.freeze({
  managerType: SocketType.FOUNDATION,
  managerScope: SocketScope.SYSTEM,
  socketModels: RUNTIME_SOCKET_MODELS
});

// 6. 主体マネージャーオブジェクト本体の作成と凍結
const runtimeSocketData: ExecutionRuntimeSocket = Object.freeze({
  id: 'runtime-socket-01',
  name: 'DefaultExecutionRuntimeSocket Foundation',
  description: 'The static execution-runtime-socket structure definition',
  context: socketContext,
  metadata: socketMetadata,
  data: socketData
});

// Blueprint コンテナの不変シングルトンインスタンス実装 (型固定の適用)
export const EXECUTION_RUNTIME_SOCKET_BLUEPRINT: Readonly<ExecutionRuntimeSocketBlueprint> = Object.freeze({
  getExecutionRuntimeSocket(): ExecutionRuntimeSocket {
    return runtimeSocketData;
  },

  getMetadata(): SocketMetadata {
    return runtimeSocketData.metadata;
  },

  getContext(): ExecutionRuntimeSocketContext {
    return runtimeSocketData.context;
  },

  getData(): ExecutionRuntimeSocketData {
    return runtimeSocketData.data;
  },

  getSocketModels(): readonly RuntimeSocketModel[] {
    return RUNTIME_SOCKET_MODELS;
  },

  getSocketSequence(): readonly string[] {
    return SOCKET_SEQUENCE;
  }
});
