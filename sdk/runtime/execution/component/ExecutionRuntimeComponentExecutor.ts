/**
 * ExecutionRuntimeComponentExecutor.ts
 * 
 * Execution Runtime Component Executor Foundation (SSOT).
 * 実行コンポーネントエグゼキュータの静的 Blueprint を表現する。
 * 
 * 警告：本ファイル内への実際の実行、プロセス起動、プラグイン実行、AI実行、タスク処理
 * （execute, run, invoke, start, stop, spawn, fork, process, dispatch, schedule, register, resolve, validate 等）、
 * 外部連携、Event、Queue、Thread、Timer、非同期処理（Async, Promise）の実装は厳禁である。
 */

export enum ExecutorType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME',
  SIMULATION = 'SIMULATION',
  PLUGIN = 'PLUGIN',
  AI = 'AI'
}

export enum ExecutorScope {
  LOCAL = 'LOCAL',
  SANDBOX = 'SANDBOX',
  REMOTE = 'REMOTE'
}

export interface RuntimeComponentExecutorMetadata {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly layer: string;
  readonly category: string;
}

export interface ExecutionRuntimeComponentExecutorContext {
  readonly runtimeComponentExecutorId: string;
}

export interface ExecutionRuntimeComponentExecutorData {
  readonly executorType: ExecutorType;
  readonly executorScope: ExecutorScope;
}

export interface ExecutionRuntimeComponentExecutor {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly context: ExecutionRuntimeComponentExecutorContext;
  readonly metadata: RuntimeComponentExecutorMetadata;
  readonly data: ExecutionRuntimeComponentExecutorData;
}

export interface ExecutionRuntimeComponentExecutorBlueprint {
  getExecutionRuntimeComponentExecutor(): ExecutionRuntimeComponentExecutor;
  getMetadata(): RuntimeComponentExecutorMetadata;
  getContext(): ExecutionRuntimeComponentExecutorContext;
  getData(): ExecutionRuntimeComponentExecutorData;
}

// 1. メタデータの作成と凍結
const executorMetadata: RuntimeComponentExecutorMetadata = Object.freeze({
  id: 'runtime-component-executor-spec-01',
  name: 'Default Execution Runtime Component Executor Specification',
  version: '1.0.0',
  description: 'The static execution runtime component executor foundation specification',
  layer: 'Runtime Layer',
  category: 'Execution Component Executor'
});

// 2. コンテキストの作成と凍結 (IDのみ保持)
const executorContext: ExecutionRuntimeComponentExecutorContext = Object.freeze({
  runtimeComponentExecutorId: 'runtime-component-executor-01'
});

// 3. データの作成と凍結
const executorData: ExecutionRuntimeComponentExecutorData = Object.freeze({
  executorType: ExecutorType.FOUNDATION,
  executorScope: ExecutorScope.LOCAL
});

// 4. エグゼキュータ本体の作成と凍結
const executorInstance: ExecutionRuntimeComponentExecutor = Object.freeze({
  id: 'runtime-component-executor-01',
  name: 'Default Execution Runtime Component Executor',
  description: 'The static execution runtime component executor instance definition',
  context: executorContext,
  metadata: executorMetadata,
  data: executorData
});

// Blueprint コンテナの不変シングルトンインスタンス実装 (型固定の適用)
export const EXECUTION_RUNTIME_COMPONENT_EXECUTOR_BLUEPRINT: Readonly<ExecutionRuntimeComponentExecutorBlueprint> = Object.freeze({
  getExecutionRuntimeComponentExecutor(): ExecutionRuntimeComponentExecutor {
    return executorInstance;
  },

  getMetadata(): RuntimeComponentExecutorMetadata {
    return executorInstance.metadata;
  },

  getContext(): ExecutionRuntimeComponentExecutorContext {
    return executorInstance.context;
  },

  getData(): ExecutionRuntimeComponentExecutorData {
    return executorInstance.data;
  }
});

export type { ExecutionRuntimeComponentExecutor as ExecutionRuntimeComponentExecutorType };
export type { ExecutionRuntimeComponentExecutorContext as ExecutionRuntimeComponentExecutorContextType };
export type { ExecutionRuntimeComponentExecutorData as ExecutionRuntimeComponentExecutorDataType };
