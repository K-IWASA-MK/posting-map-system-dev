/**
 * ExecutionRuntimeEngineScheduler.ts
 * 
 * Execution Runtime Engine Scheduler Foundation (SSOT).
 * エンジンのスケジューリング構造に関する静的 Blueprint を表現する。
 * 
 * 警告：本ファイル内への実際のスケジューリング起動、タイマー生成、ジョブ管理、
 * および実行制御（schedule, unschedule, dispatch, enqueue, execute, invoke, run, start, stop, pause, resume, retry, cancel, resolve, cache, instantiate 等）、
 * API 通信, コマンド送信, AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum EngineSchedulerType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME',
  SIMULATION = 'SIMULATION',
  PLUGIN = 'PLUGIN',
  AI = 'AI'
}

export interface RuntimeEngineSchedulerMetadata {
  readonly author: string;
  readonly version: string;
  readonly phase: string;
}

export interface ExecutionRuntimeEngineSchedulerContext {
  readonly runtimeEngineId: string;
  readonly runtimeEngineRegistryId: string;
  readonly runtimeEngineResolverId: string;
  readonly runtimeEngineValidatorId: string;
  readonly runtimeEngineDispatcherId: string;
  readonly runtimeManagerId: string;
  readonly runtimeSessionId: string;
  readonly runtimeContextId: string;
}

export interface ExecutionRuntimeEngineScheduler {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly schedulerType: EngineSchedulerType;
  readonly context: ExecutionRuntimeEngineSchedulerContext;
  readonly metadata: RuntimeEngineSchedulerMetadata;
}

export interface ExecutionRuntimeEngineSchedulerBlueprint {
  getScheduler(): ExecutionRuntimeEngineScheduler;
  getContext(): ExecutionRuntimeEngineSchedulerContext;
  getMetadata(): RuntimeEngineSchedulerMetadata;
}

// 1. メタデータの作成と凍結
const schedulerMetadata: RuntimeEngineSchedulerMetadata = Object.freeze({
  author: 'AIOS Team',
  version: '1.0.0',
  phase: 'Phase 206-6'
});

// 2. 静的なスケジューラコンテキストの作成と凍結 (IDのみ保持)
const schedulerContext: ExecutionRuntimeEngineSchedulerContext = Object.freeze({
  runtimeEngineId: 'runtime-engine-01',
  runtimeEngineRegistryId: 'runtime-engine-registry-01',
  runtimeEngineResolverId: 'runtime-engine-resolver-01',
  runtimeEngineValidatorId: 'runtime-engine-validator-01',
  runtimeEngineDispatcherId: 'runtime-engine-dispatcher-01',
  runtimeManagerId: 'runtime-manager-01',
  runtimeSessionId: 'runtime-session-01',
  runtimeContextId: 'runtime-context-01'
});

// 3. スケジューラ本体オブジェクトの作成と凍結
const schedulerData: ExecutionRuntimeEngineScheduler = Object.freeze({
  id: 'runtime-engine-scheduler-01',
  name: 'Default Execution Runtime Engine Scheduler',
  description: 'The static execution runtime engine scheduler specification',
  schedulerType: EngineSchedulerType.FOUNDATION,
  context: schedulerContext,
  metadata: schedulerMetadata
});

// Blueprint コンテナの不変シングルトンインスタンス実装
export const EXECUTION_RUNTIME_ENGINE_SCHEDULER_BLUEPRINT: ExecutionRuntimeEngineSchedulerBlueprint = Object.freeze({
  getScheduler(): ExecutionRuntimeEngineScheduler {
    return schedulerData;
  },

  getContext(): ExecutionRuntimeEngineSchedulerContext {
    return schedulerData.context;
  },

  getMetadata(): RuntimeEngineSchedulerMetadata {
    return schedulerData.metadata;
  }
});

export type { ExecutionRuntimeEngineScheduler as ExecutionRuntimeEngineSchedulerType };
