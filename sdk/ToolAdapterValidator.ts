import { ToolAdapter, ToolAdapterStatus } from './ToolAdapter';
import { ToolRegistry } from './ToolRegistry';
import { SkillPipelineRegistry } from './SkillPipelineRegistry';

/**
 * ToolAdapterValidator.ts
 * 
 * ToolAdapter インスタンスの整合性および依存関係（Pipeline, Tool の存在）を検証するバリデータ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export class ToolAdapterValidator {
  private static readonly iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

  /**
   * ToolAdapter インスタンスを検証する
   */
  static validate(adapter: ToolAdapter): void {
    if (!adapter) {
      throw new Error('[ToolAdapterValidator] Adapter is required');
    }

    if (!adapter.adapterId || !/^adapter-\d+$/.test(adapter.adapterId)) {
      throw new Error(`[ToolAdapterValidator] Invalid adapterId: ${adapter.adapterId}`);
    }

    if (!adapter.adapterName || typeof adapter.adapterName !== 'string') {
      throw new Error('[ToolAdapterValidator] Invalid adapterName');
    }

    // Status検証
    if (!adapter.status || !Object.values(ToolAdapterStatus).includes(adapter.status)) {
      throw new Error(`[ToolAdapterValidator] Invalid status: ${adapter.status}`);
    }

    // Version検証 (semver)
    const semverRegex = /^\d+\.\d+\.\d+$/;
    if (!adapter.version || !semverRegex.test(adapter.version)) {
      throw new Error(`[ToolAdapterValidator] Invalid version: ${adapter.version}`);
    }

    // ISO8601検証
    if (!adapter.createdAt || !this.iso8601Regex.test(adapter.createdAt)) {
      throw new Error(`[ToolAdapterValidator] Invalid createdAt format: ${adapter.createdAt}`);
    }
    if (!adapter.updatedAt || !this.iso8601Regex.test(adapter.updatedAt)) {
      throw new Error(`[ToolAdapterValidator] Invalid updatedAt format: ${adapter.updatedAt}`);
    }

    // 日付順序検証
    const createdTime = new Date(adapter.createdAt).getTime();
    const updatedTime = new Date(adapter.updatedAt).getTime();
    if (createdTime > updatedTime) {
      throw new Error(`[ToolAdapterValidator] Date sequence violation: createdAt (${adapter.createdAt}) is after updatedAt (${adapter.updatedAt})`);
    }

    // Tool 依存性検証 (SSOT)
    if (!adapter.supportedToolIds || !Array.isArray(adapter.supportedToolIds)) {
      throw new Error('[ToolAdapterValidator] supportedToolIds must be an array');
    }
    for (const toolId of adapter.supportedToolIds) {
      const tool = ToolRegistry.get(toolId);
      if (!tool) {
        throw new Error(`[ToolAdapterValidator] Tool dependency not registered: ${toolId}`);
      }
    }

    // Pipeline 依存性検証 (SSOT)
    if (!adapter.supportedPipelineIds || !Array.isArray(adapter.supportedPipelineIds)) {
      throw new Error('[ToolAdapterValidator] supportedPipelineIds must be an array');
    }
    for (const pipelineId of adapter.supportedPipelineIds) {
      const pipeline = SkillPipelineRegistry.get(pipelineId);
      if (!pipeline) {
        throw new Error(`[ToolAdapterValidator] Pipeline dependency not registered: ${pipelineId}`);
      }
    }
  }
}
