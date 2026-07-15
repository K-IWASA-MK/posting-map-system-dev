/**
 * ExecutionRuntimeComponentLifecycleResolver.ts
 * 
 * Execution Runtime Component Lifecycle Resolver Foundation (SSOT).
 * 実行コンポーネントライフサイクルリゾルバの静的 Blueprint を表現する。
 * 
 * 警告：本ファイル内への実際の解決・検索・マッピング・依存解決・ルーティング・バインド処理
 * （resolve, lookup, find, map, discover, bind, execute 等）、
 * ランタイムリゾルバ、イベント、キュー、スレッド、タイマー、非同期処理（Async, Promise）、プラグイン・AI ランタイムの実装は厳禁である。
 */

export enum ResolverType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME',
  SIMULATION = 'SIMULATION',
  PLUGIN = 'PLUGIN',
  AI = 'AI'
}

export enum ResolverScope {
  SINGLETON = 'SINGLETON',
  TRANSIENT = 'TRANSIENT',
  SCOPED = 'SCOPED'
}

export interface ResolverMetadata {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly layer: string;
  readonly category: string;
}

export interface ExecutionRuntimeComponentLifecycleResolverContext {
  readonly runtimeComponentLifecycleResolverId: string;
}

export interface ExecutionRuntimeComponentLifecycleResolverData {
  readonly resolverType: ResolverType;
  readonly resolverScope: ResolverScope;
}

export interface ExecutionRuntimeComponentLifecycleResolver {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly context: ExecutionRuntimeComponentLifecycleResolverContext;
  readonly metadata: ResolverMetadata;
  readonly data: ExecutionRuntimeComponentLifecycleResolverData;
}

export interface ExecutionRuntimeComponentLifecycleResolverBlueprint {
  getExecutionRuntimeComponentLifecycleResolver(): ExecutionRuntimeComponentLifecycleResolver;
  getMetadata(): ResolverMetadata;
  getContext(): ExecutionRuntimeComponentLifecycleResolverContext;
  getData(): ExecutionRuntimeComponentLifecycleResolverData;
}

// 1. メタデータの作成と凍結
const componentLifecycleResolverMetadata: ResolverMetadata = Object.freeze({
  id: 'runtime-component-lifecycle-resolver-spec-01',
  name: 'Default Execution Runtime Component Lifecycle Resolver Specification',
  version: '1.0.0',
  description: 'The static execution runtime component lifecycle resolver foundation specification',
  layer: 'Runtime Layer',
  category: 'Execution Component Lifecycle Resolver'
});

// 2. コンテキストの作成と凍結 (IDのみ保持)
const componentLifecycleResolverContext: ExecutionRuntimeComponentLifecycleResolverContext = Object.freeze({
  runtimeComponentLifecycleResolverId: 'runtime-component-lifecycle-resolver-01'
});

// 3. データの作成と凍結
const componentLifecycleResolverData: ExecutionRuntimeComponentLifecycleResolverData = Object.freeze({
  resolverType: ResolverType.FOUNDATION,
  resolverScope: ResolverScope.SINGLETON
});

// 4. リゾルバ本体の作成と凍結
const componentLifecycleResolverInstance: ExecutionRuntimeComponentLifecycleResolver = Object.freeze({
  id: 'runtime-component-lifecycle-resolver-01',
  name: 'Default Execution Runtime Component Lifecycle Resolver',
  description: 'The static execution runtime component lifecycle resolver instance definition',
  context: componentLifecycleResolverContext,
  metadata: componentLifecycleResolverMetadata,
  data: componentLifecycleResolverData
});

// Blueprint コンテナの不変シングルトンインスタンス実装 (型固定の適用)
export const EXECUTION_RUNTIME_COMPONENT_LIFECYCLE_RESOLVER_BLUEPRINT: Readonly<ExecutionRuntimeComponentLifecycleResolverBlueprint> = Object.freeze({
  getExecutionRuntimeComponentLifecycleResolver(): ExecutionRuntimeComponentLifecycleResolver {
    return componentLifecycleResolverInstance;
  },

  getMetadata(): ResolverMetadata {
    return componentLifecycleResolverInstance.metadata;
  },

  getContext(): ExecutionRuntimeComponentLifecycleResolverContext {
    return componentLifecycleResolverInstance.context;
  },

  getData(): ExecutionRuntimeComponentLifecycleResolverData {
    return componentLifecycleResolverInstance.data;
  }
});

export type { ExecutionRuntimeComponentLifecycleResolver as ExecutionRuntimeComponentLifecycleResolverType };
export type { ExecutionRuntimeComponentLifecycleResolverContext as ExecutionRuntimeComponentLifecycleResolverContextType };
export type { ExecutionRuntimeComponentLifecycleResolverData as ExecutionRuntimeComponentLifecycleResolverDataType };
