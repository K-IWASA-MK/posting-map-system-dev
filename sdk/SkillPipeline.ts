import { SkillRegistry } from './SkillRegistry';

/**
 * SkillPipeline.ts
 * 
 * 解決された Capability を遂行するためのスキルパイプライン定義。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export interface SkillPipelineContext {
  readonly pipelineId: string;
  readonly skills: readonly string[];
  readonly targetCapability: string;
}

export class SkillPipeline {
  /**
   * スキルシーケンスから不変なパイプラインコンテキストを生成する
   */
  static createPipeline(id: string, capability: string, skillIds: string[]): SkillPipelineContext {
    if (!id) {
      throw new Error('[SkillPipeline] pipelineId is required');
    }
    if (!capability) {
      throw new Error('[SkillPipeline] targetCapability is required');
    }
    if (!skillIds || skillIds.length === 0) {
      throw new Error('[SkillPipeline] skills sequence cannot be empty');
    }

    // 各スキルIDが SkillRegistry に登録されているか検証する
    skillIds.forEach(skillId => {
      if (!SkillRegistry.get(skillId)) {
        throw new Error(`[SkillPipeline] Skill is not registered in registry: ${skillId}`);
      }
    });

    const context: SkillPipelineContext = {
      pipelineId: id,
      skills: Object.freeze([...skillIds]),
      targetCapability: capability
    };

    return Object.freeze(context);
  }
}
