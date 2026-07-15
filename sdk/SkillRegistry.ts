/**
 * SkillRegistry.ts
 * 
 * Development OS 全体で使用する Skill（抽象技能）の不変レジストリ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum SkillStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DEPRECATED = 'DEPRECATED',
  EXPERIMENTAL = 'EXPERIMENTAL'
}

export enum SkillCategory {
  Analysis = 'Analysis',
  Validation = 'Validation',
  Transformation = 'Transformation',
  ExecutionPlanning = 'ExecutionPlanning',
  Audit = 'Audit',
  Reporting = 'Reporting',
  Documentation = 'Documentation'
}

export interface Skill {
  readonly skillId: string;
  readonly skillName: string;
  readonly category: SkillCategory;
  readonly description: string;
  readonly capabilityId: string;
  readonly priority: number;
  readonly status: SkillStatus;
  readonly version: string;
}

export interface RegistryMetadata {
  readonly registryId: string;
  readonly registryVersion: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export class SkillRegistry {
  private static registry: Map<string, Skill> = new Map();

  // レジストリメタデータの定義
  public static readonly metadata: RegistryMetadata = Object.freeze({
    registryId: 'reg-skill-01',
    registryVersion: '1.0.0',
    createdAt: new Date('2026-07-09T09:30:00Z').toISOString(),
    updatedAt: new Date('2026-07-09T09:30:00Z').toISOString()
  });

  /**
   * Skill を登録する
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
      throw new Error(`[SkillRegistry] Skill ID already registered: ${skill.skillId}`);
    }

    // 名前重複チェック
    for (const item of this.registry.values()) {
      if (item.skillName === skill.skillName) {
        throw new Error(`[SkillRegistry] Skill Name already registered: ${skill.skillName}`);
      }
    }

    this.registry.set(skill.skillId, Object.freeze({ ...skill }));
  }

  /**
   * IDから Skill を取得する
   */
  static get(skillId: string): Skill | undefined {
    return this.registry.get(skillId);
  }

  /**
   * 一致する SkillName を持つものを取得する
   */
  static getByName(name: string): Skill | undefined {
    for (const item of this.registry.values()) {
      if (item.skillName === name) {
        return item;
      }
    }
    return undefined;
  }

  /**
   * 親 Capability に属するすべての Skill を取得する
   */
  static getByCapability(capabilityId: string): Skill[] {
    const list: Skill[] = [];
    for (const item of this.registry.values()) {
      if (item.capabilityId === capabilityId) {
        list.push(item);
      }
    }
    return list;
  }

  /**
   * 全 Skill を取得する
   */
  static getAll(): Skill[] {
    return Array.from(this.registry.values());
  }

  /**
   * レジストリをクリアする（テスト用）
   */
  static clear(): void {
    this.registry.clear();
  }
}
