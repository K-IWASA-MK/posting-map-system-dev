import { Session, RuntimeSessionState } from './RuntimeSessionRegistry';
import { RuntimeRegistry } from './RuntimeRegistry';

/**
 * RuntimeSessionValidator.ts
 * 
 * Session 定義の妥当性および Runtime 参照整合性を検証するバリデータ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export class RuntimeSessionValidator {
  /**
   * Session の定義が正当であるか検証する
   * 不正な場合は例外をスローする
   */
  static validate(session: Session): void {
    if (!session) {
      throw new Error('[RuntimeSessionValidator] Session is empty');
    }

    // 1. Session ID 検証
    if (!session.sessionId || !/^session-\d+$/.test(session.sessionId)) {
      throw new Error(`[RuntimeSessionValidator] Invalid sessionId format: ${session.sessionId}`);
    }

    // 2. Name 検証
    if (!session.sessionName || typeof session.sessionName !== 'string' || session.sessionName.trim() === '') {
      throw new Error('[RuntimeSessionValidator] sessionName is required and must be a non-empty string');
    }

    // 3. State 検証
    if (!session.state || !Object.values(RuntimeSessionState).includes(session.state)) {
      throw new Error(`[RuntimeSessionValidator] Invalid state: ${session.state}`);
    }

    // 4. Version 検証
    if (!session.version || typeof session.version !== 'string' || session.version.trim() === '') {
      throw new Error('[RuntimeSessionValidator] version is required and must be a non-empty string');
    }
    if (!session.sessionVersion || typeof session.sessionVersion !== 'string' || session.sessionVersion.trim() === '') {
      throw new Error('[RuntimeSessionValidator] sessionVersion is required and must be a non-empty string');
    }

    // 5. ISO8601 時刻形式検証
    const iso8601Pattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
    if (!session.createdAt || !iso8601Pattern.test(session.createdAt)) {
      throw new Error(`[RuntimeSessionValidator] Invalid createdAt ISO8601 format: ${session.createdAt}`);
    }
    if (!session.updatedAt || !iso8601Pattern.test(session.updatedAt)) {
      throw new Error(`[RuntimeSessionValidator] Invalid updatedAt ISO8601 format: ${session.updatedAt}`);
    }

    // 6. createdAt <= updatedAt 検証
    const createdTime = new Date(session.createdAt).getTime();
    const updatedTime = new Date(session.updatedAt).getTime();
    if (isNaN(createdTime) || isNaN(updatedTime) || createdTime > updatedTime) {
      throw new Error(`[RuntimeSessionValidator] Invalid session date sequence: createdAt (${session.createdAt}) must be less than or equal to updatedAt (${session.updatedAt})`);
    }

    // 7. Referential Integrity: Runtime 存在検証 (SSOT)
    if (!session.runtimeId) {
      throw new Error('[RuntimeSessionValidator] runtimeId is required');
    }
    const runtime = RuntimeRegistry.get(session.runtimeId);
    if (!runtime) {
      throw new Error(`[RuntimeSessionValidator] Runtime dependency not registered in RuntimeRegistry: ${session.runtimeId}`);
    }
  }
}
