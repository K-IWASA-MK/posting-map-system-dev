/**
 * ExecutionRuntimeSession.ts
 * 
 * Execution Runtime における実行セッションを表現する構造定義 (SSOT)。
 * 
 * 警告：本ファイル内への実際のセッション生成・開始・終了・再開・破棄・管理、API 通信、コマンド送信、
 * AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum RuntimeSessionType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME',
  SIMULATION = 'SIMULATION',
  PLUGIN = 'PLUGIN',
  AI = 'AI'
}

export interface RuntimeSessionMetadata {
  readonly author: string;
  readonly version: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly phase: string;
}

export interface ExecutionRuntimeSessionReference {
  readonly runtimeId: string;
  readonly runtimeRegistryId: string;
  readonly runtimeContextId: string;
  readonly hydratorId: string;
  readonly validatorId: string;
  readonly dispatcherId: string;
  readonly resolverId: string;
  readonly executionStateId: string;
}

export interface ExecutionRuntimeSession {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly runtimeSessionType: RuntimeSessionType;
  readonly context: ExecutionRuntimeSessionReference;
  readonly metadata: RuntimeSessionMetadata;
}

export interface ExecutionRuntimeSessionBlueprint {
  getRuntimeSession(): ExecutionRuntimeSession;
  getContext(): ExecutionRuntimeSessionReference;
  getMetadata(): RuntimeSessionMetadata;
}

// 1. メタデータオブジェクトの作成と凍結
const sessionMetadata: RuntimeSessionMetadata = Object.freeze({
  author: 'AIOS Team',
  version: '1.0.0',
  createdAt: '2026-07-09T19:00:00Z',
  updatedAt: '2026-07-09T19:00:00Z',
  phase: 'Phase 204-6'
});

// 2. セッション参照オブジェクトの作成と凍結 (ID 参照のみ)
const sessionReference: ExecutionRuntimeSessionReference = Object.freeze({
  runtimeId: 'execution-runtime-01',
  runtimeRegistryId: 'registry-runtime-01',
  runtimeContextId: 'runtime-context-01',
  hydratorId: 'context-hydrator-01',
  validatorId: 'blueprint-validator-01',
  dispatcherId: 'execution-dispatcher-01',
  resolverId: 'execution-resolver-01',
  executionStateId: 'execution-state-01'
});

// 3. ランタイムセッションオブジェクト本体の作成と凍結
const sessionData: ExecutionRuntimeSession = Object.freeze({
  id: 'runtime-session-01',
  name: 'Default Execution Runtime Session',
  description: 'The static execution runtime session specification',
  runtimeSessionType: RuntimeSessionType.FOUNDATION,
  context: sessionReference,
  metadata: sessionMetadata
});

// Blueprint コンテナの不変シングルトンインスタンス実装
export const EXECUTION_RUNTIME_SESSION_BLUEPRINT: ExecutionRuntimeSessionBlueprint = Object.freeze({
  getRuntimeSession(): ExecutionRuntimeSession {
    return sessionData;
  },

  getContext(): ExecutionRuntimeSessionReference {
    return sessionData.context;
  },

  getMetadata(): RuntimeSessionMetadata {
    return sessionData.metadata;
  }
});

export type { ExecutionRuntimeSession as ExecutionRuntimeSessionType };
