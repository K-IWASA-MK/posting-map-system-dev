import { ServiceType } from './ExecutionRuntimeService';

/**
 * ExecutionRuntimeServiceRegistry.ts
 * 
 * Execution Runtime Service Registry Foundation (SSOT).
 * 登録されたランタイムサービスの静的メタデータ構造および関係性を表現する。
 * 
 * 警告：本ファイル内への実際のサービス登録、解除、探索、解決、ロード、および実行制御
 * （register, unregister, load, reload, lookup, resolve, create, destroy, execute, run, start 等）、
 * API 通信, コマンド送信, AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum ServiceRegistryType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME',
  SIMULATION = 'SIMULATION',
  PLUGIN = 'PLUGIN',
  AI = 'AI'
}

export interface RuntimeServiceRegistryMetadata {
  readonly author: string;
  readonly version: string;
  readonly phase: string;
}

export interface ExecutionRuntimeServiceRegistryEntry {
  readonly serviceId: string;
  readonly serviceType: ServiceType;
  readonly name: string;
  readonly description: string;
}

export interface ExecutionRuntimeServiceRegistry {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly entries: readonly ExecutionRuntimeServiceRegistryEntry[];
  readonly metadata: RuntimeServiceRegistryMetadata;
}

export interface ExecutionRuntimeServiceRegistryBlueprint {
  getRegistry(): ExecutionRuntimeServiceRegistry;
  getEntries(): readonly ExecutionRuntimeServiceRegistryEntry[];
  getMetadata(): RuntimeServiceRegistryMetadata;
}

// 1. メタデータの作成と凍結
const registryMetadata: RuntimeServiceRegistryMetadata = Object.freeze({
  author: 'AIOS Team',
  version: '1.0.0',
  phase: 'Phase 207-2'
});

// 2. 静的なレジストリエントリの作成と凍結 (Serviceオブジェクト参照は持たない)
const registryEntries: readonly ExecutionRuntimeServiceRegistryEntry[] = Object.freeze([
  Object.freeze({
    serviceId: 'runtime-service-01',
    serviceType: ServiceType.FOUNDATION,
    name: 'Foundation Execution Runtime Service',
    description: 'The foundation static execution runtime service'
  })
]);

// 3. レジストリ本体オブジェクトの作成と凍結
const registryData: ExecutionRuntimeServiceRegistry = Object.freeze({
  id: 'runtime-service-registry-01',
  name: 'Default Execution Runtime Service Registry',
  description: 'The static execution runtime service registry specification',
  entries: registryEntries,
  metadata: registryMetadata
});

// Blueprint コンテナの不変シングルトンインスタンス実装
export const EXECUTION_RUNTIME_SERVICE_REGISTRY_BLUEPRINT: ExecutionRuntimeServiceRegistryBlueprint = Object.freeze({
  getRegistry(): ExecutionRuntimeServiceRegistry {
    return registryData;
  },

  getEntries(): readonly ExecutionRuntimeServiceRegistryEntry[] {
    return registryData.entries;
  },

  getMetadata(): RuntimeServiceRegistryMetadata {
    return registryData.metadata;
  }
});

export type { ExecutionRuntimeServiceRegistry as ExecutionRuntimeServiceRegistryType };
export type { ExecutionRuntimeServiceRegistryEntry as ExecutionRuntimeServiceRegistryEntryType };
