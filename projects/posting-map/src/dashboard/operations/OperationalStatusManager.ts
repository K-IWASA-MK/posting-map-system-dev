/**
 * OperationalStatusManager.ts
 * 
 * ダッシュボードの運用状態管理を担当する。
 * 状態として NORMAL, WARNING, ERROR, OFFLINE, MAINTENANCE をサポートし、
 * 状態遷移時にリスナーへ通知する。
 */

export type OperationalStatus = 'NORMAL' | 'WARNING' | 'ERROR' | 'OFFLINE' | 'MAINTENANCE';

export type StatusListener = (status: OperationalStatus, prevStatus: OperationalStatus) => void;

export class OperationalStatusManager {
  private currentStatus: OperationalStatus = 'NORMAL';
  private listeners: StatusListener[] = [];

  constructor(initialStatus: OperationalStatus = 'NORMAL') {
    this.currentStatus = initialStatus;
  }

  /**
   * 現在のステータスを取得する
   */
  getStatus(): OperationalStatus {
    return this.currentStatus;
  }

  /**
   * ステータスを更新し、リスナーへイベント通知する
   */
  setStatus(status: OperationalStatus): void {
    if (this.currentStatus === status) {
      return;
    }
    const prev = this.currentStatus;
    this.currentStatus = status;
    console.log(`[OperationalStatusManager] Status transitioned: ${prev} -> ${status}`);
    this.listeners.forEach(listener => {
      try {
        listener(status, prev);
      } catch (err) {
        console.error('[OperationalStatusManager] Error in status change callback:', err);
      }
    });
  }

  /**
   * 状態変化イベントを購読する
   */
  subscribe(listener: StatusListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
}
