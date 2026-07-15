/**
 * ExecutionDispatcher.ts
 * 
 * Execution Layer におけるディスパッチ構造の静的 Blueprint データモデル (SSOT)。
 * 
 * 警告：本ファイル内への実際のディスパッチ処理、ルーティング、実行開始、キュー処理、スケジューリング、API 通信、コマンド送信、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum DispatcherType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME',
  SIMULATION = 'SIMULATION',
  PLUGIN = 'PLUGIN',
  AI = 'AI'
}

export enum DispatcherStrategy {
  STATIC = 'STATIC',
  DIRECT = 'DIRECT',
  PIPELINE = 'PIPELINE',
  ROUTER = 'ROUTER'
}

export interface DispatcherMetadata {
  readonly author: string;
  readonly version: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly phase: string;
}

export interface ExecutionDispatcherContext {
  readonly executionEngineId: string;    // Target Execution Engine ID (ID reference only, loosely coupled)
  readonly executionRegistryId: string;  // Target Execution Registry ID (ID reference only, loosely coupled)
  readonly executionRequestId: string;   // Target Execution Request ID (ID reference only, loosely coupled)
  readonly executionResultId: string;    // Target Execution Result ID (ID reference only, loosely coupled)
  readonly executionStateId: string;     // Target Execution State ID (ID reference only, loosely coupled)
  readonly executionResolverId: string;  // Target Execution Resolver ID (ID reference only, loosely coupled)
}

export interface ExecutionDispatcher {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly dispatcherType: DispatcherType;
  readonly strategy: DispatcherStrategy;
  readonly context: ExecutionDispatcherContext;
  readonly metadata: DispatcherMetadata;
}

export interface ExecutionDispatcherBlueprint {
  getDispatcher(): ExecutionDispatcher;
  getContext(): ExecutionDispatcherContext;
  getMetadata(): DispatcherMetadata;
}

// 1. メタデータオブジェクトの作成と凍結
const dispatcherMetadata = Object.freeze({
  author: 'AIOS Team',
  version: '1.0.0',
  createdAt: '2026-07-09T13:00:00Z',
  updatedAt: '2026-07-09T13:00:00Z',
  phase: 'Phase 203-7'
});

// 2. コンテキストオブジェクトの作成と凍結（疎結合のためにID参照のみとし、解決・生成処理は行わない）
const dispatcherContext: ExecutionDispatcherContext = Object.freeze({
  executionEngineId: 'engine-execution-01',
  executionRegistryId: 'registry-execution-01',
  executionRequestId: 'execution-request-01',
  executionResultId: 'execution-result-01',
  executionStateId: 'execution-state-01',
  executionResolverId: 'execution-resolver-01'
});

// 3. ディスパッチャーオブジェクト本体の作成と凍結
const dispatcherData: ExecutionDispatcher = Object.freeze({
  id: 'execution-dispatcher-01',
  name: 'Default Execution Dispatcher',
  description: 'The static execution dispatcher specification',
  dispatcherType: DispatcherType.FOUNDATION,
  strategy: DispatcherStrategy.STATIC,
  context: dispatcherContext,
  metadata: dispatcherMetadata
});

// Blueprint コンテナの不変シングルトンインスタンス実装
export const EXECUTION_DISPATCHER_BLUEPRINT: ExecutionDispatcherBlueprint = Object.freeze({
  getDispatcher(): ExecutionDispatcher {
    return dispatcherData;
  },

  getContext(): ExecutionDispatcherContext {
    return dispatcherData.context;
  },

  getMetadata(): DispatcherMetadata {
    return dispatcherData.metadata;
  }
});

export type { ExecutionDispatcher as ExecutionDispatcherType };
