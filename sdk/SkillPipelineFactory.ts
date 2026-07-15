import { SkillPipeline, SkillPipelineStatus } from './SkillPipelineRegistry';
import { SkillPipelineValidator } from './SkillPipelineValidator';

/**
 * SkillPipelineFactory.ts
 * 
 * 決定論的かつ不変な SkillPipeline（抽象技能パイプライン）インスタンスを生成するファクトリ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export class SkillPipelineFactory {
  private static instanceCounter = 0;

  /**
   * 不変な SkillPipeline インスタンスを決定論的に生成する
   */
  static create(
    name: string,
    description: string,
    capabilityId: string,
    skillIds: string[],
    priority: number,
    status: SkillPipelineStatus,
    version: string,
    pipelineVersion: string,
    createdAt: string = new Date().toISOString(),
    updatedAt: string = new Date().toISOString()
  ): SkillPipeline {
    const id = `pipeline-${++SkillPipelineFactory.instanceCounter}`;

    const pipeline: SkillPipeline = {
      pipelineId: id,
      pipelineName: name,
      description: description,
      capabilityId: capabilityId,
      skillIds: Object.freeze([...skillIds]),
      priority: priority,
      status: status,
      version: version,
      pipelineVersion: pipelineVersion,
      createdAt: createdAt,
      updatedAt: updatedAt
    };

    // 登録前の妥当性検証
    SkillPipelineValidator.validate(pipeline);

    return Object.freeze(pipeline);
  }

  /**
   * カウンタのリセット（テスト用）
   */
  static resetCounter(): void {
    this.instanceCounter = 0;
  }
}
