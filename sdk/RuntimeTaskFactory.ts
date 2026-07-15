import { Task, RuntimeTaskState, RuntimeTaskType } from './RuntimeTaskRegistry';

/**
 * RuntimeTaskFactory.ts
 * 
 * 不変な Task レコードを決定論的かつ安全に生成するファクトリ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export class RuntimeTaskFactory {
  private static counter = 0;

  /**
   * 決定論的な ID（task-1, task-2...）を持つ不変な Task を生成する
   */
  static create(
    name: string,
    queueId: string,
    taskType: RuntimeTaskType,
    taskState: RuntimeTaskState,
    description: string = '',
    taskVersion: string = '1.0.0',
    version: string = '1.0.0'
  ): Task {
    if (!name) {
      throw new Error('[RuntimeTaskFactory] taskName is required');
    }
    if (!queueId) {
      throw new Error('[RuntimeTaskFactory] queueId is required');
    }
    if (!taskType) {
      throw new Error('[RuntimeTaskFactory] taskType is required');
    }
    if (!taskState) {
      throw new Error('[RuntimeTaskFactory] taskState is required');
    }

    this.counter++;
    const id = `task-${this.counter}`;
    const now = new Date().toISOString();

    const task: Task = {
      taskId: id,
      taskName: name,
      queueId: queueId,
      taskType: taskType,
      taskState: taskState,
      description: description || '',
      taskVersion: taskVersion,
      createdAt: now,
      updatedAt: now,
      version: version
    };

    return Object.freeze(task);
  }

  /**
   * カウンターをリセットする (テスト用)
   */
  static resetCounter(): void {
    this.counter = 0;
  }
}
