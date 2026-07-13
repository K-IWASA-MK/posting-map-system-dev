/**
 * ExecutionRuntimeKernel.ts
 * 
 * Execution Runtime Kernel Foundation の構造および公開インターフェース定義 (SSOT)。
 * 
 * 警告：本ファイル内への実際の Kernel 起動、初期化、解釈、実行、スレッド/プロセス生成、
 * スケジューリング、非同期処理、キュー処理、リトライ、API 通信、コマンド送信、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum KernelType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME',
  SIMULATION = 'SIMULATION',
  PLUGIN = 'PLUGIN',
  AI = 'AI'
}

export enum KernelScope {
  SYSTEM = 'SYSTEM',
  USER = 'USER',
  TENANT = 'TENANT'
}

export enum RuntimeKernelType {
  SYSTEM_KERNEL = 'SYSTEM_KERNEL',
  CORE_KERNEL = 'CORE_KERNEL',
  APPLICATION_KERNEL = 'APPLICATION_KERNEL',
  PLUGIN_KERNEL = 'PLUGIN_KERNEL',
  FIELD_KERNEL = 'FIELD_KERNEL'
}

export enum KernelStep {
  REGISTER_INTERPRETATION = 'REGISTER_INTERPRETATION',
  VALIDATE_INTERPRETATION = 'VALIDATE_INTERPRETATION',
  BUILD_KERNEL_SCHEMA = 'BUILD_KERNEL_SCHEMA',
  READY_FOR_RUNTIME = 'READY_FOR_RUNTIME',
  KERNEL_SCHEMA_READY = 'KERNEL_SCHEMA_READY'
}

export enum KernelLifecycleState {
  CREATED = 'CREATED',
  READY = 'READY',
  RUNNING = 'RUNNING',
  STOPPED = 'STOPPED',
  TERMINATED = 'TERMINATED'
}

export enum KernelCapability {
  INTERPRETATION = 'INTERPRETATION',
  EXECUTION = 'EXECUTION',
  SCHEDULING = 'SCHEDULING',
  MONITORING = 'MONITORING',
  GOVERNANCE = 'GOVERNANCE'
}

export enum KernelExecutionPolicy {
  READ_ONLY = 'READ_ONLY',
  DETERMINISTIC = 'DETERMINISTIC',
  IMMUTABLE_BLUEPRINT = 'IMMUTABLE_BLUEPRINT',
  STATE_ISOLATION = 'STATE_ISOLATION',
  NO_DYNAMIC_SCHEMA_CHANGE = 'NO_DYNAMIC_SCHEMA_CHANGE'
}

export interface RuntimeKernelModelMetadata {
  readonly id: string;
  readonly name: string;
  readonly kernelModelVersion: string;
  readonly description: string;
}

export interface RuntimeKernelModel {
  readonly kernelType: RuntimeKernelType;
  readonly modelId: string;
  readonly metadata: RuntimeKernelModelMetadata;
  readonly kernelOrder: number;
  readonly targetInterpretations: readonly string[];
  readonly supportedExecutionModels: readonly string[];
  readonly kernelExecutionPolicy: readonly KernelExecutionPolicy[];
  readonly supportedCapabilities: readonly KernelCapability[];
  readonly allowedSteps: readonly KernelStep[];
}

export interface KernelMetadata {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly layer: string;
  readonly category: string;
}

export interface ExecutionRuntimeKernelContext {
  readonly runtimeKernelId: string;
}

export interface ExecutionRuntimeKernelData {
  readonly managerType: KernelType;
  readonly managerScope: KernelScope;
  readonly kernelModels: readonly RuntimeKernelModel[];
}

export interface ExecutionRuntimeKernel {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly context: ExecutionRuntimeKernelContext;
  readonly metadata: KernelMetadata;
  readonly data: ExecutionRuntimeKernelData;
}

export interface ExecutionRuntimeKernelBlueprint {
  getExecutionRuntimeKernel(): ExecutionRuntimeKernel;
  getMetadata(): KernelMetadata;
  getContext(): ExecutionRuntimeKernelContext;
  getData(): ExecutionRuntimeKernelData;
  getKernelModels(): readonly RuntimeKernelModel[];
  getKernelSequence(): readonly KernelStep[];
}

// 1. 静的カーネル手順リストの定義と凍結 (KERNEL_SCHEMA_READY を含む)
export const KERNEL_SEQUENCE: readonly KernelStep[] = Object.freeze([
  KernelStep.REGISTER_INTERPRETATION,
  KernelStep.VALIDATE_INTERPRETATION,
  KernelStep.BUILD_KERNEL_SCHEMA,
  KernelStep.READY_FOR_RUNTIME,
  KernelStep.KERNEL_SCHEMA_READY
]);

// 静的ポリシーリスト定義と凍結
const defaultPolicies: readonly KernelExecutionPolicy[] = Object.freeze([
  KernelExecutionPolicy.READ_ONLY,
  KernelExecutionPolicy.DETERMINISTIC,
  KernelExecutionPolicy.IMMUTABLE_BLUEPRINT,
  KernelExecutionPolicy.STATE_ISOLATION,
  KernelExecutionPolicy.NO_DYNAMIC_SCHEMA_CHANGE
]);

// 静的対応機能能力リスト定義と凍結
const defaultCapabilities: readonly KernelCapability[] = Object.freeze([
  KernelCapability.INTERPRETATION,
  KernelCapability.EXECUTION,
  KernelCapability.SCHEDULING,
  KernelCapability.MONITORING,
  KernelCapability.GOVERNANCE
]);

// 2. 静的カーネルモデルリストの定義と凍結 (kernelModelVersion 1.0, kernelOrder 1〜5, targetInterpretations を含む)
export const RUNTIME_KERNEL_MODELS: readonly RuntimeKernelModel[] = Object.freeze([
  Object.freeze({
    kernelType: RuntimeKernelType.SYSTEM_KERNEL,
    modelId: 'kernel-model-system-01',
    metadata: Object.freeze({
      id: 'kernel-model-meta-system-01',
      name: 'System Kernel Model Metadata',
      kernelModelVersion: '1.0',
      description: 'Metadata for System Kernel Model Schema'
    }),
    kernelOrder: 1,
    targetInterpretations: Object.freeze(['interpretation-model-boot-01']),
    supportedExecutionModels: Object.freeze(['SYSTEM_EXECUTION']),
    kernelExecutionPolicy: defaultPolicies,
    supportedCapabilities: defaultCapabilities,
    allowedSteps: KERNEL_SEQUENCE
  }),
  Object.freeze({
    kernelType: RuntimeKernelType.CORE_KERNEL,
    modelId: 'kernel-model-core-01',
    metadata: Object.freeze({
      id: 'kernel-model-meta-core-01',
      name: 'Core Kernel Model Metadata',
      kernelModelVersion: '1.0',
      description: 'Metadata for Core Kernel Model Schema'
    }),
    kernelOrder: 2,
    targetInterpretations: Object.freeze(['interpretation-model-engine-01']),
    supportedExecutionModels: Object.freeze(['ENGINE_EXECUTION']),
    kernelExecutionPolicy: defaultPolicies,
    supportedCapabilities: defaultCapabilities,
    allowedSteps: KERNEL_SEQUENCE
  }),
  Object.freeze({
    kernelType: RuntimeKernelType.APPLICATION_KERNEL,
    modelId: 'kernel-model-app-01',
    metadata: Object.freeze({
      id: 'kernel-model-meta-app-01',
      name: 'Application Kernel Model Metadata',
      kernelModelVersion: '1.0',
      description: 'Metadata for Application Kernel Model Schema'
    }),
    kernelOrder: 3,
    targetInterpretations: Object.freeze(['interpretation-model-app-01']),
    supportedExecutionModels: Object.freeze(['APPLICATION_EXECUTION']),
    kernelExecutionPolicy: defaultPolicies,
    supportedCapabilities: defaultCapabilities,
    allowedSteps: KERNEL_SEQUENCE
  }),
  Object.freeze({
    kernelType: RuntimeKernelType.PLUGIN_KERNEL,
    modelId: 'kernel-model-plugin-01',
    metadata: Object.freeze({
      id: 'kernel-model-meta-plugin-01',
      name: 'Plugin Kernel Model Metadata',
      kernelModelVersion: '1.0',
      description: 'Metadata for Plugin Kernel Model Schema'
    }),
    kernelOrder: 4,
    targetInterpretations: Object.freeze([]),
    supportedExecutionModels: Object.freeze([]),
    kernelExecutionPolicy: defaultPolicies,
    supportedCapabilities: defaultCapabilities,
    allowedSteps: KERNEL_SEQUENCE
  }),
  Object.freeze({
    kernelType: RuntimeKernelType.FIELD_KERNEL,
    modelId: 'kernel-model-field-01',
    metadata: Object.freeze({
      id: 'kernel-model-meta-field-01',
      name: 'Field Kernel Model Metadata',
      kernelModelVersion: '1.0',
      description: 'Metadata for Field Kernel Model Schema'
    }),
    kernelOrder: 5,
    targetInterpretations: Object.freeze([]),
    supportedExecutionModels: Object.freeze([]),
    kernelExecutionPolicy: defaultPolicies,
    supportedCapabilities: defaultCapabilities,
    allowedSteps: KERNEL_SEQUENCE
  })
]);

// 3. メタデータオブジェクトの作成と凍結
const managerMetadata: KernelMetadata = Object.freeze({
  id: 'runtime-kernel-manager-meta-01',
  name: 'Execution Runtime Kernel Manager Metadata',
  version: '1.0.0',
  description: 'Metadata for Execution Runtime Kernel Manager Foundation',
  layer: 'Kernel Manager Layer',
  category: 'Infrastructure'
});

// 4. コンテキストオブジェクトの作成と凍結 (ID 参照のみ、runtimeKernelId のみ)
const managerContext: ExecutionRuntimeKernelContext = Object.freeze({
  runtimeKernelId: 'runtime-kernel-01'
});

// 5. データオブジェクトの作成と凍結
const managerData: ExecutionRuntimeKernelData = Object.freeze({
  managerType: KernelType.FOUNDATION,
  managerScope: KernelScope.SYSTEM,
  kernelModels: RUNTIME_KERNEL_MODELS
});

// 6. カーネルマネージャーオブジェクト本体の作成と凍結
const runtimeKernelData: ExecutionRuntimeKernel = Object.freeze({
  id: 'runtime-kernel-01',
  name: 'Default Execution Runtime Kernel Foundation',
  description: 'The static execution runtime kernel manager structure definition',
  context: managerContext,
  metadata: managerMetadata,
  data: managerData
});

// Blueprint コンテナの不変シングルトンインスタンス実装
export const EXECUTION_RUNTIME_KERNEL_BLUEPRINT: ExecutionRuntimeKernelBlueprint = Object.freeze({
  getExecutionRuntimeKernel(): ExecutionRuntimeKernel {
    return runtimeKernelData;
  },

  getMetadata(): KernelMetadata {
    return runtimeKernelData.metadata;
  },

  getContext(): ExecutionRuntimeKernelContext {
    return runtimeKernelData.context;
  },

  getData(): ExecutionRuntimeKernelData {
    return runtimeKernelData.data;
  },

  getKernelModels(): readonly RuntimeKernelModel[] {
    return RUNTIME_KERNEL_MODELS;
  },

  getKernelSequence(): readonly KernelStep[] {
    return KERNEL_SEQUENCE;
  }
});
