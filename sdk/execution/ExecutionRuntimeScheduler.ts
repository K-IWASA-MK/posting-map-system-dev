/**
 * ExecutionRuntimeScheduler.ts
 * 
 * Execution Runtime Scheduler Foundation の構造および公開インターフェース定義 (SSOT)。
 * 
 * 警告：本ファイル内への実際の Scheduler 起動、スケジューリング、ディスパッチ、
 * タイマー、スレッド制御、非同期処理、キュー処理、API 通信、コマンド送信、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum SchedulerType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME'
}

export enum SchedulerScope {
  SYSTEM = 'SYSTEM'
}

export enum RuntimeSchedulerType {
  SYSTEM_SCHEDULER = 'SYSTEM_SCHEDULER',
  CORE_SCHEDULER = 'CORE_SCHEDULER',
  APPLICATION_SCHEDULER = 'APPLICATION_SCHEDULER',
  PLUGIN_SCHEDULER = 'PLUGIN_SCHEDULER',
  FIELD_SCHEDULER = 'FIELD_SCHEDULER'
}

export enum SchedulerLifecycleState {
  CREATED = 'CREATED',
  READY = 'READY',
  WAITING = 'WAITING',
  ACTIVE = 'ACTIVE',
  STOPPED = 'STOPPED',
  TERMINATED = 'TERMINATED'
}

export enum SchedulerExecutionPolicy {
  READ_ONLY = 'READ_ONLY',
  DETERMINISTIC = 'DETERMINISTIC',
  IMMUTABLE_SCHEMA = 'IMMUTABLE_SCHEMA',
  NO_THREAD = 'NO_THREAD',
  NO_TASK = 'NO_TASK',
  NO_QUEUE = 'NO_QUEUE',
  NO_WORKER = 'NO_WORKER',
  NO_EVENT_LOOP = 'NO_EVENT_LOOP',
  NO_TIMER = 'NO_TIMER',
  NO_DISPATCH = 'NO_DISPATCH',
  NO_PRIORITY_CALCULATION = 'NO_PRIORITY_CALCULATION',
  NO_LOAD_BALANCING = 'NO_LOAD_BALANCING'
}

export interface RuntimeSchedulerMetadata {
  readonly id: string;
  readonly name: string;
  readonly schedulerModelVersion: string;
  readonly description: string;
}

export interface RuntimeSchedulerModel {
  readonly schedulerType: RuntimeSchedulerType;
  readonly modelId: string;
  readonly metadata: RuntimeSchedulerMetadata;
  readonly schedulerOrder: number;
  readonly supportedSchedulerTypes: readonly string[];
  readonly lifecycleStates: readonly SchedulerLifecycleState[];
  readonly executionPolicies: readonly SchedulerExecutionPolicy[];
  readonly allowedSteps: readonly string[];
}

export interface SchedulerMetadata {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly layer: string;
  readonly category: string;
}

export interface ExecutionRuntimeSchedulerContext {
  readonly runtimeSchedulerId: string;
}

export interface ExecutionRuntimeSchedulerData {
  readonly managerType: SchedulerType;
  readonly managerScope: SchedulerScope;
  readonly schedulerModels: readonly RuntimeSchedulerModel[];
}

export interface ExecutionRuntimeScheduler {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly context: ExecutionRuntimeSchedulerContext;
  readonly metadata: SchedulerMetadata;
  readonly data: ExecutionRuntimeSchedulerData;
}

export interface ExecutionRuntimeSchedulerBlueprint {
  getExecutionRuntimeScheduler(): ExecutionRuntimeScheduler;
  getMetadata(): SchedulerMetadata;
  getContext(): ExecutionRuntimeSchedulerContext;
  getData(): ExecutionRuntimeSchedulerData;
  getSchedulerModels(): readonly RuntimeSchedulerModel[];
  getSchedulerSequence(): readonly string[];
}

// 1. 静的実行ステップシーケンスの定義と凍結
export const SCHEDULER_SEQUENCE: readonly string[] = Object.freeze([
  'REGISTER_SCHEDULER',
  'VALIDATE_SCHEDULER_SCHEMA',
  'INITIALIZE_SCHEDULER_BLUEPRINT',
  'READY_FOR_SCHEDULER_RUNTIME',
  'SCHEDULER_SCHEMA_CONFIRMED'
]);

// 静的ポリシーリストの定義と凍結 (推奨のポリシーを含む)
const defaultPolicies: readonly SchedulerExecutionPolicy[] = Object.freeze([
  SchedulerExecutionPolicy.READ_ONLY,
  SchedulerExecutionPolicy.DETERMINISTIC,
  SchedulerExecutionPolicy.IMMUTABLE_SCHEMA,
  SchedulerExecutionPolicy.NO_THREAD,
  SchedulerExecutionPolicy.NO_TASK,
  SchedulerExecutionPolicy.NO_QUEUE,
  SchedulerExecutionPolicy.NO_WORKER,
  SchedulerExecutionPolicy.NO_EVENT_LOOP,
  SchedulerExecutionPolicy.NO_TIMER,
  SchedulerExecutionPolicy.NO_DISPATCH,
  SchedulerExecutionPolicy.NO_PRIORITY_CALCULATION,
  SchedulerExecutionPolicy.NO_LOAD_BALANCING
]);

// 静的ライフサイクル状態リストの定義と凍結
const defaultLifecycleStates: readonly SchedulerLifecycleState[] = Object.freeze([
  SchedulerLifecycleState.CREATED,
  SchedulerLifecycleState.READY,
  SchedulerLifecycleState.WAITING,
  SchedulerLifecycleState.ACTIVE,
  SchedulerLifecycleState.STOPPED,
  SchedulerLifecycleState.TERMINATED
]);

// 2. 静的スケジューラモデルリストの定義と凍結
export const RUNTIME_SCHEDULER_MODELS: readonly RuntimeSchedulerModel[] = Object.freeze([
  Object.freeze({
    schedulerType: RuntimeSchedulerType.SYSTEM_SCHEDULER,
    modelId: 'scheduler-model-system-01',
    metadata: Object.freeze({
      id: 'scheduler-meta-system-01',
      name: 'System Scheduler Metadata',
      schedulerModelVersion: '1.0',
      description: 'Metadata for System Scheduler Schema'
    }),
    schedulerOrder: 1,
    supportedSchedulerTypes: Object.freeze(['SYSTEM']),
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: SCHEDULER_SEQUENCE
  }),
  Object.freeze({
    schedulerType: RuntimeSchedulerType.CORE_SCHEDULER,
    modelId: 'scheduler-model-core-01',
    metadata: Object.freeze({
      id: 'scheduler-meta-core-01',
      name: 'Core Scheduler Metadata',
      schedulerModelVersion: '1.0',
      description: 'Metadata for Core Scheduler Schema'
    }),
    schedulerOrder: 2,
    supportedSchedulerTypes: Object.freeze(['CORE']),
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: SCHEDULER_SEQUENCE
  }),
  Object.freeze({
    schedulerType: RuntimeSchedulerType.APPLICATION_SCHEDULER,
    modelId: 'scheduler-model-app-01',
    metadata: Object.freeze({
      id: 'scheduler-meta-app-01',
      name: 'Application Scheduler Metadata',
      schedulerModelVersion: '1.0',
      description: 'Metadata for Application Scheduler Schema'
    }),
    schedulerOrder: 3,
    supportedSchedulerTypes: Object.freeze(['APPLICATION']),
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: SCHEDULER_SEQUENCE
  }),
  Object.freeze({
    schedulerType: RuntimeSchedulerType.PLUGIN_SCHEDULER,
    modelId: 'scheduler-model-plugin-01',
    metadata: Object.freeze({
      id: 'scheduler-meta-plugin-01',
      name: 'Plugin Scheduler Metadata',
      schedulerModelVersion: '1.0',
      description: 'Metadata for Plugin Scheduler Schema'
    }),
    schedulerOrder: 4,
    supportedSchedulerTypes: Object.freeze([]),
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: SCHEDULER_SEQUENCE
  }),
  Object.freeze({
    schedulerType: RuntimeSchedulerType.FIELD_SCHEDULER,
    modelId: 'scheduler-model-field-01',
    metadata: Object.freeze({
      id: 'scheduler-meta-field-01',
      name: 'Field Scheduler Metadata',
      schedulerModelVersion: '1.0',
      description: 'Metadata for Field Scheduler Schema'
    }),
    schedulerOrder: 5,
    supportedSchedulerTypes: Object.freeze([]),
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: SCHEDULER_SEQUENCE
  })
]);

// 3. メタデータオブジェクトの作成と凍結
const schedulerMetadata: SchedulerMetadata = Object.freeze({
  id: 'runtime-scheduler-meta-01',
  name: 'Execution Runtime Scheduler Metadata',
  version: '1.0.0',
  description: 'Metadata for Execution Runtime Scheduler Foundation',
  layer: 'Scheduler Layer',
  category: 'Infrastructure'
});

// 4. コンテキストオブジェクトの作成と凍結 (ID 参照のみ、runtimeSchedulerId のみ)
const schedulerContext: ExecutionRuntimeSchedulerContext = Object.freeze({
  runtimeSchedulerId: 'runtime-scheduler-01'
});

// 5. データオブジェクトの作成と凍結
const schedulerData: ExecutionRuntimeSchedulerData = Object.freeze({
  managerType: SchedulerType.FOUNDATION,
  managerScope: SchedulerScope.SYSTEM,
  schedulerModels: RUNTIME_SCHEDULER_MODELS
});

// 6. スケジューラマネージャーオブジェクト本体の作成と凍結
const runtimeSchedulerData: ExecutionRuntimeScheduler = Object.freeze({
  id: 'runtime-scheduler-01',
  name: 'Default Execution Runtime Scheduler Foundation',
  description: 'The static execution runtime scheduler structure definition',
  context: schedulerContext,
  metadata: schedulerMetadata,
  data: schedulerData
});

// Blueprint コンテナの不変シングルトンインスタンス実装
export const EXECUTION_RUNTIME_SCHEDULER_BLUEPRINT: ExecutionRuntimeSchedulerBlueprint = Object.freeze({
  getExecutionRuntimeScheduler(): ExecutionRuntimeScheduler {
    return runtimeSchedulerData;
  },

  getMetadata(): SchedulerMetadata {
    return runtimeSchedulerData.metadata;
  },

  getContext(): ExecutionRuntimeSchedulerContext {
    return runtimeSchedulerData.context;
  },

  getData(): ExecutionRuntimeSchedulerData {
    return runtimeSchedulerData.data;
  },

  getSchedulerModels(): readonly RuntimeSchedulerModel[] {
    return RUNTIME_SCHEDULER_MODELS;
  },

  getSchedulerSequence(): readonly string[] {
    return SCHEDULER_SEQUENCE;
  }
});
