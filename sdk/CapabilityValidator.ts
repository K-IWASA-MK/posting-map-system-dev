import { Capability, CapabilityCategory, CapabilityStatus } from './CapabilityRegistry';

/**
 * CapabilityValidator.ts
 * 
 * Capability の登録・作成時における妥当性検証を行うバリデータ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export class CapabilityValidator {
  /**
   * Capability インスタンスを検証する
   */
  static validate(capability: Capability): void {
    if (!capability) {
      throw new Error('[CapabilityValidator] Capability is required');
    }

    if (!capability.capabilityId || typeof capability.capabilityId !== 'string') {
      throw new Error('[CapabilityValidator] Invalid capabilityId');
    }

    if (!capability.capabilityName || typeof capability.capabilityName !== 'string') {
      throw new Error('[CapabilityValidator] Invalid capabilityName');
    }

    // Category検証
    if (!capability.category || !Object.values(CapabilityCategory).includes(capability.category)) {
      throw new Error(`[CapabilityValidator] Invalid category: ${capability.category}`);
    }

    // Status検証
    if (!capability.status || !Object.values(CapabilityStatus).includes(capability.status)) {
      throw new Error(`[CapabilityValidator] Invalid status: ${capability.status}`);
    }

    // Version検証（セマンティックバージョニング形式 x.y.z）
    const semverRegex = /^\d+\.\d+\.\d+$/;
    if (!capability.version || !semverRegex.test(capability.version)) {
      throw new Error(`[CapabilityValidator] Invalid semantic version: ${capability.version}`);
    }

    // Priority検証
    if (typeof capability.priority !== 'number' || capability.priority < 0) {
      throw new Error(`[CapabilityValidator] Invalid priority: ${capability.priority}`);
    }
  }
}
