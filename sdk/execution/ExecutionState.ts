/**
 * ExecutionState.ts
 * 
 * Execution Layer における実行状態の静的データモデル (SSOT)。
 * 
 * 警告：本ファイル内への状態遷移・ライフサイクル管理、イベント処理、状態同期、API 通信、コマンド送信、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum StateType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME',
  SIMULATION = 'SIMULATION',
  PLUGIN = 'PLUGIN',
  AI = 'AI'
}

export enum StateClassification {
  UNKNOWN = 'UNKNOWN',
  PENDING = 'PENDING',
  READY = 'READY',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export interface StateMetadata {
  readonly author: string;
  readonly version: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly phase: string;
}

export interface ExecutionStateContext {
  readonly executionRequestId: string;   // Target Execution Request ID (ID reference only, loosely coupled)
  readonly executionResultId: string;    // Target Execution Result ID (ID reference only, loosely coupled)
  readonly executionEngineId: string;    // Target Execution Engine ID (ID reference only, loosely coupled)
  readonly executionRegistryId: string;  // Target Execution Registry ID (ID reference only, loosely coupled)
}

export interface ExecutionState {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly stateType: StateType;
  readonly classification: StateClassification;
  readonly context: ExecutionStateContext;
  readonly metadata: StateMetadata;
}

export interface ExecutionStateBlueprint {
  getState(): ExecutionState;
  getContext(): ExecutionStateContext;
  getMetadata(): StateMetadata;
}

// 1. メタデータオブジェクトの作成と凍結
const stateMetadata = Object.freeze({
  author: 'AIOS Team',
  version: '1.0.0',
  createdAt: '2026-07-09T13:00:00Z',
  updatedAt: '2026-07-09T13:00:00Z',
  phase: 'Phase 203-5'
});

// 2. コンテキストオブジェクトの作成と凍結（疎結合のためにID参照のみとし、解決・生成処理は行わない）
const stateContext: ExecutionStateContext = Object.freeze({
  executionRequestId: 'execution-request-01',
  executionResultId: 'execution-result-01',
  executionEngineId: 'engine-execution-01',
  executionRegistryId: 'registry-execution-01'
});

// 3. 実行状態オブジェクト本体の作成と凍結
const stateData: ExecutionState = Object.freeze({
  id: 'execution-state-01',
  name: 'Default Execution State',
  description: 'The static execution state specification',
  stateType: StateType.FOUNDATION,
  classification: StateClassification.PENDING,
  context: stateContext,
  metadata: stateMetadata
});

// Blueprint コンテナの不変シングルトンインスタンス実装
export const EXECUTION_STATE_BLUEPRINT: ExecutionStateBlueprint = Object.freeze({
  getState(): ExecutionState {
    return stateData;
  },

  getContext(): ExecutionStateContext {
    return stateData.context;
  },

  getMetadata(): StateMetadata {
    return stateData.metadata;
  }
});

export type { ExecutionState as ExecutionStateType };
