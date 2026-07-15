import { SkillPipeline, SkillPipelineStatus } from './SkillPipelineRegistry';

/**
 * SkillPipelineAdapter.ts
 * 
 * SkillPipeline オブジェクトからダッシュボード UI 表示用等の ViewModel への変換を担当するアダプター。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export interface SkillPipelineViewModel {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly capabilityId: string;
  readonly skillCount: number;
  readonly isAvailable: boolean;
  readonly priorityLabel: string;
  readonly versionTag: string;
  readonly formattedTimeline: string;
}

export class SkillPipelineAdapter {
  /**
   * SkillPipeline から不変な UI 表示用 ViewModel を生成する
   */
  static toViewModel(pipeline: SkillPipeline): SkillPipelineViewModel {
    if (!pipeline) {
      throw new Error('[SkillPipelineAdapter] pipeline is required');
    }

    const priorityLabel = pipeline.priority >= 10 ? 'HIGH' : pipeline.priority >= 5 ? 'MEDIUM' : 'LOW';
    const isAvailable = pipeline.status === SkillPipelineStatus.ACTIVE || pipeline.status === SkillPipelineStatus.EXPERIMENTAL;

    const viewModel: SkillPipelineViewModel = {
      id: pipeline.pipelineId,
      name: pipeline.pipelineName,
      description: pipeline.description,
      capabilityId: pipeline.capabilityId,
      skillCount: pipeline.skillIds.length,
      isAvailable: isAvailable,
      priorityLabel: priorityLabel,
      versionTag: `v${pipeline.version}`,
      formattedTimeline: pipeline.skillIds.join(' ➔ ')
    };

    return Object.freeze(viewModel);
  }
}
