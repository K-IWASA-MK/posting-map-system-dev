import { RuntimeRecord, RuntimeState, RuntimeMode } from './RuntimeRegistry';

/**
 * RuntimeValidator.ts
 * 
 * RuntimeRecord の静的整合性を検証するバリデータ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export class RuntimeValidator {
  /**
   * RuntimeRecord が正当であるか検証する
   * 不正な場合は例外をスローする
   */
  static validate(record: RuntimeRecord): void {
    if (!record) {
      throw new Error('[RuntimeValidator] Record is empty');
    }

    // 1. Runtime ID 検証
    if (!record.runtimeId || !/^runtime-\d+$/.test(record.runtimeId)) {
      throw new Error(`[RuntimeValidator] Invalid runtimeId format: ${record.runtimeId}`);
    }

    // 2. Name 検証
    if (!record.runtimeName || typeof record.runtimeName !== 'string' || record.runtimeName.trim() === '') {
      throw new Error('[RuntimeValidator] runtimeName is required and must be a non-empty string');
    }

    // 3. State 検証
    if (!record.runtimeState || !Object.values(RuntimeState).includes(record.runtimeState)) {
      throw new Error(`[RuntimeValidator] Invalid runtimeState: ${record.runtimeState}`);
    }

    // 4. Mode 検証
    if (!record.runtimeMode || !Object.values(RuntimeMode).includes(record.runtimeMode)) {
      throw new Error(`[RuntimeValidator] Invalid runtimeMode: ${record.runtimeMode}`);
    }

    // 5. Version 検証
    if (!record.version || typeof record.version !== 'string' || record.version.trim() === '') {
      throw new Error('[RuntimeValidator] version is required and must be a non-empty string');
    }

    // 6. ISO8601 時刻形式検証
    const iso8601Pattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
    if (!record.createdAt || !iso8601Pattern.test(record.createdAt)) {
      throw new Error(`[RuntimeValidator] Invalid createdAt ISO8601 format: ${record.createdAt}`);
    }
    if (!record.updatedAt || !iso8601Pattern.test(record.updatedAt)) {
      throw new Error(`[RuntimeValidator] Invalid updatedAt ISO8601 format: ${record.updatedAt}`);
    }
  }
}
