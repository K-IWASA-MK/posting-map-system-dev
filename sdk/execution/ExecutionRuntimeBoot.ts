/**
 * ExecutionRuntimeBoot.ts
 * 
 * Execution Runtime Boot Foundation の構造および公開インターフェース定義 (SSOT)。
 * 
 * 警告：本ファイル内への実際の起動処理、状態遷移、ディスパッチ、ハイドレーション、バリデーション、スケジューリング、
 * キュー処理、リトライ、API 通信、コマンド送信、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum BootStep {
  AIOS_BOOT = 'AIOS_BOOT',
  RUNTIME_BOOT = 'RUNTIME_BOOT',
  RUNTIME_FOUNDATION_LOAD = 'RUNTIME_FOUNDATION_LOAD',
  ENGINE_BLUEPRINT_LOAD = 'ENGINE_BLUEPRINT_LOAD',
  SERVICE_BLUEPRINT_LOAD = 'SERVICE_BLUEPRINT_LOAD',
  COMPONENT_BLUEPRINT_LOAD = 'COMPONENT_BLUEPRINT_LOAD',
  LIFECYCLE_BLUEPRINT_LOAD = 'LIFECYCLE_BLUEPRINT_LOAD',
  BOOT_COMPLETE = 'BOOT_COMPLETE'
}

export enum BootType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME',
  SIMULATION = 'SIMULATION',
  PLUGIN = 'PLUGIN',
  AI = 'AI'
}

export enum BootScope {
  SYSTEM = 'SYSTEM',
  USER = 'USER',
  TENANT = 'TENANT'
}

export interface BootMetadata {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly layer: string;
  readonly category: string;
}

export interface ExecutionRuntimeBootContext {
  readonly runtimeBootId: string;
}

export interface ExecutionRuntimeBootData {
  readonly bootType: BootType;
  readonly bootScope: BootScope;
  readonly steps: readonly BootStep[];
}

export interface ExecutionRuntimeBoot {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly context: ExecutionRuntimeBootContext;
  readonly metadata: BootMetadata;
  readonly data: ExecutionRuntimeBootData;
}

export interface ExecutionRuntimeBootBlueprint {
  getExecutionRuntimeBoot(): ExecutionRuntimeBoot;
  getMetadata(): BootMetadata;
  getContext(): ExecutionRuntimeBootContext;
  getData(): ExecutionRuntimeBootData;
  getBootSequence(): readonly BootStep[];
}

// 1. 静的ブートシーケンス配列の定義と凍結
export const BOOT_SEQUENCE: readonly BootStep[] = Object.freeze([
  BootStep.AIOS_BOOT,
  BootStep.RUNTIME_BOOT,
  BootStep.RUNTIME_FOUNDATION_LOAD,
  BootStep.ENGINE_BLUEPRINT_LOAD,
  BootStep.SERVICE_BLUEPRINT_LOAD,
  BootStep.COMPONENT_BLUEPRINT_LOAD,
  BootStep.LIFECYCLE_BLUEPRINT_LOAD,
  BootStep.BOOT_COMPLETE
]);

// 2. メタデータオブジェクトの作成と凍結
const bootMetadata: BootMetadata = Object.freeze({
  id: 'runtime-boot-meta-01',
  name: 'Execution Runtime Boot Metadata',
  version: '1.0.0',
  description: 'Metadata for Execution Runtime Boot Foundation',
  layer: 'Boot Layer',
  category: 'Infrastructure'
});

// 3. コンテキストオブジェクトの作成と凍結 (ID 参照のみ、runtimeBootId のみ)
const bootContext: ExecutionRuntimeBootContext = Object.freeze({
  runtimeBootId: 'runtime-boot-01'
});

// 4. データオブジェクトの作成と凍結
const bootData: ExecutionRuntimeBootData = Object.freeze({
  bootType: BootType.FOUNDATION,
  bootScope: BootScope.SYSTEM,
  steps: BOOT_SEQUENCE
});

// 5. ランタイムブートオブジェクト本体の作成と凍結
const runtimeBootData: ExecutionRuntimeBoot = Object.freeze({
  id: 'runtime-boot-01',
  name: 'Default Execution Runtime Boot Foundation',
  description: 'The static execution runtime boot structure definition',
  context: bootContext,
  metadata: bootMetadata,
  data: bootData
});

// Blueprint コンテナの不変シングルトンインスタンス実装
export const EXECUTION_RUNTIME_BOOT_BLUEPRINT: ExecutionRuntimeBootBlueprint = Object.freeze({
  getExecutionRuntimeBoot(): ExecutionRuntimeBoot {
    return runtimeBootData;
  },

  getMetadata(): BootMetadata {
    return runtimeBootData.metadata;
  },

  getContext(): ExecutionRuntimeBootContext {
    return runtimeBootData.context;
  },

  getData(): ExecutionRuntimeBootData {
    return runtimeBootData.data;
  },

  getBootSequence(): readonly BootStep[] {
    return BOOT_SEQUENCE;
  }
});
