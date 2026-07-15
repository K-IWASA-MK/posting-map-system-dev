/**
 * ExecutionRuntimeComponentLifecycleScheduler.ts
 * 
 * Execution Runtime Component Lifecycle Scheduler Foundation (SSOT).
 * 実行コンポーネントライフサイクルスケジューラの静的 Blueprint を表現する。
 * 
 * 警告：本ファイル内への実際のスケジューリング・キュー・タイマー・実行順序・遅延起動処理
 * （schedule, enqueue, dequeue, start, stop, pause, resume, cancel, execute 等）、
 * ランタイムスケジューラ、イベント、キュー、スレッド、タイマー、非同期処理（Async, Promise）、プラグイン・AI ランタイムの実装は厳禁である。
 */

export enum SchedulerType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME',
  SIMULATION = 'SIMULATION',
  PLUGIN = 'PLUGIN',
  AI = 'AI'
}

export enum SchedulerScope {
  SINGLETON = 'SINGLETON',
  TRANSIENT = 'TRANSIENT',
  SCOPED = 'SCOPED'
}

export interface SchedulerMetadata {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly layer: string;
  readonly category: string;
}

export interface ExecutionRuntimeComponentLifecycleSchedulerContext {
  readonly runtimeComponentLifecycleSchedulerId: string;
}

export interface ExecutionRuntimeComponentLifecycleSchedulerData {
  readonly schedulerType: SchedulerType;
  readonly schedulerScope: SchedulerScope;
}

export interface ExecutionRuntimeComponentLifecycleScheduler {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly context: ExecutionRuntimeComponentLifecycleSchedulerContext;
  readonly metadata: SchedulerMetadata;
  readonly data: ExecutionRuntimeComponentLifecycleSchedulerData;
}

export interface ExecutionRuntimeComponentLifecycleSchedulerBlueprint {
  getExecutionRuntimeComponentLifecycleScheduler(): ExecutionRuntimeComponentLifecycleScheduler;
  getMetadata(): SchedulerMetadata;
  getContext(): ExecutionRuntimeComponentLifecycleSchedulerContext;
  getData(): ExecutionRuntimeComponentLifecycleSchedulerData;
}

// 1. メタデータの作成と凍結
const componentLifecycleSchedulerMetadata: SchedulerMetadata = Object.freeze({
  id: 'runtime-component-lifecycle-scheduler-spec-01',
  name: 'Default Execution Runtime Component Lifecycle Scheduler Specification',
  version: '1.0.0',
  description: 'The static execution runtime component lifecycle scheduler foundation specification',
  layer: 'Runtime Layer',
  category: 'Execution Component Lifecycle Scheduler'
});

// 2. コンテキストの作成と凍結 (IDのみ保持)
const componentLifecycleSchedulerContext: ExecutionRuntimeComponentLifecycleSchedulerContext = Object.freeze({
  runtimeComponentLifecycleSchedulerId: 'runtime-component-lifecycle-scheduler-01'
});

// 3. データの作成と凍結
const componentLifecycleSchedulerData: ExecutionRuntimeComponentLifecycleSchedulerData = Object.freeze({
  schedulerType: SchedulerType.FOUNDATION,
  schedulerScope: SchedulerScope.SINGLETON
});

// 4. スケジューラ本体の作成と凍結
const componentLifecycleSchedulerInstance: ExecutionRuntimeComponentLifecycleScheduler = Object.freeze({
  id: 'runtime-component-lifecycle-scheduler-01',
  name: 'Default Execution Runtime Component Lifecycle Scheduler',
  description: 'The static execution runtime component lifecycle scheduler instance definition',
  context: componentLifecycleSchedulerContext,
  metadata: componentLifecycleSchedulerMetadata,
  data: componentLifecycleSchedulerData
});

// Blueprint コンテナの不変シングルトンインスタンス実装 (型固定の適用)
export const EXECUTION_RUNTIME_COMPONENT_LIFECYCLE_SCHEDULER_BLUEPRINT: Readonly<ExecutionRuntimeComponentLifecycleSchedulerBlueprint> = Object.freeze({
  getExecutionRuntimeComponentLifecycleScheduler(): ExecutionRuntimeComponentLifecycleScheduler {
    return componentLifecycleSchedulerInstance;
  },

  getMetadata(): SchedulerMetadata {
    return componentLifecycleSchedulerInstance.metadata;
  },

  getContext(): ExecutionRuntimeComponentLifecycleSchedulerContext {
    return componentLifecycleSchedulerInstance.context;
  },

  getData(): ExecutionRuntimeComponentLifecycleSchedulerData {
    return componentLifecycleSchedulerInstance.data;
  }
});

export type { ExecutionRuntimeComponentLifecycleScheduler as ExecutionRuntimeComponentLifecycleSchedulerType };
export type { ExecutionRuntimeComponentLifecycleSchedulerContext as ExecutionRuntimeComponentLifecycleSchedulerContextType };
export type { ExecutionRuntimeComponentLifecycleSchedulerData as ExecutionRuntimeComponentLifecycleSchedulerDataType };
