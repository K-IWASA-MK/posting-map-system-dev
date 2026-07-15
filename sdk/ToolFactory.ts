import { Tool, ToolCategory, ToolStatus } from './ToolRegistry';
import { ToolValidator } from './ToolValidator';

/**
 * ToolFactory.ts
 * 
 * 決定論的かつ不変な Tool インスタンスを生成するファクトリ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export class ToolFactory {
  private static instanceCounter = 0;

  /**
   * 不変な Tool インスタンスを決定論的に生成する
   */
  static create(
    name: string,
    category: ToolCategory,
    description: string,
    status: ToolStatus,
    version: string,
    createdAt: string = new Date().toISOString(),
    updatedAt: string = new Date().toISOString()
  ): Tool {
    const id = `tool-${++ToolFactory.instanceCounter}`;

    const tool: Tool = {
      toolId: id,
      toolName: name,
      category: category,
      description: description,
      status: status,
      version: version,
      createdAt: createdAt,
      updatedAt: updatedAt
    };

    // 登録前の妥当性検証
    ToolValidator.validate(tool);

    return Object.freeze(tool);
  }

  /**
   * カウンタのリセット（テスト用）
   */
  static resetCounter(): void {
    this.instanceCounter = 0;
  }
}
