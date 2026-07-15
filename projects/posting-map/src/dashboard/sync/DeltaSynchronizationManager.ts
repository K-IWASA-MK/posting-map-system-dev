/**
 * DeltaSynchronizationManager.ts
 * 
 * イベントデータなどの差分同期（Delta Synchronization）における
 * 同期開始タイムスタンプおよび重複排除用のキー識別情報を追跡・管理する。
 */
export class DeltaSynchronizationManager {
  private lastSyncTimestamp = 0;
  private lastEventId = '';

  constructor(initialTimestamp = Date.now()) {
    this.lastSyncTimestamp = initialTimestamp;
  }

  /**
   * 現在保持している最新の同期タイムスタンプを取得
   */
  getLastSyncTimestamp(): number {
    return this.lastSyncTimestamp;
  }

  /**
   * 現在保持している最新のイベントIDを取得
   */
  getLastEventId(): string {
    return this.lastEventId;
  }

  /**
   * 指定したイベントのタイムスタンプ・ID情報を判定し、
   * 新しいデータであれば同期ポインタ（最終同期タイムスタンプ・ID）を更新する。
   * 
   * @param timestamp 判定対象イベントのタイムスタンプ
   * @param eventId 判定対象イベントの一意識別ID
   * @returns 同期ポインタが更新された（新着として取り込むべき）場合 true、古い・重複データの場合 false
   */
  updatePointer(timestamp: number, eventId: string): boolean {
    if (timestamp < this.lastSyncTimestamp) {
      return false; // すでに同期済みの過去のタイムスタンプ
    }

    if (timestamp === this.lastSyncTimestamp && eventId === this.lastEventId) {
      return false; // 直近同期した同一の重複イベント
    }

    this.lastSyncTimestamp = timestamp;
    this.lastEventId = eventId;
    return true;
  }

  /**
   * 同期ポインタ情報を強制的に初期化・更新する
   */
  resetPointer(timestamp = Date.now(), eventId = ''): void {
    this.lastSyncTimestamp = timestamp;
    this.lastEventId = eventId;
  }
}
