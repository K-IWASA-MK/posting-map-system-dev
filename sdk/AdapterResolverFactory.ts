import { ResolutionRecord, AdapterType, ResolutionPolicy, ResolutionState } from './AdapterResolutionRegistry';

/**
 * AdapterResolverFactory.ts
 * 
 * 決定論的かつ不変な ResolutionRecord インスタンスを生成するファクトリ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export class AdapterResolverFactory {
  private static instanceCounter = 0;

  /**
   * 不変な ResolutionRecord インスタンスを決定論的に生成する
   */
  static create(
    capabilityId: string,
    pipelineId: string,
    adapterId: string,
    adapterType: AdapterType,
    priority: number,
    resolutionPolicy: ResolutionPolicy,
    resolutionReason: string,
    resolutionState: ResolutionState,
    version: string,
    createdAt: string = new Date().toISOString(),
    updatedAt: string = new Date().toISOString()
  ): ResolutionRecord {
    const id = `resolution-${++AdapterResolverFactory.instanceCounter}`;

    const record: ResolutionRecord = {
      resolutionId: id,
      capabilityId: capabilityId,
      pipelineId: pipelineId,
      adapterId: adapterId,
      adapterType: adapterType,
      priority: priority,
      resolutionPolicy: resolutionPolicy,
      resolutionReason: resolutionReason,
      resolutionState: resolutionState,
      version: version,
      createdAt: createdAt,
      updatedAt: updatedAt
    };

    return Object.freeze(record);
  }

  /**
   * カウンタのリセット（テスト用）
   */
  static resetCounter(): void {
    this.instanceCounter = 0;
  }
}
