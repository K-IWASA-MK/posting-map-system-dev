/**
 * ExecutionRuntimeServiceScheduler.ts
 * 
 * Execution Runtime Service Scheduler Foundation (SSOT).
 * サービス層のスケジューリング構造に関する静的 Blueprint を表現する。
 * 
 * 警告：本ファイル内への実際のスケジューリング起動、タイマー生成、ジョブ管理、
 * および実行制御（schedule, unschedule, dispatch, enqueue, execute, run, start, stop, pause, resume, retry, cancel, resolve, instantiate, cache 等）、
 * API 通信, コマンド送信, AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum ServiceSchedulerType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME',
  SIMULATION = 'SIMULATION',
  PLUGIN = 'PLUGIN',
  AI = 'AI'
}

export interface RuntimeServiceSchedulerMetadata {
  readonly author: string;
  readonly version: string;
  readonly phase: string;
}

export interface ExecutionRuntimeServiceSchedulerContext {
  readonly runtimeServiceId: string;
  readonly runtimeServiceRegistryId: string;
  readonly runtimeServiceResolverId: string;
  readonly runtimeServiceValidatorId: string;
  readonly runtimeServiceDispatcherId: string;
  readonly runtimeEngineId: string;
  readonly runtimeEngineRegistryId: string;
  readonly runtimeEngineResolverId: string;
  readonly runtimeEngineValidatorId: string;
  readonly runtimeEngineDispatcherId: string;
  readonly runtimeEngineSchedulerId: string;
  readonly runtimeEngineExecutorId: string;
}

export interface ExecutionRuntimeServiceScheduler {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly schedulerType: ServiceSchedulerType;
  readonly context: ExecutionRuntimeServiceSchedulerContext;
  readonly metadata: RuntimeServiceSchedulerMetadata;
}

export interface ExecutionRuntimeServiceSchedulerBlueprint {
  getScheduler(): ExecutionRuntimeServiceScheduler;
  getContext(): ExecutionRuntimeServiceSchedulerContext;
  getMetadata(): RuntimeServiceSchedulerMetadata;
}

// 1. メタデータの作成と凍結
const schedulerMetadata: RuntimeServiceSchedulerMetadata = Object.freeze({
  author: 'AIOS Team',
  version: '1.0.0',
  phase: 'Phase 207-6'
});

// 2. 静的なスケジューラコンテキストの作成と凍結 (IDのみ保持)
const schedulerContext: ExecutionRuntimeServiceSchedulerContext = Object.freeze({
  runtimeServiceId: 'runtime-service-01',
  runtimeServiceRegistryId: 'runtime-service-registry-01',
  runtimeServiceResolverId: 'runtime-service-resolver-01',
  runtimeServiceValidatorId: 'runtime-service-validator-01',
  runtimeServiceDispatcherId: 'runtime-service-dispatcher-01',
  runtimeEngineId: 'runtime-engine-01',
  runtimeEngineRegistryId: 'runtime-engine-registry-01',
  runtimeEngineResolverId: 'runtime-engine-resolver-01',
  runtimeEngineValidatorId: 'runtime-engine-validator-01',
  runtimeEngineDispatcherId: 'runtime-engine-dispatcher-01',
  runtimeEngineSchedulerId: 'runtime-engine-scheduler-01',
  runtimeEngineExecutorId: 'runtime-engine-executor-01'
});

// 3. スケジューラ本体オブジェクトの作成と凍結
const schedulerData: ExecutionRuntimeServiceScheduler = Object.freeze({
  id: 'runtime-service-scheduler-01',
  name: 'Default Execution Runtime Service Scheduler',
  description: 'The static execution runtime service scheduler specification',
  schedulerType: ServiceSchedulerType.FOUNDATION,
  context: schedulerContext,
  metadata: schedulerMetadata
});

// Blueprint コンテナの不変シングルトンインスタンス実装
export const EXECUTION_RUNTIME_SERVICE_SCHEDULER_BLUEPRINT: ExecutionRuntimeServiceSchedulerBlueprint = Object.freeze({
  getScheduler(): ExecutionRuntimeServiceScheduler {
    return schedulerData;
  },

  getContext(): ExecutionRuntimeServiceSchedulerContext {
    return schedulerData.context;
  },

  getMetadata(): RuntimeServiceSchedulerMetadata {
    return schedulerData.metadata;
  }
});

export type { ExecutionRuntimeServiceScheduler as ExecutionRuntimeServiceSchedulerType };
export type { ExecutionRuntimeServiceSchedulerContext as ExecutionRuntimeServiceSchedulerContextType };
