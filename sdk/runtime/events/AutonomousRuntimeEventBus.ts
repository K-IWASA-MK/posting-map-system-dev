/**
 * AutonomousRuntimeEventBus.ts
 * 
 * AIOS Autonomous Runtime Event Bus
 * 
 * タスク自律制御・通知連携のための実働イベントバス実装。
 * スリープ・ブロックを行わず非同期イベント配送と型安全なサブスクライバー管理を担保する。
 */

import { RuntimeEvent, RuntimeEventType } from './RuntimeEventModel';

export type EventSubscriber<T = any> = (event: RuntimeEvent<T>) => Promise<void> | void;

export class AutonomousRuntimeEventBus {
  private static subscribers: Map<RuntimeEventType, Set<EventSubscriber>> = new Map();
  private static history: RuntimeEvent[] = [];

  /**
   * 特定の RuntimeEventType に対するリスナーを登録する
   */
  static subscribe<T = any>(type: RuntimeEventType, subscriber: EventSubscriber<T>): () => void {
    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, new Set());
    }
    const set = this.subscribers.get(type)!;
    set.add(subscriber);

    // Unsubscribe callback
    return () => {
      set.delete(subscriber);
    };
  }

  /**
   * イベントを発行し、登録されたすべてのサブスクライバーへ非同期配送する
   */
  static async publish<T = any>(event: RuntimeEvent<T>): Promise<void> {
    const frozenEvent = Object.freeze({ ...event, payload: Object.freeze({ ...event.payload }) });
    this.history.push(frozenEvent);

    const set = this.subscribers.get(event.type);
    if (!set || set.size === 0) {
      return;
    }

    const promises: Array<Promise<void>> = [];
    for (const sub of set) {
      try {
        const res = sub(frozenEvent);
        if (res && typeof res.then === 'function') {
          promises.push(res);
        }
      } catch (err) {
        console.error(`[AutonomousRuntimeEventBus] Error in subscriber for event ${event.type}:`, err);
      }
    }

    if (promises.length > 0) {
      await Promise.allSettled(promises);
    }
  }

  /**
   * 特定イベントのサブスクライバー数が登録されているか取得する
   */
  static getSubscriberCount(type: RuntimeEventType): number {
    return this.subscribers.get(type)?.size || 0;
  }

  /**
   * 発行済みイベントの不変履歴を取得する
   */
  static getEventHistory(): readonly RuntimeEvent[] {
    return Object.freeze([...this.history]);
  }

  /**
   * サブスクライバーおよび履歴をクリアする（テスト・初期化用）
   */
  static clear(): void {
    this.subscribers.clear();
    this.history = [];
  }
}
