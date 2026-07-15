/**
 * ExecutionRuntimePipe.ts
 * 
 * ExecutionRuntimePipe Foundation の構造および公開インターフェース定義 (SSOT)。
 * 
 * 警告：本ファイル内への実際のパイプ生成、接続、切断、転送、フロー制御、
 * 非同期処理、API 通信、コマンド送信、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum PipeType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME'
}

export enum PipeScope {
  SYSTEM = 'SYSTEM'
}

export enum RuntimePipeType {
  SYSTEM_PIPE = 'SYSTEM_PIPE',
  CORE_PIPE = 'CORE_PIPE',
  APPLICATION_PIPE = 'APPLICATION_PIPE',
  PLUGIN_PIPE = 'PLUGIN_PIPE',
  FIELD_PIPE = 'FIELD_PIPE'
}

export enum PipeLifecycleState {
  CREATED = 'CREATED',
  READY = 'READY',
  WAITING = 'WAITING',
  SEALED = 'SEALED',
  TERMINATED = 'TERMINATED'
}

export enum PipeCapability {
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

export enum PipeCategory {
  UNIDIRECTIONAL = 'UNIDIRECTIONAL',
  BIDIRECTIONAL = 'BIDIRECTIONAL',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum PipeValidationPolicy {
  NONE = 'NONE',
  HEADER_ONLY = 'HEADER_ONLY',
  SCHEMA = 'SCHEMA',
  FULL = 'FULL',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum PipeFlowPolicy {
  STATIC_ONLY = 'STATIC_ONLY',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum PipeExecutionPolicy {
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
  NO_STREAM = 'NO_STREAM',
  NO_BUFFER = 'NO_BUFFER',
  NO_PIPE_CREATE = 'NO_PIPE_CREATE',
  NO_PIPE_CONNECT = 'NO_PIPE_CONNECT',
  NO_PIPE_TRANSFER = 'NO_PIPE_TRANSFER',
  NO_PIPE_FLUSH = 'NO_PIPE_FLUSH',
  NO_PIPE_CLOSE = 'NO_PIPE_CLOSE'
}

export enum PipeDependencyPolicy {
  NO_DEPENDENCY = 'NO_DEPENDENCY',
  STATIC_DEPENDENCY = 'STATIC_DEPENDENCY',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum PipeTopology {
  LOCAL = 'LOCAL',
  PROCESS = 'PROCESS',
  NODE = 'NODE',
  CLUSTER = 'CLUSTER',
  DISTRIBUTED = 'DISTRIBUTED'
}

export interface RuntimePipeMetadata {
  readonly id: string;
  readonly name: string;
  readonly pipeModelVersion: string;
  readonly pipeSchemaVersion: string;
  readonly description: string;
}

export interface RuntimePipeModel {
  readonly pipeType: RuntimePipeType;
  readonly modelId: string;
  readonly metadata: RuntimePipeMetadata;
  readonly pipeOrder: number;
  readonly supportedCapabilities: readonly PipeCapability[];
  readonly supportedPipePolicies: readonly string[];
  readonly supportedValidationPolicies: readonly PipeValidationPolicy[];
  readonly supportedFlowPolicies: readonly PipeFlowPolicy[];
  readonly dependencyPolicy: PipeDependencyPolicy;
  readonly topology: PipeTopology;
  readonly lifecycleStates: readonly PipeLifecycleState[];
  readonly executionPolicies: readonly PipeExecutionPolicy[];
  readonly allowedSteps: readonly string[];
  readonly supportedIdentityPolicies: readonly string[];
  readonly supportedSecureChannelPolicies: readonly string[];
  readonly supportedConnectionPolicies: readonly string[];
  readonly supportedSocketPolicies: readonly string[];
  readonly supportedStreamPolicies: readonly string[];
  readonly supportedBufferPolicies: readonly string[];
}

export interface PipeMetadata {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly layer: string;
  readonly category: string;
}

export interface ExecutionRuntimePipeContext {
  readonly runtimePipeId: string;
}

export interface ExecutionRuntimePipeData {
  readonly managerType: PipeType;
  readonly managerScope: PipeScope;
  readonly pipeModels: readonly RuntimePipeModel[];
}

export interface ExecutionRuntimePipe {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly context: ExecutionRuntimePipeContext;
  readonly metadata: PipeMetadata;
  readonly data: ExecutionRuntimePipeData;
}

export interface ExecutionRuntimePipeBlueprint {
  getExecutionRuntimePipe(): ExecutionRuntimePipe;
  getMetadata(): PipeMetadata;
  getContext(): ExecutionRuntimePipeContext;
  getData(): ExecutionRuntimePipeData;
  getPipeModels(): readonly RuntimePipeModel[];
  getPipeSequence(): readonly string[];
}

// 1. 静的実行ステップシーケンスの定義と凍結
export const PIPE_SEQUENCE: readonly string[] = Object.freeze([
  'REGISTER_PIPE',
  'VALIDATE_PIPE_SCHEMA',
  'INITIALIZE_PIPE_BLUEPRINT',
  'READY_FOR_PIPE_RUNTIME',
  'PIPE_SCHEMA_CONFIRMED'
]);

// 静的ポリシーリストの定義と凍結
const defaultPolicies: readonly PipeExecutionPolicy[] = Object.freeze([
  PipeExecutionPolicy.READ_ONLY,
  PipeExecutionPolicy.DETERMINISTIC,
  PipeExecutionPolicy.IMMUTABLE_SCHEMA,
  PipeExecutionPolicy.NO_THREAD,
  PipeExecutionPolicy.NO_QUEUE,
  PipeExecutionPolicy.NO_TASK,
  PipeExecutionPolicy.NO_WORKER,
  PipeExecutionPolicy.NO_EVENT,
  PipeExecutionPolicy.NO_EVENT_BUS,
  PipeExecutionPolicy.NO_ROUTER,
  PipeExecutionPolicy.NO_TRANSPORT,
  PipeExecutionPolicy.NO_CONNECTION,
  PipeExecutionPolicy.NO_PROTOCOL,
  PipeExecutionPolicy.NO_SESSION,
  PipeExecutionPolicy.NO_SOCKET,
  PipeExecutionPolicy.NO_STREAM,
  PipeExecutionPolicy.NO_BUFFER,
  PipeExecutionPolicy.NO_PIPE_CREATE,
  PipeExecutionPolicy.NO_PIPE_CONNECT,
  PipeExecutionPolicy.NO_PIPE_TRANSFER,
  PipeExecutionPolicy.NO_PIPE_FLUSH,
  PipeExecutionPolicy.NO_PIPE_CLOSE
]);

// 静的ライフサイクル状態リストの定義と凍結
const defaultLifecycleStates: readonly PipeLifecycleState[] = Object.freeze([
  PipeLifecycleState.CREATED,
  PipeLifecycleState.READY,
  PipeLifecycleState.WAITING,
  PipeLifecycleState.SEALED,
  PipeLifecycleState.TERMINATED
]);

// 2. 静的パイプモデルリストの定義と凍結
export const RUNTIME_PIPE_MODELS: readonly RuntimePipeModel[] = Object.freeze([
  Object.freeze({
    pipeType: RuntimePipeType.SYSTEM_PIPE,
    modelId: 'pipe-model-system-01',
    metadata: Object.freeze({
      id: 'pipe-meta-system-01',
      name: 'SystemPipeMetadata',
      pipeModelVersion: '1.0',
      pipeSchemaVersion: '1.0',
      description: 'Metadata for SystemPipe Schema'
    }),
    pipeOrder: 1,
    supportedCapabilities: Object.freeze([PipeCapability.SYSTEM, PipeCapability.REMOTE, PipeCapability.LOCAL]),
    supportedPipePolicies: Object.freeze(['StaticRouting']),
    supportedValidationPolicies: Object.freeze([PipeValidationPolicy.SCHEMA_ONLY]),
    supportedFlowPolicies: Object.freeze([PipeFlowPolicy.SCHEMA_ONLY]),
    dependencyPolicy: PipeDependencyPolicy.NO_DEPENDENCY,
    topology: PipeTopology.LOCAL,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: PIPE_SEQUENCE,
    supportedIdentityPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedSecureChannelPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedSocketPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedStreamPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedBufferPolicies: Object.freeze(['SCHEMA_ONLY'])
  }),
  Object.freeze({
    pipeType: RuntimePipeType.CORE_PIPE,
    modelId: 'pipe-model-core-01',
    metadata: Object.freeze({
      id: 'pipe-meta-core-01',
      name: 'CorePipeMetadata',
      pipeModelVersion: '1.0',
      pipeSchemaVersion: '1.0',
      description: 'Metadata for CorePipe Schema'
    }),
    pipeOrder: 2,
    supportedCapabilities: Object.freeze([PipeCapability.SYSTEM, PipeCapability.APPLICATION, PipeCapability.INTER_PROCESS]),
    supportedPipePolicies: Object.freeze([]),
    supportedValidationPolicies: Object.freeze([PipeValidationPolicy.HEADER_ONLY, PipeValidationPolicy.SCHEMA_ONLY]),
    supportedFlowPolicies: Object.freeze([PipeFlowPolicy.SCHEMA_ONLY]),
    dependencyPolicy: PipeDependencyPolicy.STATIC_DEPENDENCY,
    topology: PipeTopology.PROCESS,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: PIPE_SEQUENCE,
    supportedIdentityPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedSecureChannelPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedSocketPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedStreamPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedBufferPolicies: Object.freeze(['SCHEMA_ONLY'])
  }),
  Object.freeze({
    pipeType: RuntimePipeType.APPLICATION_PIPE,
    modelId: 'pipe-model-app-01',
    metadata: Object.freeze({
      id: 'pipe-meta-app-01',
      name: 'ApplicationPipeMetadata',
      pipeModelVersion: '1.0',
      pipeSchemaVersion: '1.0',
      description: 'Metadata for ApplicationPipe Schema'
    }),
    pipeOrder: 3,
    supportedCapabilities: Object.freeze([PipeCapability.APPLICATION, PipeCapability.AI, PipeCapability.WORKFLOW, PipeCapability.DISTRIBUTED, PipeCapability.INTER_NODE]),
    supportedPipePolicies: Object.freeze(['DynamicRouting']),
    supportedValidationPolicies: Object.freeze([PipeValidationPolicy.FULL, PipeValidationPolicy.SCHEMA_ONLY]),
    supportedFlowPolicies: Object.freeze([PipeFlowPolicy.SCHEMA_ONLY]),
    dependencyPolicy: PipeDependencyPolicy.SCHEMA_ONLY,
    topology: PipeTopology.NODE,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: PIPE_SEQUENCE,
    supportedIdentityPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedSecureChannelPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedSocketPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedStreamPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedBufferPolicies: Object.freeze(['SCHEMA_ONLY'])
  }),
  Object.freeze({
    pipeType: RuntimePipeType.PLUGIN_PIPE,
    modelId: 'pipe-model-plugin-01',
    metadata: Object.freeze({
      id: 'pipe-meta-plugin-01',
      name: 'PluginPipeMetadata',
      pipeModelVersion: '1.0',
      pipeSchemaVersion: '1.0',
      description: 'Metadata for PluginPipe Schema'
    }),
    pipeOrder: 4,
    supportedCapabilities: Object.freeze([PipeCapability.PLUGIN, PipeCapability.MONITORING]),
    supportedPipePolicies: Object.freeze([]),
    supportedValidationPolicies: Object.freeze([PipeValidationPolicy.SCHEMA, PipeValidationPolicy.SCHEMA_ONLY]),
    supportedFlowPolicies: Object.freeze([PipeFlowPolicy.SCHEMA_ONLY]),
    dependencyPolicy: PipeDependencyPolicy.NO_DEPENDENCY,
    topology: PipeTopology.CLUSTER,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: PIPE_SEQUENCE,
    supportedIdentityPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedSecureChannelPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedSocketPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedStreamPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedBufferPolicies: Object.freeze(['SCHEMA_ONLY'])
  }),
  Object.freeze({
    pipeType: RuntimePipeType.FIELD_PIPE,
    modelId: 'pipe-model-field-01',
    metadata: Object.freeze({
      id: 'pipe-meta-field-01',
      name: 'FieldPipeMetadata',
      pipeModelVersion: '1.0',
      pipeSchemaVersion: '1.0',
      description: 'Metadata for FieldPipe Schema'
    }),
    pipeOrder: 5,
    supportedCapabilities: Object.freeze([PipeCapability.FIELD]),
    supportedPipePolicies: Object.freeze([]),
    supportedValidationPolicies: Object.freeze([PipeValidationPolicy.FULL, PipeValidationPolicy.SCHEMA_ONLY]),
    supportedFlowPolicies: Object.freeze([PipeFlowPolicy.SCHEMA_ONLY]),
    dependencyPolicy: PipeDependencyPolicy.NO_DEPENDENCY,
    topology: PipeTopology.DISTRIBUTED,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: PIPE_SEQUENCE,
    supportedIdentityPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedSecureChannelPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedSocketPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedStreamPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedBufferPolicies: Object.freeze(['SCHEMA_ONLY'])
  })
]);

// 3. メタデータオブジェクトの作成と凍結
const pipeMetadata: PipeMetadata = Object.freeze({
  id: 'runtime-pipe-meta-01',
  name: 'ExecutionRuntimePipeMetadata',
  version: '1.0.0',
  description: 'Metadata for ExecutionRuntimePipe Foundation',
  layer: 'PipeLayer',
  category: 'Infrastructure'
});

// 4. コンテキストオブジェクトの作成と凍結 (ID 参照のみ、runtimePipeId のみ)
const pipeContext: ExecutionRuntimePipeContext = Object.freeze({
  runtimePipeId: 'runtime-pipe-01'
});

// 5. データオブジェクトの作成と凍結
const pipeData: ExecutionRuntimePipeData = Object.freeze({
  managerType: PipeType.FOUNDATION,
  managerScope: PipeScope.SYSTEM,
  pipeModels: RUNTIME_PIPE_MODELS
});

// 6. 主体マネージャーオブジェクト本体の作成と凍結
const runtimePipeData: ExecutionRuntimePipe = Object.freeze({
  id: 'runtime-pipe-01',
  name: 'DefaultExecutionRuntimePipe Foundation',
  description: 'The static execution-runtime-pipe structure definition',
  context: pipeContext,
  metadata: pipeMetadata,
  data: pipeData
});

// Blueprint コンテナの不変シングルトンインスタンス実装 (型固定の適用)
export const EXECUTION_RUNTIME_PIPE_BLUEPRINT: Readonly<ExecutionRuntimePipeBlueprint> = Object.freeze({
  getExecutionRuntimePipe(): ExecutionRuntimePipe {
    return runtimePipeData;
  },

  getMetadata(): PipeMetadata {
    return runtimePipeData.metadata;
  },

  getContext(): ExecutionRuntimePipeContext {
    return runtimePipeData.context;
  },

  getData(): ExecutionRuntimePipeData {
    return runtimePipeData.data;
  },

  getPipeModels(): readonly RuntimePipeModel[] {
    return RUNTIME_PIPE_MODELS;
  },

  getPipeSequence(): readonly string[] {
    return PIPE_SEQUENCE;
  }
});
