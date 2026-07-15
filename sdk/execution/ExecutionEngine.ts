/**
 * ExecutionEngine.ts
 * 
 * Execution Layer の最上位エントリーポイントとなる Blueprint の構造および公開インターフェース定義。
 * 
 * 警告：本ファイル内への実行エンジン本体、並列タスクスケジューラ、API 通信、コマンド送信、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum EngineType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME',
  SIMULATION = 'SIMULATION',
  PLUGIN = 'PLUGIN'
}

export interface EngineMetadata {
  readonly author: string;
  readonly version: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly phase: string;
}

export interface ExecutionEngine {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly engineType: EngineType;
  readonly capabilities: readonly string[];
  readonly interfaces: readonly string[];
  readonly metadata: EngineMetadata;
}

export interface ExecutionEngineBlueprint {
  getBlueprint(): ExecutionEngine;
  getCapabilities(): readonly string[];
  getInterfaces(): readonly string[];
  getMetadata(): EngineMetadata;
}

// 完全に不変な ExecutionEngine データモデルのインスタンス定義
const engineData: ExecutionEngine = Object.freeze({
  id: 'engine-execution-01',
  name: 'Foundation Execution Engine',
  version: '1.0.0',
  description: 'The core execution engine structure definition for AIOS',
  engineType: EngineType.FOUNDATION,
  capabilities: Object.freeze([
    'Execution Planning',
    'Execution Dispatch',
    'Execution Coordination',
    'Execution Validation'
  ]),
  interfaces: Object.freeze([
    'getBlueprint',
    'getCapabilities',
    'getInterfaces',
    'getMetadata'
  ]),
  metadata: Object.freeze({
    author: 'AIOS Team',
    version: '1.0.0',
    createdAt: '2026-07-09T10:50:00Z',
    updatedAt: '2026-07-09T10:50:00Z',
    phase: 'Phase 203-1'
  })
});

// Blueprint コンテナの不変インスタンス実装
export const EXECUTION_ENGINE_BLUEPRINT: ExecutionEngineBlueprint = Object.freeze({
  getBlueprint(): ExecutionEngine {
    return engineData;
  },

  getCapabilities(): readonly string[] {
    return engineData.capabilities;
  },

  getInterfaces(): readonly string[] {
    return engineData.interfaces;
  },

  getMetadata(): EngineMetadata {
    return engineData.metadata;
  }
});
export type { ExecutionEngine as ExecutionEngineType };
