/**
 * DashboardFieldEvidenceStore.js
 * 
 * 現場履歴ログ (History) から監査証跡 (Evidence) を決定論的に生成・保持するデータストア。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論ロジックの実装は厳禁である。
 */

class DashboardFieldEvidenceStore {
  static evidenceList = [];

  /**
   * タイムライン更新イベントの購読初期化
   */
  static init() {
    if (window.DashboardEventBus) {
      window.DashboardEventBus.on('event-timeline-update', () => {
        this.processEvidence();
      });
    }
  }

  /**
   * 履歴データから監査証跡を決定論的に生成
   */
  static processEvidence() {
    const historyStore = window.DashboardFieldHistoryStore;
    if (!historyStore) {
      this.evidenceList = Object.freeze([]);
      return;
    }

    const historyData = historyStore.getHistoryData();
    const rawHistory = historyData.history || [];

    const groups = {};
    rawHistory.forEach(event => {
      const tenantId = event.tenantId || "DEFAULT";
      const regionId = event.regionId || "DEFAULT";
      const areaId = event.areaId || "DEFAULT";
      const key = `${tenantId}::${regionId}::${areaId}`;
      if (!groups[key]) {
        groups[key] = {
          tenantId,
          regionId,
          areaId,
          eventCount: 0,
          events: []
        };
      }
      groups[key].eventCount++;
      groups[key].events.push(event);
    });

    const evdRecords = Object.keys(groups).map(key => {
      const g = groups[key];
      // 決定論的識別子: evd-${tenantId}-${regionId}-${areaId}
      const evidenceId = `evd-${g.tenantId}-${g.regionId}-${g.areaId}`;
      
      let latestTime = "00:00:00";
      g.events.forEach(e => {
        if (e.timestamp && e.timestamp > latestTime) {
          latestTime = e.timestamp;
        }
      });

      return Object.freeze({
        evidenceId,
        tenantId: g.tenantId,
        regionId: g.regionId,
        areaId: g.areaId,
        eventCount: g.eventCount,
        generatedTime: latestTime
      });
    });

    this.evidenceList = Object.freeze(evdRecords);
  }

  /**
   * 証跡データを取得する
   * @returns {array} Immutable Evidence Records Array
   */
  static getEvidenceData() {
    if (this.evidenceList.length === 0) {
      this.processEvidence();
    }
    return this.evidenceList;
  }
}

// グローバル公開と初期化
window.DashboardFieldEvidenceStore = DashboardFieldEvidenceStore;
if (typeof window !== 'undefined') {
  DashboardFieldEvidenceStore.init();
}
