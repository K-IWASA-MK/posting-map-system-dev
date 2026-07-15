import { Skill, SkillCategory, SkillStatus } from './SkillRegistry';
import { CapabilityRegistry } from './CapabilityRegistry';

/**
 * SkillValidator.ts
 * 
 * Skill の作成・登録時における妥当性検証を行うバリデータ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export class SkillValidator {
  /**
   * Skill インスタンスを検証する
   */
  static validate(skill: Skill): void {
    if (!skill) {
      throw new Error('[SkillValidator] Skill is required');
    }

    if (!skill.skillId || typeof skill.skillId !== 'string') {
      throw new Error('[SkillValidator] Invalid skillId');
    }

    if (!skill.skillName || typeof skill.skillName !== 'string') {
      throw new Error('[SkillValidator] Invalid skillName');
    }

    // Category検証
    if (!skill.category || !Object.values(SkillCategory).includes(skill.category)) {
      throw new Error(`[SkillValidator] Invalid category: ${skill.category}`);
    }

    // Status検証
    if (!skill.status || !Object.values(SkillStatus).includes(skill.status)) {
      throw new Error(`[SkillValidator] Invalid status: ${skill.status}`);
    }

    // Version検証（セマンティックバージョニング形式 x.y.z）
    const semverRegex = /^\d+\.\d+\.\d+$/;
    if (!skill.version || !semverRegex.test(skill.version)) {
      throw new Error(`[SkillValidator] Invalid semantic version: ${skill.version}`);
    }

    // Priority検証
    if (typeof skill.priority !== 'number' || skill.priority < 0) {
      throw new Error(`[SkillValidator] Invalid priority: ${skill.priority}`);
    }

    // Capability 存在確認 (SSOT)
    if (!skill.capabilityId) {
      throw new Error('[SkillValidator] capabilityId is required');
    }
    const parentCapability = CapabilityRegistry.get(skill.capabilityId) || CapabilityRegistry.getByName(skill.capabilityId);
    if (!parentCapability) {
      throw new Error(`[SkillValidator] Parent Capability is not registered: ${skill.capabilityId}`);
    }
  }
}
