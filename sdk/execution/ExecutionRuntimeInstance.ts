/**
 * ExecutionRuntimeInstance.ts
 * 
 * Execution Runtime Instance Foundation の構造および公開インターフェース定義 (SSOT)。
 * 
 * 警告：本ファイル内への実際のインスタンス作成、破棄、実行、終了、ロード、依存解決、
 * 非同期処理、キュー処理、リトライ、API 通信、コマンド送信、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum InstanceManagerType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME',
  SIMULATION = 'SIMULATION',
  PLUGIN = 'PLUGIN',
  AI = 'AI'
}

export enum InstanceManagerScope {
  SYSTEM = 'SYSTEM',
  USER = 'USER',
  TENANT = 'TENANT'
}

export enum RuntimeInstanceType {
  SYSTEM_INSTANCE = 'SYSTEM_INSTANCE',
  ENGINE_INSTANCE = 'ENGINE_INSTANCE',
  SERVICE_INSTANCE = 'SERVICE_INSTANCE',
  COMPONENT_INSTANCE = 'COMPONENT_INSTANCE',
  APPLICATION_INSTANCE = 'APPLICATION_INSTANCE'
}

export interface RuntimeInstanceModelMetadata {
  readonly id: string;
  readonly name: string;
  readonly instanceModelVersion: string;
  readonly description: string;
}

export interface RuntimeInstanceModel {
  readonly instanceType: RuntimeInstanceType;
  readonly modelId: string;
  readonly metadata: RuntimeInstanceModelMetadata;
  readonly dependencies: readonly string[];
}

export interface InstanceManagerMetadata {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly layer: string;
  readonly category: string;
}

export interface ExecutionRuntimeInstanceContext {
  readonly runtimeInstanceId: string;
}

export interface ExecutionRuntimeInstanceData {
  readonly managerType: InstanceManagerType;
  readonly managerScope: InstanceManagerScope;
  readonly instanceModels: readonly RuntimeInstanceModel[];
}

export interface ExecutionRuntimeInstance {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly context: ExecutionRuntimeInstanceContext;
  readonly metadata: InstanceManagerMetadata;
  readonly data: ExecutionRuntimeInstanceData;
}

export interface ExecutionRuntimeInstanceBlueprint {
  getExecutionRuntimeInstance(): ExecutionRuntimeInstance;
  getMetadata(): InstanceManagerMetadata;
  getContext(): ExecutionRuntimeInstanceContext;
  getData(): ExecutionRuntimeInstanceData;
  getInstanceModels(): readonly RuntimeInstanceModel[];
}

// 1. 静的インスタンスモデルリストの定義と凍結 (instanceModelVersion 1.0 を追加)
export const RUNTIME_INSTANCE_MODELS: readonly RuntimeInstanceModel[] = Object.freeze([
  Object.freeze({
    instanceType: RuntimeInstanceType.SYSTEM_INSTANCE,
    modelId: 'instance-model-system-01',
    metadata: Object.freeze({
      id: 'instance-model-meta-system-01',
      name: 'System Instance Model Metadata',
      instanceModelVersion: '1.0',
      description: 'Metadata for System Instance Model Schema'
    }),
    dependencies: Object.freeze([])
  }),
  Object.freeze({
    instanceType: RuntimeInstanceType.ENGINE_INSTANCE,
    modelId: 'instance-model-engine-01',
    metadata: Object.freeze({
      id: 'instance-model-meta-engine-01',
      name: 'Engine Instance Model Metadata',
      instanceModelVersion: '1.0',
      description: 'Metadata for Engine Instance Model Schema'
    }),
    dependencies: Object.freeze(['SYSTEM_INSTANCE'])
  }),
  Object.freeze({
    instanceType: RuntimeInstanceType.SERVICE_INSTANCE,
    modelId: 'instance-model-service-01',
    metadata: Object.freeze({
      id: 'instance-model-meta-service-01',
      name: 'Service Instance Model Metadata',
      instanceModelVersion: '1.0',
      description: 'Metadata for Service Instance Model Schema'
    }),
    dependencies: Object.freeze(['ENGINE_INSTANCE'])
  }),
  Object.freeze({
    instanceType: RuntimeInstanceType.COMPONENT_INSTANCE,
    modelId: 'instance-model-component-01',
    metadata: Object.freeze({
      id: 'instance-model-meta-component-01',
      name: 'Component Instance Model Metadata',
      instanceModelVersion: '1.0',
      description: 'Metadata for Component Instance Model Schema'
    }),
    dependencies: Object.freeze(['SERVICE_INSTANCE'])
  }),
  Object.freeze({
    instanceType: RuntimeInstanceType.APPLICATION_INSTANCE,
    modelId: 'instance-model-app-01',
    metadata: Object.freeze({
      id: 'instance-model-meta-app-01',
      name: 'Application Instance Model Metadata',
      instanceModelVersion: '1.0',
      description: 'Metadata for Application Instance Model Schema'
    }),
    dependencies: Object.freeze(['COMPONENT_INSTANCE'])
  })
]);

// 2. メタデータオブジェクトの作成と凍結
const managerMetadata: InstanceManagerMetadata = Object.freeze({
  id: 'runtime-instance-manager-meta-01',
  name: 'Execution Runtime Instance Manager Metadata',
  version: '1.0.0',
  description: 'Metadata for Execution Runtime Instance Manager Foundation',
  layer: 'Instance Manager Layer',
  category: 'Infrastructure'
});

// 3. コンテキストオブジェクトの作成と凍結 (ID 参照のみ、runtimeInstanceId のみ)
const managerContext: ExecutionRuntimeInstanceContext = Object.freeze({
  runtimeInstanceId: 'runtime-instance-01'
});

// 4. データオブジェクトの作成と凍結
const managerData: ExecutionRuntimeInstanceData = Object.freeze({
  managerType: InstanceManagerType.FOUNDATION,
  managerScope: InstanceManagerScope.SYSTEM,
  instanceModels: RUNTIME_INSTANCE_MODELS
});

// 5. インスタンスマネージャーオブジェクト本体の作成と凍結
const runtimeInstanceData: ExecutionRuntimeInstance = Object.freeze({
  id: 'runtime-instance-01',
  name: 'Default Execution Runtime Instance Foundation',
  description: 'The static execution runtime instance manager structure definition',
  context: managerContext,
  metadata: managerMetadata,
  data: managerData
});

// Blueprint コンテナの不変シングルトンインスタンス実装
export const EXECUTION_RUNTIME_INSTANCE_BLUEPRINT: ExecutionRuntimeInstanceBlueprint = Object.freeze({
  getExecutionRuntimeInstance(): ExecutionRuntimeInstance {
    return runtimeInstanceData;
  },

  getMetadata(): InstanceManagerMetadata {
    return runtimeInstanceData.metadata;
  },

  getContext(): ExecutionRuntimeInstanceContext {
    return runtimeInstanceData.context;
  },

  getData(): ExecutionRuntimeInstanceData {
    return runtimeInstanceData.data;
  },

  getInstanceModels(): readonly RuntimeInstanceModel[] {
    return RUNTIME_INSTANCE_MODELS;
  }
});
