import { DashboardStateModel, EventLogItem } from './DashboardStateModel';
import { HAppConnectionState } from './HAppConnectionState';
import { HAppEventSubscriber } from './HAppEventSubscriber';
import { DashboardDataMapper } from './DashboardDataMapper';
import { DeltaSynchronizationManager } from './sync/DeltaSynchronizationManager';
import { SynchronizationScheduler } from './sync/SynchronizationScheduler';

/**
 * HAppSynchronizationController.ts
 * 
 * H-App から送信された差分 EventLog を定期的に GAS API から取得し、
 * ダッシュボードの状態へと同期させる同期管理クラス（同期用コントローラー）。
 * 同期処理は DeltaSynchronizationManager および SynchronizationScheduler を使用して実行する。
 */
export class HAppSynchronizationController {
  private readonly stateModel: DashboardStateModel;
  private readonly subscriber: HAppEventSubscriber;
  private readonly connectionState: HAppConnectionState;
  private readonly deltaManager: DeltaSynchronizationManager;
  private readonly scheduler: SynchronizationScheduler;

  constructor(
    stateModel: DashboardStateModel,
    subscriber: HAppEventSubscriber,
    connectionState: HAppConnectionState,
    deltaManager = new DeltaSynchronizationManager(),
    scheduler = new SynchronizationScheduler(connectionState)
  ) {
    this.stateModel = stateModel;
    this.subscriber = subscriber;
    this.connectionState = connectionState;
    this.deltaManager = deltaManager;
    this.scheduler = scheduler;
  }

  /**
   * 同期ループ（ポーリング）の開始
   */
  startSyncLoop(tenantId: string, branchId: string, intervalMs = 15000): void {
    // 同期スケジューラを用いて定期処理を設定
    this.scheduler.startScheduler(async () => {
      await this.syncNewEvents(tenantId, branchId);
    }, intervalMs);
  }

  /**
   * 同期ループの停止
   */
  stopSyncLoop(): void {
    this.scheduler.stopScheduler();
  }

  /**
   * GAS API (getEventLog) を用いて差分 EventLog を取得・同期する
   */
  async syncNewEvents(tenantId: string, branchId: string): Promise<void> {
    const client = (this.stateModel as any).client;
    const sinceTimestamp = this.deltaManager.getLastSyncTimestamp();

    // 差分同期の実行
    const response = await client.getEventLog(50, sinceTimestamp);

    if (response.success && response.data) {
      const rawLogs = Array.isArray(response.data.logs) ? response.data.logs : [];

      if (rawLogs.length > 0) {
        // 古い順に処理するためタイムスタンプ昇順ソート
        const mappedLogs: EventLogItem[] = rawLogs
          .map((l: any) => DashboardDataMapper.mapEventLogItem(l))
          .sort((a: EventLogItem, b: EventLogItem) => a.timestamp - b.timestamp);

        mappedLogs.forEach((log: EventLogItem) => {
          // DeltaSynchronizationManager による差分・重複判定
          const isNew = this.deltaManager.updatePointer(log.timestamp, log.id);
          if (isNew) {
            this.subscriber.handleIncomingEvent(log);
          }
        });
      }
      this.connectionState.setState('CONNECTED');
    } else {
      this.connectionState.setState('ERROR');
      throw new Error(response.error?.message || 'Failed to fetch differential event logs.');
    }
  }

  // ゲッター群 (テスト互換用)
  getLastSyncTimestamp(): number {
    return this.deltaManager.getLastSyncTimestamp();
  }

  getLastEventId(): string {
    return this.deltaManager.getLastEventId();
  }
}
