import { Queue, RuntimeQueueState, QueuePriority } from './RuntimeQueueRegistry';

/**
 * RuntimeQueueFactory.ts
 * 
 * 不変な Queue レコードを決定論的かつ安全に生成するファクトリ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export class RuntimeQueueFactory {
  private static counter = 0;

  /**
   * 決定論的な ID（queue-1, queue-2...）を持つ不変な Queue を生成する
   */
  static create(
    name: string,
    contextId: string,
    description: string,
    state: RuntimeQueueState,
    priority: QueuePriority,
    queueVersion: string = '1.0.0',
    version: string = '1.0.0'
  ): Queue {
    if (!name) {
      throw new Error('[RuntimeQueueFactory] queueName is required');
    }
    if (!contextId) {
      throw new Error('[RuntimeQueueFactory] contextId is required');
    }
    if (!state) {
      throw new Error('[RuntimeQueueFactory] state is required');
    }
    if (!priority) {
      throw new Error('[RuntimeQueueFactory] priority is required');
    }

    this.counter++;
    const id = `queue-${this.counter}`;
    const now = new Date().toISOString();

    const queue: Queue = {
      queueId: id,
      queueName: name,
      contextId: contextId,
      description: description || '',
      queueVersion: queueVersion,
      state: state,
      priority: priority,
      createdAt: now,
      updatedAt: now,
      version: version
    };

    return Object.freeze(queue);
  }

  /**
   * カウンターをリセットする (テスト用)
   */
  static resetCounter(): void {
    this.counter = 0;
  }
}
