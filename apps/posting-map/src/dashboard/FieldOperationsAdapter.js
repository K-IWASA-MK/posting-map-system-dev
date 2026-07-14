/**
 * FieldOperationsAdapter.js
 * 
 * 現場ストアおよびタイムラインストアのデータと、
 * 親子階層マッピング情報（DashboardTenantIntelligenceStore）を組み合わせ、
 * 決定論的進捗ルールに基づいてエリア別のカバー率（Coverage）とステータスを
 * 算出するビューモデルアダプター。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測ロジックの実装は厳禁である。
 */

class FieldOperationsAdapter {
  /**
   * 現場インテリジェンスオペレーション画面用の ViewModel を取得する
   * @returns {object} Immutable Operations ViewModel
   */
  static getFieldOperationsData() {
    const tenantCtx = window.DashboardTenantContext ? window.DashboardTenantContext.getContext() : { tenantId: "DEFAULT" };
    const intelStore = window.DashboardTenantIntelligenceStore;
    const fieldStore = window.DashboardFieldOperationsStore;
    const timelineStore = window.DashboardEventTimelineStore;

    const activeTenantId = tenantCtx.tenantId || "DEFAULT";

    // 親子階層定義のロード
    const hierarchyMapping = intelStore ? intelStore.getHierarchyMapping() : {};
    const tenantHierarchy = hierarchyMapping[activeTenantId] || {
      regions: [
        {
          regionId: "DEFAULT",
          regionType: "default",
          areas: [
            { areaId: "DEFAULT", areaType: "default" }
          ]
        }
      ]
    };

    // ストアイベントデータのロード
    const allFieldEvents = fieldStore ? fieldStore.getEvents() : [];
    const tenantFieldEvents = allFieldEvents.filter(e => e.tenantId === activeTenantId);

    const allTimelineEvents = timelineStore ? timelineStore.getTimeline() : [];
    const tenantTimelineEvents = allTimelineEvents.filter(e => e.tenantId === activeTenantId);

    const regionSummary = [];
    const areaOperations = [];

    // 各 Region / Area 単位の集計
    tenantHierarchy.regions.forEach(r => {
      const regFieldEvents = tenantFieldEvents.filter(e => e.regionId === r.regionId);
      regionSummary.push({
        regionId: r.regionId,
        fieldEventCount: regFieldEvents.length
      });

      if (r.areas) {
        r.areas.forEach(a => {
          const areaFieldEvents = tenantFieldEvents.filter(e => e.regionId === r.regionId && e.areaId === a.areaId);
          const areaTimelineEvents = tenantTimelineEvents.filter(e => e.regionId === r.regionId && e.areaId === a.areaId);

          // 目標数を 100 とする決定論的カバー率算出
          const targetLimit = 100;
          const eventCount = areaFieldEvents.length;
          const completedCount = Math.min(eventCount, targetLimit);
          const coverageRate = Math.min(Math.round((completedCount / targetLimit) * 100), 100);

          // 決定論的 Status 分類ルール
          let status = 'LOW';
          if (coverageRate >= 80) {
            status = 'COMPLETE';
          } else if (coverageRate >= 50) {
            status = 'NORMAL';
          }

          let lastActivity = '-';
          if (areaFieldEvents.length > 0) {
            const lastEvent = areaFieldEvents[areaFieldEvents.length - 1];
            lastActivity = lastEvent.timestamp || new Date().toLocaleTimeString();
          }

          areaOperations.push({
            areaId: a.areaId,
            fieldEventsCount: eventCount,
            timelineEventsCount: areaTimelineEvents.length,
            completedCount,
            coverageRate,
            lastActivity,
            status
          });
        });
      }
    });

    return Object.freeze({
      tenantContext: Object.freeze({
        tenantId: activeTenantId,
        totalActiveAreas: areaOperations.length,
        totalFieldEvents: tenantFieldEvents.length
      }),
      regionSummary: Object.freeze(regionSummary.map(r => Object.freeze(r))),
      areaOperations: Object.freeze(areaOperations.map(a => Object.freeze(a)))
    });
  }
}

// グローバル公開
window.FieldOperationsAdapter = FieldOperationsAdapter;
