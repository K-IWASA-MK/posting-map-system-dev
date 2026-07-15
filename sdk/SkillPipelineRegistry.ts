/**
 * SkillPipelineRegistry.ts
 * 
 * Development OS 全体で使用する SkillPipeline（開発技能パイプライン）の不変レジストリ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum SkillPipelineStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DEPRECATED = 'DEPRECATED',
  EXPERIMENTAL = 'EXPERIMENTAL'
}

export interface SkillPipeline {
  readonly pipelineId: string;
  readonly pipelineName: string;
  readonly description: string;
  readonly capabilityId: string;
  readonly skillIds: readonly string[];
  readonly priority: number;
  readonly status: SkillPipelineStatus;
  readonly version: string;
  readonly pipelineVersion: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegistryMetadata {
  readonly registryId: string;
  readonly registryVersion: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export class SkillPipelineRegistry {
  private static registry: Map<string, SkillPipeline> = new Map();

  // レジストリメタデータの定義（Capability/Skill Registry と対称構造）
  public static readonly metadata: RegistryMetadata = Object.freeze({
    registryId: 'reg-pipeline-01',
    registryVersion: '1.0.0',
    createdAt: new Date('2026-07-09T09:30:00Z').toISOString(),
    updatedAt: new Date('2026-07-09T09:30:00Z').toISOString()
  });

  /**
   * Pipeline を登録する
   */
  static register(pipeline: SkillPipeline): void {
    if (!pipeline) {
      throw new Error('[SkillPipelineRegistry] Pipeline cannot be empty');
    }
    if (!pipeline.pipelineId) {
      throw new Error('[SkillPipelineRegistry] pipelineId is required');
    }
    if (!pipeline.pipelineName) {
      throw new Error('[SkillPipelineRegistry] pipelineName is required');
    }

    if (this.registry.has(pipeline.pipelineId)) {
      throw new Error(`[SkillPipelineRegistry] Pipeline ID already registered: ${pipeline.pipelineId}`);
    }

    // 名前重複チェック
    for (const item of this.registry.values()) {
      if (item.pipelineName === pipeline.pipelineName) {
        throw new Error(`[SkillPipelineRegistry] Pipeline Name already registered: ${pipeline.pipelineName}`);
      }
    }

    this.registry.set(pipeline.pipelineId, Object.freeze({
      ...pipeline,
      skillIds: Object.freeze([...pipeline.skillIds])
    }));
  }

  /**
   * IDから Pipeline を取得する
   */
  static get(pipelineId: string): SkillPipeline | undefined {
    return this.registry.get(pipelineId);
  }

  /**
   * 一致する PipelineName を持つものを取得する
   */
  static getByName(name: string): SkillPipeline | undefined {
    for (const item of this.registry.values()) {
      if (item.pipelineName === name) {
        return item;
      }
    }
    return undefined;
  }

  /**
   * 親 Capability に属する Pipeline を取得する
   */
  static getByCapability(capabilityId: string): SkillPipeline | undefined {
    for (const item of this.registry.values()) {
      if (item.capabilityId === capabilityId) {
        return item;
      }
    }
    return undefined;
  }

  /**
   * 全 Pipeline を取得する
   */
  static getAll(): SkillPipeline[] {
    return Array.from(this.registry.values());
  }

  /**
   * レジストリをクリアする（テスト用）
   */
  static clear(): void {
    this.registry.clear();
  }
}
