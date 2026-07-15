import { ToolAdapter, ToolAdapterStatus } from './ToolAdapter';
import { ToolAdapterValidator } from './ToolAdapterValidator';

/**
 * ToolAdapterFactory.ts
 * 
 * 決定論的かつ不変な ToolAdapter オブジェクトを生成するファクトリ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export class ToolAdapterFactory {
  private static instanceCounter = 0;

  /**
   * 不変な ToolAdapter インスタンスを決定論的に生成する
   */
  static create(
    name: string,
    description: string,
    supportedPipelineIds: string[],
    supportedToolIds: string[],
    status: ToolAdapterStatus,
    version: string,
    createdAt: string = new Date().toISOString(),
    updatedAt: string = new Date().toISOString()
  ): ToolAdapter {
    const id = `adapter-${++ToolAdapterFactory.instanceCounter}`;

    const adapter: ToolAdapter = {
      adapterId: id,
      adapterName: name,
      description: description,
      supportedPipelineIds: Object.freeze([...supportedPipelineIds]),
      supportedToolIds: Object.freeze([...supportedToolIds]),
      status: status,
      version: version,
      createdAt: createdAt,
      updatedAt: updatedAt
    };

    // 登録前の妥当性検証
    ToolAdapterValidator.validate(adapter);

    return Object.freeze(adapter);
  }

  /**
   * カウンタのリセット（テスト用）
   */
  static resetCounter(): void {
    this.instanceCounter = 0;
  }
}
