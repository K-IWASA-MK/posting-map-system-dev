/**
 * ExecutionRuntimeLoader.ts
 * 
 * Execution Runtime Loader Foundation の構造および公開インターフェース定義 (SSOT)。
 * 
 * 警告：本ファイル内への実際のモジュール読み込み、インスタンス生成、依存解決、メモリ確保、初期化、
 * 非同期処理、キュー処理、リトライ、API 通信、コマンド送信、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum LoaderManagerType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME',
  SIMULATION = 'SIMULATION',
  PLUGIN = 'PLUGIN',
  AI = 'AI'
}

export enum LoaderManagerScope {
  SYSTEM = 'SYSTEM',
  USER = 'USER',
  TENANT = 'TENANT'
}

export enum RuntimeLoadingType {
  SYSTEM_LOAD = 'SYSTEM_LOAD',
  ENGINE_LOAD = 'ENGINE_LOAD',
  SERVICE_LOAD = 'SERVICE_LOAD',
  COMPONENT_LOAD = 'COMPONENT_LOAD',
  APPLICATION_LOAD = 'APPLICATION_LOAD'
}

export interface RuntimeLoadingModelMetadata {
  readonly id: string;
  readonly name: string;
  readonly loadingModelVersion: string;
  readonly description: string;
}

export interface RuntimeLoadingModel {
  readonly loadingType: RuntimeLoadingType;
  readonly modelId: string;
  readonly metadata: RuntimeLoadingModelMetadata;
  readonly loadOrder: number;
  readonly allowedPolicies: readonly string[];
}

export interface LoaderManagerMetadata {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly layer: string;
  readonly category: string;
}

export interface ExecutionRuntimeLoaderContext {
  readonly runtimeLoaderId: string;
}

export interface ExecutionRuntimeLoaderData {
  readonly managerType: LoaderManagerType;
  readonly managerScope: LoaderManagerScope;
  readonly loadingModels: readonly RuntimeLoadingModel[];
}

export interface ExecutionRuntimeLoader {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly context: ExecutionRuntimeLoaderContext;
  readonly metadata: LoaderManagerMetadata;
  readonly data: ExecutionRuntimeLoaderData;
}

export interface ExecutionRuntimeLoaderBlueprint {
  getExecutionRuntimeLoader(): ExecutionRuntimeLoader;
  getMetadata(): LoaderManagerMetadata;
  getContext(): ExecutionRuntimeLoaderContext;
  getData(): ExecutionRuntimeLoaderData;
  getLoadingModels(): readonly RuntimeLoadingModel[];
}

// 1. 静的ロードモデルリストの定義と凍結 (loadingModelVersion 1.0, loadOrder 1〜5 を追加)
export const RUNTIME_LOADING_MODELS: readonly RuntimeLoadingModel[] = Object.freeze([
  Object.freeze({
    loadingType: RuntimeLoadingType.SYSTEM_LOAD,
    modelId: 'loading-model-system-01',
    metadata: Object.freeze({
      id: 'loading-model-meta-system-01',
      name: 'System Loading Model Metadata',
      loadingModelVersion: '1.0',
      description: 'Metadata for System Loading Model Schema'
    }),
    loadOrder: 1,
    allowedPolicies: Object.freeze(['EAGER'])
  }),
  Object.freeze({
    loadingType: RuntimeLoadingType.ENGINE_LOAD,
    modelId: 'loading-model-engine-01',
    metadata: Object.freeze({
      id: 'loading-model-meta-engine-01',
      name: 'Engine Loading Model Metadata',
      loadingModelVersion: '1.0',
      description: 'Metadata for Engine Loading Model Schema'
    }),
    loadOrder: 2,
    allowedPolicies: Object.freeze(['EAGER', 'ISOLATED'])
  }),
  Object.freeze({
    loadingType: RuntimeLoadingType.SERVICE_LOAD,
    modelId: 'loading-model-service-01',
    metadata: Object.freeze({
      id: 'loading-model-meta-service-01',
      name: 'Service Loading Model Metadata',
      loadingModelVersion: '1.0',
      description: 'Metadata for Service Loading Model Schema'
    }),
    loadOrder: 3,
    allowedPolicies: Object.freeze(['LAZY', 'ISOLATED'])
  }),
  Object.freeze({
    loadingType: RuntimeLoadingType.COMPONENT_LOAD,
    modelId: 'loading-model-component-01',
    metadata: Object.freeze({
      id: 'loading-model-meta-component-01',
      name: 'Component Loading Model Metadata',
      loadingModelVersion: '1.0',
      description: 'Metadata for Component Loading Model Schema'
    }),
    loadOrder: 4,
    allowedPolicies: Object.freeze(['LAZY'])
  }),
  Object.freeze({
    loadingType: RuntimeLoadingType.APPLICATION_LOAD,
    modelId: 'loading-model-app-01',
    metadata: Object.freeze({
      id: 'loading-model-meta-app-01',
      name: 'Application Loading Model Metadata',
      loadingModelVersion: '1.0',
      description: 'Metadata for Application Loading Model Schema'
    }),
    loadOrder: 5,
    allowedPolicies: Object.freeze(['LAZY'])
  })
]);

// 2. メタデータオブジェクトの作成と凍結
const managerMetadata: LoaderManagerMetadata = Object.freeze({
  id: 'runtime-loader-manager-meta-01',
  name: 'Execution Runtime Loader Manager Metadata',
  version: '1.0.0',
  description: 'Metadata for Execution Runtime Loader Manager Foundation',
  layer: 'Loader Manager Layer',
  category: 'Infrastructure'
});

// 3. コンテキストオブジェクトの作成と凍結 (ID 参照のみ、runtimeLoaderId のみ)
const managerContext: ExecutionRuntimeLoaderContext = Object.freeze({
  runtimeLoaderId: 'runtime-loader-01'
});

// 4. データオブジェクトの作成と凍結
const managerData: ExecutionRuntimeLoaderData = Object.freeze({
  managerType: LoaderManagerType.FOUNDATION,
  managerScope: LoaderManagerScope.SYSTEM,
  loadingModels: RUNTIME_LOADING_MODELS
});

// 5. ローダーマネージャーオブジェクト本体の作成と凍結
const runtimeLoaderData: ExecutionRuntimeLoader = Object.freeze({
  id: 'runtime-loader-01',
  name: 'Default Execution Runtime Loader Foundation',
  description: 'The static execution runtime loader manager structure definition',
  context: managerContext,
  metadata: managerMetadata,
  data: managerData
});

// Blueprint コンテナの不変シングルトンインスタンス実装
export const EXECUTION_RUNTIME_LOADER_BLUEPRINT: ExecutionRuntimeLoaderBlueprint = Object.freeze({
  getExecutionRuntimeLoader(): ExecutionRuntimeLoader {
    return runtimeLoaderData;
  },

  getMetadata(): LoaderManagerMetadata {
    return runtimeLoaderData.metadata;
  },

  getContext(): ExecutionRuntimeLoaderContext {
    return runtimeLoaderData.context;
  },

  getData(): ExecutionRuntimeLoaderData {
    return runtimeLoaderData.data;
  },

  getLoadingModels(): readonly RuntimeLoadingModel[] {
    return RUNTIME_LOADING_MODELS;
  }
});
