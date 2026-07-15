import { AdapterRecord } from './MultiAdapterRegistry';

/**
 * MultiAdapterAdapter.ts
 * 
 * AdapterRecord オブジェクトからダッシュボード UI 表示用等の ViewModel への変換を担当するアダプター。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export interface MultiAdapterViewModel {
  readonly id: string;
  readonly adapterId: string;
  readonly typeLabel: string;
  readonly categoryLabel: string;
  readonly priorityValue: number;
  readonly priorityPolicyLabel: string;
  readonly healthStatusLabel: string;
  readonly statusLabel: string;
  readonly capabilityCount: number;
  readonly pipelineCount: number;
  readonly versionTag: string;
  readonly activeSince: string;
}

export class MultiAdapterAdapter {
  /**
   * AdapterRecord から不変な UI 表示用 ViewModel を生成する
   */
  static toViewModel(record: AdapterRecord): MultiAdapterViewModel {
    if (!record) {
      throw new Error('[MultiAdapterAdapter] record is required');
    }

    const viewModel: MultiAdapterViewModel = {
      id: record.adapterRecordId,
      adapterId: record.adapterId,
      typeLabel: record.adapterType.toUpperCase(),
      categoryLabel: record.adapterCategory.toUpperCase(),
      priorityValue: record.priority,
      priorityPolicyLabel: record.priorityPolicy.toUpperCase(),
      healthStatusLabel: record.healthStatus.toUpperCase(),
      statusLabel: record.status.toUpperCase(),
      capabilityCount: record.supportedCapabilityIds.length,
      pipelineCount: record.supportedPipelineIds.length,
      versionTag: `v${record.version}`,
      activeSince: record.createdAt
    };

    return Object.freeze(viewModel);
  }
}
