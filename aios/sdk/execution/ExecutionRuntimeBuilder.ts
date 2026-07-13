/**
 * ExecutionRuntimeBuilder.ts
 * 
 * Execution Runtime Builder Foundation の構造および公開インターフェース定義 (SSOT)。
 * 
 * 警告：本ファイル内への実際の Runtime 構築、組立、インスタンス化、初期化、依存解決、
 * 非同期処理、キュー処理、リトライ、API 通信、コマンド送信、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum BuilderType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME',
  SIMULATION = 'SIMULATION',
  PLUGIN = 'PLUGIN',
  AI = 'AI'
}

export enum BuilderScope {
  SYSTEM = 'SYSTEM',
  USER = 'USER',
  TENANT = 'TENANT'
}

export enum RuntimeBuildType {
  SYSTEM_BUILD = 'SYSTEM_BUILD',
  ENGINE_BUILD = 'ENGINE_BUILD',
  SERVICE_BUILD = 'SERVICE_BUILD',
  COMPONENT_BUILD = 'COMPONENT_BUILD',
  APPLICATION_BUILD = 'APPLICATION_BUILD'
}

export enum BuildStep {
  LOAD_BLUEPRINTS = 'LOAD_BLUEPRINTS',
  LOAD_RUNTIME_MODELS = 'LOAD_RUNTIME_MODELS',
  VALIDATE_STRUCTURE = 'VALIDATE_STRUCTURE',
  BUILD_RUNTIME_SCHEMA = 'BUILD_RUNTIME_SCHEMA',
  READY_FOR_RUNTIME = 'READY_FOR_RUNTIME'
}

export interface RuntimeBuildModelMetadata {
  readonly id: string;
  readonly name: string;
  readonly buildModelVersion: string;
  readonly description: string;
}

export interface RuntimeBuildModel {
  readonly buildType: RuntimeBuildType;
  readonly modelId: string;
  readonly metadata: RuntimeBuildModelMetadata;
  readonly targetBlueprints: readonly string[];
  readonly allowedSteps: readonly BuildStep[];
}

export interface BuilderMetadata {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly layer: string;
  readonly category: string;
}

export interface ExecutionRuntimeBuilderContext {
  readonly runtimeBuilderId: string;
}

export interface ExecutionRuntimeBuilderData {
  readonly managerType: BuilderType;
  readonly managerScope: BuilderScope;
  readonly buildModels: readonly RuntimeBuildModel[];
}

export interface ExecutionRuntimeBuilder {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly context: ExecutionRuntimeBuilderContext;
  readonly metadata: BuilderMetadata;
  readonly data: ExecutionRuntimeBuilderData;
}

export interface ExecutionRuntimeBuilderBlueprint {
  getExecutionRuntimeBuilder(): ExecutionRuntimeBuilder;
  getMetadata(): BuilderMetadata;
  getContext(): ExecutionRuntimeBuilderContext;
  getData(): ExecutionRuntimeBuilderData;
  getBuildModels(): readonly RuntimeBuildModel[];
  getBuildSequence(): readonly BuildStep[];
}

// 1. 静的ビルド手順リストの定義と凍結
export const BUILD_SEQUENCE: readonly BuildStep[] = Object.freeze([
  BuildStep.LOAD_BLUEPRINTS,
  BuildStep.LOAD_RUNTIME_MODELS,
  BuildStep.VALIDATE_STRUCTURE,
  BuildStep.BUILD_RUNTIME_SCHEMA,
  BuildStep.READY_FOR_RUNTIME
]);

// 2. 静的ビルドモデルリストの定義と凍結 (buildModelVersion 1.0, targetBlueprints, allowedSteps を含む)
export const RUNTIME_BUILD_MODELS: readonly RuntimeBuildModel[] = Object.freeze([
  Object.freeze({
    buildType: RuntimeBuildType.SYSTEM_BUILD,
    modelId: 'build-model-system-01',
    metadata: Object.freeze({
      id: 'build-model-meta-system-01',
      name: 'System Build Model Metadata',
      buildModelVersion: '1.0',
      description: 'Metadata for System Build Model Schema'
    }),
    targetBlueprints: Object.freeze(['blueprint-boot-01', 'blueprint-orchestrator-01']),
    allowedSteps: BUILD_SEQUENCE
  }),
  Object.freeze({
    buildType: RuntimeBuildType.ENGINE_BUILD,
    modelId: 'build-model-engine-01',
    metadata: Object.freeze({
      id: 'build-model-meta-engine-01',
      name: 'Engine Build Model Metadata',
      buildModelVersion: '1.0',
      description: 'Metadata for Engine Build Model Schema'
    }),
    targetBlueprints: Object.freeze(['blueprint-pipeline-01', 'blueprint-context-manager-01']),
    allowedSteps: BUILD_SEQUENCE
  }),
  Object.freeze({
    buildType: RuntimeBuildType.SERVICE_BUILD,
    modelId: 'build-model-service-01',
    metadata: Object.freeze({
      id: 'build-model-meta-service-01',
      name: 'Service Build Model Metadata',
      buildModelVersion: '1.0',
      description: 'Metadata for Service Build Model Schema'
    }),
    targetBlueprints: Object.freeze(['blueprint-state-manager-01', 'blueprint-session-manager-01']),
    allowedSteps: BUILD_SEQUENCE
  }),
  Object.freeze({
    buildType: RuntimeBuildType.COMPONENT_BUILD,
    modelId: 'build-model-component-01',
    metadata: Object.freeze({
      id: 'build-model-meta-component-01',
      name: 'Component Build Model Metadata',
      buildModelVersion: '1.0',
      description: 'Metadata for Component Build Model Schema'
    }),
    targetBlueprints: Object.freeze(['blueprint-instance-manager-01', 'blueprint-loader-01']),
    allowedSteps: BUILD_SEQUENCE
  }),
  Object.freeze({
    buildType: RuntimeBuildType.APPLICATION_BUILD,
    modelId: 'build-model-app-01',
    metadata: Object.freeze({
      id: 'build-model-meta-app-01',
      name: 'Application Build Model Metadata',
      buildModelVersion: '1.0',
      description: 'Metadata for Application Build Model Schema'
    }),
    targetBlueprints: Object.freeze(['blueprint-composer-01', 'blueprint-executor-01']),
    allowedSteps: BUILD_SEQUENCE
  })
]);

// 3. メタデータオブジェクトの作成と凍結
const managerMetadata: BuilderMetadata = Object.freeze({
  id: 'runtime-builder-manager-meta-01',
  name: 'Execution Runtime Builder Manager Metadata',
  version: '1.0.0',
  description: 'Metadata for Execution Runtime Builder Manager Foundation',
  layer: 'Builder Manager Layer',
  category: 'Infrastructure'
});

// 4. コンテキストオブジェクトの作成と凍結 (ID 参照のみ、runtimeBuilderId のみ)
const managerContext: ExecutionRuntimeBuilderContext = Object.freeze({
  runtimeBuilderId: 'runtime-builder-01'
});

// 5. データオブジェクトの作成と凍結
const managerData: ExecutionRuntimeBuilderData = Object.freeze({
  managerType: BuilderType.FOUNDATION,
  managerScope: BuilderScope.SYSTEM,
  buildModels: RUNTIME_BUILD_MODELS
});

// 6. ビルダーマネージャーオブジェクト本体の作成と凍結
const runtimeBuilderData: ExecutionRuntimeBuilder = Object.freeze({
  id: 'runtime-builder-01',
  name: 'Default Execution Runtime Builder Foundation',
  description: 'The static execution runtime builder manager structure definition',
  context: managerContext,
  metadata: managerMetadata,
  data: managerData
});

// Blueprint コンテナの不変シングルトンインスタンス実装
export const EXECUTION_RUNTIME_BUILDER_BLUEPRINT: ExecutionRuntimeBuilderBlueprint = Object.freeze({
  getExecutionRuntimeBuilder(): ExecutionRuntimeBuilder {
    return runtimeBuilderData;
  },

  getMetadata(): BuilderMetadata {
    return runtimeBuilderData.metadata;
  },

  getContext(): ExecutionRuntimeBuilderContext {
    return runtimeBuilderData.context;
  },

  getData(): ExecutionRuntimeBuilderData {
    return runtimeBuilderData.data;
  },

  getBuildModels(): readonly RuntimeBuildModel[] {
    return RUNTIME_BUILD_MODELS;
  },

  getBuildSequence(): readonly BuildStep[] {
    return BUILD_SEQUENCE;
  }
});
