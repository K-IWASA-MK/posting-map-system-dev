import { RuntimeQueueValidator } from './RuntimeQueueValidator';

/**
 * RuntimeQueueRegistry.ts
 * 
 * Development OS における処理待ちキューの状態および定義を一元管理する不変レジストリ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum RuntimeQueueState {
  CREATED = 'CREATED',
  WAITING = 'WAITING',
  READY = 'READY',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum QueuePriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface Queue {
  readonly queueId: string;
  readonly queueName: string;
  readonly contextId: string;
  readonly description: string;
  readonly queueVersion: string;
  readonly state: RuntimeQueueState;
  readonly priority: QueuePriority;
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

export class RuntimeQueueRegistry {
  private static registry: Map<string, Queue> = new Map();

  // レジストリメタデータの定義
  public static readonly metadata: RegistryMetadata = Object.freeze({
    registryId: 'reg-runtime-queue-01',
    registryVersion: '1.0.0',
    createdAt: new Date('2026-07-09T10:20:00Z').toISOString(),
    updatedAt: new Date('2026-07-09T10:20:00Z').toISOString()
  });

  /**
   * Queue を登録する
   */
  static register(queue: Queue): void {
    if (!queue) {
      throw new Error('[RuntimeQueueRegistry] Queue cannot be empty');
    }
    if (!queue.queueId) {
      throw new Error('[RuntimeQueueRegistry] queueId is required');
    }
    if (!queue.queueName) {
      throw new Error('[RuntimeQueueRegistry] queueName is required');
    }

    // ID重複チェック
    if (this.registry.has(queue.queueId)) {
      throw new Error(`[RuntimeQueueRegistry] Queue ID already registered: ${queue.queueId}`);
    }

    // 名前重複チェック
    for (const item of this.registry.values()) {
      if (item.queueName === queue.queueName) {
        throw new Error(`[RuntimeQueueRegistry] Queue Name already registered: ${queue.queueName}`);
      }
    }

    // バリデーションの実行
    RuntimeQueueValidator.validate(queue);

    // 完全な不変性を担保して格納
    this.registry.set(queue.queueId, Object.freeze({
      ...queue
    }));
  }

  /**
   * IDから Queue を取得する
   */
  static get(id: string): Queue | undefined {
    return this.registry.get(id);
  }

  /**
   * Context ID から関連する Queue のリストを検索する
   */
  static findByContext(contextId: string): Queue[] {
    const results: Queue[] = [];
    for (const queue of this.registry.values()) {
      if (queue.contextId === contextId) {
        results.push(queue);
      }
    }
    return results;
  }

  /**
   * すべての Queue を取得する
   */
  static findAll(): Queue[] {
    return Array.from(this.registry.values());
  }

  /**
   * レジストリをクリアする (テスト用)
   */
  static clear(): void {
    this.registry.clear();
  }
}
