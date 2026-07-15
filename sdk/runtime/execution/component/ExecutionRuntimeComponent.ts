/**
 * ExecutionRuntimeComponent.ts
 * 
 * Execution Runtime Component Foundation (SSOT).
 * 実行コンポーネントの静的 Blueprint を表現する。
 * 
 * 警告：本ファイル内への実際のコンポーネント生成、ロード、ライフサイクル制御
 * （execute, run, load, initialize, create, destroy, mount, unmount, register, resolve, validate, dispatch, schedule 等）、
 * DI、Event、Plugin、AI、Queue、Thread、Timer、非同期処理（Async, Promise）の実装は厳禁である。
 */

export enum ComponentType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME',
  SIMULATION = 'SIMULATION',
  PLUGIN = 'PLUGIN',
  AI = 'AI'
}

export enum ComponentState {
  INITIAL = 'INITIAL',
  RESOLVED = 'RESOLVED',
  VALIDATED = 'VALIDATED'
}

export interface RuntimeComponentMetadata {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly layer: string;
  readonly category: string;
}

export interface ExecutionRuntimeComponentContext {
  readonly runtimeComponentId: string;
}

export interface ExecutionRuntimeComponentData {
  readonly componentType: ComponentType;
  readonly componentState: ComponentState;
}

export interface ExecutionRuntimeComponent {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly context: ExecutionRuntimeComponentContext;
  readonly metadata: RuntimeComponentMetadata;
  readonly data: ExecutionRuntimeComponentData;
}

export interface ExecutionRuntimeComponentBlueprint {
  getExecutionRuntimeComponent(): ExecutionRuntimeComponent;
  getMetadata(): RuntimeComponentMetadata;
  getContext(): ExecutionRuntimeComponentContext;
  getData(): ExecutionRuntimeComponentData;
}

// 1. メタデータの作成と凍結
const componentMetadata: RuntimeComponentMetadata = Object.freeze({
  id: 'runtime-component-spec-01',
  name: 'Default Execution Runtime Component Specification',
  version: '1.0.0',
  description: 'The static execution runtime component foundation specification',
  layer: 'Runtime Layer',
  category: 'Execution Component'
});

// 2. コンテキストの作成と凍結 (IDのみ保持)
const componentContext: ExecutionRuntimeComponentContext = Object.freeze({
  runtimeComponentId: 'runtime-component-01'
});

// 3. データの作成と凍結
const componentData: ExecutionRuntimeComponentData = Object.freeze({
  componentType: ComponentType.FOUNDATION,
  componentState: ComponentState.INITIAL
});

// 4. コンポーネント本体の作成と凍結
const componentInstance: ExecutionRuntimeComponent = Object.freeze({
  id: 'runtime-component-01',
  name: 'Default Execution Runtime Component',
  description: 'The static execution runtime component instance definition',
  context: componentContext,
  metadata: componentMetadata,
  data: componentData
});

// Blueprint コンテナの不変シングルトンインスタンス実装 (型固定の適用)
export const EXECUTION_RUNTIME_COMPONENT_BLUEPRINT: Readonly<ExecutionRuntimeComponentBlueprint> = Object.freeze({
  getExecutionRuntimeComponent(): ExecutionRuntimeComponent {
    return componentInstance;
  },

  getMetadata(): RuntimeComponentMetadata {
    return componentInstance.metadata;
  },

  getContext(): ExecutionRuntimeComponentContext {
    return componentInstance.context;
  },

  getData(): ExecutionRuntimeComponentData {
    return componentInstance.data;
  }
});

export type { ExecutionRuntimeComponent as ExecutionRuntimeComponentType };
export type { ExecutionRuntimeComponentContext as ExecutionRuntimeComponentContextType };
export type { ExecutionRuntimeComponentData as ExecutionRuntimeComponentDataType };
