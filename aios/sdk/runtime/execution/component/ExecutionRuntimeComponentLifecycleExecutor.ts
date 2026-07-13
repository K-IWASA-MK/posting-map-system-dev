/**
 * ExecutionRuntimeComponentLifecycleExecutor.ts
 * 
 * Execution Runtime Component Lifecycle Executor Foundation (SSOT).
 * 実行コンポーネントライフサイクルエグゼキュータの静的 Blueprint を表現する。
 * 
 * 警告：本ファイル内への実際の実行制御・起動・停止・再起動・シャットダウン・状態遷移処理
 * （execute, run, start, stop, restart, initialize, shutdown, terminate 等）、
 * ランタイムエグゼキュータ、イベント、キュー、スレッド、タイマー、非同期処理（Async, Promise）、プラグイン・AI ランタイムの実装は厳禁である。
 */

export enum ExecutorType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME',
  SIMULATION = 'SIMULATION',
  PLUGIN = 'PLUGIN',
  AI = 'AI'
}

export enum ExecutorScope {
  SINGLETON = 'SINGLETON',
  TRANSIENT = 'TRANSIENT',
  SCOPED = 'SCOPED'
}

export interface ExecutorMetadata {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly layer: string;
  readonly category: string;
}

export interface ExecutionRuntimeComponentLifecycleExecutorContext {
  readonly runtimeComponentLifecycleExecutorId: string;
}

export interface ExecutionRuntimeComponentLifecycleExecutorData {
  readonly executorType: ExecutorType;
  readonly executorScope: ExecutorScope;
}

export interface ExecutionRuntimeComponentLifecycleExecutor {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly context: ExecutionRuntimeComponentLifecycleExecutorContext;
  readonly metadata: ExecutorMetadata;
  readonly data: ExecutionRuntimeComponentLifecycleExecutorData;
}

export interface ExecutionRuntimeComponentLifecycleExecutorBlueprint {
  getExecutionRuntimeComponentLifecycleExecutor(): ExecutionRuntimeComponentLifecycleExecutor;
  getMetadata(): ExecutorMetadata;
  getContext(): ExecutionRuntimeComponentLifecycleExecutorContext;
  getData(): ExecutionRuntimeComponentLifecycleExecutorData;
}

// 1. メタデータの作成と凍結
const componentLifecycleExecutorMetadata: ExecutorMetadata = Object.freeze({
  id: 'runtime-component-lifecycle-executor-spec-01',
  name: 'Default Execution Runtime Component Lifecycle Executor Specification',
  version: '1.0.0',
  description: 'The static execution runtime component lifecycle executor foundation specification',
  layer: 'Runtime Layer',
  category: 'Execution Component Lifecycle Executor'
});

// 2. コンテキストの作成と凍結 (IDのみ保持)
const componentLifecycleExecutorContext: ExecutionRuntimeComponentLifecycleExecutorContext = Object.freeze({
  runtimeComponentLifecycleExecutorId: 'runtime-component-lifecycle-executor-01'
});

// 3. データの作成と凍結
const componentLifecycleExecutorData: ExecutionRuntimeComponentLifecycleExecutorData = Object.freeze({
  executorType: ExecutorType.FOUNDATION,
  executorScope: ExecutorScope.SINGLETON
});

// 4. エグゼキュータ本体の作成と凍結
const componentLifecycleExecutorInstance: ExecutionRuntimeComponentLifecycleExecutor = Object.freeze({
  id: 'runtime-component-lifecycle-executor-01',
  name: 'Default Execution Runtime Component Lifecycle Executor',
  description: 'The static execution runtime component lifecycle executor instance definition',
  context: componentLifecycleExecutorContext,
  metadata: componentLifecycleExecutorMetadata,
  data: componentLifecycleExecutorData
});

// Blueprint コンテナの不変シングルトンインスタンス実装 (型固定の適用)
export const EXECUTION_RUNTIME_COMPONENT_LIFECYCLE_EXECUTOR_BLUEPRINT: Readonly<ExecutionRuntimeComponentLifecycleExecutorBlueprint> = Object.freeze({
  getExecutionRuntimeComponentLifecycleExecutor(): ExecutionRuntimeComponentLifecycleExecutor {
    return componentLifecycleExecutorInstance;
  },

  getMetadata(): ExecutorMetadata {
    return componentLifecycleExecutorInstance.metadata;
  },

  getContext(): ExecutionRuntimeComponentLifecycleExecutorContext {
    return componentLifecycleExecutorInstance.context;
  },

  getData(): ExecutionRuntimeComponentLifecycleExecutorData {
    return componentLifecycleExecutorInstance.data;
  }
});

export type { ExecutionRuntimeComponentLifecycleExecutor as ExecutionRuntimeComponentLifecycleExecutorType };
export type { ExecutionRuntimeComponentLifecycleExecutorContext as ExecutionRuntimeComponentLifecycleExecutorContextType };
export type { ExecutionRuntimeComponentLifecycleExecutorData as ExecutionRuntimeComponentLifecycleExecutorDataType };
