/**
 * ExecutionRuntimeEngineDispatcher.ts
 * 
 * Execution Runtime Engine Dispatcher Foundation (SSOT).
 * エンジンのディスパッチ構造に関する静的 Blueprint を表現する。
 * 
 * 警告：本ファイル内への実際のディスパッチ実行、キュー投入、タスクスケジュール、
 * および実行制御（dispatch, enqueue, schedule, execute, invoke, run, start, stop, cancel, retry, resolve, cache, instantiate 等）、
 * API 通信, コマンド送信, AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum EngineDispatcherType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME',
  SIMULATION = 'SIMULATION',
  PLUGIN = 'PLUGIN',
  AI = 'AI'
}

export interface RuntimeEngineDispatcherMetadata {
  readonly author: string;
  readonly version: string;
  readonly phase: string;
}

export interface ExecutionRuntimeEngineDispatcherContext {
  readonly runtimeEngineId: string;
  readonly runtimeEngineRegistryId: string;
  readonly runtimeEngineResolverId: string;
  readonly runtimeEngineValidatorId: string;
  readonly runtimeManagerId: string;
  readonly runtimeSessionId: string;
  readonly runtimeContextId: string;
}

export interface ExecutionRuntimeEngineDispatcher {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly dispatcherType: EngineDispatcherType;
  readonly context: ExecutionRuntimeEngineDispatcherContext;
  readonly metadata: RuntimeEngineDispatcherMetadata;
}

export interface ExecutionRuntimeEngineDispatcherBlueprint {
  getDispatcher(): ExecutionRuntimeEngineDispatcher;
  getContext(): ExecutionRuntimeEngineDispatcherContext;
  getMetadata(): RuntimeEngineDispatcherMetadata;
}

// 1. メタデータの作成と凍結
const dispatcherMetadata: RuntimeEngineDispatcherMetadata = Object.freeze({
  author: 'AIOS Team',
  version: '1.0.0',
  phase: 'Phase 206-5'
});

// 2. 静的なディスパッチャコンテキストの作成と凍結 (IDのみ保持)
const dispatcherContext: ExecutionRuntimeEngineDispatcherContext = Object.freeze({
  runtimeEngineId: 'runtime-engine-01',
  runtimeEngineRegistryId: 'runtime-engine-registry-01',
  runtimeEngineResolverId: 'runtime-engine-resolver-01',
  runtimeEngineValidatorId: 'runtime-engine-validator-01',
  runtimeManagerId: 'runtime-manager-01',
  runtimeSessionId: 'runtime-session-01',
  runtimeContextId: 'runtime-context-01'
});

// 3. ディスパッチャ本体オブジェクトの作成と凍結
const dispatcherData: ExecutionRuntimeEngineDispatcher = Object.freeze({
  id: 'runtime-engine-dispatcher-01',
  name: 'Default Execution Runtime Engine Dispatcher',
  description: 'The static execution runtime engine dispatcher specification',
  dispatcherType: EngineDispatcherType.FOUNDATION,
  context: dispatcherContext,
  metadata: dispatcherMetadata
});

// Blueprint コンテナの不変シングルトンインスタンス実装
export const EXECUTION_RUNTIME_ENGINE_DISPATCHER_BLUEPRINT: ExecutionRuntimeEngineDispatcherBlueprint = Object.freeze({
  getDispatcher(): ExecutionRuntimeEngineDispatcher {
    return dispatcherData;
  },

  getContext(): ExecutionRuntimeEngineDispatcherContext {
    return dispatcherData.context;
  },

  getMetadata(): RuntimeEngineDispatcherMetadata {
    return dispatcherData.metadata;
  }
});

export type { ExecutionRuntimeEngineDispatcher as ExecutionRuntimeEngineDispatcherType };
