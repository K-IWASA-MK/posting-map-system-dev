/**
 * ExecutionRuntimeKernelEngine.ts
 * 
 * Execution Runtime Kernel Engine Foundation の構造および公開インターフェース定義 (SSOT)。
 * 
 * 警告：本ファイル内への実際の Kernel Engine 起動、スレッド生成、スケジューラ、イベントループ、
 * タスク実行、非同期処理、キュー処理、API 通信、コマンド送信、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum KernelEngineType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME'
}

export enum KernelEngineScope {
  SYSTEM = 'SYSTEM'
}

export enum RuntimeKernelEngineType {
  SYSTEM_ENGINE = 'SYSTEM_ENGINE',
  CORE_ENGINE = 'CORE_ENGINE',
  APPLICATION_ENGINE = 'APPLICATION_ENGINE',
  PLUGIN_ENGINE = 'PLUGIN_ENGINE',
  FIELD_ENGINE = 'FIELD_ENGINE'
}

export enum KernelEngineStep {
  REGISTER_KERNEL = 'REGISTER_KERNEL',
  VALIDATE_KERNEL = 'VALIDATE_KERNEL',
  BUILD_KERNEL_ENGINE_SCHEMA = 'BUILD_KERNEL_ENGINE_SCHEMA',
  READY_FOR_RUNTIME = 'READY_FOR_RUNTIME',
  KERNEL_ENGINE_SCHEMA_READY = 'KERNEL_ENGINE_SCHEMA_READY'
}

export enum KernelEngineExecutionPolicy {
  READ_ONLY = 'READ_ONLY',
  DETERMINISTIC = 'DETERMINISTIC',
  IMMUTABLE_BLUEPRINT = 'IMMUTABLE_BLUEPRINT',
  STATE_ISOLATION = 'STATE_ISOLATION',
  NO_DYNAMIC_SCHEMA_CHANGE = 'NO_DYNAMIC_SCHEMA_CHANGE',
  NO_THREAD = 'NO_THREAD',
  NO_QUEUE = 'NO_QUEUE',
  NO_EVENT_LOOP = 'NO_EVENT_LOOP',
  NO_TASK = 'NO_TASK',
  NO_WORKER = 'NO_WORKER'
}

export interface RuntimeKernelEngineMetadata {
  readonly id: string;
  readonly name: string;
  readonly kernelEngineVersion: string;
  readonly description: string;
}

export interface RuntimeKernelEngineModel {
  readonly kernelEngineType: RuntimeKernelEngineType;
  readonly modelId: string;
  readonly metadata: RuntimeKernelEngineMetadata;
  readonly engineOrder: number;
  readonly targetKernelSchemas: readonly string[];
  readonly supportedKernelCapabilities: readonly string[];
  readonly kernelExecutionPolicies: readonly KernelEngineExecutionPolicy[];
  readonly allowedSteps: readonly KernelEngineStep[];
}

export interface KernelEngineMetadata {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly layer: string;
  readonly category: string;
}

export interface ExecutionRuntimeKernelEngineContext {
  readonly runtimeKernelEngineId: string;
}

export interface ExecutionRuntimeKernelEngineData {
  readonly managerType: KernelEngineType;
  readonly managerScope: KernelEngineScope;
  readonly engineModels: readonly RuntimeKernelEngineModel[];
}

export interface ExecutionRuntimeKernelEngine {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly context: ExecutionRuntimeKernelEngineContext;
  readonly metadata: KernelEngineMetadata;
  readonly data: ExecutionRuntimeKernelEngineData;
}

export interface ExecutionRuntimeKernelEngineBlueprint {
  getExecutionRuntimeKernelEngine(): ExecutionRuntimeKernelEngine;
  getMetadata(): KernelEngineMetadata;
  getContext(): ExecutionRuntimeKernelEngineContext;
  getData(): ExecutionRuntimeKernelEngineData;
  getEngineModels(): readonly RuntimeKernelEngineModel[];
  getEngineSequence(): readonly KernelEngineStep[];
}

// 1. 静的実行手順シーケンスの定義と凍結
export const KERNEL_ENGINE_SEQUENCE: readonly KernelEngineStep[] = Object.freeze([
  KernelEngineStep.REGISTER_KERNEL,
  KernelEngineStep.VALIDATE_KERNEL,
  KernelEngineStep.BUILD_KERNEL_ENGINE_SCHEMA,
  KernelEngineStep.READY_FOR_RUNTIME,
  KernelEngineStep.KERNEL_ENGINE_SCHEMA_READY
]);

// 静的ポリシーリストの定義と凍結 (推奨の NO_THREAD 等を含む)
const defaultPolicies: readonly KernelEngineExecutionPolicy[] = Object.freeze([
  KernelEngineExecutionPolicy.READ_ONLY,
  KernelEngineExecutionPolicy.DETERMINISTIC,
  KernelEngineExecutionPolicy.IMMUTABLE_BLUEPRINT,
  KernelEngineExecutionPolicy.STATE_ISOLATION,
  KernelEngineExecutionPolicy.NO_DYNAMIC_SCHEMA_CHANGE,
  KernelEngineExecutionPolicy.NO_THREAD,
  KernelEngineExecutionPolicy.NO_QUEUE,
  KernelEngineExecutionPolicy.NO_EVENT_LOOP,
  KernelEngineExecutionPolicy.NO_TASK,
  KernelEngineExecutionPolicy.NO_WORKER
]);

// 2. 静的エンジンモデルリストの定義と凍結
export const RUNTIME_KERNEL_ENGINE_MODELS: readonly RuntimeKernelEngineModel[] = Object.freeze([
  Object.freeze({
    kernelEngineType: RuntimeKernelEngineType.SYSTEM_ENGINE,
    modelId: 'kernel-engine-model-system-01',
    metadata: Object.freeze({
      id: 'kernel-engine-meta-system-01',
      name: 'System Kernel Engine Metadata',
      kernelEngineVersion: '1.0',
      description: 'Metadata for System Kernel Engine Schema'
    }),
    engineOrder: 1,
    targetKernelSchemas: Object.freeze(['kernel-schema-system-01']),
    supportedKernelCapabilities: Object.freeze(['SYSTEM_CONTROL']),
    kernelExecutionPolicies: defaultPolicies,
    allowedSteps: KERNEL_ENGINE_SEQUENCE
  }),
  Object.freeze({
    kernelEngineType: RuntimeKernelEngineType.CORE_ENGINE,
    modelId: 'kernel-engine-model-core-01',
    metadata: Object.freeze({
      id: 'kernel-engine-meta-core-01',
      name: 'Core Kernel Engine Metadata',
      kernelEngineVersion: '1.0',
      description: 'Metadata for Core Kernel Engine Schema'
    }),
    engineOrder: 2,
    targetKernelSchemas: Object.freeze(['kernel-schema-core-01']),
    supportedKernelCapabilities: Object.freeze(['CORE_ROUTING']),
    kernelExecutionPolicies: defaultPolicies,
    allowedSteps: KERNEL_ENGINE_SEQUENCE
  }),
  Object.freeze({
    kernelEngineType: RuntimeKernelEngineType.APPLICATION_ENGINE,
    modelId: 'kernel-engine-model-app-01',
    metadata: Object.freeze({
      id: 'kernel-engine-meta-app-01',
      name: 'Application Kernel Engine Metadata',
      kernelEngineVersion: '1.0',
      description: 'Metadata for Application Kernel Engine Schema'
    }),
    engineOrder: 3,
    targetKernelSchemas: Object.freeze(['kernel-schema-app-01']),
    supportedKernelCapabilities: Object.freeze(['APPLICATION_EXECUTION']),
    kernelExecutionPolicies: defaultPolicies,
    allowedSteps: KERNEL_ENGINE_SEQUENCE
  }),
  Object.freeze({
    kernelEngineType: RuntimeKernelEngineType.PLUGIN_ENGINE,
    modelId: 'kernel-engine-model-plugin-01',
    metadata: Object.freeze({
      id: 'kernel-engine-meta-plugin-01',
      name: 'Plugin Kernel Engine Metadata',
      kernelEngineVersion: '1.0',
      description: 'Metadata for Plugin Kernel Engine Schema'
    }),
    engineOrder: 4,
    targetKernelSchemas: Object.freeze([]),
    supportedKernelCapabilities: Object.freeze([]),
    kernelExecutionPolicies: defaultPolicies,
    allowedSteps: KERNEL_ENGINE_SEQUENCE
  }),
  Object.freeze({
    kernelEngineType: RuntimeKernelEngineType.FIELD_ENGINE,
    modelId: 'kernel-engine-model-field-01',
    metadata: Object.freeze({
      id: 'kernel-engine-meta-field-01',
      name: 'Field Kernel Engine Metadata',
      kernelEngineVersion: '1.0',
      description: 'Metadata for Field Kernel Engine Schema'
    }),
    engineOrder: 5,
    targetKernelSchemas: Object.freeze([]),
    supportedKernelCapabilities: Object.freeze([]),
    kernelExecutionPolicies: defaultPolicies,
    allowedSteps: KERNEL_ENGINE_SEQUENCE
  })
]);

// 3. メタデータオブジェクトの作成と凍結
const engineMetadata: KernelEngineMetadata = Object.freeze({
  id: 'runtime-kernel-engine-meta-01',
  name: 'Execution Runtime Kernel Engine Metadata',
  version: '1.0.0',
  description: 'Metadata for Execution Runtime Kernel Engine Foundation',
  layer: 'Kernel Engine Layer',
  category: 'Infrastructure'
});

// 4. コンテキストオブジェクトの作成と凍結 (ID 参照のみ、runtimeKernelEngineId のみ)
const engineContext: ExecutionRuntimeKernelEngineContext = Object.freeze({
  runtimeKernelEngineId: 'runtime-kernel-engine-01'
});

// 5. データオブジェクトの作成と凍結
const engineData: ExecutionRuntimeKernelEngineData = Object.freeze({
  managerType: KernelEngineType.FOUNDATION,
  managerScope: KernelEngineScope.SYSTEM,
  engineModels: RUNTIME_KERNEL_ENGINE_MODELS
});

// 6. カーネルエンジンオブジェクト本体の作成と凍結
const runtimeKernelEngineData: ExecutionRuntimeKernelEngine = Object.freeze({
  id: 'runtime-kernel-engine-01',
  name: 'Default Execution Runtime Kernel Engine Foundation',
  description: 'The static execution runtime kernel engine structure definition',
  context: engineContext,
  metadata: engineMetadata,
  data: engineData
});

// Blueprint コンテナの不変シングルトンインスタンス実装
export const EXECUTION_RUNTIME_KERNEL_ENGINE_BLUEPRINT: ExecutionRuntimeKernelEngineBlueprint = Object.freeze({
  getExecutionRuntimeKernelEngine(): ExecutionRuntimeKernelEngine {
    return runtimeKernelEngineData;
  },

  getMetadata(): KernelEngineMetadata {
    return runtimeKernelEngineData.metadata;
  },

  getContext(): ExecutionRuntimeKernelEngineContext {
    return runtimeKernelEngineData.context;
  },

  getData(): ExecutionRuntimeKernelEngineData {
    return runtimeKernelEngineData.data;
  },

  getEngineModels(): readonly RuntimeKernelEngineModel[] {
    return RUNTIME_KERNEL_ENGINE_MODELS;
  },

  getEngineSequence(): readonly KernelEngineStep[] {
    return KERNEL_ENGINE_SEQUENCE;
  }
});
