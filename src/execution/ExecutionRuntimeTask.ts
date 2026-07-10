/**
 * ExecutionRuntimeTask.ts
 * 
 * Execution Runtime Task Foundation の構造および公開インターフェース定義 (SSOT)。
 * 
 * 警告：本ファイル内への実際のタスク生成、タスク実行、キャンセル、
 * 再試行、スレッド割当、非同期処理、API 通信、コマンド送信、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum TaskType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME'
}

export enum TaskScope {
  SYSTEM = 'SYSTEM'
}

export enum RuntimeTaskType {
  SYSTEM_TASK = 'SYSTEM_TASK',
  CORE_TASK = 'CORE_TASK',
  APPLICATION_TASK = 'APPLICATION_TASK',
  PLUGIN_TASK = 'PLUGIN_TASK',
  FIELD_TASK = 'FIELD_TASK'
}

export enum TaskLifecycleState {
  CREATED = 'CREATED',
  READY = 'READY',
  WAITING = 'WAITING',
  SEALED = 'SEALED',
  TERMINATED = 'TERMINATED'
}

export enum TaskExecutionPolicy {
  READ_ONLY = 'READ_ONLY',
  DETERMINISTIC = 'DETERMINISTIC',
  IMMUTABLE_SCHEMA = 'IMMUTABLE_SCHEMA',
  NO_THREAD = 'NO_THREAD',
  NO_SCHEDULER = 'NO_SCHEDULER',
  NO_QUEUE = 'NO_QUEUE',
  NO_WORKER = 'NO_WORKER',
  NO_EVENT_LOOP = 'NO_EVENT_LOOP',
  NO_EXECUTION = 'NO_EXECUTION',
  NO_DISPATCH = 'NO_DISPATCH',
  NO_RETRY = 'NO_RETRY',
  NO_CANCEL = 'NO_CANCEL'
}

export enum TaskCapability {
  SYNC = 'SYNC',
  ASYNC = 'ASYNC',
  CPU_BOUND = 'CPU_BOUND',
  IO_BOUND = 'IO_BOUND',
  SYSTEM = 'SYSTEM',
  APPLICATION = 'APPLICATION'
}

export enum TaskDependencyPolicy {
  NO_DEPENDENCY = 'NO_DEPENDENCY',
  STATIC_DEPENDENCY = 'STATIC_DEPENDENCY',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export interface RuntimeTaskMetadata {
  readonly id: string;
  readonly name: string;
  readonly taskModelVersion: string;
  readonly taskSchemaVersion: string;
  readonly description: string;
}

export interface RuntimeTaskModel {
  readonly taskType: RuntimeTaskType;
  readonly modelId: string;
  readonly metadata: RuntimeTaskMetadata;
  readonly taskOrder: number;
  readonly supportedTaskTypes: readonly string[];
  readonly supportedTaskPolicies: readonly string[];
  readonly supportedCapabilities: readonly TaskCapability[];
  readonly dependencyPolicy: TaskDependencyPolicy;
  readonly lifecycleStates: readonly TaskLifecycleState[];
  readonly executionPolicies: readonly TaskExecutionPolicy[];
  readonly allowedSteps: readonly string[];
}

export interface TaskMetadata {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly layer: string;
  readonly category: string;
}

export interface ExecutionRuntimeTaskContext {
  readonly runtimeTaskId: string;
}

export interface ExecutionRuntimeTaskData {
  readonly managerType: TaskType;
  readonly managerScope: TaskScope;
  readonly taskModels: readonly RuntimeTaskModel[];
}

export interface ExecutionRuntimeTask {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly context: ExecutionRuntimeTaskContext;
  readonly metadata: TaskMetadata;
  readonly data: ExecutionRuntimeTaskData;
}

export interface ExecutionRuntimeTaskBlueprint {
  getExecutionRuntimeTask(): ExecutionRuntimeTask;
  getMetadata(): TaskMetadata;
  getContext(): ExecutionRuntimeTaskContext;
  getData(): ExecutionRuntimeTaskData;
  getTaskModels(): readonly RuntimeTaskModel[];
  getTaskSequence(): readonly string[];
}

// 1. 静的実行ステップシーケンスの定義と凍結
export const TASK_SEQUENCE: readonly string[] = Object.freeze([
  'REGISTER_TASK',
  'VALIDATE_TASK_SCHEMA',
  'INITIALIZE_TASK_BLUEPRINT',
  'READY_FOR_TASK_RUNTIME',
  'TASK_SCHEMA_CONFIRMED'
]);

// 静的ポリシーリストの定義と凍結
const defaultPolicies: readonly TaskExecutionPolicy[] = Object.freeze([
  TaskExecutionPolicy.READ_ONLY,
  TaskExecutionPolicy.DETERMINISTIC,
  TaskExecutionPolicy.IMMUTABLE_SCHEMA,
  TaskExecutionPolicy.NO_THREAD,
  TaskExecutionPolicy.NO_SCHEDULER,
  TaskExecutionPolicy.NO_QUEUE,
  TaskExecutionPolicy.NO_WORKER,
  TaskExecutionPolicy.NO_EVENT_LOOP,
  TaskExecutionPolicy.NO_EXECUTION,
  TaskExecutionPolicy.NO_DISPATCH,
  TaskExecutionPolicy.NO_RETRY,
  TaskExecutionPolicy.NO_CANCEL
]);

// 静的ライフサイクル状態リストの定義と凍結
const defaultLifecycleStates: readonly TaskLifecycleState[] = Object.freeze([
  TaskLifecycleState.CREATED,
  TaskLifecycleState.READY,
  TaskLifecycleState.WAITING,
  TaskLifecycleState.SEALED,
  TaskLifecycleState.TERMINATED
]);

// 2. 静的タスクモデルリストの定義と凍結
export const RUNTIME_TASK_MODELS: readonly RuntimeTaskModel[] = Object.freeze([
  Object.freeze({
    taskType: RuntimeTaskType.SYSTEM_TASK,
    modelId: 'task-model-system-01',
    metadata: Object.freeze({
      id: 'task-meta-system-01',
      name: 'System Task Metadata',
      taskModelVersion: '1.0',
      taskSchemaVersion: '1.0',
      description: 'Metadata for System Task Schema'
    }),
    taskOrder: 1,
    supportedTaskTypes: Object.freeze(['SYSTEM']),
    supportedTaskPolicies: Object.freeze(['Retry', 'Priority']),
    supportedCapabilities: Object.freeze([TaskCapability.SYNC, TaskCapability.SYSTEM]),
    dependencyPolicy: TaskDependencyPolicy.NO_DEPENDENCY,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: TASK_SEQUENCE
  }),
  Object.freeze({
    taskType: RuntimeTaskType.CORE_TASK,
    modelId: 'task-model-core-01',
    metadata: Object.freeze({
      id: 'task-meta-core-01',
      name: 'Core Task Metadata',
      taskModelVersion: '1.0',
      taskSchemaVersion: '1.0',
      description: 'Metadata for Core Task Schema'
    }),
    taskOrder: 2,
    supportedTaskTypes: Object.freeze(['CORE']),
    supportedTaskPolicies: Object.freeze(['Retry']),
    supportedCapabilities: Object.freeze([TaskCapability.SYNC, TaskCapability.CPU_BOUND]),
    dependencyPolicy: TaskDependencyPolicy.STATIC_DEPENDENCY,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: TASK_SEQUENCE
  }),
  Object.freeze({
    taskType: RuntimeTaskType.APPLICATION_TASK,
    modelId: 'task-model-app-01',
    metadata: Object.freeze({
      id: 'task-meta-app-01',
      name: 'Application Task Metadata',
      taskModelVersion: '1.0',
      taskSchemaVersion: '1.0',
      description: 'Metadata for Application Task Schema'
    }),
    taskOrder: 3,
    supportedTaskTypes: Object.freeze(['APPLICATION']),
    supportedTaskPolicies: Object.freeze(['Retry', 'Realtime']),
    supportedCapabilities: Object.freeze([TaskCapability.ASYNC, TaskCapability.APPLICATION]),
    dependencyPolicy: TaskDependencyPolicy.SCHEMA_ONLY,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: TASK_SEQUENCE
  }),
  Object.freeze({
    taskType: RuntimeTaskType.PLUGIN_TASK,
    modelId: 'task-model-plugin-01',
    metadata: Object.freeze({
      id: 'task-meta-plugin-01',
      name: 'Plugin Task Metadata',
      taskModelVersion: '1.0',
      taskSchemaVersion: '1.0',
      description: 'Metadata for Plugin Task Schema'
    }),
    taskOrder: 4,
    supportedTaskTypes: Object.freeze([]),
    supportedTaskPolicies: Object.freeze([]),
    supportedCapabilities: Object.freeze([TaskCapability.ASYNC, TaskCapability.IO_BOUND]),
    dependencyPolicy: TaskDependencyPolicy.NO_DEPENDENCY,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: TASK_SEQUENCE
  }),
  Object.freeze({
    taskType: RuntimeTaskType.FIELD_TASK,
    modelId: 'task-model-field-01',
    metadata: Object.freeze({
      id: 'task-meta-field-01',
      name: 'Field Task Metadata',
      taskModelVersion: '1.0',
      taskSchemaVersion: '1.0',
      description: 'Metadata for Field Task Schema'
    }),
    taskOrder: 5,
    supportedTaskTypes: Object.freeze([]),
    supportedTaskPolicies: Object.freeze([]),
    supportedCapabilities: Object.freeze([TaskCapability.ASYNC, TaskCapability.IO_BOUND]),
    dependencyPolicy: TaskDependencyPolicy.NO_DEPENDENCY,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: TASK_SEQUENCE
  })
]);

// 3. メタデータオブジェクトの作成と凍結
const taskMetadata: TaskMetadata = Object.freeze({
  id: 'runtime-task-meta-01',
  name: 'Execution Runtime Task Metadata',
  version: '1.0.0',
  description: 'Metadata for Execution Runtime Task Foundation',
  layer: 'Task Layer',
  category: 'Infrastructure'
});

// 4. コンテキストオブジェクトの作成と凍結 (ID 参照のみ、runtimeTaskId のみ)
const taskContext: ExecutionRuntimeTaskContext = Object.freeze({
  runtimeTaskId: 'runtime-task-01'
});

// 5. データオブジェクトの作成と凍結
const taskData: ExecutionRuntimeTaskData = Object.freeze({
  managerType: TaskType.FOUNDATION,
  managerScope: TaskScope.SYSTEM,
  taskModels: RUNTIME_TASK_MODELS
});

// 6. タスクマネージャーオブジェクト本体の作成と凍結
const runtimeTaskData: ExecutionRuntimeTask = Object.freeze({
  id: 'runtime-task-01',
  name: 'Default Execution Runtime Task Foundation',
  description: 'The static execution runtime task structure definition',
  context: taskContext,
  metadata: taskMetadata,
  data: taskData
});

// Blueprint コンテナの不変シングルトンインスタンス実装
export const EXECUTION_RUNTIME_TASK_BLUEPRINT: ExecutionRuntimeTaskBlueprint = Object.freeze({
  getExecutionRuntimeTask(): ExecutionRuntimeTask {
    return runtimeTaskData;
  },

  getMetadata(): TaskMetadata {
    return runtimeTaskData.metadata;
  },

  getContext(): ExecutionRuntimeTaskContext {
    return runtimeTaskData.context;
  },

  getData(): ExecutionRuntimeTaskData {
    return runtimeTaskData.data;
  },

  getTaskModels(): readonly RuntimeTaskModel[] {
    return RUNTIME_TASK_MODELS;
  },

  getTaskSequence(): readonly string[] {
    return TASK_SEQUENCE;
  }
});
