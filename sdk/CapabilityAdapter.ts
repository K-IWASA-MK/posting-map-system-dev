import { Capability, CapabilityStatus } from './CapabilityRegistry';

/**
 * CapabilityAdapter.ts
 * 
 * Capability オブジェクトからダッシュボード UI 表示用等の ViewModel への変換を担当するアダプター。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export interface CapabilityViewModel {
  readonly id: string;
  readonly name: string;
  readonly categoryLabel: string;
  readonly priorityLabel: string;
  readonly isAvailable: boolean;
  readonly versionTag: string;
}

export class CapabilityAdapter {
  /**
   * Capability から不変な UI 表示用 ViewModel を生成する
   */
  static toViewModel(capability: Capability): CapabilityViewModel {
    if (!capability) {
      throw new Error('[CapabilityAdapter] capability is required');
    }

    const priorityLabel = capability.priority >= 10 ? 'HIGH' : capability.priority >= 5 ? 'MEDIUM' : 'LOW';
    const isAvailable = capability.status === CapabilityStatus.ACTIVE || capability.status === CapabilityStatus.EXPERIMENTAL;

    const viewModel: CapabilityViewModel = {
      id: capability.capabilityId,
      name: capability.capabilityName,
      categoryLabel: capability.category.toUpperCase(),
      priorityLabel: priorityLabel,
      isAvailable: isAvailable,
      versionTag: `v${capability.version}`
    };

    return Object.freeze(viewModel);
  }
}
