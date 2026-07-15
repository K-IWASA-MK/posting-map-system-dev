import { AntigravityAdapter } from './AntigravityAdapter';
import { ToolAdapterStatus } from './ToolAdapter';
import { ToolRegistry } from './ToolRegistry';
import { SkillPipelineRegistry } from './SkillPipelineRegistry';
import { AntigravityCommandRegistry } from './AntigravityCommandRegistry';

/**
 * AntigravityAdapterValidator.ts
 * 
 * AntigravityAdapter インスタンスの整合性および依存関係を検証するバリデータ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export class AntigravityAdapterValidator {
  private static readonly iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

  /**
   * AntigravityAdapter を検証する
   */
  static validate(adapter: AntigravityAdapter): void {
    if (!adapter) {
      throw new Error('[AntigravityAdapterValidator] Adapter is required');
    }

    if (!adapter.adapterId || !/^adapter-\d+$/.test(adapter.adapterId)) {
      throw new Error(`[AntigravityAdapterValidator] Invalid adapterId: ${adapter.adapterId}`);
    }

    if (!adapter.adapterName || typeof adapter.adapterName !== 'string') {
      throw new Error('[AntigravityAdapterValidator] Invalid adapterName');
    }

    // Status検証
    if (!adapter.status || !Object.values(ToolAdapterStatus).includes(adapter.status)) {
      throw new Error(`[AntigravityAdapterValidator] Invalid status: ${adapter.status}`);
    }

    // Version検証
    const semverRegex = /^\d+\.\d+\.\d+$/;
    if (!adapter.version || !semverRegex.test(adapter.version)) {
      throw new Error(`[AntigravityAdapterValidator] Invalid version: ${adapter.version}`);
    }

    // ISO8601検証
    if (!adapter.createdAt || !this.iso8601Regex.test(adapter.createdAt)) {
      throw new Error(`[AntigravityAdapterValidator] Invalid createdAt format: ${adapter.createdAt}`);
    }
    if (!adapter.updatedAt || !this.iso8601Regex.test(adapter.updatedAt)) {
      throw new Error(`[AntigravityAdapterValidator] Invalid updatedAt format: ${adapter.updatedAt}`);
    }

    // 日付順序検証
    const createdTime = new Date(adapter.createdAt).getTime();
    const updatedTime = new Date(adapter.updatedAt).getTime();
    if (createdTime > updatedTime) {
      throw new Error(`[AntigravityAdapterValidator] Date sequence violation: createdAt (${adapter.createdAt}) is after updatedAt (${adapter.updatedAt})`);
    }

    // Tool 依存性検証 (SSOT)
    if (!adapter.supportedToolIds || !Array.isArray(adapter.supportedToolIds)) {
      throw new Error('[AntigravityAdapterValidator] supportedToolIds must be an array');
    }
    for (const toolId of adapter.supportedToolIds) {
      const tool = ToolRegistry.get(toolId);
      if (!tool) {
        throw new Error(`[AntigravityAdapterValidator] Tool dependency not registered: ${toolId}`);
      }
    }

    // Pipeline 依存性検証 (SSOT)
    if (!adapter.supportedPipelineIds || !Array.isArray(adapter.supportedPipelineIds)) {
      throw new Error('[AntigravityAdapterValidator] supportedPipelineIds must be an array');
    }
    for (const pipelineId of adapter.supportedPipelineIds) {
      const pipeline = SkillPipelineRegistry.get(pipelineId);
      if (!pipeline) {
        throw new Error(`[AntigravityAdapterValidator] Pipeline dependency not registered: ${pipelineId}`);
      }
    }

    // Command 依存性検証 (SSOT)
    if (!adapter.supportedCommandIds || !Array.isArray(adapter.supportedCommandIds)) {
      throw new Error('[AntigravityAdapterValidator] supportedCommandIds must be an array');
    }
    for (const commandId of adapter.supportedCommandIds) {
      const command = AntigravityCommandRegistry.get(commandId);
      if (!command) {
        throw new Error(`[AntigravityAdapterValidator] Command dependency not registered: ${commandId}`);
      }
    }
  }
}
