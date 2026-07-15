/**
 * ExecutionRuntimeComposer.ts
 * 
 * Execution Runtime Composer Foundation の構造および公開インターフェース定義 (SSOT)。
 * 
 * 警告：本ファイル内への実際の Runtime 接続、マウント、実行、インスタンス生成、依存解決、
 * 非同期処理、キュー処理、リトライ、API 通信、コマンド送信、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum ComposerType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME',
  SIMULATION = 'SIMULATION',
  PLUGIN = 'PLUGIN',
  AI = 'AI'
}

export enum ComposerScope {
  SYSTEM = 'SYSTEM',
  USER = 'USER',
  TENANT = 'TENANT'
}

export enum RuntimeCompositionType {
  SYSTEM_LAYOUT = 'SYSTEM_LAYOUT',
  ENGINE_LAYOUT = 'ENGINE_LAYOUT',
  SERVICE_LAYOUT = 'SERVICE_LAYOUT',
  COMPONENT_LAYOUT = 'COMPONENT_LAYOUT',
  APPLICATION_LAYOUT = 'APPLICATION_LAYOUT'
}

export enum CompositionStep {
  PREPARE_LAYOUT = 'PREPARE_LAYOUT',
  VALIDATE_LAYOUT = 'VALIDATE_LAYOUT',
  COMPOSE_LAYOUT = 'COMPOSE_LAYOUT',
  FINALIZE_LAYOUT = 'FINALIZE_LAYOUT',
  READY_FOR_RUNTIME = 'READY_FOR_RUNTIME'
}

export interface RuntimeCompositionModelMetadata {
  readonly id: string;
  readonly name: string;
  readonly compositionModelVersion: string;
  readonly description: string;
}

export interface RuntimeCompositionModel {
  readonly compositionType: RuntimeCompositionType;
  readonly modelId: string;
  readonly metadata: RuntimeCompositionModelMetadata;
  readonly layoutOrder: number;
  readonly connections: readonly string[];
  readonly allowedSteps: readonly CompositionStep[];
}

export interface ComposerMetadata {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly layer: string;
  readonly category: string;
}

export interface ExecutionRuntimeComposerContext {
  readonly runtimeComposerId: string;
}

export interface ExecutionRuntimeComposerData {
  readonly managerType: ComposerType;
  readonly managerScope: ComposerScope;
  readonly compositionModels: readonly RuntimeCompositionModel[];
}

export interface ExecutionRuntimeComposer {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly context: ExecutionRuntimeComposerContext;
  readonly metadata: ComposerMetadata;
  readonly data: ExecutionRuntimeComposerData;
}

export interface ExecutionRuntimeComposerBlueprint {
  getExecutionRuntimeComposer(): ExecutionRuntimeComposer;
  getMetadata(): ComposerMetadata;
  getContext(): ExecutionRuntimeComposerContext;
  getData(): ExecutionRuntimeComposerData;
  getCompositionModels(): readonly RuntimeCompositionModel[];
  getCompositionSequence(): readonly CompositionStep[];
}

// 1. 静的構成手順リストの定義と凍結
export const COMPOSITION_SEQUENCE: readonly CompositionStep[] = Object.freeze([
  CompositionStep.PREPARE_LAYOUT,
  CompositionStep.VALIDATE_LAYOUT,
  CompositionStep.COMPOSE_LAYOUT,
  CompositionStep.FINALIZE_LAYOUT,
  CompositionStep.READY_FOR_RUNTIME
]);

// 2. 静的構成モデルリストの定義と凍結 (compositionModelVersion 1.0, layoutOrder 1〜5, connections を含む)
export const RUNTIME_COMPOSITION_MODELS: readonly RuntimeCompositionModel[] = Object.freeze([
  Object.freeze({
    compositionType: RuntimeCompositionType.SYSTEM_LAYOUT,
    modelId: 'composition-model-system-01',
    metadata: Object.freeze({
      id: 'composition-model-meta-system-01',
      name: 'System Layout Model Metadata',
      compositionModelVersion: '1.0',
      description: 'Metadata for System Layout Model Schema'
    }),
    layoutOrder: 1,
    connections: Object.freeze(['engine-layout-blueprint-id']),
    allowedSteps: COMPOSITION_SEQUENCE
  }),
  Object.freeze({
    compositionType: RuntimeCompositionType.ENGINE_LAYOUT,
    modelId: 'composition-model-engine-01',
    metadata: Object.freeze({
      id: 'composition-model-meta-engine-01',
      name: 'Engine Layout Model Metadata',
      compositionModelVersion: '1.0',
      description: 'Metadata for Engine Layout Model Schema'
    }),
    layoutOrder: 2,
    connections: Object.freeze(['service-layout-blueprint-id']),
    allowedSteps: COMPOSITION_SEQUENCE
  }),
  Object.freeze({
    compositionType: RuntimeCompositionType.SERVICE_LAYOUT,
    modelId: 'composition-model-service-01',
    metadata: Object.freeze({
      id: 'composition-model-meta-service-01',
      name: 'Service Layout Model Metadata',
      compositionModelVersion: '1.0',
      description: 'Metadata for Service Layout Model Schema'
    }),
    layoutOrder: 3,
    connections: Object.freeze(['component-layout-blueprint-id']),
    allowedSteps: COMPOSITION_SEQUENCE
  }),
  Object.freeze({
    compositionType: RuntimeCompositionType.COMPONENT_LAYOUT,
    modelId: 'composition-model-component-01',
    metadata: Object.freeze({
      id: 'composition-model-meta-component-01',
      name: 'Component Layout Model Metadata',
      compositionModelVersion: '1.0',
      description: 'Metadata for Component Layout Model Schema'
    }),
    layoutOrder: 4,
    connections: Object.freeze(['application-layout-blueprint-id']),
    allowedSteps: COMPOSITION_SEQUENCE
  }),
  Object.freeze({
    compositionType: RuntimeCompositionType.APPLICATION_LAYOUT,
    modelId: 'composition-model-app-01',
    metadata: Object.freeze({
      id: 'composition-model-meta-app-01',
      name: 'Application Layout Model Metadata',
      compositionModelVersion: '1.0',
      description: 'Metadata for Application Layout Model Schema'
    }),
    layoutOrder: 5,
    connections: Object.freeze([]),
    allowedSteps: COMPOSITION_SEQUENCE
  })
]);

// 3. メタデータオブジェクトの作成と凍結
const managerMetadata: ComposerMetadata = Object.freeze({
  id: 'runtime-composer-manager-meta-01',
  name: 'Execution Runtime Composer Manager Metadata',
  version: '1.0.0',
  description: 'Metadata for Execution Runtime Composer Manager Foundation',
  layer: 'Composer Manager Layer',
  category: 'Infrastructure'
});

// 4. コンテキストオブジェクトの作成と凍結 (ID 参照のみ、runtimeComposerId のみ)
const managerContext: ExecutionRuntimeComposerContext = Object.freeze({
  runtimeComposerId: 'runtime-composer-01'
});

// 5. データオブジェクトの作成と凍結
const managerData: ExecutionRuntimeComposerData = Object.freeze({
  managerType: ComposerType.FOUNDATION,
  managerScope: ComposerScope.SYSTEM,
  compositionModels: RUNTIME_COMPOSITION_MODELS
});

// 6. コムポーザーマネージャーオブジェクト本体の作成と凍結
const runtimeComposerData: ExecutionRuntimeComposer = Object.freeze({
  id: 'runtime-composer-01',
  name: 'Default Execution Runtime Composer Foundation',
  description: 'The static execution runtime composer manager structure definition',
  context: managerContext,
  metadata: managerMetadata,
  data: managerData
});

// Blueprint コンテナの不変シングルトンインスタンス実装
export const EXECUTION_RUNTIME_COMPOSER_BLUEPRINT: ExecutionRuntimeComposerBlueprint = Object.freeze({
  getExecutionRuntimeComposer(): ExecutionRuntimeComposer {
    return runtimeComposerData;
  },

  getMetadata(): ComposerMetadata {
    return runtimeComposerData.metadata;
  },

  getContext(): ExecutionRuntimeComposerContext {
    return runtimeComposerData.context;
  },

  getData(): ExecutionRuntimeComposerData {
    return runtimeComposerData.data;
  },

  getCompositionModels(): readonly RuntimeCompositionModel[] {
    return RUNTIME_COMPOSITION_MODELS;
  },

  getCompositionSequence(): readonly CompositionStep[] {
    return COMPOSITION_SEQUENCE;
  }
});
