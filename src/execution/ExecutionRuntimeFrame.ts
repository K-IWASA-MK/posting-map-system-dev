/**
 * ExecutionRuntimeFrame.ts
 * 
 * Execution Runtime Frame Foundation の構造および公開インターフェース定義 (SSOT)。
 * 
 * 警告：本ファイル内への実際のフレーム生成、組み立て、分割、結合、エンコード、デコード、
 * 送受信、同期、非同期処理、API 通信、コマンド送信、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum FrameType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME'
}

export enum FrameScope {
  SYSTEM = 'SYSTEM'
}

export enum RuntimeFrameType {
  SYSTEM_FRAME = 'SYSTEM_FRAME',
  CORE_FRAME = 'CORE_FRAME',
  APPLICATION_FRAME = 'APPLICATION_FRAME',
  PLUGIN_FRAME = 'PLUGIN_FRAME',
  FIELD_FRAME = 'FIELD_FRAME'
}

export enum FrameLifecycleState {
  CREATED = 'CREATED',
  READY = 'READY',
  WAITING = 'WAITING',
  SEALED = 'SEALED',
  TERMINATED = 'TERMINATED'
}

export enum FrameCapability {
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

export enum FrameCategory {
  CONTROL = 'CONTROL',
  DATA = 'DATA',
  SYSTEM = 'SYSTEM',
  APPLICATION = 'APPLICATION',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum FrameFormatPolicy {
  JSON = 'JSON',
  BINARY = 'BINARY',
  PROTOBUF = 'PROTOBUF',
  MSGPACK = 'MSGPACK',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum FrameValidationPolicy {
  NONE = 'NONE',
  HEADER_ONLY = 'HEADER_ONLY',
  SCHEMA = 'SCHEMA',
  FULL = 'FULL',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum FrameExecutionPolicy {
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
  NO_PROTOCOL = 'NO_PROTOCOL',
  NO_SESSION = 'NO_SESSION',
  NO_PACKET = 'NO_PACKET',
  NO_SOCKET = 'NO_SOCKET',
  NO_STREAM = 'NO_STREAM',
  NO_FRAME_BUILD = 'NO_FRAME_BUILD',
  NO_FRAME_PARSE = 'NO_FRAME_PARSE',
  NO_FRAME_SEND = 'NO_FRAME_SEND',
  NO_FRAME_RECEIVE = 'NO_FRAME_RECEIVE',
  NO_FRAGMENT = 'NO_FRAGMENT',
  NO_REASSEMBLY = 'NO_REASSEMBLY',
  NO_SYNCHRONIZATION = 'NO_SYNCHRONIZATION'
}

export enum FrameDependencyPolicy {
  NO_DEPENDENCY = 'NO_DEPENDENCY',
  STATIC_DEPENDENCY = 'STATIC_DEPENDENCY',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum FrameTopology {
  LOCAL = 'LOCAL',
  PROCESS = 'PROCESS',
  NODE = 'NODE',
  CLUSTER = 'CLUSTER',
  DISTRIBUTED = 'DISTRIBUTED'
}

export interface RuntimeFrameMetadata {
  readonly id: string;
  readonly name: string;
  readonly frameModelVersion: string;
  readonly frameSchemaVersion: string;
  readonly description: string;
}

export interface RuntimeFrameModel {
  readonly frameType: RuntimeFrameType;
  readonly modelId: string;
  readonly metadata: RuntimeFrameMetadata;
  readonly frameOrder: number;
  readonly supportedCapabilities: readonly FrameCapability[];
  readonly supportedFramePolicies: readonly string[];
  readonly supportedFormatPolicies: readonly FrameFormatPolicy[];
  readonly supportedValidationPolicies: readonly FrameValidationPolicy[];
  readonly dependencyPolicy: FrameDependencyPolicy;
  readonly topology: FrameTopology;
  readonly lifecycleStates: readonly FrameLifecycleState[];
  readonly executionPolicies: readonly FrameExecutionPolicy[];
  readonly allowedSteps: readonly string[];
  readonly supportedConnectionPolicies: readonly string[];
  readonly supportedTransportPolicies: readonly string[];
  readonly supportedProtocolPolicies: readonly string[];
  readonly supportedSessionPolicies: readonly string[];
  readonly supportedPacketPolicies: readonly string[];
}

export interface FrameMetadata {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly layer: string;
  readonly category: string;
}

export interface ExecutionRuntimeFrameContext {
  readonly runtimeFrameId: string;
}

export interface ExecutionRuntimeFrameData {
  readonly managerType: FrameType;
  readonly managerScope: FrameScope;
  readonly frameModels: readonly RuntimeFrameModel[];
}

export interface ExecutionRuntimeFrame {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly context: ExecutionRuntimeFrameContext;
  readonly metadata: FrameMetadata;
  readonly data: ExecutionRuntimeFrameData;
}

export interface ExecutionRuntimeFrameBlueprint {
  getExecutionRuntimeFrame(): ExecutionRuntimeFrame;
  getMetadata(): FrameMetadata;
  getContext(): ExecutionRuntimeFrameContext;
  getData(): ExecutionRuntimeFrameData;
  getFrameModels(): readonly RuntimeFrameModel[];
  getFrameSequence(): readonly string[];
}

// 1. 静的実行ステップシーケンスの定義と凍結
export const FRAME_SEQUENCE: readonly string[] = Object.freeze([
  'REGISTER_FRAME',
  'VALIDATE_FRAME_SCHEMA',
  'INITIALIZE_FRAME_BLUEPRINT',
  'READY_FOR_FRAME_RUNTIME',
  'FRAME_SCHEMA_CONFIRMED'
]);

// 静的ポリシーリストの定義と凍結
const defaultPolicies: readonly FrameExecutionPolicy[] = Object.freeze([
  FrameExecutionPolicy.READ_ONLY,
  FrameExecutionPolicy.DETERMINISTIC,
  FrameExecutionPolicy.IMMUTABLE_SCHEMA,
  FrameExecutionPolicy.NO_THREAD,
  FrameExecutionPolicy.NO_QUEUE,
  FrameExecutionPolicy.NO_TASK,
  FrameExecutionPolicy.NO_WORKER,
  FrameExecutionPolicy.NO_DISPATCHER,
  FrameExecutionPolicy.NO_EVENT,
  FrameExecutionPolicy.NO_EVENT_BUS,
  FrameExecutionPolicy.NO_ROUTER,
  FrameExecutionPolicy.NO_TRANSPORT,
  FrameExecutionPolicy.NO_CONNECTION,
  FrameExecutionPolicy.NO_PROTOCOL,
  FrameExecutionPolicy.NO_SESSION,
  FrameExecutionPolicy.NO_PACKET,
  FrameExecutionPolicy.NO_SOCKET,
  FrameExecutionPolicy.NO_STREAM,
  FrameExecutionPolicy.NO_FRAME_BUILD,
  FrameExecutionPolicy.NO_FRAME_PARSE,
  FrameExecutionPolicy.NO_FRAME_SEND,
  FrameExecutionPolicy.NO_FRAME_RECEIVE,
  FrameExecutionPolicy.NO_FRAGMENT,
  FrameExecutionPolicy.NO_REASSEMBLY,
  FrameExecutionPolicy.NO_SYNCHRONIZATION
]);

// 静的ライフサイクル状態リストの定義と凍結
const defaultLifecycleStates: readonly FrameLifecycleState[] = Object.freeze([
  FrameLifecycleState.CREATED,
  FrameLifecycleState.READY,
  FrameLifecycleState.WAITING,
  FrameLifecycleState.SEALED,
  FrameLifecycleState.TERMINATED
]);

// 2. 静的フレームモデルリストの定義と凍結
export const RUNTIME_FRAME_MODELS: readonly RuntimeFrameModel[] = Object.freeze([
  Object.freeze({
    frameType: RuntimeFrameType.SYSTEM_FRAME,
    modelId: 'frame-model-system-01',
    metadata: Object.freeze({
      id: 'frame-meta-system-01',
      name: 'System Frame Metadata',
      frameModelVersion: '1.0',
      frameSchemaVersion: '1.0',
      description: 'Metadata for System Frame Schema'
    }),
    frameOrder: 1,
    supportedCapabilities: Object.freeze([FrameCapability.SYSTEM, FrameCapability.REMOTE, FrameCapability.LOCAL]),
    supportedFramePolicies: Object.freeze(['StaticSynchronization']),
    supportedFormatPolicies: Object.freeze([FrameFormatPolicy.JSON, FrameFormatPolicy.SCHEMA_ONLY]),
    supportedValidationPolicies: Object.freeze([FrameValidationPolicy.SCHEMA_ONLY]),
    dependencyPolicy: FrameDependencyPolicy.NO_DEPENDENCY,
    topology: FrameTopology.LOCAL,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: FRAME_SEQUENCE,
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedTransportPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedProtocolPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedSessionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedPacketPolicies: Object.freeze(['SCHEMA_ONLY'])
  }),
  Object.freeze({
    frameType: RuntimeFrameType.CORE_FRAME,
    modelId: 'frame-model-core-01',
    metadata: Object.freeze({
      id: 'frame-meta-core-01',
      name: 'Core Frame Metadata',
      frameModelVersion: '1.0',
      frameSchemaVersion: '1.0',
      description: 'Metadata for Core Frame Schema'
    }),
    frameOrder: 2,
    supportedCapabilities: Object.freeze([FrameCapability.SYSTEM, FrameCapability.APPLICATION, FrameCapability.INTER_PROCESS]),
    supportedFramePolicies: Object.freeze([]),
    supportedFormatPolicies: Object.freeze([FrameFormatPolicy.BINARY, FrameFormatPolicy.SCHEMA_ONLY]),
    supportedValidationPolicies: Object.freeze([FrameValidationPolicy.HEADER_ONLY, FrameValidationPolicy.SCHEMA_ONLY]),
    dependencyPolicy: FrameDependencyPolicy.STATIC_DEPENDENCY,
    topology: FrameTopology.PROCESS,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: FRAME_SEQUENCE,
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedTransportPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedProtocolPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedSessionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedPacketPolicies: Object.freeze(['SCHEMA_ONLY'])
  }),
  Object.freeze({
    frameType: RuntimeFrameType.APPLICATION_FRAME,
    modelId: 'frame-model-app-01',
    metadata: Object.freeze({
      id: 'frame-meta-app-01',
      name: 'Application Frame Metadata',
      frameModelVersion: '1.0',
      frameSchemaVersion: '1.0',
      description: 'Metadata for Application Frame Schema'
    }),
    frameOrder: 3,
    supportedCapabilities: Object.freeze([FrameCapability.APPLICATION, FrameCapability.AI, FrameCapability.WORKFLOW, FrameCapability.DISTRIBUTED, FrameCapability.INTER_NODE]),
    supportedFramePolicies: Object.freeze(['DynamicSynchronization']),
    supportedFormatPolicies: Object.freeze([FrameFormatPolicy.JSON, FrameFormatPolicy.SCHEMA_ONLY]),
    supportedValidationPolicies: Object.freeze([FrameValidationPolicy.FULL, FrameValidationPolicy.SCHEMA_ONLY]),
    dependencyPolicy: FrameDependencyPolicy.SCHEMA_ONLY,
    topology: FrameTopology.NODE,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: FRAME_SEQUENCE,
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedTransportPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedProtocolPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedSessionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedPacketPolicies: Object.freeze(['SCHEMA_ONLY'])
  }),
  Object.freeze({
    frameType: RuntimeFrameType.PLUGIN_FRAME,
    modelId: 'frame-model-plugin-01',
    metadata: Object.freeze({
      id: 'frame-meta-plugin-01',
      name: 'Plugin Frame Metadata',
      frameModelVersion: '1.0',
      frameSchemaVersion: '1.0',
      description: 'Metadata for Plugin Frame Schema'
    }),
    frameOrder: 4,
    supportedCapabilities: Object.freeze([FrameCapability.PLUGIN, FrameCapability.MONITORING]),
    supportedFramePolicies: Object.freeze([]),
    supportedFormatPolicies: Object.freeze([FrameFormatPolicy.MSGPACK, FrameFormatPolicy.SCHEMA_ONLY]),
    supportedValidationPolicies: Object.freeze([FrameValidationPolicy.SCHEMA, FrameValidationPolicy.SCHEMA_ONLY]),
    dependencyPolicy: FrameDependencyPolicy.NO_DEPENDENCY,
    topology: FrameTopology.CLUSTER,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: FRAME_SEQUENCE,
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedTransportPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedProtocolPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedSessionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedPacketPolicies: Object.freeze(['SCHEMA_ONLY'])
  }),
  Object.freeze({
    frameType: RuntimeFrameType.FIELD_FRAME,
    modelId: 'frame-model-field-01',
    metadata: Object.freeze({
      id: 'frame-meta-field-01',
      name: 'Field Frame Metadata',
      frameModelVersion: '1.0',
      frameSchemaVersion: '1.0',
      description: 'Metadata for Field Frame Schema'
    }),
    frameOrder: 5,
    supportedCapabilities: Object.freeze([FrameCapability.FIELD]),
    supportedFramePolicies: Object.freeze([]),
    supportedFormatPolicies: Object.freeze([FrameFormatPolicy.JSON, FrameFormatPolicy.SCHEMA_ONLY]),
    supportedValidationPolicies: Object.freeze([FrameValidationPolicy.FULL, FrameValidationPolicy.SCHEMA_ONLY]),
    dependencyPolicy: FrameDependencyPolicy.NO_DEPENDENCY,
    topology: FrameTopology.DISTRIBUTED,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: FRAME_SEQUENCE,
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedTransportPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedProtocolPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedSessionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedPacketPolicies: Object.freeze(['SCHEMA_ONLY'])
  })
]);

// 3. メタデータオブジェクトの作成と凍結
const frameMetadata: FrameMetadata = Object.freeze({
  id: 'runtime-frame-meta-01',
  name: 'Execution Runtime Frame Metadata',
  version: '1.0.0',
  description: 'Metadata for Execution Runtime Frame Foundation',
  layer: 'Frame Layer',
  category: 'Infrastructure'
});

// 4. コンテキストオブジェクトの作成と凍結 (ID 参照のみ、runtimeFrameId のみ)
const frameContext: ExecutionRuntimeFrameContext = Object.freeze({
  runtimeFrameId: 'runtime-frame-01'
});

// 5. データオブジェクトの作成と凍結
const frameData: ExecutionRuntimeFrameData = Object.freeze({
  managerType: FrameType.FOUNDATION,
  managerScope: FrameScope.SYSTEM,
  frameModels: RUNTIME_FRAME_MODELS
});

// 6. フレームマネージャーオブジェクト本体の作成と凍結
const runtimeFrameData: ExecutionRuntimeFrame = Object.freeze({
  id: 'runtime-frame-01',
  name: 'Default Execution Runtime Frame Foundation',
  description: 'The static execution runtime frame structure definition',
  context: frameContext,
  metadata: frameMetadata,
  data: frameData
});

// Blueprint コンテナの不変シングルトンインスタンス実装 (型固定の適用)
export const EXECUTION_RUNTIME_FRAME_BLUEPRINT: Readonly<ExecutionRuntimeFrameBlueprint> = Object.freeze({
  getExecutionRuntimeFrame(): ExecutionRuntimeFrame {
    return runtimeFrameData;
  },

  getMetadata(): FrameMetadata {
    return runtimeFrameData.metadata;
  },

  getContext(): ExecutionRuntimeFrameContext {
    return runtimeFrameData.context;
  },

  getData(): ExecutionRuntimeFrameData {
    return runtimeFrameData.data;
  },

  getFrameModels(): readonly RuntimeFrameModel[] {
    return RUNTIME_FRAME_MODELS;
  },

  getFrameSequence(): readonly string[] {
    return FRAME_SEQUENCE;
  }
});
