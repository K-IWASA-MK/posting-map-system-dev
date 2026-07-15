import { Context, RuntimeContextState } from './RuntimeContextRegistry';
import { RuntimeSessionRegistry } from './RuntimeSessionRegistry';

/**
 * RuntimeContextValidator.ts
 * 
 * Context 定義の妥当性および Session 参照整合性を検証するバリデータ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export class RuntimeContextValidator {
  /**
   * Context の定義が正当であるか検証する
   * 不正な場合は例外をスローする
   */
  static validate(context: Context): void {
    if (!context) {
      throw new Error('[RuntimeContextValidator] Context is empty');
    }

    // 1. Context ID 検証
    if (!context.contextId || !/^context-\d+$/.test(context.contextId)) {
      throw new Error(`[RuntimeContextValidator] Invalid contextId format: ${context.contextId}`);
    }

    // 2. Name 検証
    if (!context.contextName || typeof context.contextName !== 'string' || context.contextName.trim() === '') {
      throw new Error('[RuntimeContextValidator] contextName is required and must be a non-empty string');
    }

    // 3. State 検証
    if (!context.state || !Object.values(RuntimeContextState).includes(context.state)) {
      throw new Error(`[RuntimeContextValidator] Invalid state: ${context.state}`);
    }

    // 4. Version 検証
    if (!context.version || typeof context.version !== 'string' || context.version.trim() === '') {
      throw new Error('[RuntimeContextValidator] version is required and must be a non-empty string');
    }
    if (!context.contextVersion || typeof context.contextVersion !== 'string' || context.contextVersion.trim() === '') {
      throw new Error('[RuntimeContextValidator] contextVersion is required and must be a non-empty string');
    }

    // 5. ISO8601 時刻形式検証
    const iso8601Pattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
    if (!context.createdAt || !iso8601Pattern.test(context.createdAt)) {
      throw new Error(`[RuntimeContextValidator] Invalid createdAt ISO8601 format: ${context.createdAt}`);
    }
    if (!context.updatedAt || !iso8601Pattern.test(context.updatedAt)) {
      throw new Error(`[RuntimeContextValidator] Invalid updatedAt ISO8601 format: ${context.updatedAt}`);
    }

    // 6. createdAt <= updatedAt 検証
    const createdTime = new Date(context.createdAt).getTime();
    const updatedTime = new Date(context.updatedAt).getTime();
    if (isNaN(createdTime) || isNaN(updatedTime) || createdTime > updatedTime) {
      throw new Error(`[RuntimeContextValidator] Invalid context date sequence: createdAt (${context.createdAt}) must be less than or equal to updatedAt (${context.updatedAt})`);
    }

    // 7. Referential Integrity: Session 存在検証 (SSOT)
    if (!context.sessionId) {
      throw new Error('[RuntimeContextValidator] sessionId is required');
    }
    const session = RuntimeSessionRegistry.get(context.sessionId);
    if (!session) {
      throw new Error(`[RuntimeContextValidator] Session dependency not registered in RuntimeSessionRegistry: ${context.sessionId}`);
    }
  }
}
