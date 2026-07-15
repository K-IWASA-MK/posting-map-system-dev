import { Session, RuntimeSessionState } from './RuntimeSessionRegistry';

/**
 * RuntimeSessionFactory.ts
 * 
 * 不変な Session レコードを決定論的かつ安全に生成するファクトリ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export class RuntimeSessionFactory {
  private static counter = 0;

  /**
   * 決定論的な ID（session-1, session-2...）を持つ不変な Session を生成する
   */
  static create(
    name: string,
    runtimeId: string,
    description: string,
    state: RuntimeSessionState,
    sessionVersion: string = '1.0.0',
    version: string = '1.0.0'
  ): Session {
    if (!name) {
      throw new Error('[RuntimeSessionFactory] sessionName is required');
    }
    if (!runtimeId) {
      throw new Error('[RuntimeSessionFactory] runtimeId is required');
    }
    if (!state) {
      throw new Error('[RuntimeSessionFactory] state is required');
    }

    this.counter++;
    const id = `session-${this.counter}`;
    const now = new Date().toISOString();

    const session: Session = {
      sessionId: id,
      sessionName: name,
      runtimeId: runtimeId,
      description: description || '',
      sessionVersion: sessionVersion,
      state: state,
      createdAt: now,
      updatedAt: now,
      version: version
    };

    return Object.freeze(session);
  }

  /**
   * カウンターをリセットする (テスト用)
   */
  static resetCounter(): void {
    this.counter = 0;
  }
}
