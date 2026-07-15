import { Skill, SkillStatus } from './SkillRegistry';

/**
 * SkillAdapter.ts
 * 
 * Skill オブジェクトからダッシュボード UI 表示用等の ViewModel への変換を担当するアダプター。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export interface SkillViewModel {
  readonly id: string;
  readonly name: string;
  readonly categoryLabel: string;
  readonly capabilityId: string;
  readonly priorityLabel: string;
  readonly isAvailable: boolean;
  readonly versionTag: string;
}

export class SkillAdapter {
  /**
   * Skill から不変な UI 表示用 ViewModel を生成する
   */
  static toViewModel(skill: Skill): SkillViewModel {
    if (!skill) {
      throw new Error('[SkillAdapter] skill is required');
    }

    const priorityLabel = skill.priority >= 10 ? 'HIGH' : skill.priority >= 5 ? 'MEDIUM' : 'LOW';
    const isAvailable = skill.status === SkillStatus.ACTIVE || skill.status === SkillStatus.EXPERIMENTAL;

    const viewModel: SkillViewModel = {
      id: skill.skillId,
      name: skill.skillName,
      categoryLabel: skill.category.toUpperCase(),
      capabilityId: skill.capabilityId,
      priorityLabel: priorityLabel,
      isAvailable: isAvailable,
      versionTag: `v${skill.version}`
    };

    return Object.freeze(viewModel);
  }
}
