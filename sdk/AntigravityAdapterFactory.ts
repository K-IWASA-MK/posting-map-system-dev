import { AntigravityAdapter } from './AntigravityAdapter';
import { ToolAdapterStatus } from './ToolAdapter';

/**
 * AntigravityAdapterFactory.ts
 * 
 * 決定論的かつ不変な AntigravityAdapter インスタンスを生成するファクトリ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export class AntigravityAdapterFactory {
  private static instanceCounter = 0;

  /**
   * 不変な AntigravityAdapter インスタンスを決定論的に生成する
   */
  static create(
    name: string,
    description: string,
    supportedPipelineIds: string[],
    supportedToolIds: string[],
    supportedCommandIds: string[],
    status: ToolAdapterStatus,
    version: string,
    createdAt: string = new Date().toISOString(),
    updatedAt: string = new Date().toISOString()
  ): AntigravityAdapter {
    const id = `adapter-${++AntigravityAdapterFactory.instanceCounter}`;

    const adapter = new AntigravityAdapter({
      adapterId: id,
      adapterName: name,
      description: description,
      supportedPipelineIds: supportedPipelineIds,
      supportedToolIds: supportedToolIds,
      supportedCommandIds: supportedCommandIds,
      status: status,
      version: version,
      createdAt: createdAt,
      updatedAt: updatedAt
    });

    return Object.freeze(adapter);
  }

  /**
   * カウンタのリセット（テスト用）
   */
  static resetCounter(): void {
    this.instanceCounter = 0;
  }
}
