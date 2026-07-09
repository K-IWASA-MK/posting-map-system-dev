/**
 * ExecutionRuntimeComponentRegistry.ts
 * 
 * Execution Runtime Component Registry Foundation (SSOT).
 * 実行コンポーネントレジストリの静的 Blueprint を表現する。
 * 
 * 警告：本ファイル内への実際のコンポーネント登録、削除、検索、同期
 * （register, unregister, add, remove, update, clear, find, resolve, validate, dispatch, schedule, execute 等）、
 * 外部連携、Event、Queue、Thread、Timer、非同期処理（Async, Promise）の実装は厳禁である。
 */

export enum RegistryType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME',
  SIMULATION = 'SIMULATION',
  PLUGIN = 'PLUGIN',
  AI = 'AI'
}

export enum RegistryScope {
  GLOBAL = 'GLOBAL',
  TENANT = 'TENANT',
  LOCAL = 'LOCAL'
}

export interface RuntimeComponentRegistryMetadata {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly layer: string;
  readonly category: string;
}

export interface ExecutionRuntimeComponentRegistryContext {
  readonly runtimeComponentRegistryId: string;
}

export interface ExecutionRuntimeComponentRegistryData {
  readonly registryType: RegistryType;
  readonly registryScope: RegistryScope;
}

export interface ExecutionRuntimeComponentRegistry {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly context: ExecutionRuntimeComponentRegistryContext;
  readonly metadata: RuntimeComponentRegistryMetadata;
  readonly data: ExecutionRuntimeComponentRegistryData;
}

export interface ExecutionRuntimeComponentRegistryBlueprint {
  getExecutionRuntimeComponentRegistry(): ExecutionRuntimeComponentRegistry;
  getMetadata(): RuntimeComponentRegistryMetadata;
  getContext(): ExecutionRuntimeComponentRegistryContext;
  getData(): ExecutionRuntimeComponentRegistryData;
}

// 1. メタデータの作成と凍結
const registryMetadata: RuntimeComponentRegistryMetadata = Object.freeze({
  id: 'runtime-component-registry-spec-01',
  name: 'Default Execution Runtime Component Registry Specification',
  version: '1.0.0',
  description: 'The static execution runtime component registry foundation specification',
  layer: 'Runtime Layer',
  category: 'Execution Component Registry'
});

// 2. コンテキストの作成と凍結 (IDのみ保持)
const registryContext: ExecutionRuntimeComponentRegistryContext = Object.freeze({
  runtimeComponentRegistryId: 'runtime-component-registry-01'
});

// 3. データの作成と凍結
const registryData: ExecutionRuntimeComponentRegistryData = Object.freeze({
  registryType: RegistryType.FOUNDATION,
  registryScope: RegistryScope.GLOBAL
});

// 4. レジストリ本体の作成と凍結
const registryInstance: ExecutionRuntimeComponentRegistry = Object.freeze({
  id: 'runtime-component-registry-01',
  name: 'Default Execution Runtime Component Registry',
  description: 'The static execution runtime component registry instance definition',
  context: registryContext,
  metadata: registryMetadata,
  data: registryData
});

// Blueprint コンテナの不変シングルトンインスタンス実装 (型固定の適用)
export const EXECUTION_RUNTIME_COMPONENT_REGISTRY_BLUEPRINT: Readonly<ExecutionRuntimeComponentRegistryBlueprint> = Object.freeze({
  getExecutionRuntimeComponentRegistry(): ExecutionRuntimeComponentRegistry {
    return registryInstance;
  },

  getMetadata(): RuntimeComponentRegistryMetadata {
    return registryInstance.metadata;
  },

  getContext(): ExecutionRuntimeComponentRegistryContext {
    return registryInstance.context;
  },

  getData(): ExecutionRuntimeComponentRegistryData {
    return registryInstance.data;
  }
});

export type { ExecutionRuntimeComponentRegistry as ExecutionRuntimeComponentRegistryType };
export type { ExecutionRuntimeComponentRegistryContext as ExecutionRuntimeComponentRegistryContextType };
export type { ExecutionRuntimeComponentRegistryData as ExecutionRuntimeComponentRegistryDataType };
