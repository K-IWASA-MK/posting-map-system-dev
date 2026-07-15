/**
 * ExecutionRuntimeRegistry.ts
 * 
 * Runtime 層の静的定義（Blueprint）を一元管理する静的レジストリ (SSOT)。
 * 
 * 警告：本ファイル内への実際のインスタンス生成・登録・削除・検索、API 通信、コマンド送信、
 * AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum RuntimeRegistryType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME',
  SIMULATION = 'SIMULATION',
  PLUGIN = 'PLUGIN',
  AI = 'AI'
}

export interface RuntimeRegistryMetadata {
  readonly author: string;
  readonly version: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly phase: string;
}

export interface ExecutionRuntimeRegistryEntry {
  readonly runtimeId: string;
  readonly runtimeType: string;
  readonly name: string;
  readonly description: string;
}

export interface ExecutionRuntimeRegistry {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly registryType: RuntimeRegistryType;
  readonly entries: readonly ExecutionRuntimeRegistryEntry[];
  readonly metadata: RuntimeRegistryMetadata;
}

export interface ExecutionRuntimeRegistryBlueprint {
  getRegistry(): ExecutionRuntimeRegistry;
  getEntries(): readonly ExecutionRuntimeRegistryEntry[];
  getMetadata(): RuntimeRegistryMetadata;
}

// 1. 各エントリー自体の作成と凍結
const entry1: ExecutionRuntimeRegistryEntry = Object.freeze({
  runtimeId: 'execution-runtime-01',
  runtimeType: 'FOUNDATION',
  name: 'Default Execution Runtime Definition',
  description: 'The fallback execution runtime layout specification'
});

const entry2: ExecutionRuntimeRegistryEntry = Object.freeze({
  runtimeId: 'execution-runtime-02',
  runtimeType: 'RUNTIME',
  name: 'Active Agent Execution Runtime Definition',
  description: 'Execution runtime layout specification for active agent capability'
});

// 2. エントリー配列の作成と凍結 - 二層目
const entries: readonly ExecutionRuntimeRegistryEntry[] = Object.freeze([
  entry1,
  entry2
]);

// 3. レジストリレベルのメタデータの作成と凍結
const registryMetadata: RuntimeRegistryMetadata = Object.freeze({
  author: 'AIOS Team',
  version: '1.0.0',
  createdAt: '2026-07-09T15:00:00Z',
  updatedAt: '2026-07-09T15:00:00Z',
  phase: 'Phase 204-2'
});

// 4. 親レジストリオブジェクト全体の作成と凍結 - 三層目
const registryData: ExecutionRuntimeRegistry = Object.freeze({
  id: 'registry-runtime-01',
  name: 'Foundation Execution Runtime Registry',
  description: 'The static Single Source of Truth for execution runtime configurations',
  registryType: RuntimeRegistryType.FOUNDATION,
  entries: entries,
  metadata: registryMetadata
});

// Blueprint コンテナの不変シングルトンインスタンス実装
export const EXECUTION_RUNTIME_REGISTRY_BLUEPRINT: ExecutionRuntimeRegistryBlueprint = Object.freeze({
  getRegistry(): ExecutionRuntimeRegistry {
    return registryData;
  },

  getEntries(): readonly ExecutionRuntimeRegistryEntry[] {
    return registryData.entries;
  },

  getMetadata(): RuntimeRegistryMetadata {
    return registryData.metadata;
  }
});

export type { ExecutionRuntimeRegistry as ExecutionRuntimeRegistryType };
