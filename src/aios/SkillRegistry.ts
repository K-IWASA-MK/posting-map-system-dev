/**
 * SkillRegistry.ts
 * 
 * 抽象スキル定義の登録・取得を一元管理するレジストリ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export interface Skill {
  readonly skillId: string;
  readonly skillName: string;
  readonly description: string;
  readonly capabilityType: string;
}

export class SkillRegistry {
  private static registry: Map<string, Skill> = new Map();

  /**
   * 抽象スキルをレジストリに登録する
   */
  static register(skill: Skill): void {
    if (!skill) {
      throw new Error('[SkillRegistry] Skill cannot be empty');
    }
    if (!skill.skillId) {
      throw new Error('[SkillRegistry] skillId is required');
    }
    if (!skill.skillName) {
      throw new Error('[SkillRegistry] skillName is required');
    }

    if (this.registry.has(skill.skillId)) {
      throw new Error(`[SkillRegistry] Skill is already registered: ${skill.skillId}`);
    }

    this.registry.set(skill.skillId, Object.freeze({ ...skill }));
  }

  /**
   * スキルをIDから取得する
   */
  static get(skillId: string): Skill | undefined {
    return this.registry.get(skillId);
  }

  /**
   * 全登録スキルを取得する
   */
  static getAll(): Skill[] {
    return Array.from(this.registry.values());
  }

  /**
   * レジストリをクリアする (テスト用)
   */
  static clear(): void {
    this.registry.clear();
  }
}
