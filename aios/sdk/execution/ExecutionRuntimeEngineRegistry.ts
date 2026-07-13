import { EngineType } from './ExecutionRuntimeEngine';

/**
 * ExecutionRuntimeEngineRegistry.ts
 * 
 * Execution Runtime Engine Registry Foundation (SSOT).
 * 登録されている Execution Runtime Engine の静的 Blueprint 一覧を一元管理する。
 * 
 * 警告：本ファイル内への実際の Engine 登録、削除、検索、ロード、アンロード、生成、破棄、
 * および実行制御（register, unregister, load, reload, lookup, resolve, create, destroy, execute, run, start 等）、
 * API 通信、コマンド送信、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum EngineRegistryType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME',
  SIMULATION = 'SIMULATION',
  PLUGIN = 'PLUGIN',
  AI = 'AI'
}

export interface RuntimeEngineRegistryMetadata {
  readonly author: string;
  readonly version: string;
  readonly phase: string;
}

export interface ExecutionRuntimeEngineRegistryEntry {
  readonly engineId: string;
  readonly engineType: EngineType;
  readonly name: string;
  readonly description: string;
}

export interface ExecutionRuntimeEngineRegistry {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly entries: readonly ExecutionRuntimeEngineRegistryEntry[];
  readonly metadata: RuntimeEngineRegistryMetadata;
}

export interface ExecutionRuntimeEngineRegistryBlueprint {
  getRegistry(): ExecutionRuntimeEngineRegistry;
  getEntries(): readonly ExecutionRuntimeEngineRegistryEntry[];
  getMetadata(): RuntimeEngineRegistryMetadata;
}

// 1. メタデータの作成と凍結
const registryMetadata: RuntimeEngineRegistryMetadata = Object.freeze({
  author: 'AIOS Team',
  version: '1.0.0',
  phase: 'Phase 206-2'
});

// 2. 静的なレジストリエントリの作成と凍結 (IDおよび静的識別情報のみ)
const registryEntries: readonly ExecutionRuntimeEngineRegistryEntry[] = Object.freeze([
  Object.freeze({
    engineId: 'runtime-engine-01',
    engineType: EngineType.FOUNDATION,
    name: 'Default Execution Runtime Engine',
    description: 'The static execution runtime engine entry point specification'
  })
]);

// 3. レジストリ本体オブジェクトの作成と凍結
const registryData: ExecutionRuntimeEngineRegistry = Object.freeze({
  id: 'runtime-engine-registry-01',
  name: 'Default Execution Runtime Engine Registry',
  description: 'The static execution runtime engine registry specification',
  entries: registryEntries,
  metadata: registryMetadata
});

// Blueprint コンテナの不変シングルトンインスタンス実装
export const EXECUTION_RUNTIME_ENGINE_REGISTRY_BLUEPRINT: ExecutionRuntimeEngineRegistryBlueprint = Object.freeze({
  getRegistry(): ExecutionRuntimeEngineRegistry {
    return registryData;
  },

  getEntries(): readonly ExecutionRuntimeEngineRegistryEntry[] {
    return registryData.entries;
  },

  getMetadata(): RuntimeEngineRegistryMetadata {
    return registryData.metadata;
  }
});

export type { ExecutionRuntimeEngineRegistry as ExecutionRuntimeEngineRegistryType };
