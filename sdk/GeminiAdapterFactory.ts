import { GeminiAdapter } from './GeminiAdapter';
import { ToolAdapterStatus } from './ToolAdapter';

/**
 * GeminiAdapterFactory.ts
 * 
 * 決定論的かつ不変な GeminiAdapter インスタンスを生成するファクトリ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export class GeminiAdapterFactory {
  private static instanceCounter = 0;

  /**
   * 不変な GeminiAdapter インスタンスを決定論的に生成する
   */
  static create(
    name: string,
    description: string,
    supportedPipelineIds: string[],
    supportedToolIds: string[],
    supportedModelIds: string[],
    status: ToolAdapterStatus,
    version: string,
    createdAt: string = new Date().toISOString(),
    updatedAt: string = new Date().toISOString()
  ): GeminiAdapter {
    const id = `adapter-${++GeminiAdapterFactory.instanceCounter}`;

    const adapter = new GeminiAdapter({
      adapterId: id,
      adapterName: name,
      description: description,
      supportedPipelineIds: supportedPipelineIds,
      supportedToolIds: supportedToolIds,
      supportedModelIds: supportedModelIds,
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
