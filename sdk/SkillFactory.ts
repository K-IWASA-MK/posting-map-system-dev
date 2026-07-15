import { Skill, SkillCategory, SkillStatus } from './SkillRegistry';
import { SkillValidator } from './SkillValidator';

/**
 * SkillFactory.ts
 * 
 * 決定論的かつ不変な Skill（抽象技能）インスタンスを生成するファクトリ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export class SkillFactory {
  private static instanceCounter = 0;

  /**
   * 不変な Skill インスタンスを決定論的に生成する
   */
  static create(
    name: string,
    category: SkillCategory,
    description: string,
    capabilityId: string,
    priority: number,
    status: SkillStatus,
    version: string
  ): Skill {
    const id = `skill-${++SkillFactory.instanceCounter}`;

    const skill: Skill = {
      skillId: id,
      skillName: name,
      category: category,
      description: description,
      capabilityId: capabilityId,
      priority: priority,
      status: status,
      version: version
    };

    // 登録前の妥当性検証
    SkillValidator.validate(skill);

    return Object.freeze(skill);
  }

  /**
   * カウンタのリセット（テスト用）
   */
  static resetCounter(): void {
    this.instanceCounter = 0;
  }
}
