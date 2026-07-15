/**
 * ExecutionRuntimeThread.ts
 * 
 * Execution Runtime Thread Foundation の構造および公開インターフェース定義 (SSOT)。
 * 
 * 警告：本ファイル内への実際の Thread 起動、実行、停止、コンテキスト切替、
 * スケジューリング、非同期処理、キュー処理、API 通信、コマンド送信、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum ThreadType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME'
}

export enum ThreadScope {
  SYSTEM = 'SYSTEM'
}

export enum RuntimeThreadType {
  SYSTEM_THREAD = 'SYSTEM_THREAD',
  CORE_THREAD = 'CORE_THREAD',
  APPLICATION_THREAD = 'APPLICATION_THREAD',
  PLUGIN_THREAD = 'PLUGIN_THREAD',
  FIELD_THREAD = 'FIELD_THREAD'
}

export enum ThreadLifecycleState {
  CREATED = 'CREATED',
  READY = 'READY',
  WAITING = 'WAITING',
  RUNNING = 'RUNNING',
  STOPPED = 'STOPPED',
  TERMINATED = 'TERMINATED'
}

export enum ThreadExecutionPolicy {
  READ_ONLY = 'READ_ONLY',
  DETERMINISTIC = 'DETERMINISTIC',
  IMMUTABLE_SCHEMA = 'IMMUTABLE_SCHEMA',
  NO_TASK = 'NO_TASK',
  NO_QUEUE = 'NO_QUEUE',
  NO_EVENT_LOOP = 'NO_EVENT_LOOP',
  NO_SCHEDULER = 'NO_SCHEDULER',
  NO_CONTEXT_SWITCH = 'NO_CONTEXT_SWITCH'
}

export interface RuntimeThreadMetadata {
  readonly id: string;
  readonly name: string;
  readonly threadModelVersion: string;
  readonly description: string;
}

export interface RuntimeThreadModel {
  readonly threadType: RuntimeThreadType;
  readonly modelId: string;
  readonly metadata: RuntimeThreadMetadata;
  readonly threadOrder: number;
  readonly supportedThreadTypes: readonly string[];
  readonly lifecycleStates: readonly ThreadLifecycleState[];
  readonly executionPolicies: readonly ThreadExecutionPolicy[];
  readonly allowedSteps: readonly string[];
}

export interface ThreadMetadata {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly layer: string;
  readonly category: string;
}

export interface ExecutionRuntimeThreadContext {
  readonly runtimeThreadId: string;
}

export interface ExecutionRuntimeThreadData {
  readonly managerType: ThreadType;
  readonly managerScope: ThreadScope;
  readonly threadModels: readonly RuntimeThreadModel[];
}

export interface ExecutionRuntimeThread {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly context: ExecutionRuntimeThreadContext;
  readonly metadata: ThreadMetadata;
  readonly data: ExecutionRuntimeThreadData;
}

export interface ExecutionRuntimeThreadBlueprint {
  getExecutionRuntimeThread(): ExecutionRuntimeThread;
  getMetadata(): ThreadMetadata;
  getContext(): ExecutionRuntimeThreadContext;
  getData(): ExecutionRuntimeThreadData;
  getThreadModels(): readonly RuntimeThreadModel[];
  getThreadSequence(): readonly string[];
}

// 1. 静的実行ステップシーケンスの定義と凍結
export const THREAD_SEQUENCE: readonly string[] = Object.freeze([
  'REGISTER_THREAD',
  'VALIDATE_THREAD_SCHEMA',
  'INITIALIZE_THREAD_BLUEPRINT',
  'READY_FOR_THREAD_RUNTIME',
  'THREAD_SCHEMA_CONFIRMED'
]);

// 静的ポリシーリストの定義と凍結
const defaultPolicies: readonly ThreadExecutionPolicy[] = Object.freeze([
  ThreadExecutionPolicy.READ_ONLY,
  ThreadExecutionPolicy.DETERMINISTIC,
  ThreadExecutionPolicy.IMMUTABLE_SCHEMA,
  ThreadExecutionPolicy.NO_TASK,
  ThreadExecutionPolicy.NO_QUEUE,
  ThreadExecutionPolicy.NO_EVENT_LOOP,
  ThreadExecutionPolicy.NO_SCHEDULER,
  ThreadExecutionPolicy.NO_CONTEXT_SWITCH
]);

// 静的ライフサイクル状態リストの定義と凍結
const defaultLifecycleStates: readonly ThreadLifecycleState[] = Object.freeze([
  ThreadLifecycleState.CREATED,
  ThreadLifecycleState.READY,
  ThreadLifecycleState.WAITING,
  ThreadLifecycleState.RUNNING,
  ThreadLifecycleState.STOPPED,
  ThreadLifecycleState.TERMINATED
]);

// 2. 静的スレッドモデルリストの定義と凍結
export const RUNTIME_THREAD_MODELS: readonly RuntimeThreadModel[] = Object.freeze([
  Object.freeze({
    threadType: RuntimeThreadType.SYSTEM_THREAD,
    modelId: 'thread-model-system-01',
    metadata: Object.freeze({
      id: 'thread-meta-system-01',
      name: 'System Thread Metadata',
      threadModelVersion: '1.0',
      description: 'Metadata for System Thread Schema'
    }),
    threadOrder: 1,
    supportedThreadTypes: Object.freeze(['SYSTEM']),
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: THREAD_SEQUENCE
  }),
  Object.freeze({
    threadType: RuntimeThreadType.CORE_THREAD,
    modelId: 'thread-model-core-01',
    metadata: Object.freeze({
      id: 'thread-meta-core-01',
      name: 'Core Thread Metadata',
      threadModelVersion: '1.0',
      description: 'Metadata for Core Thread Schema'
    }),
    threadOrder: 2,
    supportedThreadTypes: Object.freeze(['CORE']),
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: THREAD_SEQUENCE
  }),
  Object.freeze({
    threadType: RuntimeThreadType.APPLICATION_THREAD,
    modelId: 'thread-model-app-01',
    metadata: Object.freeze({
      id: 'thread-meta-app-01',
      name: 'Application Thread Metadata',
      threadModelVersion: '1.0',
      description: 'Metadata for Application Thread Schema'
    }),
    threadOrder: 3,
    supportedThreadTypes: Object.freeze(['APPLICATION']),
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: THREAD_SEQUENCE
  }),
  Object.freeze({
    threadType: RuntimeThreadType.PLUGIN_THREAD,
    modelId: 'thread-model-plugin-01',
    metadata: Object.freeze({
      id: 'thread-meta-plugin-01',
      name: 'Plugin Thread Metadata',
      threadModelVersion: '1.0',
      description: 'Metadata for Plugin Thread Schema'
    }),
    threadOrder: 4,
    supportedThreadTypes: Object.freeze([]),
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: THREAD_SEQUENCE
  }),
  Object.freeze({
    threadType: RuntimeThreadType.FIELD_THREAD,
    modelId: 'thread-model-field-01',
    metadata: Object.freeze({
      id: 'thread-meta-field-01',
      name: 'Field Thread Metadata',
      threadModelVersion: '1.0',
      description: 'Metadata for Field Thread Schema'
    }),
    threadOrder: 5,
    supportedThreadTypes: Object.freeze([]),
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: THREAD_SEQUENCE
  })
]);

// 3. メタデータオブジェクトの作成と凍結
const threadMetadata: ThreadMetadata = Object.freeze({
  id: 'runtime-thread-meta-01',
  name: 'Execution Runtime Thread Metadata',
  version: '1.0.0',
  description: 'Metadata for Execution Runtime Thread Foundation',
  layer: 'Thread Layer',
  category: 'Infrastructure'
});

// 4. コンテキストオブジェクトの作成と凍結 (ID 参照のみ、runtimeThreadId のみ)
const threadContext: ExecutionRuntimeThreadContext = Object.freeze({
  runtimeThreadId: 'runtime-thread-01'
});

// 5. データオブジェクトの作成と凍結
const threadData: ExecutionRuntimeThreadData = Object.freeze({
  managerType: ThreadType.FOUNDATION,
  managerScope: ThreadScope.SYSTEM,
  threadModels: RUNTIME_THREAD_MODELS
});

// 6. スレッドマネージャーオブジェクト本体の作成と凍結
const runtimeThreadData: ExecutionRuntimeThread = Object.freeze({
  id: 'runtime-thread-01',
  name: 'Default Execution Runtime Thread Foundation',
  description: 'The static execution runtime thread structure definition',
  context: threadContext,
  metadata: threadMetadata,
  data: threadData
});

// Blueprint コンテナの不変シングルトンインスタンス実装
export const EXECUTION_RUNTIME_THREAD_BLUEPRINT: ExecutionRuntimeThreadBlueprint = Object.freeze({
  getExecutionRuntimeThread(): ExecutionRuntimeThread {
    return runtimeThreadData;
  },

  getMetadata(): ThreadMetadata {
    return runtimeThreadData.metadata;
  },

  getContext(): ExecutionRuntimeThreadContext {
    return runtimeThreadData.context;
  },

  getData(): ExecutionRuntimeThreadData {
    return runtimeThreadData.data;
  },

  getThreadModels(): readonly RuntimeThreadModel[] {
    return RUNTIME_THREAD_MODELS;
  },

  getThreadSequence(): readonly string[] {
    return THREAD_SEQUENCE;
  }
});
