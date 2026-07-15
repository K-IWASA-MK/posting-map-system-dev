/**
 * ExecutionRuntimeServiceDispatcher.ts
 * 
 * Execution Runtime Service Dispatcher Foundation (SSOT).
 * サービス層のディスパッチ構造に関する静的 Blueprint を表現する。
 * 
 * 警告：本ファイル内への実際のディスパッチ実行、キュー投入、タスクスケジュール、
 * および実行制御（dispatch, enqueue, execute, run, start, stop, cancel, schedule, resolve, instantiate, cache 等）、
 * API 通信, コマンド送信, AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum ServiceDispatcherType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME',
  SIMULATION = 'SIMULATION',
  PLUGIN = 'PLUGIN',
  AI = 'AI'
}

export interface RuntimeServiceDispatcherMetadata {
  readonly author: string;
  readonly version: string;
  readonly phase: string;
}

export interface ExecutionRuntimeServiceDispatcherContext {
  readonly runtimeServiceId: string;
  readonly runtimeServiceRegistryId: string;
  readonly runtimeServiceResolverId: string;
  readonly runtimeServiceValidatorId: string;
  readonly runtimeEngineId: string;
  readonly runtimeEngineRegistryId: string;
  readonly runtimeEngineResolverId: string;
  readonly runtimeEngineValidatorId: string;
  readonly runtimeEngineDispatcherId: string;
  readonly runtimeEngineSchedulerId: string;
  readonly runtimeEngineExecutorId: string;
}

export interface ExecutionRuntimeServiceDispatcher {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly dispatcherType: ServiceDispatcherType;
  readonly context: ExecutionRuntimeServiceDispatcherContext;
  readonly metadata: RuntimeServiceDispatcherMetadata;
}

export interface ExecutionRuntimeServiceDispatcherBlueprint {
  getDispatcher(): ExecutionRuntimeServiceDispatcher;
  getContext(): ExecutionRuntimeServiceDispatcherContext;
  getMetadata(): RuntimeServiceDispatcherMetadata;
}

// 1. メタデータの作成と凍結
const dispatcherMetadata: RuntimeServiceDispatcherMetadata = Object.freeze({
  author: 'AIOS Team',
  version: '1.0.0',
  phase: 'Phase 207-5'
});

// 2. 静的なディスパッチャコンテキストの作成と凍結 (IDのみ保持)
const dispatcherContext: ExecutionRuntimeServiceDispatcherContext = Object.freeze({
  runtimeServiceId: 'runtime-service-01',
  runtimeServiceRegistryId: 'runtime-service-registry-01',
  runtimeServiceResolverId: 'runtime-service-resolver-01',
  runtimeServiceValidatorId: 'runtime-service-validator-01',
  runtimeEngineId: 'runtime-engine-01',
  runtimeEngineRegistryId: 'runtime-engine-registry-01',
  runtimeEngineResolverId: 'runtime-engine-resolver-01',
  runtimeEngineValidatorId: 'runtime-engine-validator-01',
  runtimeEngineDispatcherId: 'runtime-engine-dispatcher-01',
  runtimeEngineSchedulerId: 'runtime-engine-scheduler-01',
  runtimeEngineExecutorId: 'runtime-engine-executor-01'
});

// 3. ディスパッチャ本体オブジェクトの作成と凍結
const dispatcherData: ExecutionRuntimeServiceDispatcher = Object.freeze({
  id: 'runtime-service-dispatcher-01',
  name: 'Default Execution Runtime Service Dispatcher',
  description: 'The static execution runtime service dispatcher specification',
  dispatcherType: ServiceDispatcherType.FOUNDATION,
  context: dispatcherContext,
  metadata: dispatcherMetadata
});

// Blueprint コンテナの不変シングルトンインスタンス実装
export const EXECUTION_RUNTIME_SERVICE_DISPATCHER_BLUEPRINT: ExecutionRuntimeServiceDispatcherBlueprint = Object.freeze({
  getDispatcher(): ExecutionRuntimeServiceDispatcher {
    return dispatcherData;
  },

  getContext(): ExecutionRuntimeServiceDispatcherContext {
    return dispatcherData.context;
  },

  getMetadata(): RuntimeServiceDispatcherMetadata {
    return dispatcherData.metadata;
  }
});

export type { ExecutionRuntimeServiceDispatcher as ExecutionRuntimeServiceDispatcherType };
export type { ExecutionRuntimeServiceDispatcherContext as ExecutionRuntimeServiceDispatcherContextType };
