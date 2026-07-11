import { DashboardStateModel, EventLogItem } from './DashboardStateModel';
import { EventLogDispatcher } from './EventLogDispatcher';

/**
 * HAppEventSubscriber.ts
 * 
 * H-App から新しく受信した EventLog を検知し、
 * DashboardStateModel の状態更新（Immutable再計算）と EventLogDispatcher へのブロードキャストを調整する。
 */
export class HAppEventSubscriber {
  private readonly stateModel: DashboardStateModel;
  private readonly dispatcher: EventLogDispatcher;

  constructor(stateModel: DashboardStateModel, dispatcher: EventLogDispatcher) {
    this.stateModel = stateModel;
    this.dispatcher = dispatcher;
  }

  /**
   * 同期ループまたは外部の LIFF 打刻通知から新着イベントログを受信した際のハンドラ
   */
  handleIncomingEvent(log: EventLogItem): void {
    // 1. DashboardStateModel にデータを追加 (一意性検証と不変状態の再計算が内部で行われます)
    const isAdded = this.stateModel.addIncomingEventLog(log);

    // 2. 新規追加された場合のみ、ディスパッチャーからUIリスナー群へブロードキャスト
    if (isAdded) {
      this.dispatcher.dispatch(log);
    }
  }
}
