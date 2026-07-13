/**
 * ExecutionRuntimeComponentScheduler.ts
 * 
 * Execution Runtime Component Scheduler Foundation (SSOT).
 * 実行コンポーネントスケジューラの静的 Blueprint を表現する。
 * 
 * 警告：本ファイル内への実際のスケジューリング、ジョブ管理、タイマー制御、実行順序制御
 * （schedule, enqueue, dequeue, start, stop, pause, resume, cancel, execute, dispatch, register, resolve, validate 等）、
 * 外部連携、Event、Thread、Timer、非同期処理（Async, Promise）の実装は厳禁である。
 */

export enum SchedulerType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME',
  SIMULATION = 'SIMULATION',
  PLUGIN = 'PLUGIN',
  AI = 'AI'
}

export enum SchedulerScope {
  FIFO = 'FIFO',
  PRIORITY = 'PRIORITY',
  ROUND_ROBIN = 'ROUND_ROBIN'
}

export interface RuntimeComponentSchedulerMetadata {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly layer: string;
  readonly category: string;
}

export interface ExecutionRuntimeComponentSchedulerContext {
  readonly runtimeComponentSchedulerId: string;
}

export interface ExecutionRuntimeComponentSchedulerData {
  readonly schedulerType: SchedulerType;
  readonly schedulerScope: SchedulerScope;
}

export interface ExecutionRuntimeComponentScheduler {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly context: ExecutionRuntimeComponentSchedulerContext;
  readonly metadata: RuntimeComponentSchedulerMetadata;
  readonly data: ExecutionRuntimeComponentSchedulerData;
}

export interface ExecutionRuntimeComponentSchedulerBlueprint {
  getExecutionRuntimeComponentScheduler(): ExecutionRuntimeComponentScheduler;
  getMetadata(): RuntimeComponentSchedulerMetadata;
  getContext(): ExecutionRuntimeComponentSchedulerContext;
  getData(): ExecutionRuntimeComponentSchedulerData;
}

// 1. メタデータの作成と凍結
const schedulerMetadata: RuntimeComponentSchedulerMetadata = Object.freeze({
  id: 'runtime-component-scheduler-spec-01',
  name: 'Default Execution Runtime Component Scheduler Specification',
  version: '1.0.0',
  description: 'The static execution runtime component scheduler foundation specification',
  layer: 'Runtime Layer',
  category: 'Execution Component Scheduler'
});

// 2. コンテキストの作成と凍結 (IDのみ保持)
const schedulerContext: ExecutionRuntimeComponentSchedulerContext = Object.freeze({
  runtimeComponentSchedulerId: 'runtime-component-scheduler-01'
});

// 3. データの作成と凍結
const schedulerData: ExecutionRuntimeComponentSchedulerData = Object.freeze({
  schedulerType: SchedulerType.FOUNDATION,
  schedulerScope: SchedulerScope.FIFO
});

// 4. スケジューラ本体の作成と凍結
const schedulerInstance: ExecutionRuntimeComponentScheduler = Object.freeze({
  id: 'runtime-component-scheduler-01',
  name: 'Default Execution Runtime Component Scheduler',
  description: 'The static execution runtime component scheduler instance definition',
  context: schedulerContext,
  metadata: schedulerMetadata,
  data: schedulerData
});

// Blueprint コンテナの不変シングルトンインスタンス実装 (型固定の適用)
export const EXECUTION_RUNTIME_COMPONENT_SCHEDULER_BLUEPRINT: Readonly<ExecutionRuntimeComponentSchedulerBlueprint> = Object.freeze({
  getExecutionRuntimeComponentScheduler(): ExecutionRuntimeComponentScheduler {
    return schedulerInstance;
  },

  getMetadata(): RuntimeComponentSchedulerMetadata {
    return schedulerInstance.metadata;
  },

  getContext(): ExecutionRuntimeComponentSchedulerContext {
    return schedulerInstance.context;
  },

  getData(): ExecutionRuntimeComponentSchedulerData {
    return schedulerInstance.data;
  }
});

export type { ExecutionRuntimeComponentScheduler as ExecutionRuntimeComponentSchedulerType };
export type { ExecutionRuntimeComponentSchedulerContext as ExecutionRuntimeComponentSchedulerContextType };
export type { ExecutionRuntimeComponentSchedulerData as ExecutionRuntimeComponentSchedulerDataType };
