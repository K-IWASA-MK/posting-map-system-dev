/**
 * ExecutionRuntimeServiceExecutor.ts
 * 
 * Execution Runtime Service Executor Foundation (SSOT).
 * サービス層の実行（Execution）境界構造に関する静的 Blueprint を表現する。
 * 
 * 警告：本ファイル内への実際のプロセス実行、スレッド制御、実行制御
 * （execute, invoke, run, start, stop, terminate, cancel, dispatch, schedule, spawn, fork, createProcess, instantiate, resolve, cache 等）、
 * AI予測・推論、Plugin実行、Shell実行、Browser操作、MCP呼び出しの実装は厳禁である。
 */

export enum ServiceExecutorType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME',
  SIMULATION = 'SIMULATION',
  PLUGIN = 'PLUGIN',
  AI = 'AI'
}

export interface RuntimeServiceExecutorMetadata {
  readonly author: string;
  readonly version: string;
  readonly phase: string;
}

export interface ExecutionRuntimeServiceExecutorContext {
  readonly runtimeServiceId: string;
  readonly runtimeServiceRegistryId: string;
  readonly runtimeServiceResolverId: string;
  readonly runtimeServiceValidatorId: string;
  readonly runtimeServiceDispatcherId: string;
  readonly runtimeServiceSchedulerId: string;
  readonly runtimeEngineId: string;
  readonly runtimeEngineRegistryId: string;
  readonly runtimeEngineResolverId: string;
  readonly runtimeEngineValidatorId: string;
  readonly runtimeEngineDispatcherId: string;
  readonly runtimeEngineSchedulerId: string;
  readonly runtimeEngineExecutorId: string;
}

export interface ExecutionRuntimeServiceExecutor {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly executorType: ServiceExecutorType;
  readonly context: ExecutionRuntimeServiceExecutorContext;
  readonly metadata: RuntimeServiceExecutorMetadata;
}

export interface ExecutionRuntimeServiceExecutorBlueprint {
  getExecutor(): ExecutionRuntimeServiceExecutor;
  getContext(): ExecutionRuntimeServiceExecutorContext;
  getMetadata(): RuntimeServiceExecutorMetadata;
}

// 1. メタデータの作成と凍結
const executorMetadata: RuntimeServiceExecutorMetadata = Object.freeze({
  author: 'AIOS Team',
  version: '1.0.0',
  phase: 'Phase 207-7'
});

// 2. 静的なエグゼキュータコンテキストの作成と凍結 (IDのみ保持)
const executorContext: ExecutionRuntimeServiceExecutorContext = Object.freeze({
  runtimeServiceId: 'runtime-service-01',
  runtimeServiceRegistryId: 'runtime-service-registry-01',
  runtimeServiceResolverId: 'runtime-service-resolver-01',
  runtimeServiceValidatorId: 'runtime-service-validator-01',
  runtimeServiceDispatcherId: 'runtime-service-dispatcher-01',
  runtimeServiceSchedulerId: 'runtime-service-scheduler-01',
  runtimeEngineId: 'runtime-engine-01',
  runtimeEngineRegistryId: 'runtime-engine-registry-01',
  runtimeEngineResolverId: 'runtime-engine-resolver-01',
  runtimeEngineValidatorId: 'runtime-engine-validator-01',
  runtimeEngineDispatcherId: 'runtime-engine-dispatcher-01',
  runtimeEngineSchedulerId: 'runtime-engine-scheduler-01',
  runtimeEngineExecutorId: 'runtime-engine-executor-01'
});

// 3. エグゼキュータ本体オブジェクトの作成と凍結
const executorData: ExecutionRuntimeServiceExecutor = Object.freeze({
  id: 'runtime-service-executor-01',
  name: 'Default Execution Runtime Service Executor',
  description: 'The static execution runtime service executor specification',
  executorType: ServiceExecutorType.FOUNDATION,
  context: executorContext,
  metadata: executorMetadata
});

// Blueprint コンテナの不変シングルトンインスタンス実装
export const EXECUTION_RUNTIME_SERVICE_EXECUTOR_BLUEPRINT: ExecutionRuntimeServiceExecutorBlueprint = Object.freeze({
  getExecutor(): ExecutionRuntimeServiceExecutor {
    return executorData;
  },

  getContext(): ExecutionRuntimeServiceExecutorContext {
    return executorData.context;
  },

  getMetadata(): RuntimeServiceExecutorMetadata {
    return executorData.metadata;
  }
});

export type { ExecutionRuntimeServiceExecutor as ExecutionRuntimeServiceExecutorType };
export type { ExecutionRuntimeServiceExecutorContext as ExecutionRuntimeServiceExecutorContextType };
