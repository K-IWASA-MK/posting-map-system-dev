import { ToolAdapter } from './ToolAdapter';

/**
 * ToolAdapterAdapter.ts
 * 
 * ToolAdapter オブジェクトからダッシュボード UI 表示用等の ViewModel への変換を担当するアダプター。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export interface ToolAdapterViewModel {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly pipelineCount: number;
  readonly toolCount: number;
  readonly statusLabel: string;
  readonly versionTag: string;
  readonly activeSince: string;
}

export class ToolAdapterAdapter {
  /**
   * ToolAdapter から不変な UI 表示用 ViewModel を生成する
   */
  static toViewModel(adapter: ToolAdapter): ToolAdapterViewModel {
    if (!adapter) {
      throw new Error('[ToolAdapterAdapter] adapter is required');
    }

    const viewModel: ToolAdapterViewModel = {
      id: adapter.adapterId,
      name: adapter.adapterName,
      description: adapter.description,
      pipelineCount: adapter.supportedPipelineIds.length,
      toolCount: adapter.supportedToolIds.length,
      statusLabel: adapter.status.toUpperCase(),
      versionTag: `v${adapter.version}`,
      activeSince: adapter.createdAt
    };

    return Object.freeze(viewModel);
  }
}
