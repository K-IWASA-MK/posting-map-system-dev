import { Task, RuntimeTaskState, RuntimeTaskType } from './RuntimeTaskRegistry';
import { RuntimeQueueRegistry } from './RuntimeQueueRegistry';

/**
 * RuntimeTaskValidator.ts
 * 
 * Task 定義の妥当性および Runtime Queue 参照整合性を検証するバリデータ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export class RuntimeTaskValidator {
  /**
   * Task の定義が正当であるか検証する
   * 不正な場合は例外をスローする
   */
  static validate(task: Task): void {
    if (!task) {
      throw new Error('[RuntimeTaskValidator] Task is empty');
    }

    // 1. Task ID 検証
    if (!task.taskId || !/^task-\d+$/.test(task.taskId)) {
      throw new Error(`[RuntimeTaskValidator] Invalid taskId format: ${task.taskId}`);
    }

    // 2. Name 検証
    if (!task.taskName || typeof task.taskName !== 'string' || task.taskName.trim() === '') {
      throw new Error('[RuntimeTaskValidator] taskName is required and must be a non-empty string');
    }

    // 3. State 検証
    if (!task.taskState || !Object.values(RuntimeTaskState).includes(task.taskState)) {
      throw new Error(`[RuntimeTaskValidator] Invalid state: ${task.taskState}`);
    }

    // 4. Type 検証
    if (!task.taskType || !Object.values(RuntimeTaskType).includes(task.taskType)) {
      throw new Error(`[RuntimeTaskValidator] Invalid type: ${task.taskType}`);
    }

    // 5. Version 検証
    if (!task.version || typeof task.version !== 'string' || task.version.trim() === '') {
      throw new Error('[RuntimeTaskValidator] version is required and must be a non-empty string');
    }
    if (!task.taskVersion || typeof task.taskVersion !== 'string' || task.taskVersion.trim() === '') {
      throw new Error('[RuntimeTaskValidator] taskVersion is required and must be a non-empty string');
    }

    // 6. ISO8601 時刻形式検証
    const iso8601Pattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
    if (!task.createdAt || !iso8601Pattern.test(task.createdAt)) {
      throw new Error(`[RuntimeTaskValidator] Invalid createdAt ISO8601 format: ${task.createdAt}`);
    }
    if (!task.updatedAt || !iso8601Pattern.test(task.updatedAt)) {
      throw new Error(`[RuntimeTaskValidator] Invalid updatedAt ISO8601 format: ${task.updatedAt}`);
    }

    // 7. createdAt <= updatedAt 検証
    const createdTime = new Date(task.createdAt).getTime();
    const updatedTime = new Date(task.updatedAt).getTime();
    if (isNaN(createdTime) || isNaN(updatedTime) || createdTime > updatedTime) {
      throw new Error(`[RuntimeTaskValidator] Invalid task date sequence: createdAt (${task.createdAt}) must be less than or equal to updatedAt (${task.updatedAt})`);
    }

    // 8. Referential Integrity: Queue 存在検証 (SSOT)
    if (!task.queueId) {
      throw new Error('[RuntimeTaskValidator] queueId is required');
    }
    const queue = RuntimeQueueRegistry.get(task.queueId);
    if (!queue) {
      throw new Error(`[RuntimeTaskValidator] Queue dependency not registered in RuntimeQueueRegistry: ${task.queueId}`);
    }
  }
}
