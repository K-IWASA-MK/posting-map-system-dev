/**
 * DevelopmentRules.ts
 * 
 * Development OS で適用される各開発ルールの定義体。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

import { CapabilityRegistry } from './CapabilityRegistry';
import { SkillRegistry, Skill } from './SkillRegistry';

export interface DevelopmentRule {
  readonly ruleId: string;
  readonly ruleName: string;
  readonly capability: string;
  readonly priority: number;
}

export class DevelopmentRules {
  /**
   * 不変な開発ルールオブジェクトを生成する
   */
  static createRule(id: string, name: string, capability: string, priority: number): DevelopmentRule {
    if (!id) {
      throw new Error('[DevelopmentRules] ruleId is required');
    }
    if (!name) {
      throw new Error('[DevelopmentRules] ruleName is required');
    }
    if (!capability) {
      throw new Error('[DevelopmentRules] capability is required');
    }

    // Capability がレジストリに存在するか検証 (Name または ID)
    const verified = CapabilityRegistry.get(capability) || CapabilityRegistry.getByName(capability);
    if (!verified) {
      throw new Error(`[DevelopmentRules] Capability is not registered: ${capability}`);
    }

    const rule: DevelopmentRule = {
      ruleId: id,
      ruleName: name,
      capability: capability,
      priority: priority
    };

    return Object.freeze(rule);
  }

  /**
   * ルールに関連付けられた Capability を満たすための全 Skill を SkillRegistry から取得する
   */
  static getRequiredSkills(rule: DevelopmentRule): Skill[] {
    const verified = CapabilityRegistry.get(rule.capability) || CapabilityRegistry.getByName(rule.capability);
    if (!verified) {
      return [];
    }
    return SkillRegistry.getByCapability(verified.capabilityId);
  }
}
