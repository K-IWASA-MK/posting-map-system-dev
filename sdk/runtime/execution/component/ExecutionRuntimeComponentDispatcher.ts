/**
 * ExecutionRuntimeComponentDispatcher.ts
 * 
 * Execution Runtime Component Dispatcher Foundation (SSOT).
 * 実行コンポーネントディスパッチャの静的 Blueprint を表現する。
 * 
 * 警告：本ファイル内への実際のディスパッチ、キュー投入、ルーティング、実行制御
 * （dispatch, enqueue, dequeue, route, schedule, execute, process, forward, register, resolve, validate 等）、
 * 外部連携、Event、Queue、Thread、Timer、非同期処理（Async, Promise）の実装は厳禁である。
 */

export enum DispatcherType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME',
  SIMULATION = 'SIMULATION',
  PLUGIN = 'PLUGIN',
  AI = 'AI'
}

export enum DispatcherScope {
  SYNC = 'SYNC',
  ASYNC = 'ASYNC',
  DEFERRED = 'DEFERRED'
}

export interface RuntimeComponentDispatcherMetadata {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly layer: string;
  readonly category: string;
}

export interface ExecutionRuntimeComponentDispatcherContext {
  readonly runtimeComponentDispatcherId: string;
}

export interface ExecutionRuntimeComponentDispatcherData {
  readonly dispatcherType: DispatcherType;
  readonly dispatcherScope: DispatcherScope;
}

export interface ExecutionRuntimeComponentDispatcher {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly context: ExecutionRuntimeComponentDispatcherContext;
  readonly metadata: RuntimeComponentDispatcherMetadata;
  readonly data: ExecutionRuntimeComponentDispatcherData;
}

export interface ExecutionRuntimeComponentDispatcherBlueprint {
  getExecutionRuntimeComponentDispatcher(): ExecutionRuntimeComponentDispatcher;
  getMetadata(): RuntimeComponentDispatcherMetadata;
  getContext(): ExecutionRuntimeComponentDispatcherContext;
  getData(): ExecutionRuntimeComponentDispatcherData;
}

// 1. メタデータの作成と凍結
const dispatcherMetadata: RuntimeComponentDispatcherMetadata = Object.freeze({
  id: 'runtime-component-dispatcher-spec-01',
  name: 'Default Execution Runtime Component Dispatcher Specification',
  version: '1.0.0',
  description: 'The static execution runtime component dispatcher foundation specification',
  layer: 'Runtime Layer',
  category: 'Execution Component Dispatcher'
});

// 2. コンテキストの作成と凍結 (IDのみ保持)
const dispatcherContext: ExecutionRuntimeComponentDispatcherContext = Object.freeze({
  runtimeComponentDispatcherId: 'runtime-component-dispatcher-01'
});

// 3. データの作成と凍結
const dispatcherData: ExecutionRuntimeComponentDispatcherData = Object.freeze({
  dispatcherType: DispatcherType.FOUNDATION,
  dispatcherScope: DispatcherScope.SYNC
});

// 4. ディスパッチャ本体の作成と凍結
const dispatcherInstance: ExecutionRuntimeComponentDispatcher = Object.freeze({
  id: 'runtime-component-dispatcher-01',
  name: 'Default Execution Runtime Component Dispatcher',
  description: 'The static execution runtime component dispatcher instance definition',
  context: dispatcherContext,
  metadata: dispatcherMetadata,
  data: dispatcherData
});

// Blueprint コンテナの不変シングルトンインスタンス実装 (型固定の適用)
export const EXECUTION_RUNTIME_COMPONENT_DISPATCHER_BLUEPRINT: Readonly<ExecutionRuntimeComponentDispatcherBlueprint> = Object.freeze({
  getExecutionRuntimeComponentDispatcher(): ExecutionRuntimeComponentDispatcher {
    return dispatcherInstance;
  },

  getMetadata(): RuntimeComponentDispatcherMetadata {
    return dispatcherInstance.metadata;
  },

  getContext(): ExecutionRuntimeComponentDispatcherContext {
    return dispatcherInstance.context;
  },

  getData(): ExecutionRuntimeComponentDispatcherData {
    return dispatcherInstance.data;
  }
});

export type { ExecutionRuntimeComponentDispatcher as ExecutionRuntimeComponentDispatcherType };
export type { ExecutionRuntimeComponentDispatcherContext as ExecutionRuntimeComponentDispatcherContextType };
export type { ExecutionRuntimeComponentDispatcherData as ExecutionRuntimeComponentDispatcherDataType };
