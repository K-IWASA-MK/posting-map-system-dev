/**
 * DashboardFieldTraceStore.js
 * 
 * 監査ログ (Audit) および履歴ログ (History) からレコード間の関係性 (Traceability) を
 * 決定論的に生成・保持するデータストア。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・原因分析・推論・判断ロジックの実装は厳禁である。
 */

class DashboardFieldTraceStore {
  static traceList = [];

  /**
   * タイムライン更新イベントの購読初期化
   */
  static init() {
    if (window.DashboardEventBus) {
      window.DashboardEventBus.on('event-timeline-update', () => {
        this.processTrace();
      });
    }
  }

  /**
   * 監査データおよび履歴データから追跡対象レコードを決定論的に生成
   */
  static processTrace() {
    const auditStore = window.DashboardFieldAuditStore;
    const historyStore = window.DashboardFieldHistoryStore;
    if (!auditStore || !historyStore) {
      this.traceList = Object.freeze([]);
      return;
    }

    const rawAudit = auditStore.getAuditData() || [];
    const rawHistory = historyStore.getHistoryData().history || [];

    const traceRecords = rawAudit.map(audit => {
      // 決定論的識別子: trc-${auditId}
      const traceId = `trc-${audit.auditId}`;
      
      // テナント、Region、Area が一致する履歴イベント群を抽出
      const matchedEvents = rawHistory.filter(e => 
        e.tenantId === audit.tenantId && 
        e.regionId === audit.regionId && 
        e.areaId === audit.areaId
      );

      const eventIds = matchedEvents.map(e => e.eventId);
      const eventIdsStr = eventIds.length > 0 ? eventIds.join(', ') : '-';

      return Object.freeze({
        traceId,
        auditId: audit.auditId,
        evidenceId: audit.evidenceId,
        historyId: eventIdsStr,
        timelineId: eventIdsStr,
        tenantId: audit.tenantId,
        regionId: audit.regionId,
        areaId: audit.areaId
      });
    });

    this.traceList = Object.freeze(traceRecords);
  }

  /**
   * 追跡データを取得する
   * @returns {array} Immutable Trace Records Array
   */
  static getTraceData() {
    if (this.traceList.length === 0) {
      this.processTrace();
    }
    return this.traceList;
  }
}

// グローバル公開と初期化
window.DashboardFieldTraceStore = DashboardFieldTraceStore;
if (typeof window !== 'undefined') {
  DashboardFieldTraceStore.init();
}
