import { Tool, ToolCategory, ToolStatus } from './ToolRegistry';

/**
 * ToolValidator.ts
 * 
 * Tool インスタンスの整合性を検証するバリデータ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export class ToolValidator {
  private static readonly iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

  /**
   * Tool インスタンスを検証する
   */
  static validate(tool: Tool): void {
    if (!tool) {
      throw new Error('[ToolValidator] Tool is required');
    }

    if (!tool.toolId || !/^tool-\d+$/.test(tool.toolId)) {
      throw new Error(`[ToolValidator] Invalid toolId: ${tool.toolId}`);
    }

    if (!tool.toolName || typeof tool.toolName !== 'string') {
      throw new Error('[ToolValidator] Invalid toolName');
    }

    // Category検証
    if (!tool.category || !Object.values(ToolCategory).includes(tool.category)) {
      throw new Error(`[ToolValidator] Invalid category: ${tool.category}`);
    }

    // Status検証
    if (!tool.status || !Object.values(ToolStatus).includes(tool.status)) {
      throw new Error(`[ToolValidator] Invalid status: ${tool.status}`);
    }

    // Version検証 (semver)
    const semverRegex = /^\d+\.\d+\.\d+$/;
    if (!tool.version || !semverRegex.test(tool.version)) {
      throw new Error(`[ToolValidator] Invalid version: ${tool.version}`);
    }

    // ISO8601検証
    if (!tool.createdAt || !this.iso8601Regex.test(tool.createdAt)) {
      throw new Error(`[ToolValidator] Invalid createdAt format: ${tool.createdAt}`);
    }
    if (!tool.updatedAt || !this.iso8601Regex.test(tool.updatedAt)) {
      throw new Error(`[ToolValidator] Invalid updatedAt format: ${tool.updatedAt}`);
    }

    // 日付順序検証
    const createdTime = new Date(tool.createdAt).getTime();
    const updatedTime = new Date(tool.updatedAt).getTime();
    if (createdTime > updatedTime) {
      throw new Error(`[ToolValidator] Date sequence violation: createdAt (${tool.createdAt}) is after updatedAt (${tool.updatedAt})`);
    }
  }
}
