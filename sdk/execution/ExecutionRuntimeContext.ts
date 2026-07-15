/**
 * ExecutionRuntimeContext.ts
 * 
 * Execution Runtime における実行コンテキストを表現する構造定義 (SSOT)。
 * 
 * 警告：本ファイル内への実際の Context の生成・更新・同期・破棄、API 通信、コマンド送信、
 * AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum RuntimeContextType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME',
  SIMULATION = 'SIMULATION',
  PLUGIN = 'PLUGIN',
  AI = 'AI'
}

export interface RuntimeContextMetadata {
  readonly author: string;
  readonly version: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly phase: string;
}

export interface ExecutionRuntimeContextReference {
  readonly runtimeId: string;
  readonly runtimeRegistryId: string;
  readonly hydratorId: string;
  readonly validatorId: string;
  readonly dispatcherId: string;
  readonly resolverId: string;
  readonly executionStateId: string;
  readonly executionResultId: string;
}

export interface ExecutionRuntimeContext {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly runtimeContextType: RuntimeContextType;
  readonly context: ExecutionRuntimeContextReference;
  readonly metadata: RuntimeContextMetadata;
}

export interface ExecutionRuntimeContextBlueprint {
  getRuntimeContext(): ExecutionRuntimeContext;
  getContext(): ExecutionRuntimeContextReference;
  getMetadata(): RuntimeContextMetadata;
}

// 1. メタデータオブジェクトの作成と凍結
const contextMetadata: RuntimeContextMetadata = Object.freeze({
  author: 'AIOS Team',
  version: '1.0.0',
  createdAt: '2026-07-09T18:00:00Z',
  updatedAt: '2026-07-09T18:00:00Z',
  phase: 'Phase 204-5'
});

// 2. コンテキスト参照オブジェクトの作成と凍結 (ID 参照のみ)
const contextReference: ExecutionRuntimeContextReference = Object.freeze({
  runtimeId: 'execution-runtime-01',
  runtimeRegistryId: 'registry-runtime-01',
  hydratorId: 'context-hydrator-01',
  validatorId: 'blueprint-validator-01',
  dispatcherId: 'execution-dispatcher-01',
  resolverId: 'execution-resolver-01',
  executionStateId: 'execution-state-01',
  executionResultId: 'execution-result-01'
});

// 3. ランタイムコンテキストオブジェクト本体の作成と凍結
const contextData: ExecutionRuntimeContext = Object.freeze({
  id: 'runtime-context-01',
  name: 'Default Execution Runtime Context',
  description: 'The static execution runtime context specification',
  runtimeContextType: RuntimeContextType.FOUNDATION,
  context: contextReference,
  metadata: contextMetadata
});

// Blueprint コンテナの不変シングルトンインスタンス実装
export const EXECUTION_RUNTIME_CONTEXT_BLUEPRINT: ExecutionRuntimeContextBlueprint = Object.freeze({
  getRuntimeContext(): ExecutionRuntimeContext {
    return contextData;
  },

  getContext(): ExecutionRuntimeContextReference {
    return contextData.context;
  },

  getMetadata(): RuntimeContextMetadata {
    return contextData.metadata;
  }
});

export type { ExecutionRuntimeContext as ExecutionRuntimeContextType };
