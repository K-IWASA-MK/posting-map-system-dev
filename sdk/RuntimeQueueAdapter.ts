import { Queue } from './RuntimeQueueRegistry';

/**
 * RuntimeQueueAdapter.ts
 * 
 * Queue レコードを UI 表示用の Immutable な ViewModel へ変換するアダプター。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export interface QueueViewModel {
  readonly id: string;
  readonly name: string;
  readonly contextId: string;
  readonly descriptionText: string;
  readonly queueSpecVersion: string;
  readonly stateLabel: string;
  readonly priorityLabel: string;
  readonly displayName: string;
  readonly createdTimestamp: string;
  readonly updatedTimestamp: string;
}

export class RuntimeQueueAdapter {
  /**
   * Queue レコードを不変な QueueViewModel へ変換する
   */
  static toViewModel(queue: Queue): QueueViewModel {
    if (!queue) {
      throw new Error('[RuntimeQueueAdapter] Queue cannot be empty');
    }

    const viewModel: QueueViewModel = {
      id: queue.queueId,
      name: queue.queueName,
      contextId: queue.contextId,
      descriptionText: queue.description || '',
      queueSpecVersion: queue.queueVersion,
      stateLabel: String(queue.state),
      priorityLabel: String(queue.priority),
      displayName: `Queue: ${queue.queueName} [Priority: ${queue.priority}] (${queue.queueId})`,
      createdTimestamp: queue.createdAt,
      updatedTimestamp: queue.updatedAt
    };

    return Object.freeze(viewModel);
  }
}
