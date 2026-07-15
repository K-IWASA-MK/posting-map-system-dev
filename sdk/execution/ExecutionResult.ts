/**
 * ExecutionResult.ts
 * 
 * Execution Layer における実行結果の静的データモデル (SSOT)。
 * 
 * 警告：本ファイル内への実行結果生成、成功判定、動的な状態遷移、API 通信、コマンド送信、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum ResultType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME',
  SIMULATION = 'SIMULATION',
  PLUGIN = 'PLUGIN',
  AI = 'AI'
}

export enum ResultStatus {
  UNKNOWN = 'UNKNOWN',
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  PARTIAL = 'PARTIAL'
}

export interface ResultMetadata {
  readonly author: string;
  readonly version: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly phase: string;
}

export interface ExecutionResultContext {
  readonly executionRequest: string; // Target Execution Request ID (Identifier only, loosely coupled)
  readonly executionEngine: string;  // Target Execution Engine ID (Identifier only, loosely coupled)
  readonly executionRegistry: string; // Target Execution Registry ID (Identifier only, loosely coupled)
}

export interface ExecutionResult {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly resultType: ResultType;
  readonly status: ResultStatus;
  readonly context: ExecutionResultContext;
  readonly metadata: ResultMetadata;
}

export interface ExecutionResultBlueprint {
  getResult(): ExecutionResult;
  getContext(): ExecutionResultContext;
  getMetadata(): ResultMetadata;
}

// 1. メタデータオブジェクトの作成と凍結
const resultMetadata = Object.freeze({
  author: 'AIOS Team',
  version: '1.0.0',
  createdAt: '2026-07-09T13:00:00Z',
  updatedAt: '2026-07-09T13:00:00Z',
  phase: 'Phase 203-4'
});

// 2. コンテキストオブジェクトの作成と凍結（疎結合のためにID参照のみとし、解決・生成処理は行わない）
const resultContext: ExecutionResultContext = Object.freeze({
  executionRequest: 'execution-request-01',
  executionEngine: 'engine-execution-01',
  executionRegistry: 'registry-execution-01'
});

// 3. 実行結果オブジェクト本体の作成と凍結
const resultData: ExecutionResult = Object.freeze({
  id: 'execution-result-01',
  name: 'Default Execution Result',
  description: 'The static execution result specification',
  resultType: ResultType.FOUNDATION,
  status: ResultStatus.SUCCESS,
  context: resultContext,
  metadata: resultMetadata
});

// Blueprint コンテナの不変シングルトンインスタンス実装
export const EXECUTION_RESULT_BLUEPRINT: ExecutionResultBlueprint = Object.freeze({
  getResult(): ExecutionResult {
    return resultData;
  },

  getContext(): ExecutionResultContext {
    return resultData.context;
  },

  getMetadata(): ResultMetadata {
    return resultData.metadata;
  }
});

export type { ExecutionResult as ExecutionResultType };
