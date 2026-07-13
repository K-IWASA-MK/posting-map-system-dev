import { EventLogItem } from './DashboardStateModel';

/**
 * EventLogDispatcher.ts
 * 
 * H-App から新しく受信した EventLog を、特定のコンポーネント（MapPanel, AreaDetailPanel など）へ
 * 配信・通知するためのイベントブロードキャストバス（Mediator / Observer）。
 */

export type EventLogListener = (log: EventLogItem) => void;

export class EventLogDispatcher {
  private listeners: EventLogListener[] = [];

  /**
   * 新着イベントログ受信時のコールバックを登録する
   */
  subscribe(listener: EventLogListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * 受信したイベントログをすべての購読者へ配信する
   */
  dispatch(log: EventLogItem): void {
    console.log(`[EventLogDispatcher] Broadcasting incoming event log ID=${log.id} to listeners`);
    this.listeners.forEach(listener => {
      try {
        listener(log);
      } catch (err) {
        console.error('[EventLogDispatcher] Error in subscriber callback:', err);
      }
    });
  }

  /**
   * リセット処理（テスト用）
   */
  reset(): void {
    this.listeners = [];
  }
}
