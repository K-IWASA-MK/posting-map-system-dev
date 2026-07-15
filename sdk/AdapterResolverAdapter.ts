import { ResolutionRecord } from './AdapterResolutionRegistry';

/**
 * AdapterResolverAdapter.ts
 * 
 * ResolutionRecord オブジェクトからダッシュボード UI 表示用等の ViewModel への変換を担当するアダプター。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export interface AdapterResolutionViewModel {
  readonly id: string;
  readonly capabilityId: string;
  readonly pipelineId: string;
  readonly adapterId: string;
  readonly adapterTypeLabel: string;
  readonly priorityValue: number;
  readonly policyLabel: string;
  readonly reason: string;
  readonly stateLabel: string;
  readonly versionTag: string;
  readonly activeSince: string;
}

export class AdapterResolverAdapter {
  /**
   * ResolutionRecord から不変な UI 表示用 ViewModel を生成する
   */
  static toViewModel(record: ResolutionRecord): AdapterResolutionViewModel {
    if (!record) {
      throw new Error('[AdapterResolverAdapter] record is required');
    }

    const viewModel: AdapterResolutionViewModel = {
      id: record.resolutionId,
      capabilityId: record.capabilityId,
      pipelineId: record.pipelineId,
      adapterId: record.adapterId,
      adapterTypeLabel: record.adapterType.toUpperCase(),
      priorityValue: record.priority,
      policyLabel: record.resolutionPolicy.toUpperCase(),
      reason: record.resolutionReason,
      stateLabel: record.resolutionState.toUpperCase(),
      versionTag: `v${record.version}`,
      activeSince: record.createdAt
    };

    return Object.freeze(viewModel);
  }
}
