import { RuntimeRecord, RuntimeState, RuntimeMode } from './RuntimeRegistry';

/**
 * RuntimeFactory.ts
 * 
 * 不変な RuntimeRecord を決定論的かつ安全に生成するファクトリ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export class RuntimeFactory {
  private static counter = 0;

  /**
   * 決定論的な ID（runtime-1, runtime-2...）を持つ不変な RuntimeRecord を生成する
   */
  static create(
    name: string,
    state: RuntimeState,
    mode: RuntimeMode,
    description: string,
    version: string = '1.0.0'
  ): RuntimeRecord {
    if (!name) {
      throw new Error('[RuntimeFactory] runtimeName is required');
    }
    if (!state) {
      throw new Error('[RuntimeFactory] runtimeState is required');
    }
    if (!mode) {
      throw new Error('[RuntimeFactory] runtimeMode is required');
    }

    this.counter++;
    const id = `runtime-${this.counter}`;
    const now = new Date().toISOString();

    const record: RuntimeRecord = {
      runtimeId: id,
      runtimeName: name,
      runtimeState: state,
      runtimeMode: mode,
      description: description || '',
      version: version,
      createdAt: now,
      updatedAt: now
    };

    return Object.freeze(record);
  }

  /**
   * カウンターをリセットする (テスト用)
   */
  static resetCounter(): void {
    this.counter = 0;
  }
}
