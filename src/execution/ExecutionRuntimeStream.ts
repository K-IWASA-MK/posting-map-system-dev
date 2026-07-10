/**
 * ExecutionRuntimeStream.ts
 * 
 * ExecutionRuntimeStream Foundation の構造および公開インターフェース定義 (SSOT)。
 * 
 * 警告：本ファイル内への実際のストリーム生成、読み書き、パイプ処理、バッファ操作、
 * 非同期処理、API 通信、コマンド送信、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum StreamType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME'
}

export enum StreamScope {
  SYSTEM = 'SYSTEM'
}

export enum RuntimeStreamType {
  SYSTEM_STREAM = 'SYSTEM_STREAM',
  CORE_STREAM = 'CORE_STREAM',
  APPLICATION_STREAM = 'APPLICATION_STREAM',
  PLUGIN_STREAM = 'PLUGIN_STREAM',
  FIELD_STREAM = 'FIELD_STREAM'
}

export enum StreamLifecycleState {
  CREATED = 'CREATED',
  READY = 'READY',
  WAITING = 'WAITING',
  SEALED = 'SEALED',
  TERMINATED = 'TERMINATED'
}

export enum StreamCapability {
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

export enum StreamCategory {
  READABLE = 'READABLE',
  WRITABLE = 'WRITABLE',
  DUPLEX = 'DUPLEX',
  TRANSFORM = 'TRANSFORM',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum StreamValidationPolicy {
  NONE = 'NONE',
  HEADER_ONLY = 'HEADER_ONLY',
  SCHEMA = 'SCHEMA',
  FULL = 'FULL',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum StreamExecutionPolicy {
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
  NO_SOCKET = 'NO_SOCKET',
  NO_STREAM_CREATE = 'NO_STREAM_CREATE',
  NO_STREAM_OPEN = 'NO_STREAM_OPEN',
  NO_STREAM_CLOSE = 'NO_STREAM_CLOSE',
  NO_STREAM_READ = 'NO_STREAM_READ',
  NO_STREAM_WRITE = 'NO_STREAM_WRITE',
  NO_STREAM_PIPE = 'NO_STREAM_PIPE',
  NO_STREAM_UNPIPE = 'NO_STREAM_UNPIPE',
  NO_STREAM_PUSH = 'NO_STREAM_PUSH',
  NO_STREAM_FLUSH = 'NO_STREAM_FLUSH',
  NO_STREAM_PAUSE = 'NO_STREAM_PAUSE',
  NO_STREAM_RESUME = 'NO_STREAM_RESUME'
}

export enum StreamDependencyPolicy {
  NO_DEPENDENCY = 'NO_DEPENDENCY',
  STATIC_DEPENDENCY = 'STATIC_DEPENDENCY',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum StreamTopology {
  LOCAL = 'LOCAL',
  PROCESS = 'PROCESS',
  NODE = 'NODE',
  CLUSTER = 'CLUSTER',
  DISTRIBUTED = 'DISTRIBUTED'
}

export interface RuntimeStreamMetadata {
  readonly id: string;
  readonly name: string;
  readonly streamModelVersion: string;
  readonly streamSchemaVersion: string;
  readonly description: string;
}

export interface RuntimeStreamModel {
  readonly streamType: RuntimeStreamType;
  readonly modelId: string;
  readonly metadata: RuntimeStreamMetadata;
  readonly streamOrder: number;
  readonly supportedCapabilities: readonly StreamCapability[];
  readonly supportedStreamPolicies: readonly string[];
  readonly supportedValidationPolicies: readonly StreamValidationPolicy[];
  readonly dependencyPolicy: StreamDependencyPolicy;
  readonly topology: StreamTopology;
  readonly lifecycleStates: readonly StreamLifecycleState[];
  readonly executionPolicies: readonly StreamExecutionPolicy[];
  readonly allowedSteps: readonly string[];
  readonly supportedIdentityPolicies: readonly string[];
  readonly supportedSecureChannelPolicies: readonly string[];
  readonly supportedConnectionPolicies: readonly string[];
  readonly supportedSocketPolicies: readonly string[];
}

export interface StreamMetadata {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly layer: string;
  readonly category: string;
}

export interface ExecutionRuntimeStreamContext {
  readonly runtimeStreamId: string;
}

export interface ExecutionRuntimeStreamData {
  readonly managerType: StreamType;
  readonly managerScope: StreamScope;
  readonly streamModels: readonly RuntimeStreamModel[];
}

export interface ExecutionRuntimeStream {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly context: ExecutionRuntimeStreamContext;
  readonly metadata: StreamMetadata;
  readonly data: ExecutionRuntimeStreamData;
}

export interface ExecutionRuntimeStreamBlueprint {
  getExecutionRuntimeStream(): ExecutionRuntimeStream;
  getMetadata(): StreamMetadata;
  getContext(): ExecutionRuntimeStreamContext;
  getData(): ExecutionRuntimeStreamData;
  getStreamModels(): readonly RuntimeStreamModel[];
  getStreamSequence(): readonly string[];
}

// 1. 静的実行ステップシーケンスの定義と凍結
export const STREAM_SEQUENCE: readonly string[] = Object.freeze([
  'REGISTER_STREAM',
  'VALIDATE_STREAM_SCHEMA',
  'INITIALIZE_STREAM_BLUEPRINT',
  'READY_FOR_STREAM_RUNTIME',
  'STREAM_SCHEMA_CONFIRMED'
]);

// 静的ポリシーリストの定義と凍結
const defaultPolicies: readonly StreamExecutionPolicy[] = Object.freeze([
  StreamExecutionPolicy.READ_ONLY,
  StreamExecutionPolicy.DETERMINISTIC,
  StreamExecutionPolicy.IMMUTABLE_SCHEMA,
  StreamExecutionPolicy.NO_THREAD,
  StreamExecutionPolicy.NO_QUEUE,
  StreamExecutionPolicy.NO_TASK,
  StreamExecutionPolicy.NO_WORKER,
  StreamExecutionPolicy.NO_EVENT,
  StreamExecutionPolicy.NO_EVENT_BUS,
  StreamExecutionPolicy.NO_ROUTER,
  StreamExecutionPolicy.NO_TRANSPORT,
  StreamExecutionPolicy.NO_CONNECTION,
  StreamExecutionPolicy.NO_PROTOCOL,
  StreamExecutionPolicy.NO_SESSION,
  StreamExecutionPolicy.NO_SOCKET,
  StreamExecutionPolicy.NO_STREAM_CREATE,
  StreamExecutionPolicy.NO_STREAM_OPEN,
  StreamExecutionPolicy.NO_STREAM_CLOSE,
  StreamExecutionPolicy.NO_STREAM_READ,
  StreamExecutionPolicy.NO_STREAM_WRITE,
  StreamExecutionPolicy.NO_STREAM_PIPE,
  StreamExecutionPolicy.NO_STREAM_UNPIPE,
  StreamExecutionPolicy.NO_STREAM_PUSH,
  StreamExecutionPolicy.NO_STREAM_FLUSH,
  StreamExecutionPolicy.NO_STREAM_PAUSE,
  StreamExecutionPolicy.NO_STREAM_RESUME
]);

// 静的ライフサイクル状態リストの定義と凍結
const defaultLifecycleStates: readonly StreamLifecycleState[] = Object.freeze([
  StreamLifecycleState.CREATED,
  StreamLifecycleState.READY,
  StreamLifecycleState.WAITING,
  StreamLifecycleState.SEALED,
  StreamLifecycleState.TERMINATED
]);

// 2. 静的ストリームモデルリストの定義と凍結
export const RUNTIME_STREAM_MODELS: readonly RuntimeStreamModel[] = Object.freeze([
  Object.freeze({
    streamType: RuntimeStreamType.SYSTEM_STREAM,
    modelId: 'stream-model-system-01',
    metadata: Object.freeze({
      id: 'stream-meta-system-01',
      name: 'SystemStream Metadata',
      streamModelVersion: '1.0',
      streamSchemaVersion: '1.0',
      description: 'Metadata for SystemStream Schema'
    }),
    streamOrder: 1,
    supportedCapabilities: Object.freeze([StreamCapability.SYSTEM, StreamCapability.REMOTE, StreamCapability.LOCAL]),
    supportedStreamPolicies: Object.freeze(['StaticRouting']),
    supportedValidationPolicies: Object.freeze([StreamValidationPolicy.SCHEMA_ONLY]),
    dependencyPolicy: StreamDependencyPolicy.NO_DEPENDENCY,
    topology: StreamTopology.LOCAL,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: STREAM_SEQUENCE,
    supportedIdentityPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedSecureChannelPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedSocketPolicies: Object.freeze(['SCHEMA_ONLY'])
  }),
  Object.freeze({
    streamType: RuntimeStreamType.CORE_STREAM,
    modelId: 'stream-model-core-01',
    metadata: Object.freeze({
      id: 'stream-meta-core-01',
      name: 'CoreStream Metadata',
      streamModelVersion: '1.0',
      streamSchemaVersion: '1.0',
      description: 'Metadata for CoreStream Schema'
    }),
    streamOrder: 2,
    supportedCapabilities: Object.freeze([StreamCapability.SYSTEM, StreamCapability.APPLICATION, StreamCapability.INTER_PROCESS]),
    supportedStreamPolicies: Object.freeze([]),
    supportedValidationPolicies: Object.freeze([StreamValidationPolicy.HEADER_ONLY, StreamValidationPolicy.SCHEMA_ONLY]),
    dependencyPolicy: StreamDependencyPolicy.STATIC_DEPENDENCY,
    topology: StreamTopology.PROCESS,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: STREAM_SEQUENCE,
    supportedIdentityPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedSecureChannelPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedSocketPolicies: Object.freeze(['SCHEMA_ONLY'])
  }),
  Object.freeze({
    streamType: RuntimeStreamType.APPLICATION_STREAM,
    modelId: 'stream-model-app-01',
    metadata: Object.freeze({
      id: 'stream-meta-app-01',
      name: 'ApplicationStream Metadata',
      streamModelVersion: '1.0',
      streamSchemaVersion: '1.0',
      description: 'Metadata for ApplicationStream Schema'
    }),
    streamOrder: 3,
    supportedCapabilities: Object.freeze([StreamCapability.APPLICATION, StreamCapability.AI, StreamCapability.WORKFLOW, StreamCapability.DISTRIBUTED, StreamCapability.INTER_NODE]),
    supportedStreamPolicies: Object.freeze(['DynamicRouting']),
    supportedValidationPolicies: Object.freeze([StreamValidationPolicy.FULL, StreamValidationPolicy.SCHEMA_ONLY]),
    dependencyPolicy: StreamDependencyPolicy.SCHEMA_ONLY,
    topology: StreamTopology.NODE,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: STREAM_SEQUENCE,
    supportedIdentityPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedSecureChannelPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedSocketPolicies: Object.freeze(['SCHEMA_ONLY'])
  }),
  Object.freeze({
    streamType: RuntimeStreamType.PLUGIN_STREAM,
    modelId: 'stream-model-plugin-01',
    metadata: Object.freeze({
      id: 'stream-meta-plugin-01',
      name: 'PluginStream Metadata',
      streamModelVersion: '1.0',
      streamSchemaVersion: '1.0',
      description: 'Metadata for PluginStream Schema'
    }),
    streamOrder: 4,
    supportedCapabilities: Object.freeze([StreamCapability.PLUGIN, StreamCapability.MONITORING]),
    supportedStreamPolicies: Object.freeze([]),
    supportedValidationPolicies: Object.freeze([StreamValidationPolicy.SCHEMA, StreamValidationPolicy.SCHEMA_ONLY]),
    dependencyPolicy: StreamDependencyPolicy.NO_DEPENDENCY,
    topology: StreamTopology.CLUSTER,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: STREAM_SEQUENCE,
    supportedIdentityPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedSecureChannelPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedSocketPolicies: Object.freeze(['SCHEMA_ONLY'])
  }),
  Object.freeze({
    streamType: RuntimeStreamType.FIELD_STREAM,
    modelId: 'stream-model-field-01',
    metadata: Object.freeze({
      id: 'stream-meta-field-01',
      name: 'FieldStream Metadata',
      streamModelVersion: '1.0',
      streamSchemaVersion: '1.0',
      description: 'Metadata for FieldStream Schema'
    }),
    streamOrder: 5,
    supportedCapabilities: Object.freeze([StreamCapability.FIELD]),
    supportedStreamPolicies: Object.freeze([]),
    supportedValidationPolicies: Object.freeze([StreamValidationPolicy.FULL, StreamValidationPolicy.SCHEMA_ONLY]),
    dependencyPolicy: StreamDependencyPolicy.NO_DEPENDENCY,
    topology: StreamTopology.DISTRIBUTED,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: STREAM_SEQUENCE,
    supportedIdentityPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedSecureChannelPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedSocketPolicies: Object.freeze(['SCHEMA_ONLY'])
  })
]);

// 3. メタデータオブジェクトの作成と凍結
const streamMetadata: StreamMetadata = Object.freeze({
  id: 'runtime-stream-meta-01',
  name: 'ExecutionRuntimeStream Metadata',
  version: '1.0.0',
  description: 'Metadata for ExecutionRuntimeStream Foundation',
  layer: 'StreamLayer',
  category: 'Infrastructure'
});

// 4. コンテキストオブジェクトの作成と凍結 (ID 参照のみ、runtimeStreamId のみ)
const streamContext: ExecutionRuntimeStreamContext = Object.freeze({
  runtimeStreamId: 'runtime-stream-01'
});

// 5. データオブジェクトの作成と凍結
const streamData: ExecutionRuntimeStreamData = Object.freeze({
  managerType: StreamType.FOUNDATION,
  managerScope: StreamScope.SYSTEM,
  streamModels: RUNTIME_STREAM_MODELS
});

// 6. 主体マネージャーオブジェクト本体の作成と凍結
const runtimeStreamData: ExecutionRuntimeStream = Object.freeze({
  id: 'runtime-stream-01',
  name: 'DefaultExecutionRuntimeStream Foundation',
  description: 'The static execution-runtime-stream structure definition',
  context: streamContext,
  metadata: streamMetadata,
  data: streamData
});

// Blueprint コンテナの不変シングルトンインスタンス実装 (型固定の適用)
export const EXECUTION_RUNTIME_STREAM_BLUEPRINT: Readonly<ExecutionRuntimeStreamBlueprint> = Object.freeze({
  getExecutionRuntimeStream(): ExecutionRuntimeStream {
    return runtimeStreamData;
  },

  getMetadata(): StreamMetadata {
    return runtimeStreamData.metadata;
  },

  getContext(): ExecutionRuntimeStreamContext {
    return runtimeStreamData.context;
  },

  getData(): ExecutionRuntimeStreamData {
    return runtimeStreamData.data;
  },

  getStreamModels(): readonly RuntimeStreamModel[] {
    return RUNTIME_STREAM_MODELS;
  },

  getStreamSequence(): readonly string[] {
    return STREAM_SEQUENCE;
  }
});
