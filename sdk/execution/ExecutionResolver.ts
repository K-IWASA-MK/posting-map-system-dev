/**
 * ExecutionResolver.ts
 * 
 * Execution Layer における実行定義の静的な解決構造のデータモデル (SSOT)。
 * 
 * 警告：本ファイル内への実際の解決処理、探索、マッチング、優先順位判定、ルール評価、API 通信、コマンド送信、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum ResolverType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME',
  SIMULATION = 'SIMULATION',
  PLUGIN = 'PLUGIN',
  AI = 'AI'
}

export enum ResolverStrategy {
  STATIC = 'STATIC',
  MAPPING = 'MAPPING',
  REGISTRY = 'REGISTRY',
  PIPELINE = 'PIPELINE'
}

export interface ResolverMetadata {
  readonly author: string;
  readonly version: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly phase: string;
}

export interface ExecutionResolverContext {
  readonly executionEngineId: string;    // Target Execution Engine ID (ID reference only, loosely coupled)
  readonly executionRegistryId: string;  // Target Execution Registry ID (ID reference only, loosely coupled)
  readonly executionRequestId: string;   // Target Execution Request ID (ID reference only, loosely coupled)
  readonly executionResultId: string;    // Target Execution Result ID (ID reference only, loosely coupled)
  readonly executionStateId: string;     // Target Execution State ID (ID reference only, loosely coupled)
}

export interface ExecutionResolver {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly resolverType: ResolverType;
  readonly strategy: ResolverStrategy;
  readonly context: ExecutionResolverContext;
  readonly metadata: ResolverMetadata;
}

export interface ExecutionResolverBlueprint {
  getResolver(): ExecutionResolver;
  getContext(): ExecutionResolverContext;
  getMetadata(): ResolverMetadata;
}

// 1. メタデータオブジェクトの作成と凍結
const resolverMetadata = Object.freeze({
  author: 'AIOS Team',
  version: '1.0.0',
  createdAt: '2026-07-09T13:00:00Z',
  updatedAt: '2026-07-09T13:00:00Z',
  phase: 'Phase 203-6'
});

// 2. コンテキストオブジェクトの作成と凍結（疎結合のためにID参照のみとし、解決・生成処理は行わない）
const resolverContext: ExecutionResolverContext = Object.freeze({
  executionEngineId: 'engine-execution-01',
  executionRegistryId: 'registry-execution-01',
  executionRequestId: 'execution-request-01',
  executionResultId: 'execution-result-01',
  executionStateId: 'execution-state-01'
});

// 3. 解決オブジェクト本体の作成と凍結
const resolverData: ExecutionResolver = Object.freeze({
  id: 'execution-resolver-01',
  name: 'Default Execution Resolver',
  description: 'The static execution resolver specification',
  resolverType: ResolverType.FOUNDATION,
  strategy: ResolverStrategy.STATIC,
  context: resolverContext,
  metadata: resolverMetadata
});

// Blueprint コンテナの不変シングルトンインスタンス実装
export const EXECUTION_RESOLVER_BLUEPRINT: ExecutionResolverBlueprint = Object.freeze({
  getResolver(): ExecutionResolver {
    return resolverData;
  },

  getContext(): ExecutionResolverContext {
    return resolverData.context;
  },

  getMetadata(): ResolverMetadata {
    return resolverData.metadata;
  }
});

export type { ExecutionResolver as ExecutionResolverType };
