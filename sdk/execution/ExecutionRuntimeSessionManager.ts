/**
 * ExecutionRuntimeSessionManager.ts
 * 
 * Execution Runtime Session Manager Foundation の構造および公開インターフェース定義 (SSOT)。
 * 
 * 警告：本ファイル内への実際のセッション作成、破棄、同期、復旧、認証、認可、タイムアウト判定、
 * 非同期処理、キュー処理、リトライ、API 通信、コマンド送信、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum SessionManagerType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME',
  SIMULATION = 'SIMULATION',
  PLUGIN = 'PLUGIN',
  AI = 'AI'
}

export enum SessionManagerScope {
  SYSTEM = 'SYSTEM',
  USER = 'USER',
  TENANT = 'TENANT'
}

export enum RuntimeSessionType {
  SYSTEM_SESSION = 'SYSTEM_SESSION',
  TENANT_SESSION = 'TENANT_SESSION',
  APPLICATION_SESSION = 'APPLICATION_SESSION',
  USER_SESSION = 'USER_SESSION',
  AGENT_SESSION = 'AGENT_SESSION'
}

export interface RuntimeSessionModelMetadata {
  readonly id: string;
  readonly name: string;
  readonly sessionModelVersion: string;
  readonly description: string;
}

export interface RuntimeSessionModel {
  readonly sessionType: RuntimeSessionType;
  readonly modelId: string;
  readonly metadata: RuntimeSessionModelMetadata;
  readonly allowedLifespans: readonly string[];
}

export interface SessionManagerMetadata {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly layer: string;
  readonly category: string;
}

export interface ExecutionRuntimeSessionManagerContext {
  readonly runtimeSessionManagerId: string;
}

export interface ExecutionRuntimeSessionManagerData {
  readonly managerType: SessionManagerType;
  readonly managerScope: SessionManagerScope;
  readonly sessionModels: readonly RuntimeSessionModel[];
}

export interface ExecutionRuntimeSessionManager {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly context: ExecutionRuntimeSessionManagerContext;
  readonly metadata: SessionManagerMetadata;
  readonly data: ExecutionRuntimeSessionManagerData;
}

export interface ExecutionRuntimeSessionManagerBlueprint {
  getExecutionRuntimeSessionManager(): ExecutionRuntimeSessionManager;
  getMetadata(): SessionManagerMetadata;
  getContext(): ExecutionRuntimeSessionManagerContext;
  getData(): ExecutionRuntimeSessionManagerData;
  getSessionModels(): readonly RuntimeSessionModel[];
}

// 1. 静的セッションモデルリストの定義と凍結 (sessionModelVersion 1.0 を追加)
export const RUNTIME_SESSION_MODELS: readonly RuntimeSessionModel[] = Object.freeze([
  Object.freeze({
    sessionType: RuntimeSessionType.SYSTEM_SESSION,
    modelId: 'session-model-system-01',
    metadata: Object.freeze({
      id: 'session-model-meta-system-01',
      name: 'System Session Model Metadata',
      sessionModelVersion: '1.0',
      description: 'Metadata for System Session Model Schema'
    }),
    allowedLifespans: Object.freeze(['INFINITE'])
  }),
  Object.freeze({
    sessionType: RuntimeSessionType.TENANT_SESSION,
    modelId: 'session-model-tenant-01',
    metadata: Object.freeze({
      id: 'session-model-meta-tenant-01',
      name: 'Tenant Session Model Metadata',
      sessionModelVersion: '1.0',
      description: 'Metadata for Tenant Session Model Schema'
    }),
    allowedLifespans: Object.freeze(['PERSISTENT', 'TEMPORARY'])
  }),
  Object.freeze({
    sessionType: RuntimeSessionType.APPLICATION_SESSION,
    modelId: 'session-model-app-01',
    metadata: Object.freeze({
      id: 'session-model-meta-app-01',
      name: 'Application Session Model Metadata',
      sessionModelVersion: '1.0',
      description: 'Metadata for Application Session Model Schema'
    }),
    allowedLifespans: Object.freeze(['PERSISTENT', 'TEMPORARY'])
  }),
  Object.freeze({
    sessionType: RuntimeSessionType.USER_SESSION,
    modelId: 'session-model-user-01',
    metadata: Object.freeze({
      id: 'session-model-meta-user-01',
      name: 'User Session Model Metadata',
      sessionModelVersion: '1.0',
      description: 'Metadata for User Session Model Schema'
    }),
    allowedLifespans: Object.freeze(['TEMPORARY'])
  }),
  Object.freeze({
    sessionType: RuntimeSessionType.AGENT_SESSION,
    modelId: 'session-model-agent-01',
    metadata: Object.freeze({
      id: 'session-model-meta-agent-01',
      name: 'Agent Session Model Metadata',
      sessionModelVersion: '1.0',
      description: 'Metadata for Agent Session Model Schema'
    }),
    allowedLifespans: Object.freeze(['PERSISTENT', 'TEMPORARY'])
  })
]);

// 2. メタデータオブジェクトの作成と凍結
const managerMetadata: SessionManagerMetadata = Object.freeze({
  id: 'runtime-session-manager-meta-01',
  name: 'Execution Runtime Session Manager Metadata',
  version: '1.0.0',
  description: 'Metadata for Execution Runtime Session Manager Foundation',
  layer: 'Session Manager Layer',
  category: 'Infrastructure'
});

// 3. コンテキストオブジェクトの作成と凍結 (ID 参照のみ、runtimeSessionManagerId のみ)
const managerContext: ExecutionRuntimeSessionManagerContext = Object.freeze({
  runtimeSessionManagerId: 'runtime-session-manager-01'
});

// 4. データオブジェクトの作成と凍結
const managerData: ExecutionRuntimeSessionManagerData = Object.freeze({
  managerType: SessionManagerType.FOUNDATION,
  managerScope: SessionManagerScope.SYSTEM,
  sessionModels: RUNTIME_SESSION_MODELS
});

// 5. セッションマネージャーオブジェクト本体の作成と凍結
const runtimeSessionManagerData: ExecutionRuntimeSessionManager = Object.freeze({
  id: 'runtime-session-manager-01',
  name: 'Default Execution Runtime Session Manager Foundation',
  description: 'The static execution runtime session manager structure definition',
  context: managerContext,
  metadata: managerMetadata,
  data: managerData
});

// Blueprint コンテナの不変シングルトンインスタンス実装
export const EXECUTION_RUNTIME_SESSION_MANAGER_BLUEPRINT: ExecutionRuntimeSessionManagerBlueprint = Object.freeze({
  getExecutionRuntimeSessionManager(): ExecutionRuntimeSessionManager {
    return runtimeSessionManagerData;
  },

  getMetadata(): SessionManagerMetadata {
    return runtimeSessionManagerData.metadata;
  },

  getContext(): ExecutionRuntimeSessionManagerContext {
    return runtimeSessionManagerData.context;
  },

  getData(): ExecutionRuntimeSessionManagerData {
    return runtimeSessionManagerData.data;
  },

  getSessionModels(): readonly RuntimeSessionModel[] {
    return RUNTIME_SESSION_MODELS;
  }
});
