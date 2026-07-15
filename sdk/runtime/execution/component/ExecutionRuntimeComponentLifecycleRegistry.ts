/**
 * ExecutionRuntimeComponentLifecycleRegistry.ts
 * 
 * Execution Runtime Component Lifecycle Registry Foundation (SSOT).
 * 実行コンポーネントライフサイクルレジストリの静的 Blueprint を表現する。
 * 
 * 警告：本ファイル内への実際のレジストリ登録・削除・解決・同期処理
 * （register, unregister, add, remove, update, clear, find, lookup, resolve, execute 等）、
 * ランタイムレジストリ、イベント、キュー、スレッド、タイマー、非同期処理（Async, Promise）、プラグイン・AI ランタイムの実装は厳禁である。
 */

export enum RegistryType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME',
  SIMULATION = 'SIMULATION',
  PLUGIN = 'PLUGIN',
  AI = 'AI'
}

export enum RegistryScope {
  SINGLETON = 'SINGLETON',
  TRANSIENT = 'TRANSIENT',
  SCOPED = 'SCOPED'
}

export interface RegistryMetadata {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly layer: string;
  readonly category: string;
}

export interface ExecutionRuntimeComponentLifecycleRegistryContext {
  readonly runtimeComponentLifecycleRegistryId: string;
}

export interface ExecutionRuntimeComponentLifecycleRegistryData {
  readonly registryType: RegistryType;
  readonly registryScope: RegistryScope;
}

export interface ExecutionRuntimeComponentLifecycleRegistry {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly context: ExecutionRuntimeComponentLifecycleRegistryContext;
  readonly metadata: RegistryMetadata;
  readonly data: ExecutionRuntimeComponentLifecycleRegistryData;
}

export interface ExecutionRuntimeComponentLifecycleRegistryBlueprint {
  getExecutionRuntimeComponentLifecycleRegistry(): ExecutionRuntimeComponentLifecycleRegistry;
  getMetadata(): RegistryMetadata;
  getContext(): ExecutionRuntimeComponentLifecycleRegistryContext;
  getData(): ExecutionRuntimeComponentLifecycleRegistryData;
}

// 1. メタデータの作成と凍結
const componentLifecycleRegistryMetadata: RegistryMetadata = Object.freeze({
  id: 'runtime-component-lifecycle-registry-spec-01',
  name: 'Default Execution Runtime Component Lifecycle Registry Specification',
  version: '1.0.0',
  description: 'The static execution runtime component lifecycle registry foundation specification',
  layer: 'Runtime Layer',
  category: 'Execution Component Lifecycle Registry'
});

// 2. コンテキストの作成と凍結 (IDのみ保持)
const componentLifecycleRegistryContext: ExecutionRuntimeComponentLifecycleRegistryContext = Object.freeze({
  runtimeComponentLifecycleRegistryId: 'runtime-component-lifecycle-registry-01'
});

// 3. データの作成と凍結
const componentLifecycleRegistryData: ExecutionRuntimeComponentLifecycleRegistryData = Object.freeze({
  registryType: RegistryType.FOUNDATION,
  registryScope: RegistryScope.SINGLETON
});

// 4. レジストリ本体の作成と凍結
const componentLifecycleRegistryInstance: ExecutionRuntimeComponentLifecycleRegistry = Object.freeze({
  id: 'runtime-component-lifecycle-registry-01',
  name: 'Default Execution Runtime Component Lifecycle Registry',
  description: 'The static execution runtime component lifecycle registry instance definition',
  context: componentLifecycleRegistryContext,
  metadata: componentLifecycleRegistryMetadata,
  data: componentLifecycleRegistryData
});

// Blueprint コンテナの不変シングルトンインスタンス実装 (型固定の適用)
export const EXECUTION_RUNTIME_COMPONENT_LIFECYCLE_REGISTRY_BLUEPRINT: Readonly<ExecutionRuntimeComponentLifecycleRegistryBlueprint> = Object.freeze({
  getExecutionRuntimeComponentLifecycleRegistry(): ExecutionRuntimeComponentLifecycleRegistry {
    return componentLifecycleRegistryInstance;
  },

  getMetadata(): RegistryMetadata {
    return componentLifecycleRegistryInstance.metadata;
  },

  getContext(): ExecutionRuntimeComponentLifecycleRegistryContext {
    return componentLifecycleRegistryInstance.context;
  },

  getData(): ExecutionRuntimeComponentLifecycleRegistryData {
    return componentLifecycleRegistryInstance.data;
  }
});

export type { ExecutionRuntimeComponentLifecycleRegistry as ExecutionRuntimeComponentLifecycleRegistryType };
export type { ExecutionRuntimeComponentLifecycleRegistryContext as ExecutionRuntimeComponentLifecycleRegistryContextType };
export type { ExecutionRuntimeComponentLifecycleRegistryData as ExecutionRuntimeComponentLifecycleRegistryDataType };
