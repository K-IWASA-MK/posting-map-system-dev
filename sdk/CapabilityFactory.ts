import { Capability, CapabilityCategory, CapabilityStatus } from './CapabilityRegistry';
import { CapabilityValidator } from './CapabilityValidator';

/**
 * CapabilityFactory.ts
 * 
 * 決定論的かつ不変な Capability（開発能力）インスタンスを生成するファクトリ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export class CapabilityFactory {
  private static instanceCounter = 0;

  /**
   * 不変な Capability インスタンスを決定論的に生成する
   */
  static create(
    name: string,
    category: CapabilityCategory,
    description: string,
    priority: number,
    status: CapabilityStatus,
    version: string,
    supportedSkillIds: string[] = []
  ): Capability {
    const id = `capability-${++CapabilityFactory.instanceCounter}`;

    const capability: Capability = {
      capabilityId: id,
      capabilityName: name,
      category: category,
      description: description,
      priority: priority,
      status: status,
      version: version,
      supportedSkillIds: Object.freeze([...supportedSkillIds])
    };

    // 登録前の妥当性検証
    CapabilityValidator.validate(capability);

    return Object.freeze(capability);
  }

  /**
   * カウンタのリセット（テスト用）
   */
  static resetCounter(): void {
    this.instanceCounter = 0;
  }
}
