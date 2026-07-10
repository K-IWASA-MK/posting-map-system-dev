/**
 * ExecutionRuntimePort.ts
 * 
 * ExecutionRuntimePort Foundation の構造および公開インターフェース定義 (SSOT)。
 * 
 * 警告：本ファイル内への実際のポート生成、解決、登録、ポート開閉、バインド、データ分配、
 * 非同期処理、API 通信、コマンド送信、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum PortType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME'
}

export enum PortScope {
  SYSTEM = 'SYSTEM'
}

export enum RuntimePortType {
  SYSTEM_PORT = 'SYSTEM_PORT',
  CORE_PORT = 'CORE_PORT',
  APPLICATION_PORT = 'APPLICATION_PORT',
  PLUGIN_PORT = 'PLUGIN_PORT',
  FIELD_PORT = 'FIELD_PORT'
}

export enum PortLifecycleState {
  CREATED = 'CREATED',
  READY = 'READY',
  WAITING = 'WAITING',
  SEALED = 'SEALED',
  TERMINATED = 'TERMINATED'
}

export enum PortCapability {
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

export enum PortCategory {
  LOCAL = 'LOCAL',
  REMOTE = 'REMOTE',
  SERVICE = 'SERVICE',
  DEVICE = 'DEVICE',
  APPLICATION = 'APPLICATION',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum PortDirectionPolicy {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND',
  BIDIRECTIONAL = 'BIDIRECTIONAL',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum PortValidationPolicy {
  NONE = 'NONE',
  HEADER_ONLY = 'HEADER_ONLY',
  SCHEMA = 'SCHEMA',
  FULL = 'FULL',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum PortExecutionPolicy {
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
  NO_PORT_CREATE = 'NO_PORT_CREATE',
  NO_PORT_RESOLVE = 'NO_PORT_RESOLVE',
  NO_PORT_REGISTER = 'NO_PORT_REGISTER',
  NO_PORT_OPEN = 'NO_PORT_OPEN',
  NO_PORT_CLOSE = 'NO_PORT_CLOSE',
  NO_PORT_BIND = 'NO_PORT_BIND',
  NO_PORT_UNBIND = 'NO_PORT_UNBIND',
  NO_CONNECT = 'NO_CONNECT',
  NO_DISCONNECT = 'NO_DISCONNECT',
  NO_LISTEN = 'NO_LISTEN',
  NO_SEND = 'NO_SEND',
  NO_RECEIVE = 'NO_RECEIVE',
  NO_ROUTE = 'NO_ROUTE',
  NO_QUEUE_PROCESS = 'NO_QUEUE_PROCESS'
}

export enum PortDependencyPolicy {
  NO_DEPENDENCY = 'NO_DEPENDENCY',
  STATIC_DEPENDENCY = 'STATIC_DEPENDENCY',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum PortTopology {
  LOCAL = 'LOCAL',
  PROCESS = 'PROCESS',
  NODE = 'NODE',
  CLUSTER = 'CLUSTER',
  DISTRIBUTED = 'DISTRIBUTED'
}

export interface RuntimePortMetadata {
  readonly id: string;
  readonly name: string;
  readonly portModelVersion: string;
  readonly portSchemaVersion: string;
  readonly description: string;
}

export interface RuntimePortModel {
  readonly portType: RuntimePortType;
  readonly modelId: string;
  readonly metadata: RuntimePortMetadata;
  readonly portOrder: number;
  readonly supportedCapabilities: readonly PortCapability[];
  readonly supportedPortPolicies: readonly string[];
  readonly supportedDirectionPolicies: readonly PortDirectionPolicy[];
  readonly supportedValidationPolicies: readonly PortValidationPolicy[];
  readonly dependencyPolicy: PortDependencyPolicy;
  readonly topology: PortTopology;
  readonly lifecycleStates: readonly PortLifecycleState[];
  readonly executionPolicies: readonly PortExecutionPolicy[];
  readonly allowedSteps: readonly string[];
  readonly supportedTransportPolicies: readonly string[];
  readonly supportedConnectionPolicies: readonly string[];
  readonly supportedIdentityPolicies: readonly string[];
}

export interface PortMetadata {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly layer: string;
  readonly category: string;
}

export interface ExecutionRuntimePortContext {
  readonly runtimePortId: string;
}

export interface ExecutionRuntimePortData {
  readonly managerType: PortType;
  readonly managerScope: PortScope;
  readonly portModels: readonly RuntimePortModel[];
}

export interface ExecutionRuntimePort {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly context: ExecutionRuntimePortContext;
  readonly metadata: PortMetadata;
  readonly data: ExecutionRuntimePortData;
}

export interface ExecutionRuntimePortBlueprint {
  getExecutionRuntimePort(): ExecutionRuntimePort;
  getMetadata(): PortMetadata;
  getContext(): ExecutionRuntimePortContext;
  getData(): ExecutionRuntimePortData;
  getPortModels(): readonly RuntimePortModel[];
  getPortSequence(): readonly string[];
}

// 1. 静的実行ステップシーケンスの定義と凍結
export const PORT_SEQUENCE: readonly string[] = Object.freeze([
  'REGISTER_PORT',
  'VALIDATE_PORT_SCHEMA',
  'INITIALIZE_PORT_BLUEPRINT',
  'READY_FOR_PORT_RUNTIME',
  'PORT_SCHEMA_CONFIRMED'
]);

// 静的ポリシーリストの定義と凍結
const defaultPolicies: readonly PortExecutionPolicy[] = Object.freeze([
  PortExecutionPolicy.READ_ONLY,
  PortExecutionPolicy.DETERMINISTIC,
  PortExecutionPolicy.IMMUTABLE_SCHEMA,
  PortExecutionPolicy.NO_THREAD,
  PortExecutionPolicy.NO_QUEUE,
  PortExecutionPolicy.NO_TASK,
  PortExecutionPolicy.NO_WORKER,
  PortExecutionPolicy.NO_EVENT,
  PortExecutionPolicy.NO_EVENT_BUS,
  PortExecutionPolicy.NO_ROUTER,
  PortExecutionPolicy.NO_PORT_CREATE,
  PortExecutionPolicy.NO_PORT_RESOLVE,
  PortExecutionPolicy.NO_PORT_REGISTER,
  PortExecutionPolicy.NO_PORT_OPEN,
  PortExecutionPolicy.NO_PORT_CLOSE,
  PortExecutionPolicy.NO_PORT_BIND,
  PortExecutionPolicy.NO_PORT_UNBIND,
  PortExecutionPolicy.NO_CONNECT,
  PortExecutionPolicy.NO_DISCONNECT,
  PortExecutionPolicy.NO_LISTEN,
  PortExecutionPolicy.NO_SEND,
  PortExecutionPolicy.NO_RECEIVE,
  PortExecutionPolicy.NO_ROUTE,
  PortExecutionPolicy.NO_QUEUE_PROCESS
]);

// 静的ライフサイクル状態リストの定義と凍結
const defaultLifecycleStates: readonly PortLifecycleState[] = Object.freeze([
  PortLifecycleState.CREATED,
  PortLifecycleState.READY,
  PortLifecycleState.WAITING,
  PortLifecycleState.SEALED,
  PortLifecycleState.TERMINATED
]);

// 2. 静的ポートモデルリストの定義と凍結
export const RUNTIME_PORT_MODELS: readonly RuntimePortModel[] = Object.freeze([
  Object.freeze({
    portType: RuntimePortType.SYSTEM_PORT,
    modelId: 'port-model-system-01',
    metadata: Object.freeze({
      id: 'port-meta-system-01',
      name: 'SystemPortMetadata',
      portModelVersion: '1.0',
      portSchemaVersion: '1.0',
      description: 'Metadata for SystemPort Schema'
    }),
    portOrder: 1,
    supportedCapabilities: Object.freeze([PortCapability.SYSTEM, PortCapability.REMOTE, PortCapability.LOCAL]),
    supportedPortPolicies: Object.freeze(['StaticRouting']),
    supportedDirectionPolicies: Object.freeze([PortDirectionPolicy.SCHEMA_ONLY]),
    supportedValidationPolicies: Object.freeze([PortValidationPolicy.SCHEMA_ONLY]),
    dependencyPolicy: PortDependencyPolicy.NO_DEPENDENCY,
    topology: PortTopology.LOCAL,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: PORT_SEQUENCE,
    supportedTransportPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedIdentityPolicies: Object.freeze(['SCHEMA_ONLY'])
  }),
  Object.freeze({
    portType: RuntimePortType.CORE_PORT,
    modelId: 'port-model-core-01',
    metadata: Object.freeze({
      id: 'port-meta-core-01',
      name: 'CorePortMetadata',
      portModelVersion: '1.0',
      portSchemaVersion: '1.0',
      description: 'Metadata for CorePort Schema'
    }),
    portOrder: 2,
    supportedCapabilities: Object.freeze([PortCapability.SYSTEM, PortCapability.APPLICATION, PortCapability.INTER_PROCESS]),
    supportedPortPolicies: Object.freeze([]),
    supportedDirectionPolicies: Object.freeze([PortDirectionPolicy.SCHEMA_ONLY]),
    supportedValidationPolicies: Object.freeze([PortValidationPolicy.HEADER_ONLY, PortValidationPolicy.SCHEMA_ONLY]),
    dependencyPolicy: PortDependencyPolicy.STATIC_DEPENDENCY,
    topology: PortTopology.PROCESS,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: PORT_SEQUENCE,
    supportedTransportPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedIdentityPolicies: Object.freeze(['SCHEMA_ONLY'])
  }),
  Object.freeze({
    portType: RuntimePortType.APPLICATION_PORT,
    modelId: 'port-model-app-01',
    metadata: Object.freeze({
      id: 'port-meta-app-01',
      name: 'ApplicationPortMetadata',
      portModelVersion: '1.0',
      portSchemaVersion: '1.0',
      description: 'Metadata for ApplicationPort Schema'
    }),
    portOrder: 3,
    supportedCapabilities: Object.freeze([PortCapability.APPLICATION, PortCapability.AI, PortCapability.WORKFLOW, PortCapability.DISTRIBUTED, PortCapability.INTER_NODE]),
    supportedPortPolicies: Object.freeze(['DynamicRouting']),
    supportedDirectionPolicies: Object.freeze([PortDirectionPolicy.SCHEMA_ONLY]),
    supportedValidationPolicies: Object.freeze([PortValidationPolicy.FULL, PortValidationPolicy.SCHEMA_ONLY]),
    dependencyPolicy: PortDependencyPolicy.SCHEMA_ONLY,
    topology: PortTopology.NODE,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: PORT_SEQUENCE,
    supportedTransportPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedIdentityPolicies: Object.freeze(['SCHEMA_ONLY'])
  }),
  Object.freeze({
    portType: RuntimePortType.PLUGIN_PORT,
    modelId: 'port-model-plugin-01',
    metadata: Object.freeze({
      id: 'port-meta-plugin-01',
      name: 'PluginPortMetadata',
      portModelVersion: '1.0',
      portSchemaVersion: '1.0',
      description: 'Metadata for PluginPort Schema'
    }),
    portOrder: 4,
    supportedCapabilities: Object.freeze([PortCapability.PLUGIN, PortCapability.MONITORING]),
    supportedPortPolicies: Object.freeze([]),
    supportedDirectionPolicies: Object.freeze([PortDirectionPolicy.SCHEMA_ONLY]),
    supportedValidationPolicies: Object.freeze([PortValidationPolicy.SCHEMA, PortValidationPolicy.SCHEMA_ONLY]),
    dependencyPolicy: PortDependencyPolicy.NO_DEPENDENCY,
    topology: PortTopology.CLUSTER,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: PORT_SEQUENCE,
    supportedTransportPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedIdentityPolicies: Object.freeze(['SCHEMA_ONLY'])
  }),
  Object.freeze({
    portType: RuntimePortType.FIELD_PORT,
    modelId: 'port-model-field-01',
    metadata: Object.freeze({
      id: 'port-meta-field-01',
      name: 'FieldPortMetadata',
      portModelVersion: '1.0',
      portSchemaVersion: '1.0',
      description: 'Metadata for FieldPort Schema'
    }),
    portOrder: 5,
    supportedCapabilities: Object.freeze([PortCapability.FIELD]),
    supportedPortPolicies: Object.freeze([]),
    supportedDirectionPolicies: Object.freeze([PortDirectionPolicy.SCHEMA_ONLY]),
    supportedValidationPolicies: Object.freeze([PortValidationPolicy.FULL, PortValidationPolicy.SCHEMA_ONLY]),
    dependencyPolicy: PortDependencyPolicy.NO_DEPENDENCY,
    topology: PortTopology.DISTRIBUTED,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: PORT_SEQUENCE,
    supportedTransportPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedIdentityPolicies: Object.freeze(['SCHEMA_ONLY'])
  })
]);

// 3. メタデータオブジェクトの作成と凍結
const portMetadata: PortMetadata = Object.freeze({
  id: 'runtime-port-meta-01',
  name: 'ExecutionRuntimePortMetadata',
  version: '1.0.0',
  description: 'Metadata for ExecutionRuntimePort Foundation',
  layer: 'PortLayer',
  category: 'Infrastructure'
});

// 4. コンテキストオブジェクトの作成と凍結 (ID 参照のみ、runtimePortId のみ)
const portContext: ExecutionRuntimePortContext = Object.freeze({
  runtimePortId: 'runtime-port-01'
});

// 5. データオブジェクトの作成と凍結
const portData: ExecutionRuntimePortData = Object.freeze({
  managerType: PortType.FOUNDATION,
  managerScope: PortScope.SYSTEM,
  portModels: RUNTIME_PORT_MODELS
});

// 6. 主体マネージャーオブジェクト本体の作成と凍結
const runtimePortObj: ExecutionRuntimePort = Object.freeze({
  id: 'runtime-port-01',
  name: 'DefaultExecutionRuntimePort Foundation',
  description: 'The static execution-runtime-port structure definition',
  context: portContext,
  metadata: portMetadata,
  data: portData
});

// Blueprint コンテナの不変シングルトンインスタンス実装 (型固定の適用)
export const EXECUTION_RUNTIME_PORT_BLUEPRINT: Readonly<ExecutionRuntimePortBlueprint> = Object.freeze({
  getExecutionRuntimePort(): ExecutionRuntimePort {
    return runtimePortObj;
  },

  getMetadata(): PortMetadata {
    return runtimePortObj.metadata;
  },

  getContext(): ExecutionRuntimePortContext {
    return runtimePortObj.context;
  },

  getData(): ExecutionRuntimePortData {
    return runtimePortObj.data;
  },

  getPortModels(): readonly RuntimePortModel[] {
    return RUNTIME_PORT_MODELS;
  },

  getPortSequence(): readonly string[] {
    return PORT_SEQUENCE;
  }
});
