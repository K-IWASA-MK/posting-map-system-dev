import { Queue, RuntimeQueueState, QueuePriority } from './RuntimeQueueRegistry';
import { RuntimeContextRegistry } from './RuntimeContextRegistry';

/**
 * RuntimeQueueValidator.ts
 * 
 * Queue 定義の妥当性および Runtime Context 参照整合性を検証するバリデータ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export class RuntimeQueueValidator {
  /**
   * Queue の定義が正当であるか検証する
   * 不正な場合は例外をスローする
   */
  static validate(queue: Queue): void {
    if (!queue) {
      throw new Error('[RuntimeQueueValidator] Queue is empty');
    }

    // 1. Queue ID 検証
    if (!queue.queueId || !/^queue-\d+$/.test(queue.queueId)) {
      throw new Error(`[RuntimeQueueValidator] Invalid queueId format: ${queue.queueId}`);
    }

    // 2. Name 検証
    if (!queue.queueName || typeof queue.queueName !== 'string' || queue.queueName.trim() === '') {
      throw new Error('[RuntimeQueueValidator] queueName is required and must be a non-empty string');
    }

    // 3. State 検証
    if (!queue.state || !Object.values(RuntimeQueueState).includes(queue.state)) {
      throw new Error(`[RuntimeQueueValidator] Invalid state: ${queue.state}`);
    }

    // 4. Priority 検証
    if (!queue.priority || !Object.values(QueuePriority).includes(queue.priority)) {
      throw new Error(`[RuntimeQueueValidator] Invalid priority: ${queue.priority}`);
    }

    // 5. Version 検証
    if (!queue.version || typeof queue.version !== 'string' || queue.version.trim() === '') {
      throw new Error('[RuntimeQueueValidator] version is required and must be a non-empty string');
    }
    if (!queue.queueVersion || typeof queue.queueVersion !== 'string' || queue.queueVersion.trim() === '') {
      throw new Error('[RuntimeQueueValidator] queueVersion is required and must be a non-empty string');
    }

    // 6. ISO8601 時刻形式検証
    const iso8601Pattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
    if (!queue.createdAt || !iso8601Pattern.test(queue.createdAt)) {
      throw new Error(`[RuntimeQueueValidator] Invalid createdAt ISO8601 format: ${queue.createdAt}`);
    }
    if (!queue.updatedAt || !iso8601Pattern.test(queue.updatedAt)) {
      throw new Error(`[RuntimeQueueValidator] Invalid updatedAt ISO8601 format: ${queue.updatedAt}`);
    }

    // 7. createdAt <= updatedAt 検証
    const createdTime = new Date(queue.createdAt).getTime();
    const updatedTime = new Date(queue.updatedAt).getTime();
    if (isNaN(createdTime) || isNaN(updatedTime) || createdTime > updatedTime) {
      throw new Error(`[RuntimeQueueValidator] Invalid queue date sequence: createdAt (${queue.createdAt}) must be less than or equal to updatedAt (${queue.updatedAt})`);
    }

    // 8. Referential Integrity: Context 存在検証 (SSOT)
    if (!queue.contextId) {
      throw new Error('[RuntimeQueueValidator] contextId is required');
    }
    const context = RuntimeContextRegistry.get(queue.contextId);
    if (!context) {
      throw new Error(`[RuntimeQueueValidator] Context dependency not registered in RuntimeContextRegistry: ${queue.contextId}`);
    }
  }
}
