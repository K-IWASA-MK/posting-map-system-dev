/**
 * ExecutionRuntime.ts
 * 
 * Execution Layer と Runtime の境界となる Execution Runtime の構造および公開インターフェース定義 (SSOT)。
 * 
 * 警告：本ファイル内への実際の実行処理、状態遷移、ディスパッチ、ハイドレーション、バリデーション、スケジューリング、
 * キュー処理、リトライ、API 通信、コマンド送信、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum RuntimeType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME',
  SIMULATION = 'SIMULATION',
  PLUGIN = 'PLUGIN',
  AI = 'AI'
}

export interface RuntimeMetadata {
  readonly author: string;
  readonly version: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly phase: string;
}

export interface ExecutionRuntimeContext {
  readonly executionEngineId: string;
  readonly executionRegistryId: string;
  readonly executionRequestId: string;
  readonly executionResultId: string;
  readonly executionStateId: string;
  readonly executionResolverId: string;
  readonly executionDispatcherId: string;
}

export interface ExecutionRuntime {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly runtimeType: RuntimeType;
  readonly context: ExecutionRuntimeContext;
  readonly metadata: RuntimeMetadata;
}

export interface ExecutionRuntimeBlueprint {
  getRuntime(): ExecutionRuntime;
  getContext(): ExecutionRuntimeContext;
  getMetadata(): RuntimeMetadata;
}

// 1. メタデータオブジェクトの作成と凍結
const runtimeMetadata = Object.freeze({
  author: 'AIOS Team',
  version: '1.0.0',
  createdAt: '2026-07-09T14:00:00Z',
  updatedAt: '2026-07-09T14:00:00Z',
  phase: 'Phase 204-1'
});

// 2. コンテキストオブジェクトの作成と凍結 (ID 参照のみ)
const runtimeContext: ExecutionRuntimeContext = Object.freeze({
  executionEngineId: 'engine-execution-01',
  executionRegistryId: 'registry-execution-01',
  executionRequestId: 'execution-request-01',
  executionResultId: 'execution-result-01',
  executionStateId: 'execution-state-01',
  executionResolverId: 'execution-resolver-01',
  executionDispatcherId: 'execution-dispatcher-01'
});

// 3. ランタイムオブジェクト本体の作成と凍結
const runtimeData: ExecutionRuntime = Object.freeze({
  id: 'execution-runtime-01',
  name: 'Default Execution Runtime',
  description: 'The static execution runtime structure definition',
  runtimeType: RuntimeType.FOUNDATION,
  context: runtimeContext,
  metadata: runtimeMetadata
});

// Blueprint コンテナの不変シングルトンインスタンス実装
export const EXECUTION_RUNTIME_BLUEPRINT: ExecutionRuntimeBlueprint = Object.freeze({
  getRuntime(): ExecutionRuntime {
    return runtimeData;
  },

  getContext(): ExecutionRuntimeContext {
    return runtimeData.context;
  },

  getMetadata(): RuntimeMetadata {
    return runtimeData.metadata;
  }
});

export type { ExecutionRuntime as ExecutionRuntimeType };
