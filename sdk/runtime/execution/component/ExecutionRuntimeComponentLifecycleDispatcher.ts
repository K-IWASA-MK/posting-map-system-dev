/**
 * ExecutionRuntimeComponentLifecycleDispatcher.ts
 * 
 * Execution Runtime Component Lifecycle Dispatcher Foundation (SSOT).
 * 実行コンポーネントライフサイクルディスパッチャーの静的 Blueprint を表現する。
 * 
 * 警告：本ファイル内への実際のイベントディスパッチ・通知・ルーティング・配信処理
 * （dispatch, route, publish, notify, emit, forward, execute 等）、
 * ランタイムディスパッチャー、イベント、キュー、スレッド、タイマー、非同期処理（Async, Promise）、プラグイン・AI ランタイムの実装は厳禁である。
 */

export enum DispatcherType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME',
  SIMULATION = 'SIMULATION',
  PLUGIN = 'PLUGIN',
  AI = 'AI'
}

export enum DispatcherScope {
  SINGLETON = 'SINGLETON',
  TRANSIENT = 'TRANSIENT',
  SCOPED = 'SCOPED'
}

export interface DispatcherMetadata {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly layer: string;
  readonly category: string;
}

export interface ExecutionRuntimeComponentLifecycleDispatcherContext {
  readonly runtimeComponentLifecycleDispatcherId: string;
}

export interface ExecutionRuntimeComponentLifecycleDispatcherData {
  readonly dispatcherType: DispatcherType;
  readonly dispatcherScope: DispatcherScope;
}

export interface ExecutionRuntimeComponentLifecycleDispatcher {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly context: ExecutionRuntimeComponentLifecycleDispatcherContext;
  readonly metadata: DispatcherMetadata;
  readonly data: ExecutionRuntimeComponentLifecycleDispatcherData;
}

export interface ExecutionRuntimeComponentLifecycleDispatcherBlueprint {
  getExecutionRuntimeComponentLifecycleDispatcher(): ExecutionRuntimeComponentLifecycleDispatcher;
  getMetadata(): DispatcherMetadata;
  getContext(): ExecutionRuntimeComponentLifecycleDispatcherContext;
  getData(): ExecutionRuntimeComponentLifecycleDispatcherData;
}

// 1. メタデータの作成と凍結
const componentLifecycleDispatcherMetadata: DispatcherMetadata = Object.freeze({
  id: 'runtime-component-lifecycle-dispatcher-spec-01',
  name: 'Default Execution Runtime Component Lifecycle Dispatcher Specification',
  version: '1.0.0',
  description: 'The static execution runtime component lifecycle dispatcher foundation specification',
  layer: 'Runtime Layer',
  category: 'Execution Component Lifecycle Dispatcher'
});

// 2. コンテキストの作成と凍結 (IDのみ保持)
const componentLifecycleDispatcherContext: ExecutionRuntimeComponentLifecycleDispatcherContext = Object.freeze({
  runtimeComponentLifecycleDispatcherId: 'runtime-component-lifecycle-dispatcher-01'
});

// 3. データの作成と凍結
const componentLifecycleDispatcherData: ExecutionRuntimeComponentLifecycleDispatcherData = Object.freeze({
  dispatcherType: DispatcherType.FOUNDATION,
  dispatcherScope: DispatcherScope.SINGLETON
});

// 4. ディスパッチャー本体の作成と凍結
const componentLifecycleDispatcherInstance: ExecutionRuntimeComponentLifecycleDispatcher = Object.freeze({
  id: 'runtime-component-lifecycle-dispatcher-01',
  name: 'Default Execution Runtime Component Lifecycle Dispatcher',
  description: 'The static execution runtime component lifecycle dispatcher instance definition',
  context: componentLifecycleDispatcherContext,
  metadata: componentLifecycleDispatcherMetadata,
  data: componentLifecycleDispatcherData
});

// Blueprint コンテナの不変シングルトンインスタンス実装 (型固定の適用)
export const EXECUTION_RUNTIME_COMPONENT_LIFECYCLE_DISPATCHER_BLUEPRINT: Readonly<ExecutionRuntimeComponentLifecycleDispatcherBlueprint> = Object.freeze({
  getExecutionRuntimeComponentLifecycleDispatcher(): ExecutionRuntimeComponentLifecycleDispatcher {
    return componentLifecycleDispatcherInstance;
  },

  getMetadata(): DispatcherMetadata {
    return componentLifecycleDispatcherInstance.metadata;
  },

  getContext(): ExecutionRuntimeComponentLifecycleDispatcherContext {
    return componentLifecycleDispatcherInstance.context;
  },

  getData(): ExecutionRuntimeComponentLifecycleDispatcherData {
    return componentLifecycleDispatcherInstance.data;
  }
});

export type { ExecutionRuntimeComponentLifecycleDispatcher as ExecutionRuntimeComponentLifecycleDispatcherType };
export type { ExecutionRuntimeComponentLifecycleDispatcherContext as ExecutionRuntimeComponentLifecycleDispatcherContextType };
export type { ExecutionRuntimeComponentLifecycleDispatcherData as ExecutionRuntimeComponentLifecycleDispatcherDataType };
