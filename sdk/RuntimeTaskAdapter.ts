import { Task } from './RuntimeTaskRegistry';

/**
 * RuntimeTaskAdapter.ts
 * 
 * Task レコードを UI 表示用の Immutable な ViewModel へ変換するアダプター。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export interface TaskViewModel {
  readonly id: string;
  readonly name: string;
  readonly queueId: string;
  readonly descriptionText: string;
  readonly taskSpecVersion: string;
  readonly stateLabel: string;
  readonly typeLabel: string;
  readonly displayName: string;
  readonly createdTimestamp: string;
  readonly updatedTimestamp: string;
}

export class RuntimeTaskAdapter {
  /**
   * Task レコードを不変な TaskViewModel へ変換する
   */
  static toViewModel(task: Task): TaskViewModel {
    if (!task) {
      throw new Error('[RuntimeTaskAdapter] Task cannot be empty');
    }

    const viewModel: TaskViewModel = {
      id: task.taskId,
      name: task.taskName,
      queueId: task.queueId,
      descriptionText: task.description || '',
      taskSpecVersion: task.taskVersion,
      stateLabel: String(task.taskState),
      typeLabel: String(task.taskType),
      displayName: `Task: ${task.taskName} [Type: ${task.taskType}] (${task.taskId})`,
      createdTimestamp: task.createdAt,
      updatedTimestamp: task.updatedAt
    };

    return Object.freeze(viewModel);
  }
}
