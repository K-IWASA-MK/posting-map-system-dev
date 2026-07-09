/**
 * ExecutionRegistry.ts
 * 
 * Execution Definition を一元管理する静的レジストリ (SSOT)。
 * 
 * 警告：本ファイル内への実行エンジン本体、並列タスクスケジューラ、動的な登録・削除、API 通信、コマンド送信、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum RegistryType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME',
  PLUGIN = 'PLUGIN',
  SIMULATION = 'SIMULATION',
  AI = 'AI'
}

export interface RegistryMetadata {
  readonly author: string;
  readonly version: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly phase: string;
}

export interface ExecutionRegistryEntry {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly engineType: string;
  readonly capability: string;
  readonly metadata: RegistryMetadata;
}

export interface ExecutionRegistry {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly entries: readonly ExecutionRegistryEntry[];
  readonly metadata: RegistryMetadata;
}

export interface ExecutionRegistryBlueprint {
  getRegistry(): ExecutionRegistry;
  getEntries(): readonly ExecutionRegistryEntry[];
  getMetadata(): RegistryMetadata;
}

// 1. 各エントリー内のメタデータの作成と凍結 (Object.freeze)
const entryMetadata1 = Object.freeze({
  author: 'AIOS Team',
  version: '1.0.0',
  createdAt: '2026-07-09T11:00:00Z',
  updatedAt: '2026-07-09T11:00:00Z',
  phase: 'Phase 203-2'
});

const entryMetadata2 = Object.freeze({
  author: 'AIOS Team',
  version: '1.0.0',
  createdAt: '2026-07-09T11:00:00Z',
  updatedAt: '2026-07-09T11:00:00Z',
  phase: 'Phase 203-2'
});

// 2. 各エントリーオブジェクト自体の作成と凍結 (Object.freeze)
const entry1: ExecutionRegistryEntry = Object.freeze({
  id: 'execution-entry-01',
  name: 'Default Execution Definition',
  description: 'The fallback execution layout specification',
  engineType: 'FOUNDATION',
  capability: 'Testing', // test_execution_engine/registry で検証用に使用する Capability
  metadata: entryMetadata1
});

const entry2: ExecutionRegistryEntry = Object.freeze({
  id: 'execution-entry-02',
  name: 'Analysis Execution Definition',
  description: 'Execution layout specification for analysis capability',
  engineType: 'FOUNDATION',
  capability: 'Analysis',
  metadata: entryMetadata2
});

// 3. エントリー配列の作成と凍結 (Object.freeze) - 二層目
const entries: readonly ExecutionRegistryEntry[] = Object.freeze([
  entry1,
  entry2
]);

// 4. レジストリレベルのメタデータの作成と凍結 (Object.freeze)
const registryMetadata = Object.freeze({
  author: 'AIOS Team',
  version: '1.0.0',
  createdAt: '2026-07-09T11:00:00Z',
  updatedAt: '2026-07-09T11:00:00Z',
  phase: 'Phase 203-2'
});

// 5. 親レジストリオブジェクト全体の作成と凍結 (Object.freeze) - 三層目
const registryData: ExecutionRegistry = Object.freeze({
  id: 'registry-execution-01',
  name: 'Foundation Execution Registry',
  version: '1.0.0',
  description: 'The static Single Source of Truth for execution configurations',
  entries: entries,
  metadata: registryMetadata
});

// Blueprint コンテナの不変インスタンス実装
export const EXECUTION_REGISTRY_BLUEPRINT: ExecutionRegistryBlueprint = Object.freeze({
  getRegistry(): ExecutionRegistry {
    return registryData;
  },

  getEntries(): readonly ExecutionRegistryEntry[] {
    return registryData.entries;
  },

  getMetadata(): RegistryMetadata {
    return registryData.metadata;
  }
});

export type { ExecutionRegistry as ExecutionRegistryType };
