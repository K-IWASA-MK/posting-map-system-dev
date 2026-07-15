/**
 * ExecutionRuntimeService.ts
 * 
 * Execution Runtime Service Foundation (SSOT).
 * ランタイムサービスの利用境界構造に関する静的 Blueprint を表現する。
 * 
 * 警告：本ファイル内への実際のサービス実行、起動、停止、再起動、登録、解決、ロード、アンロード、
 * および実行制御（execute, run, start, stop, restart, invoke, dispatch, schedule, register, resolve, instantiate, load, unload 等）、
 * API 通信, コマンド送信, AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum ServiceType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME',
  SIMULATION = 'SIMULATION',
  PLUGIN = 'PLUGIN',
  AI = 'AI'
}

export interface RuntimeServiceMetadata {
  readonly author: string;
  readonly version: string;
  readonly phase: string;
}

export interface ExecutionRuntimeServiceContext {
  readonly runtimeServiceId: string;
  readonly runtimeEngineId: string;
  readonly runtimeEngineRegistryId: string;
  readonly runtimeEngineResolverId: string;
  readonly runtimeEngineValidatorId: string;
  readonly runtimeEngineDispatcherId: string;
  readonly runtimeEngineSchedulerId: string;
  readonly runtimeEngineExecutorId: string;
}

export interface ExecutionRuntimeService {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly serviceType: ServiceType;
  readonly context: ExecutionRuntimeServiceContext;
  readonly metadata: RuntimeServiceMetadata;
}

export interface ExecutionRuntimeServiceBlueprint {
  getService(): ExecutionRuntimeService;
  getContext(): ExecutionRuntimeServiceContext;
  getMetadata(): RuntimeServiceMetadata;
}

// 1. メタデータの作成と凍結
const serviceMetadata: RuntimeServiceMetadata = Object.freeze({
  author: 'AIOS Team',
  version: '1.0.0',
  phase: 'Phase 207-1'
});

// 2. 静的なサービスコンテキストの作成と凍結 (IDのみ保持)
const serviceContext: ExecutionRuntimeServiceContext = Object.freeze({
  runtimeServiceId: 'runtime-service-01',
  runtimeEngineId: 'runtime-engine-01',
  runtimeEngineRegistryId: 'runtime-engine-registry-01',
  runtimeEngineResolverId: 'runtime-engine-resolver-01',
  runtimeEngineValidatorId: 'runtime-engine-validator-01',
  runtimeEngineDispatcherId: 'runtime-engine-dispatcher-01',
  runtimeEngineSchedulerId: 'runtime-engine-scheduler-01',
  runtimeEngineExecutorId: 'runtime-engine-executor-01'
});

// 3. サービス本体オブジェクトの作成と凍結
const serviceData: ExecutionRuntimeService = Object.freeze({
  id: 'runtime-service-foundation-01',
  name: 'Default Execution Runtime Service',
  description: 'The static execution runtime service specification',
  serviceType: ServiceType.FOUNDATION,
  context: serviceContext,
  metadata: serviceMetadata
});

// Blueprint コンテナの不変シングルトンインスタンス実装
export const EXECUTION_RUNTIME_SERVICE_BLUEPRINT: ExecutionRuntimeServiceBlueprint = Object.freeze({
  getService(): ExecutionRuntimeService {
    return serviceData;
  },

  getContext(): ExecutionRuntimeServiceContext {
    return serviceData.context;
  },

  getMetadata(): RuntimeServiceMetadata {
    return serviceData.metadata;
  }
});

export type { ExecutionRuntimeService as ExecutionRuntimeServiceType };
