import { RuntimeTaskValidator } from './RuntimeTaskValidator';

/**
 * RuntimeTaskRegistry.ts
 * 
 * Development OS における最小実行単位（タスク）の状態および定義を一元管理する不変レジストリ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum RuntimeTaskState {
  CREATED = 'CREATED',
  READY = 'READY',
  QUEUED = 'QUEUED',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export enum RuntimeTaskType {
  CAPABILITY = 'CAPABILITY',
  PIPELINE = 'PIPELINE',
  VALIDATION = 'VALIDATION',
  AUDIT = 'AUDIT',
  DOCUMENTATION = 'DOCUMENTATION',
  UTILITY = 'UTILITY'
}

export interface Task {
  readonly taskId: string;
  readonly taskName: string;
  readonly queueId: string;
  readonly taskType: RuntimeTaskType;
  readonly taskState: RuntimeTaskState;
  readonly description: string;
  readonly taskVersion: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly version: string;
}

export interface RegistryMetadata {
  readonly registryId: string;
  readonly registryVersion: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export class RuntimeTaskRegistry {
  private static registry: Map<string, Task> = new Map();

  // レジストリメタデータの定義
  public static readonly metadata: RegistryMetadata = Object.freeze({
    registryId: 'reg-runtime-task-01',
    registryVersion: '1.0.0',
    createdAt: new Date('2026-07-09T10:25:00Z').toISOString(),
    updatedAt: new Date('2026-07-09T10:25:00Z').toISOString()
  });

  /**
   * Task を登録する
   */
  static register(task: Task): void {
    if (!task) {
      throw new Error('[RuntimeTaskRegistry] Task cannot be empty');
    }
    if (!task.taskId) {
      throw new Error('[RuntimeTaskRegistry] taskId is required');
    }
    if (!task.taskName) {
      throw new Error('[RuntimeTaskRegistry] taskName is required');
    }

    // ID重複チェック
    if (this.registry.has(task.taskId)) {
      throw new Error(`[RuntimeTaskRegistry] Task ID already registered: ${task.taskId}`);
    }

    // 名前重複チェック
    for (const item of this.registry.values()) {
      if (item.taskName === task.taskName) {
        throw new Error(`[RuntimeTaskRegistry] Task Name already registered: ${task.taskName}`);
      }
    }

    // バリデーションの実行
    RuntimeTaskValidator.validate(task);

    // 完全な不変性を担保して格納
    this.registry.set(task.taskId, Object.freeze({
      ...task
    }));
  }

  /**
   * IDから Task を取得する
   */
  static get(id: string): Task | undefined {
    return this.registry.get(id);
  }

  /**
   * Queue ID から関連する Task のリストを検索する
   */
  static findByQueue(queueId: string): Task[] {
    const results: Task[] = [];
    for (const task of this.registry.values()) {
      if (task.queueId === queueId) {
        results.push(task);
      }
    }
    return results;
  }

  /**
   * State から関連する Task のリストを検索する
   */
  static findByState(state: RuntimeTaskState): Task[] {
    const results: Task[] = [];
    for (const task of this.registry.values()) {
      if (task.taskState === state) {
        results.push(task);
      }
    }
    return results;
  }

  /**
   * Type から関連する Task のリストを検索する
   */
  static findByType(type: RuntimeTaskType): Task[] {
    const results: Task[] = [];
    for (const task of this.registry.values()) {
      if (task.taskType === type) {
        results.push(task);
      }
    }
    return results;
  }

  /**
   * すべての Task を取得する
   */
  static findAll(): Task[] {
    return Array.from(this.registry.values());
  }

  /**
   * レジストリをクリアする (テスト用)
   */
  static clear(): void {
    this.registry.clear();
  }
}
