/**
 * ExecutionRuntimeComponentResolver.ts
 * 
 * Execution Runtime Component Resolver Foundation (SSOT).
 * 実行コンポーネントリゾルバの静的 Blueprint を表現する。
 * 
 * 警告：本ファイル内への実際のコンポーネント解決、探索、依存解決、ルーティング
 * （resolve, lookup, discover, route, match, bind, register, unregister, validate, dispatch, schedule, execute 等）、
 * 外部連携、Event、Queue、Thread、Timer、非同期処理（Async, Promise）の実装は厳禁である。
 */

export enum ResolverType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME',
  SIMULATION = 'SIMULATION',
  PLUGIN = 'PLUGIN',
  AI = 'AI'
}

export enum ResolverScope {
  STATIC = 'STATIC',
  DYNAMIC = 'DYNAMIC',
  HYBRID = 'HYBRID'
}

export interface RuntimeComponentResolverMetadata {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly layer: string;
  readonly category: string;
}

export interface ExecutionRuntimeComponentResolverContext {
  readonly runtimeComponentResolverId: string;
}

export interface ExecutionRuntimeComponentResolverData {
  readonly resolverType: ResolverType;
  readonly resolverScope: ResolverScope;
}

export interface ExecutionRuntimeComponentResolver {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly context: ExecutionRuntimeComponentResolverContext;
  readonly metadata: RuntimeComponentResolverMetadata;
  readonly data: ExecutionRuntimeComponentResolverData;
}

export interface ExecutionRuntimeComponentResolverBlueprint {
  getExecutionRuntimeComponentResolver(): ExecutionRuntimeComponentResolver;
  getMetadata(): RuntimeComponentResolverMetadata;
  getContext(): ExecutionRuntimeComponentResolverContext;
  getData(): ExecutionRuntimeComponentResolverData;
}

// 1. メタデータの作成と凍結
const resolverMetadata: RuntimeComponentResolverMetadata = Object.freeze({
  id: 'runtime-component-resolver-spec-01',
  name: 'Default Execution Runtime Component Resolver Specification',
  version: '1.0.0',
  description: 'The static execution runtime component resolver foundation specification',
  layer: 'Runtime Layer',
  category: 'Execution Component Resolver'
});

// 2. コンテキストの作成と凍結 (IDのみ保持)
const resolverContext: ExecutionRuntimeComponentResolverContext = Object.freeze({
  runtimeComponentResolverId: 'runtime-component-resolver-01'
});

// 3. データの作成と凍結
const resolverData: ExecutionRuntimeComponentResolverData = Object.freeze({
  resolverType: ResolverType.FOUNDATION,
  resolverScope: ResolverScope.STATIC
});

// 4. リゾルバ本体の作成と凍結
const resolverInstance: ExecutionRuntimeComponentResolver = Object.freeze({
  id: 'runtime-component-resolver-01',
  name: 'Default Execution Runtime Component Resolver',
  description: 'The static execution runtime component resolver instance definition',
  context: resolverContext,
  metadata: resolverMetadata,
  data: resolverData
});

// Blueprint コンテナの不変シングルトンインスタンス実装 (型固定の適用)
export const EXECUTION_RUNTIME_COMPONENT_RESOLVER_BLUEPRINT: Readonly<ExecutionRuntimeComponentResolverBlueprint> = Object.freeze({
  getExecutionRuntimeComponentResolver(): ExecutionRuntimeComponentResolver {
    return resolverInstance;
  },

  getMetadata(): RuntimeComponentResolverMetadata {
    return resolverInstance.metadata;
  },

  getContext(): ExecutionRuntimeComponentResolverContext {
    return resolverInstance.context;
  },

  getData(): ExecutionRuntimeComponentResolverData {
    return resolverInstance.data;
  }
});

export type { ExecutionRuntimeComponentResolver as ExecutionRuntimeComponentResolverType };
export type { ExecutionRuntimeComponentResolverContext as ExecutionRuntimeComponentResolverContextType };
export type { ExecutionRuntimeComponentResolverData as ExecutionRuntimeComponentResolverDataType };
