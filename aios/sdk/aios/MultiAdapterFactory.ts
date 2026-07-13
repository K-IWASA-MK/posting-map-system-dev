import { AdapterRecord, AdapterHealthStatus, AdapterPriorityPolicy } from './MultiAdapterRegistry';
import { AdapterType } from './AdapterResolutionRegistry';
import { ToolCategory } from './ToolRegistry';
import { ToolAdapterStatus } from './ToolAdapter';

/**
 * MultiAdapterFactory.ts
 * 
 * 決定論的かつ不変な AdapterRecord インスタンスを生成するファクトリ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export class MultiAdapterFactory {
  private static instanceCounter = 0;

  /**
   * 不変な AdapterRecord インスタンスを決定論的に生成する
   */
  static create(
    adapterId: string,
    adapterType: AdapterType,
    adapterCategory: ToolCategory,
    priority: number,
    priorityPolicy: AdapterPriorityPolicy,
    healthStatus: AdapterHealthStatus,
    status: ToolAdapterStatus,
    supportedCapabilityIds: string[],
    supportedPipelineIds: string[],
    version: string,
    createdAt: string = new Date().toISOString(),
    updatedAt: string = new Date().toISOString()
  ): AdapterRecord {
    const id = `multi-adapter-${++MultiAdapterFactory.instanceCounter}`;

    const record: AdapterRecord = {
      adapterRecordId: id,
      adapterId: adapterId,
      adapterType: adapterType,
      adapterCategory: adapterCategory,
      priority: priority,
      priorityPolicy: priorityPolicy,
      healthStatus: healthStatus,
      status: status,
      supportedCapabilityIds: supportedCapabilityIds,
      supportedPipelineIds: supportedPipelineIds,
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
