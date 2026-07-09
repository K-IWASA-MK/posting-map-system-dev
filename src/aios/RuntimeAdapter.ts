import { RuntimeRecord } from './RuntimeRegistry';

/**
 * RuntimeAdapter.ts
 * 
 * RuntimeRecord を UI 表示用の Immutable な ViewModel へ変換するアダプター。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export interface RuntimeViewModel {
  readonly id: string;
  readonly name: string;
  readonly stateLabel: string;
  readonly modeLabel: string;
  readonly descriptionText: string;
  readonly specVersion: string;
  readonly pipelineCount: number;
  readonly createdTimestamp: string;
  readonly updatedTimestamp: string;
}

export class RuntimeAdapter {
  /**
   * RuntimeRecord を不変な RuntimeViewModel へ変換する
   */
  static toViewModel(record: RuntimeRecord): RuntimeViewModel {
    if (!record) {
      throw new Error('[RuntimeAdapter] Record cannot be empty');
    }

    const viewModel: RuntimeViewModel = {
      id: record.runtimeId,
      name: record.runtimeName,
      stateLabel: String(record.runtimeState),
      modeLabel: String(record.runtimeMode),
      descriptionText: record.description || '',
      specVersion: record.version,
      pipelineCount: Array.isArray(record.supportedPipelineIds) ? record.supportedPipelineIds.length : 0,
      createdTimestamp: record.createdAt,
      updatedTimestamp: record.updatedAt
    };

    return Object.freeze(viewModel);
  }
}
