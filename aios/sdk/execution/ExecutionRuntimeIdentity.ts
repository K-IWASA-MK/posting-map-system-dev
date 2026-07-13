/**
 * ExecutionRuntimeIdentity.ts
 * 
 * Execution Runtime Identity Foundation の構造および公開インターフェース定義 (SSOT)。
 * 
 * 警告：本ファイル内への実際のアイデンティティ生成、署名、検証、トークン発行、認証・認可、
 * 非同期処理、API 通信、コマンド送信、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum IdentityType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME'
}

export enum IdentityScope {
  SYSTEM = 'SYSTEM'
}

export enum RuntimeIdentityType {
  SYSTEM_IDENTITY = 'SYSTEM_IDENTITY',
  CORE_IDENTITY = 'CORE_IDENTITY',
  APPLICATION_IDENTITY = 'APPLICATION_IDENTITY',
  PLUGIN_IDENTITY = 'PLUGIN_IDENTITY',
  FIELD_IDENTITY = 'FIELD_IDENTITY'
}

export enum IdentityLifecycleState {
  CREATED = 'CREATED',
  READY = 'READY',
  WAITING = 'WAITING',
  SEALED = 'SEALED',
  TERMINATED = 'TERMINATED'
}

export enum IdentityCapability {
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

export enum IdentityCategory {
  USER = 'USER',
  SERVICE = 'SERVICE',
  SYSTEM = 'SYSTEM',
  DEVICE = 'DEVICE',
  AGENT = 'AGENT',
  PLUGIN = 'PLUGIN',
  FIELD = 'FIELD',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum IdentityTrustPolicy {
  NONE = 'NONE',
  STATIC_TRUST = 'STATIC_TRUST',
  CERTIFICATE_REFERENCE = 'CERTIFICATE_REFERENCE',
  ATTESTATION_REFERENCE = 'ATTESTATION_REFERENCE',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum IdentityValidationPolicy {
  NONE = 'NONE',
  SCHEMA = 'SCHEMA',
  HEADER_ONLY = 'HEADER_ONLY',
  FULL = 'FULL',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum IdentitySecurityPolicy {
  NONE = 'NONE',
  SIGNATURE_REFERENCE = 'SIGNATURE_REFERENCE',
  AUTH_REFERENCE = 'AUTH_REFERENCE',
  TRUST_REFERENCE = 'TRUST_REFERENCE',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum IdentityExecutionPolicy {
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
  NO_TOKEN = 'NO_TOKEN',
  NO_CREDENTIAL = 'NO_CREDENTIAL',
  NO_AUTHENTICATION = 'NO_AUTHENTICATION',
  NO_AUTHORIZATION = 'NO_AUTHORIZATION',
  NO_IDENTITY_CREATE = 'NO_IDENTITY_CREATE',
  NO_IDENTITY_VALIDATE = 'NO_IDENTITY_VALIDATE'
}

export enum IdentityDependencyPolicy {
  NO_DEPENDENCY = 'NO_DEPENDENCY',
  STATIC_DEPENDENCY = 'STATIC_DEPENDENCY',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum IdentityTopology {
  LOCAL = 'LOCAL',
  PROCESS = 'PROCESS',
  NODE = 'NODE',
  CLUSTER = 'CLUSTER',
  DISTRIBUTED = 'DISTRIBUTED'
}

export interface RuntimeIdentityMetadata {
  readonly id: string;
  readonly name: string;
  readonly identityModelVersion: string;
  readonly identitySchemaVersion: string;
  readonly description: string;
}

export interface RuntimeIdentityModel {
  readonly identityType: RuntimeIdentityType;
  readonly modelId: string;
  readonly metadata: RuntimeIdentityMetadata;
  readonly identityOrder: number;
  readonly supportedCapabilities: readonly IdentityCapability[];
  readonly supportedTrustPolicies: readonly IdentityTrustPolicy[];
  readonly supportedSecurityPolicies: readonly IdentitySecurityPolicy[];
  readonly supportedValidationPolicies: readonly IdentityValidationPolicy[];
  readonly dependencyPolicy: IdentityDependencyPolicy;
  readonly topology: IdentityTopology;
  readonly lifecycleStates: readonly IdentityLifecycleState[];
  readonly executionPolicies: readonly IdentityExecutionPolicy[];
  readonly allowedSteps: readonly string[];
  readonly supportedSessionPolicies: readonly string[];
  readonly supportedConnectionPolicies: readonly string[];
  readonly supportedSecureChannelPolicies: readonly string[];
}

export interface IdentityMetadata {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly layer: string;
  readonly category: string;
}

export interface ExecutionRuntimeIdentityContext {
  readonly runtimeIdentityId: string;
}

export interface ExecutionRuntimeIdentityData {
  readonly managerType: IdentityType;
  readonly managerScope: IdentityScope;
  readonly identityModels: readonly RuntimeIdentityModel[];
}

export interface ExecutionRuntimeIdentity {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly context: ExecutionRuntimeIdentityContext;
  readonly metadata: IdentityMetadata;
  readonly data: ExecutionRuntimeIdentityData;
}

export interface ExecutionRuntimeIdentityBlueprint {
  getExecutionRuntimeIdentity(): ExecutionRuntimeIdentity;
  getMetadata(): IdentityMetadata;
  getContext(): ExecutionRuntimeIdentityContext;
  getData(): ExecutionRuntimeIdentityData;
  getIdentityModels(): readonly RuntimeIdentityModel[];
  getIdentitySequence(): readonly string[];
}

// 1. 静的実行ステップシーケンスの定義と凍結
export const IDENTITY_SEQUENCE: readonly string[] = Object.freeze([
  'REGISTER_IDENTITY',
  'VALIDATE_IDENTITY_SCHEMA',
  'INITIALIZE_IDENTITY_BLUEPRINT',
  'READY_FOR_IDENTITY_RUNTIME',
  'IDENTITY_SCHEMA_CONFIRMED'
]);

// 静的ポリシーリストの定義と凍結
const defaultPolicies: readonly IdentityExecutionPolicy[] = Object.freeze([
  IdentityExecutionPolicy.READ_ONLY,
  IdentityExecutionPolicy.DETERMINISTIC,
  IdentityExecutionPolicy.IMMUTABLE_SCHEMA,
  IdentityExecutionPolicy.NO_THREAD,
  IdentityExecutionPolicy.NO_QUEUE,
  IdentityExecutionPolicy.NO_TASK,
  IdentityExecutionPolicy.NO_WORKER,
  IdentityExecutionPolicy.NO_DISPATCHER,
  IdentityExecutionPolicy.NO_EVENT,
  IdentityExecutionPolicy.NO_EVENT_BUS,
  IdentityExecutionPolicy.NO_ROUTER,
  IdentityExecutionPolicy.NO_TRANSPORT,
  IdentityExecutionPolicy.NO_CONNECTION,
  IdentityExecutionPolicy.NO_PROTOCOL,
  IdentityExecutionPolicy.NO_SESSION,
  IdentityExecutionPolicy.NO_TOKEN,
  IdentityExecutionPolicy.NO_CREDENTIAL,
  IdentityExecutionPolicy.NO_AUTHENTICATION,
  IdentityExecutionPolicy.NO_AUTHORIZATION,
  IdentityExecutionPolicy.NO_IDENTITY_CREATE,
  IdentityExecutionPolicy.NO_IDENTITY_VALIDATE
]);

// 静的ライフサイクル状態リストの定義と凍結
const defaultLifecycleStates: readonly IdentityLifecycleState[] = Object.freeze([
  IdentityLifecycleState.CREATED,
  IdentityLifecycleState.READY,
  IdentityLifecycleState.WAITING,
  IdentityLifecycleState.SEALED,
  IdentityLifecycleState.TERMINATED
]);

// 2. 静的主体モデルリストの定義と凍結
export const RUNTIME_IDENTITY_MODELS: readonly RuntimeIdentityModel[] = Object.freeze([
  Object.freeze({
    identityType: RuntimeIdentityType.SYSTEM_IDENTITY,
    modelId: 'identity-model-system-01',
    metadata: Object.freeze({
      id: 'identity-meta-system-01',
      name: 'System Identity Metadata',
      identityModelVersion: '1.0',
      identitySchemaVersion: '1.0',
      description: 'Metadata for System Identity Schema'
    }),
    identityOrder: 1,
    supportedCapabilities: Object.freeze([IdentityCapability.SYSTEM, IdentityCapability.REMOTE, IdentityCapability.LOCAL]),
    supportedTrustPolicies: Object.freeze([IdentityTrustPolicy.STATIC_TRUST, IdentityTrustPolicy.SCHEMA_ONLY]),
    supportedSecurityPolicies: Object.freeze([IdentitySecurityPolicy.SIGNATURE_REFERENCE, IdentitySecurityPolicy.SCHEMA_ONLY]),
    supportedValidationPolicies: Object.freeze([IdentityValidationPolicy.SCHEMA_ONLY]),
    dependencyPolicy: IdentityDependencyPolicy.NO_DEPENDENCY,
    topology: IdentityTopology.LOCAL,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: IDENTITY_SEQUENCE,
    supportedSessionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedSecureChannelPolicies: Object.freeze(['SCHEMA_ONLY'])
  }),
  Object.freeze({
    identityType: RuntimeIdentityType.CORE_IDENTITY,
    modelId: 'identity-model-core-01',
    metadata: Object.freeze({
      id: 'identity-meta-core-01',
      name: 'Core Identity Metadata',
      identityModelVersion: '1.0',
      identitySchemaVersion: '1.0',
      description: 'Metadata for Core Identity Schema'
    }),
    identityOrder: 2,
    supportedCapabilities: Object.freeze([IdentityCapability.SYSTEM, IdentityCapability.APPLICATION, IdentityCapability.INTER_PROCESS]),
    supportedTrustPolicies: Object.freeze([IdentityTrustPolicy.CERTIFICATE_REFERENCE, IdentityTrustPolicy.SCHEMA_ONLY]),
    supportedSecurityPolicies: Object.freeze([IdentitySecurityPolicy.AUTH_REFERENCE, IdentitySecurityPolicy.SCHEMA_ONLY]),
    supportedValidationPolicies: Object.freeze([IdentityValidationPolicy.HEADER_ONLY, IdentityValidationPolicy.SCHEMA_ONLY]),
    dependencyPolicy: IdentityDependencyPolicy.STATIC_DEPENDENCY,
    topology: IdentityTopology.PROCESS,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: IDENTITY_SEQUENCE,
    supportedSessionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedSecureChannelPolicies: Object.freeze(['SCHEMA_ONLY'])
  }),
  Object.freeze({
    identityType: RuntimeIdentityType.APPLICATION_IDENTITY,
    modelId: 'identity-model-app-01',
    metadata: Object.freeze({
      id: 'identity-meta-app-01',
      name: 'Application Identity Metadata',
      identityModelVersion: '1.0',
      identitySchemaVersion: '1.0',
      description: 'Metadata for Application Identity Schema'
    }),
    identityOrder: 3,
    supportedCapabilities: Object.freeze([IdentityCapability.APPLICATION, IdentityCapability.AI, IdentityCapability.WORKFLOW, IdentityCapability.DISTRIBUTED, IdentityCapability.INTER_NODE]),
    supportedTrustPolicies: Object.freeze([IdentityTrustPolicy.ATTESTATION_REFERENCE, IdentityTrustPolicy.SCHEMA_ONLY]),
    supportedSecurityPolicies: Object.freeze([IdentitySecurityPolicy.TRUST_REFERENCE, IdentitySecurityPolicy.SCHEMA_ONLY]),
    supportedValidationPolicies: Object.freeze([IdentityValidationPolicy.FULL, IdentityValidationPolicy.SCHEMA_ONLY]),
    dependencyPolicy: IdentityDependencyPolicy.SCHEMA_ONLY,
    topology: IdentityTopology.NODE,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: IDENTITY_SEQUENCE,
    supportedSessionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedSecureChannelPolicies: Object.freeze(['SCHEMA_ONLY'])
  }),
  Object.freeze({
    identityType: RuntimeIdentityType.PLUGIN_IDENTITY,
    modelId: 'identity-model-plugin-01',
    metadata: Object.freeze({
      id: 'identity-meta-plugin-01',
      name: 'Plugin Identity Metadata',
      identityModelVersion: '1.0',
      identitySchemaVersion: '1.0',
      description: 'Metadata for Plugin Identity Schema'
    }),
    identityOrder: 4,
    supportedCapabilities: Object.freeze([IdentityCapability.PLUGIN, IdentityCapability.MONITORING]),
    supportedTrustPolicies: Object.freeze([IdentityTrustPolicy.STATIC_TRUST, IdentityTrustPolicy.SCHEMA_ONLY]),
    supportedSecurityPolicies: Object.freeze([IdentitySecurityPolicy.SIGNATURE_REFERENCE, IdentitySecurityPolicy.SCHEMA_ONLY]),
    supportedValidationPolicies: Object.freeze([IdentityValidationPolicy.SCHEMA, IdentityValidationPolicy.SCHEMA_ONLY]),
    dependencyPolicy: IdentityDependencyPolicy.NO_DEPENDENCY,
    topology: IdentityTopology.CLUSTER,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: IDENTITY_SEQUENCE,
    supportedSessionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedSecureChannelPolicies: Object.freeze(['SCHEMA_ONLY'])
  }),
  Object.freeze({
    identityType: RuntimeIdentityType.FIELD_IDENTITY,
    modelId: 'identity-model-field-01',
    metadata: Object.freeze({
      id: 'identity-meta-field-01',
      name: 'Field Identity Metadata',
      identityModelVersion: '1.0',
      identitySchemaVersion: '1.0',
      description: 'Metadata for Field Identity Schema'
    }),
    identityOrder: 5,
    supportedCapabilities: Object.freeze([IdentityCapability.FIELD]),
    supportedTrustPolicies: Object.freeze([IdentityTrustPolicy.CERTIFICATE_REFERENCE, IdentityTrustPolicy.SCHEMA_ONLY]),
    supportedSecurityPolicies: Object.freeze([IdentitySecurityPolicy.AUTH_REFERENCE, IdentitySecurityPolicy.SCHEMA_ONLY]),
    supportedValidationPolicies: Object.freeze([IdentityValidationPolicy.FULL, IdentityValidationPolicy.SCHEMA_ONLY]),
    dependencyPolicy: IdentityDependencyPolicy.NO_DEPENDENCY,
    topology: IdentityTopology.DISTRIBUTED,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: IDENTITY_SEQUENCE,
    supportedSessionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedSecureChannelPolicies: Object.freeze(['SCHEMA_ONLY'])
  })
]);

// 3. メタデータオブジェクトの作成と凍結
const identityMetadata: IdentityMetadata = Object.freeze({
  id: 'runtime-identity-meta-01',
  name: 'Execution Runtime Identity Metadata',
  version: '1.0.0',
  description: 'Metadata for Execution Runtime Identity Foundation',
  layer: 'Identity Layer',
  category: 'Infrastructure'
});

// 4. コンテキストオブジェクトの作成と凍結 (ID 参照のみ、runtimeIdentityId のみ)
const identityContext: ExecutionRuntimeIdentityContext = Object.freeze({
  runtimeIdentityId: 'runtime-identity-01'
});

// 5. データオブジェクトの作成と凍結
const identityData: ExecutionRuntimeIdentityData = Object.freeze({
  managerType: IdentityType.FOUNDATION,
  managerScope: IdentityScope.SYSTEM,
  identityModels: RUNTIME_IDENTITY_MODELS
});

// 6. 主体マネージャーオブジェクト本体の作成と凍結
const runtimeIdentityData: ExecutionRuntimeIdentity = Object.freeze({
  id: 'runtime-identity-01',
  name: 'Default Execution Runtime Identity Foundation',
  description: 'The static execution runtime identity structure definition',
  context: identityContext,
  metadata: identityMetadata,
  data: identityData
});

// Blueprint コンテナの不変シングルトンインスタンス実装 (型固定の適用)
export const EXECUTION_RUNTIME_IDENTITY_BLUEPRINT: Readonly<ExecutionRuntimeIdentityBlueprint> = Object.freeze({
  getExecutionRuntimeIdentity(): ExecutionRuntimeIdentity {
    return runtimeIdentityData;
  },

  getMetadata(): IdentityMetadata {
    return runtimeIdentityData.metadata;
  },

  getContext(): ExecutionRuntimeIdentityContext {
    return runtimeIdentityData.context;
  },

  getData(): ExecutionRuntimeIdentityData {
    return runtimeIdentityData.data;
  },

  getIdentityModels(): readonly RuntimeIdentityModel[] {
    return RUNTIME_IDENTITY_MODELS;
  },

  getIdentitySequence(): readonly string[] {
    return IDENTITY_SEQUENCE;
  }
});
