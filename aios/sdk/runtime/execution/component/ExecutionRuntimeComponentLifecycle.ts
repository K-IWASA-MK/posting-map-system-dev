/**
 * ExecutionRuntimeComponentLifecycle.ts
 * 
 * Execution Runtime Component Lifecycle Foundation (SSOT).
 * 実行コンポーネントのライフサイクル静的 Blueprint を表現する。
 * 
 * 警告：本ファイル内への実際のライフサイクル遷移・状態管理・初期化・終了処理
 * （initialize, activate, deactivate, shutdown, reload, transition, start, stop, pause, resume, execute, dispatch, schedule 等）、
 * 状態マシン、イベント、キュー、スレッド、タイマー、非同期処理（Async, Promise）、プラグイン・AI ランタイムの実装は厳禁である。
 */

export enum LifecycleType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME',
  SIMULATION = 'SIMULATION',
  PLUGIN = 'PLUGIN',
  AI = 'AI'
}

export enum LifecycleScope {
  SINGLETON = 'SINGLETON',
  TRANSIENT = 'TRANSIENT',
  SCOPED = 'SCOPED'
}

export interface LifecycleMetadata {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly layer: string;
  readonly category: string;
}

export interface ExecutionRuntimeComponentLifecycleContext {
  readonly runtimeComponentLifecycleId: string;
}

export interface ExecutionRuntimeComponentLifecycleData {
  readonly lifecycleType: LifecycleType;
  readonly lifecycleScope: LifecycleScope;
}

export interface ExecutionRuntimeComponentLifecycle {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly context: ExecutionRuntimeComponentLifecycleContext;
  readonly metadata: LifecycleMetadata;
  readonly data: ExecutionRuntimeComponentLifecycleData;
}

export interface ExecutionRuntimeComponentLifecycleBlueprint {
  getExecutionRuntimeComponentLifecycle(): ExecutionRuntimeComponentLifecycle;
  getMetadata(): LifecycleMetadata;
  getContext(): ExecutionRuntimeComponentLifecycleContext;
  getData(): ExecutionRuntimeComponentLifecycleData;
}

// 1. メタデータの作成と凍結
const componentLifecycleMetadata: LifecycleMetadata = Object.freeze({
  id: 'runtime-component-lifecycle-spec-01',
  name: 'Default Execution Runtime Component Lifecycle Specification',
  version: '1.0.0',
  description: 'The static execution runtime component lifecycle foundation specification',
  layer: 'Runtime Layer',
  category: 'Execution Component Lifecycle'
});

// 2. コンテキストの作成と凍結 (IDのみ保持)
const componentLifecycleContext: ExecutionRuntimeComponentLifecycleContext = Object.freeze({
  runtimeComponentLifecycleId: 'runtime-component-lifecycle-01'
});

// 3. データの作成と凍結
const componentLifecycleData: ExecutionRuntimeComponentLifecycleData = Object.freeze({
  lifecycleType: LifecycleType.FOUNDATION,
  lifecycleScope: LifecycleScope.SINGLETON
});

// 4. ライフサイクル本体の作成と凍結
const componentLifecycleInstance: ExecutionRuntimeComponentLifecycle = Object.freeze({
  id: 'runtime-component-lifecycle-01',
  name: 'Default Execution Runtime Component Lifecycle',
  description: 'The static execution runtime component lifecycle instance definition',
  context: componentLifecycleContext,
  metadata: componentLifecycleMetadata,
  data: componentLifecycleData
});

// Blueprint コンテナの不変シングルトンインスタンス実装 (型固定の適用)
export const EXECUTION_RUNTIME_COMPONENT_LIFECYCLE_BLUEPRINT: Readonly<ExecutionRuntimeComponentLifecycleBlueprint> = Object.freeze({
  getExecutionRuntimeComponentLifecycle(): ExecutionRuntimeComponentLifecycle {
    return componentLifecycleInstance;
  },

  getMetadata(): LifecycleMetadata {
    return componentLifecycleInstance.metadata;
  },

  getContext(): ExecutionRuntimeComponentLifecycleContext {
    return componentLifecycleInstance.context;
  },

  getData(): ExecutionRuntimeComponentLifecycleData {
    return componentLifecycleInstance.data;
  }
});

export type { ExecutionRuntimeComponentLifecycle as ExecutionRuntimeComponentLifecycleType };
export type { ExecutionRuntimeComponentLifecycleContext as ExecutionRuntimeComponentLifecycleContextType };
export type { ExecutionRuntimeComponentLifecycleData as ExecutionRuntimeComponentLifecycleDataType };
