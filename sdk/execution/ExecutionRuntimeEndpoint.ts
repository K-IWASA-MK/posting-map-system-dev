/**
 * ExecutionRuntimeEndpoint.ts
 * 
 * ExecutionRuntimeEndpoint Foundation の構造および公開インターフェース定義 (SSOT)。
 * 
 * 警告：本ファイル内への実際のエンドポイント生成、解決、登録、アドレス開閉、ポートバインド、
 * 非同期処理、API 通信、コマンド送信、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum EndpointType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME'
}

export enum EndpointScope {
  SYSTEM = 'SYSTEM'
}

export enum RuntimeEndpointType {
  SYSTEM_ENDPOINT = 'SYSTEM_ENDPOINT',
  CORE_ENDPOINT = 'CORE_ENDPOINT',
  APPLICATION_ENDPOINT = 'APPLICATION_ENDPOINT',
  PLUGIN_ENDPOINT = 'PLUGIN_ENDPOINT',
  FIELD_ENDPOINT = 'FIELD_ENDPOINT'
}

export enum EndpointLifecycleState {
  CREATED = 'CREATED',
  READY = 'READY',
  WAITING = 'WAITING',
  SEALED = 'SEALED',
  TERMINATED = 'TERMINATED'
}

export enum EndpointCapability {
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

export enum EndpointCategory {
  LOCAL = 'LOCAL',
  REMOTE = 'REMOTE',
  SERVICE = 'SERVICE',
  DEVICE = 'DEVICE',
  APPLICATION = 'APPLICATION',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum EndpointAddressPolicy {
  STATIC_REFERENCE = 'STATIC_REFERENCE',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum EndpointResolutionPolicy {
  NONE = 'NONE',
  STATIC_ONLY = 'STATIC_ONLY',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum EndpointValidationPolicy {
  NONE = 'NONE',
  HEADER_ONLY = 'HEADER_ONLY',
  SCHEMA = 'SCHEMA',
  FULL = 'FULL',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum EndpointExecutionPolicy {
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
  NO_ENDPOINT_CREATE = 'NO_ENDPOINT_CREATE',
  NO_ENDPOINT_RESOLVE = 'NO_ENDPOINT_RESOLVE',
  NO_ENDPOINT_REGISTER = 'NO_ENDPOINT_REGISTER',
  NO_ADDRESS_LOOKUP = 'NO_ADDRESS_LOOKUP',
  NO_PORT_BIND = 'NO_PORT_BIND',
  NO_CONNECT = 'NO_CONNECT',
  NO_DISCOVER = 'NO_DISCOVER'
}

export enum EndpointDependencyPolicy {
  NO_DEPENDENCY = 'NO_DEPENDENCY',
  STATIC_DEPENDENCY = 'STATIC_DEPENDENCY',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum EndpointTopology {
  LOCAL = 'LOCAL',
  PROCESS = 'PROCESS',
  NODE = 'NODE',
  CLUSTER = 'CLUSTER',
  DISTRIBUTED = 'DISTRIBUTED'
}

export interface RuntimeEndpointMetadata {
  readonly id: string;
  readonly name: string;
  readonly endpointModelVersion: string;
  readonly endpointSchemaVersion: string;
  readonly description: string;
}

export interface RuntimeEndpointModel {
  readonly endpointType: RuntimeEndpointType;
  readonly modelId: string;
  readonly metadata: RuntimeEndpointMetadata;
  readonly endpointOrder: number;
  readonly supportedCapabilities: readonly EndpointCapability[];
  readonly supportedEndpointPolicies: readonly string[];
  readonly supportedAddressPolicies: readonly EndpointAddressPolicy[];
  readonly supportedResolutionPolicies: readonly EndpointResolutionPolicy[];
  readonly supportedValidationPolicies: readonly EndpointValidationPolicy[];
  readonly dependencyPolicy: EndpointDependencyPolicy;
  readonly topology: EndpointTopology;
  readonly lifecycleStates: readonly EndpointLifecycleState[];
  readonly executionPolicies: readonly EndpointExecutionPolicy[];
  readonly allowedSteps: readonly string[];
  readonly supportedTransportPolicies: readonly string[];
  readonly supportedConnectionPolicies: readonly string[];
  readonly supportedIdentityPolicies: readonly string[];
}

export interface EndpointMetadata {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly layer: string;
  readonly category: string;
}

export interface ExecutionRuntimeEndpointContext {
  readonly runtimeEndpointId: string;
}

export interface ExecutionRuntimeEndpointData {
  readonly managerType: EndpointType;
  readonly managerScope: EndpointScope;
  readonly endpointModels: readonly RuntimeEndpointModel[];
}

export interface ExecutionRuntimeEndpoint {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly context: ExecutionRuntimeEndpointContext;
  readonly metadata: EndpointMetadata;
  readonly data: ExecutionRuntimeEndpointData;
}

export interface ExecutionRuntimeEndpointBlueprint {
  getExecutionRuntimeEndpoint(): ExecutionRuntimeEndpoint;
  getMetadata(): EndpointMetadata;
  getContext(): ExecutionRuntimeEndpointContext;
  getData(): ExecutionRuntimeEndpointData;
  getEndpointModels(): readonly RuntimeEndpointModel[];
  getEndpointSequence(): readonly string[];
}

// 1. 静的実行ステップシーケンスの定義と凍結
export const ENDPOINT_SEQUENCE: readonly string[] = Object.freeze([
  'REGISTER_ENDPOINT',
  'VALIDATE_ENDPOINT_SCHEMA',
  'INITIALIZE_ENDPOINT_BLUEPRINT',
  'READY_FOR_ENDPOINT_RUNTIME',
  'ENDPOINT_SCHEMA_CONFIRMED'
]);

// 静的ポリシーリストの定義と凍結
const defaultPolicies: readonly EndpointExecutionPolicy[] = Object.freeze([
  EndpointExecutionPolicy.READ_ONLY,
  EndpointExecutionPolicy.DETERMINISTIC,
  EndpointExecutionPolicy.IMMUTABLE_SCHEMA,
  EndpointExecutionPolicy.NO_THREAD,
  EndpointExecutionPolicy.NO_QUEUE,
  EndpointExecutionPolicy.NO_TASK,
  EndpointExecutionPolicy.NO_WORKER,
  EndpointExecutionPolicy.NO_EVENT,
  EndpointExecutionPolicy.NO_EVENT_BUS,
  EndpointExecutionPolicy.NO_ROUTER,
  EndpointExecutionPolicy.NO_ENDPOINT_CREATE,
  EndpointExecutionPolicy.NO_ENDPOINT_RESOLVE,
  EndpointExecutionPolicy.NO_ENDPOINT_REGISTER,
  EndpointExecutionPolicy.NO_ADDRESS_LOOKUP,
  EndpointExecutionPolicy.NO_PORT_BIND,
  EndpointExecutionPolicy.NO_CONNECT,
  EndpointExecutionPolicy.NO_DISCOVER
]);

// 静的ライフサイクル状態リストの定義と凍結
const defaultLifecycleStates: readonly EndpointLifecycleState[] = Object.freeze([
  EndpointLifecycleState.CREATED,
  EndpointLifecycleState.READY,
  EndpointLifecycleState.WAITING,
  EndpointLifecycleState.SEALED,
  EndpointLifecycleState.TERMINATED
]);

// 2. 静的エンドポイントモデルリストの定義と凍結
export const RUNTIME_ENDPOINT_MODELS: readonly RuntimeEndpointModel[] = Object.freeze([
  Object.freeze({
    endpointType: RuntimeEndpointType.SYSTEM_ENDPOINT,
    modelId: 'endpoint-model-system-01',
    metadata: Object.freeze({
      id: 'endpoint-meta-system-01',
      name: 'SystemEndpointMetadata',
      endpointModelVersion: '1.0',
      endpointSchemaVersion: '1.0',
      description: 'Metadata for SystemEndpoint Schema'
    }),
    endpointOrder: 1,
    supportedCapabilities: Object.freeze([EndpointCapability.SYSTEM, EndpointCapability.REMOTE, EndpointCapability.LOCAL]),
    supportedEndpointPolicies: Object.freeze(['StaticRouting']),
    supportedAddressPolicies: Object.freeze([EndpointAddressPolicy.SCHEMA_ONLY]),
    supportedResolutionPolicies: Object.freeze([EndpointResolutionPolicy.SCHEMA_ONLY]),
    supportedValidationPolicies: Object.freeze([EndpointValidationPolicy.SCHEMA_ONLY]),
    dependencyPolicy: EndpointDependencyPolicy.NO_DEPENDENCY,
    topology: EndpointTopology.LOCAL,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: ENDPOINT_SEQUENCE,
    supportedTransportPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedIdentityPolicies: Object.freeze(['SCHEMA_ONLY'])
  }),
  Object.freeze({
    endpointType: RuntimeEndpointType.CORE_ENDPOINT,
    modelId: 'endpoint-model-core-01',
    metadata: Object.freeze({
      id: 'endpoint-meta-core-01',
      name: 'CoreEndpointMetadata',
      endpointModelVersion: '1.0',
      endpointSchemaVersion: '1.0',
      description: 'Metadata for CoreEndpoint Schema'
    }),
    endpointOrder: 2,
    supportedCapabilities: Object.freeze([EndpointCapability.SYSTEM, EndpointCapability.APPLICATION, EndpointCapability.INTER_PROCESS]),
    supportedEndpointPolicies: Object.freeze([]),
    supportedAddressPolicies: Object.freeze([EndpointAddressPolicy.SCHEMA_ONLY]),
    supportedResolutionPolicies: Object.freeze([EndpointResolutionPolicy.SCHEMA_ONLY]),
    supportedValidationPolicies: Object.freeze([EndpointValidationPolicy.HEADER_ONLY, EndpointValidationPolicy.SCHEMA_ONLY]),
    dependencyPolicy: EndpointDependencyPolicy.STATIC_DEPENDENCY,
    topology: EndpointTopology.PROCESS,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: ENDPOINT_SEQUENCE,
    supportedTransportPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedIdentityPolicies: Object.freeze(['SCHEMA_ONLY'])
  }),
  Object.freeze({
    endpointType: RuntimeEndpointType.APPLICATION_ENDPOINT,
    modelId: 'endpoint-model-app-01',
    metadata: Object.freeze({
      id: 'endpoint-meta-app-01',
      name: 'ApplicationEndpointMetadata',
      endpointModelVersion: '1.0',
      endpointSchemaVersion: '1.0',
      description: 'Metadata for ApplicationEndpoint Schema'
    }),
    endpointOrder: 3,
    supportedCapabilities: Object.freeze([EndpointCapability.APPLICATION, EndpointCapability.AI, EndpointCapability.WORKFLOW, EndpointCapability.DISTRIBUTED, EndpointCapability.INTER_NODE]),
    supportedEndpointPolicies: Object.freeze(['DynamicRouting']),
    supportedAddressPolicies: Object.freeze([EndpointAddressPolicy.SCHEMA_ONLY]),
    supportedResolutionPolicies: Object.freeze([EndpointResolutionPolicy.SCHEMA_ONLY]),
    supportedValidationPolicies: Object.freeze([EndpointValidationPolicy.FULL, EndpointValidationPolicy.SCHEMA_ONLY]),
    dependencyPolicy: EndpointDependencyPolicy.SCHEMA_ONLY,
    topology: EndpointTopology.NODE,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: ENDPOINT_SEQUENCE,
    supportedTransportPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedIdentityPolicies: Object.freeze(['SCHEMA_ONLY'])
  }),
  Object.freeze({
    endpointType: RuntimeEndpointType.PLUGIN_ENDPOINT,
    modelId: 'endpoint-model-plugin-01',
    metadata: Object.freeze({
      id: 'endpoint-meta-plugin-01',
      name: 'PluginEndpointMetadata',
      endpointModelVersion: '1.0',
      endpointSchemaVersion: '1.0',
      description: 'Metadata for PluginEndpoint Schema'
    }),
    endpointOrder: 4,
    supportedCapabilities: Object.freeze([EndpointCapability.PLUGIN, EndpointCapability.MONITORING]),
    supportedEndpointPolicies: Object.freeze([]),
    supportedAddressPolicies: Object.freeze([EndpointAddressPolicy.SCHEMA_ONLY]),
    supportedResolutionPolicies: Object.freeze([EndpointResolutionPolicy.SCHEMA_ONLY]),
    supportedValidationPolicies: Object.freeze([EndpointValidationPolicy.SCHEMA, EndpointValidationPolicy.SCHEMA_ONLY]),
    dependencyPolicy: EndpointDependencyPolicy.NO_DEPENDENCY,
    topology: EndpointTopology.CLUSTER,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: ENDPOINT_SEQUENCE,
    supportedTransportPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedIdentityPolicies: Object.freeze(['SCHEMA_ONLY'])
  }),
  Object.freeze({
    endpointType: RuntimeEndpointType.FIELD_ENDPOINT,
    modelId: 'endpoint-model-field-01',
    metadata: Object.freeze({
      id: 'endpoint-meta-field-01',
      name: 'FieldEndpointMetadata',
      endpointModelVersion: '1.0',
      endpointSchemaVersion: '1.0',
      description: 'Metadata for FieldEndpoint Schema'
    }),
    endpointOrder: 5,
    supportedCapabilities: Object.freeze([EndpointCapability.FIELD]),
    supportedEndpointPolicies: Object.freeze([]),
    supportedAddressPolicies: Object.freeze([EndpointAddressPolicy.SCHEMA_ONLY]),
    supportedResolutionPolicies: Object.freeze([EndpointResolutionPolicy.SCHEMA_ONLY]),
    supportedValidationPolicies: Object.freeze([EndpointValidationPolicy.FULL, EndpointValidationPolicy.SCHEMA_ONLY]),
    dependencyPolicy: EndpointDependencyPolicy.NO_DEPENDENCY,
    topology: EndpointTopology.DISTRIBUTED,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: ENDPOINT_SEQUENCE,
    supportedTransportPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedIdentityPolicies: Object.freeze(['SCHEMA_ONLY'])
  })
]);

// 3. メタデータオブジェクトの作成と凍結
const endpointMetadata: EndpointMetadata = Object.freeze({
  id: 'runtime-endpoint-meta-01',
  name: 'ExecutionRuntimeEndpointMetadata',
  version: '1.0.0',
  description: 'Metadata for ExecutionRuntimeEndpoint Foundation',
  layer: 'EndpointLayer',
  category: 'Infrastructure'
});

// 4. コンテキストオブジェクトの作成と凍結 (ID 参照のみ、runtimeEndpointId のみ)
const endpointContext: ExecutionRuntimeEndpointContext = Object.freeze({
  runtimeEndpointId: 'runtime-endpoint-01'
});

// 5. データオブジェクトの作成と凍結
const endpointData: ExecutionRuntimeEndpointData = Object.freeze({
  managerType: EndpointType.FOUNDATION,
  managerScope: EndpointScope.SYSTEM,
  endpointModels: RUNTIME_ENDPOINT_MODELS
});

// 6. 主体マネージャーオブジェクト本体の作成と凍結
const runtimeEndpointObj: ExecutionRuntimeEndpoint = Object.freeze({
  id: 'runtime-endpoint-01',
  name: 'DefaultExecutionRuntimeEndpoint Foundation',
  description: 'The static execution-runtime-endpoint structure definition',
  context: endpointContext,
  metadata: endpointMetadata,
  data: endpointData
});

// Blueprint コンテナの不変シングルトンインスタンス実装 (型固定の適用)
export const EXECUTION_RUNTIME_ENDPOINT_BLUEPRINT: Readonly<ExecutionRuntimeEndpointBlueprint> = Object.freeze({
  getExecutionRuntimeEndpoint(): ExecutionRuntimeEndpoint {
    return runtimeEndpointObj;
  },

  getMetadata(): EndpointMetadata {
    return runtimeEndpointObj.metadata;
  },

  getContext(): ExecutionRuntimeEndpointContext {
    return runtimeEndpointObj.context;
  },

  getData(): ExecutionRuntimeEndpointData {
    return runtimeEndpointObj.data;
  },

  getEndpointModels(): readonly RuntimeEndpointModel[] {
    return RUNTIME_ENDPOINT_MODELS;
  },

  getEndpointSequence(): readonly string[] {
    return ENDPOINT_SEQUENCE;
  }
});
