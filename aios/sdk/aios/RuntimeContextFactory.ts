import { Context, RuntimeContextState } from './RuntimeContextRegistry';

/**
 * RuntimeContextFactory.ts
 * 
 * 不変な Context レコードを決定論的かつ安全に生成するファクトリ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export class RuntimeContextFactory {
  private static counter = 0;

  /**
   * 決定論的な ID（context-1, context-2...）を持つ不変な Context を生成する
   */
  static create(
    name: string,
    sessionId: string,
    description: string,
    state: RuntimeContextState,
    contextVersion: string = '1.0.0',
    version: string = '1.0.0'
  ): Context {
    if (!name) {
      throw new Error('[RuntimeContextFactory] contextName is required');
    }
    if (!sessionId) {
      throw new Error('[RuntimeContextFactory] sessionId is required');
    }
    if (!state) {
      throw new Error('[RuntimeContextFactory] state is required');
    }

    this.counter++;
    const id = `context-${this.counter}`;
    const now = new Date().toISOString();

    const context: Context = {
      contextId: id,
      contextName: name,
      sessionId: sessionId,
      description: description || '',
      contextVersion: contextVersion,
      state: state,
      createdAt: now,
      updatedAt: now,
      version: version
    };

    return Object.freeze(context);
  }

  /**
   * カウンターをリセットする (テスト用)
   */
  static resetCounter(): void {
    this.counter = 0;
  }
}
