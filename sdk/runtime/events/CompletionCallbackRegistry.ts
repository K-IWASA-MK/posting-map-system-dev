/**
 * CompletionCallbackRegistry.ts
 * 
 * AIOS Completion Callback Registry
 * 
 * TASK_COMPLETED / TASK_FAILED / TASK_BLOCKED 完了イベント発生時に
 * 外部業務アプリケーション（External Apps 等）へ非同期コールバック通知を行うための共通ハンドラー管理レジストリ。
 */

import { RuntimeEvent, TaskCompletionPayload } from './RuntimeEventModel';

export type CompletionCallbackHandler = (event: RuntimeEvent<TaskCompletionPayload>) => Promise<void> | void;

export class CompletionCallbackRegistry {
  private static handlers: Set<CompletionCallbackHandler> = new Set();
  private static callbackHistory: Array<RuntimeEvent<TaskCompletionPayload>> = [];

  /**
   * 外部業務アプリ用コールバックハンドラーを登録する
   * 返り値として unsubscribe 用関数を返す
   */
  static register(handler: CompletionCallbackHandler): () => void {
    if (typeof handler !== 'function') {
      throw new Error('[CompletionCallbackRegistry] Handler must be a function');
    }
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  /**
   * 特定のコールバックハンドラーの登録を解除する
   */
  static unregister(handler: CompletionCallbackHandler): boolean {
    return this.handlers.delete(handler);
  }

  /**
   * 登録済みコールバックハンドラーの一覧を取得する
   */
  static getHandlers(): readonly CompletionCallbackHandler[] {
    return Object.freeze(Array.from(this.handlers));
  }

  /**
   * 登録された全コールバックへタスク完了イベントを一括非同期通知する
   */
  static async notify(event: RuntimeEvent<TaskCompletionPayload>): Promise<void> {
    this.callbackHistory.push(Object.freeze({ ...event, payload: Object.freeze({ ...event.payload }) }));

    if (this.handlers.size === 0) {
      return;
    }

    const promises: Array<Promise<void>> = [];
    for (const handler of this.handlers) {
      try {
        const res = handler(event);
        if (res && typeof res.then === 'function') {
          promises.push(res);
        }
      } catch (err) {
        console.error('[CompletionCallbackRegistry] Error in completion callback handler:', err);
      }
    }

    if (promises.length > 0) {
      await Promise.allSettled(promises);
    }
  }

  /**
   * ディスパッチ済み履歴を取得する
   */
  static getHistory(): readonly RuntimeEvent<TaskCompletionPayload>[] {
    return Object.freeze([...this.callbackHistory]);
  }

  /**
   * レジストリ状態をクリアする（テスト・初期化用）
   */
  static clear(): void {
    this.handlers.clear();
    this.callbackHistory = [];
  }
}
