/**
 * ExecutionRequest.ts
 * 
 * Execution Layer における実行要求の静的データモデル (SSOT)。
 * 
 * 警告：本ファイル内への実行エンジン本体、並列タスクスケジューラ、検証・送信・配信・キューイング、API 通信、コマンド送信、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum RequestType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME',
  SIMULATION = 'SIMULATION',
  PLUGIN = 'PLUGIN',
  AI = 'AI'
}

export interface RequestMetadata {
  readonly author: string;
  readonly version: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly phase: string;
}

export interface ExecutionRequestContext {
  readonly capability: string;
  readonly pipeline: string;
  readonly runtime: string;
  readonly executionEngine: string;
  readonly executionRegistry: string;
}

export interface ExecutionRequest {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly requestType: RequestType;
  readonly context: ExecutionRequestContext;
  readonly metadata: RequestMetadata;
}

export interface ExecutionRequestBlueprint {
  getRequest(): ExecutionRequest;
  getContext(): ExecutionRequestContext;
  getMetadata(): RequestMetadata;
}

// 1. メタデータオブジェクトの作成と凍結
const requestMetadata = Object.freeze({
  author: 'AIOS Team',
  version: '1.0.0',
  createdAt: '2026-07-09T12:00:00Z',
  updatedAt: '2026-07-09T12:00:00Z',
  phase: 'Phase 203-3'
});

// 2. コンテキストオブジェクトの作成と凍結（参照構造のみを保持し、解決・生成処理は行わない）
const requestContext: ExecutionRequestContext = Object.freeze({
  capability: 'Testing', // test_execution_engine/registry/request で検証用に使用する Capability
  pipeline: 'TestPipe',
  runtime: 'runtime-1',
  executionEngine: 'engine-execution-01',
  executionRegistry: 'registry-execution-01'
});

// 3. リクエストオブジェクト本体の作成と凍結
const requestData: ExecutionRequest = Object.freeze({
  id: 'execution-request-01',
  name: 'Default Execution Request',
  description: 'The static execution request specification',
  requestType: RequestType.FOUNDATION,
  context: requestContext,
  metadata: requestMetadata
});

// Blueprint コンテナの不変シングルトンインスタンス実装
export const EXECUTION_REQUEST_BLUEPRINT: ExecutionRequestBlueprint = Object.freeze({
  getRequest(): ExecutionRequest {
    return requestData;
  },

  getContext(): ExecutionRequestContext {
    return requestData.context;
  },

  getMetadata(): RequestMetadata {
    return requestData.metadata;
  }
});

export type { ExecutionRequest as ExecutionRequestType };
