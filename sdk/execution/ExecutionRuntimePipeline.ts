/**
 * ExecutionRuntimePipeline.ts
 * 
 * Execution Runtime Pipeline Foundation の構造および公開インターフェース定義 (SSOT)。
 * 
 * 警告：本ファイル内への実際のパイプライン処理、データ伝播、ロード、実行、状態遷移、ディスパッチ、ハイドレーション、
 * バリデーション、スケジューリング、キュー処理、リトライ、API 通信、コマンド送信、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum PipelineStep {
  BOOT_READY = 'BOOT_READY',
  ORCHESTRATION_READY = 'ORCHESTRATION_READY',
  PIPELINE_READY = 'PIPELINE_READY',
  RUNTIME_CONTEXT_READY = 'RUNTIME_CONTEXT_READY',
  READY_FOR_RUNTIME = 'READY_FOR_RUNTIME'
}

export enum PipelineType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME',
  SIMULATION = 'SIMULATION',
  PLUGIN = 'PLUGIN',
  AI = 'AI'
}

export enum PipelineScope {
  SYSTEM = 'SYSTEM',
  USER = 'USER',
  TENANT = 'TENANT'
}

export interface PipelineMetadata {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly layer: string;
  readonly category: string;
}

export interface ExecutionRuntimePipelineContext {
  readonly runtimePipelineId: string;
}

export interface ExecutionRuntimePipelineData {
  readonly pipelineType: PipelineType;
  readonly pipelineScope: PipelineScope;
  readonly pipelineVersion: string;
  readonly steps: readonly PipelineStep[];
}

export interface ExecutionRuntimePipeline {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly context: ExecutionRuntimePipelineContext;
  readonly metadata: PipelineMetadata;
  readonly data: ExecutionRuntimePipelineData;
}

export interface ExecutionRuntimePipelineBlueprint {
  getExecutionRuntimePipeline(): ExecutionRuntimePipeline;
  getMetadata(): PipelineMetadata;
  getContext(): ExecutionRuntimePipelineContext;
  getData(): ExecutionRuntimePipelineData;
  getPipelineSequence(): readonly PipelineStep[];
  getPipelineVersion(): string;
}

// 1. 静的データフローシーケンス配列の定義と凍結
export const PIPELINE_SEQUENCE: readonly PipelineStep[] = Object.freeze([
  PipelineStep.BOOT_READY,
  PipelineStep.ORCHESTRATION_READY,
  PipelineStep.PIPELINE_READY,
  PipelineStep.RUNTIME_CONTEXT_READY,
  PipelineStep.READY_FOR_RUNTIME
]);

// 2. メタデータオブジェクトの作成と凍結
const pipelineMetadata: PipelineMetadata = Object.freeze({
  id: 'runtime-pipeline-meta-01',
  name: 'Execution Runtime Pipeline Metadata',
  version: '1.0.0',
  description: 'Metadata for Execution Runtime Pipeline Foundation',
  layer: 'Pipeline Layer',
  category: 'Infrastructure'
});

// 3. コンテキストオブジェクトの作成と凍結 (ID 参照のみ、runtimePipelineId のみ)
const pipelineContext: ExecutionRuntimePipelineContext = Object.freeze({
  runtimePipelineId: 'runtime-pipeline-01'
});

// 4. データオブジェクトの作成と凍結 (推奨された pipelineVersion 1.0 を含む)
const pipelineData: ExecutionRuntimePipelineData = Object.freeze({
  pipelineType: PipelineType.FOUNDATION,
  pipelineScope: PipelineScope.SYSTEM,
  pipelineVersion: '1.0',
  steps: PIPELINE_SEQUENCE
});

// 5. パイプラインオブジェクト本体の作成と凍結
const runtimePipelineData: ExecutionRuntimePipeline = Object.freeze({
  id: 'runtime-pipeline-01',
  name: 'Default Execution Runtime Pipeline Foundation',
  description: 'The static execution runtime pipeline structure definition',
  context: pipelineContext,
  metadata: pipelineMetadata,
  data: pipelineData
});

// Blueprint コンテナの不変シングルトンインスタンス実装
export const EXECUTION_RUNTIME_PIPELINE_BLUEPRINT: ExecutionRuntimePipelineBlueprint = Object.freeze({
  getExecutionRuntimePipeline(): ExecutionRuntimePipeline {
    return runtimePipelineData;
  },

  getMetadata(): PipelineMetadata {
    return runtimePipelineData.metadata;
  },

  getContext(): ExecutionRuntimePipelineContext {
    return runtimePipelineData.context;
  },

  getData(): ExecutionRuntimePipelineData {
    return runtimePipelineData.data;
  },

  getPipelineSequence(): readonly PipelineStep[] {
    return PIPELINE_SEQUENCE;
  },

  getPipelineVersion(): string {
    return runtimePipelineData.data.pipelineVersion;
  }
});
