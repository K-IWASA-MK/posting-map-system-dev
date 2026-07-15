import { SkillPipeline, SkillPipelineStatus } from './SkillPipelineRegistry';
import { CapabilityRegistry } from './CapabilityRegistry';
import { SkillRegistry, SkillCategory } from './SkillRegistry';

/**
 * SkillPipelineValidator.ts
 * 
 * SkillPipeline の構成・整合性・フェーズ順序を検証するバリデータ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export class SkillPipelineValidator {
  // 順序検証用の重みテーブル
  private static readonly categoryOrder: Record<string, number> = {
    [SkillCategory.Analysis]: 0,
    [SkillCategory.Validation]: 1,
    [SkillCategory.Transformation]: 2,
    [SkillCategory.ExecutionPlanning]: 3,
    [SkillCategory.Audit]: 4,
    [SkillCategory.Reporting]: 5,
    [SkillCategory.Documentation]: 6
  };

  /**
   * SkillPipeline を検証する
   */
  static validate(pipeline: SkillPipeline): void {
    if (!pipeline) {
      throw new Error('[SkillPipelineValidator] Pipeline is required');
    }

    if (!pipeline.pipelineId || typeof pipeline.pipelineId !== 'string') {
      throw new Error('[SkillPipelineValidator] Invalid pipelineId');
    }

    if (!pipeline.pipelineName || typeof pipeline.pipelineName !== 'string') {
      throw new Error('[SkillPipelineValidator] Invalid pipelineName');
    }

    if (typeof pipeline.description !== 'string') {
      throw new Error('[SkillPipelineValidator] Invalid description');
    }

    // Status検証
    if (!pipeline.status || !Object.values(SkillPipelineStatus).includes(pipeline.status)) {
      throw new Error(`[SkillPipelineValidator] Invalid status: ${pipeline.status}`);
    }

    // Version検証 (semver)
    const semverRegex = /^\d+\.\d+\.\d+$/;
    if (!pipeline.version || !semverRegex.test(pipeline.version)) {
      throw new Error(`[SkillPipelineValidator] Invalid version: ${pipeline.version}`);
    }
    if (!pipeline.pipelineVersion || !semverRegex.test(pipeline.pipelineVersion)) {
      throw new Error(`[SkillPipelineValidator] Invalid pipelineVersion: ${pipeline.pipelineVersion}`);
    }

    // Priority検証
    if (typeof pipeline.priority !== 'number' || pipeline.priority < 0) {
      throw new Error(`[SkillPipelineValidator] Invalid priority: ${pipeline.priority}`);
    }

    // Capability 存在確認
    if (!pipeline.capabilityId) {
      throw new Error('[SkillPipelineValidator] capabilityId is required');
    }
    const parentCapability = CapabilityRegistry.get(pipeline.capabilityId) || CapabilityRegistry.getByName(pipeline.capabilityId);
    if (!parentCapability) {
      throw new Error(`[SkillPipelineValidator] Capability not registered: ${pipeline.capabilityId}`);
    }

    // Skill 存在・重複および順序（フェーズフロー）検証
    if (!pipeline.skillIds || !Array.isArray(pipeline.skillIds)) {
      throw new Error('[SkillPipelineValidator] skillIds array is required');
    }

    const seenSkills = new Set<string>();
    let lastOrderValue = -1;

    for (const skillId of pipeline.skillIds) {
      if (!skillId) {
        throw new Error('[SkillPipelineValidator] skillId cannot be empty');
      }

      // 重複検証
      if (seenSkills.has(skillId)) {
        throw new Error(`[SkillPipelineValidator] Duplicate skill detected: ${skillId}`);
      }
      seenSkills.add(skillId);

      // Skill 存在検証 (SSOT)
      const skill = SkillRegistry.get(skillId) || SkillRegistry.getByName(skillId);
      if (!skill) {
        throw new Error(`[SkillPipelineValidator] Skill not registered: ${skillId}`);
      }

      // 順序検証 (Non-decreasing Category Order Check)
      const orderValue = this.categoryOrder[skill.category];
      if (orderValue === undefined) {
        throw new Error(`[SkillPipelineValidator] Invalid skill category in order table: ${skill.category}`);
      }

      if (orderValue < lastOrderValue) {
        throw new Error(`[SkillPipelineValidator] INVALID_PIPELINE_ORDER: skill '${skillId}' (${skill.category}) violates phase sequence`);
      }
      lastOrderValue = orderValue;
    }
  }
}
