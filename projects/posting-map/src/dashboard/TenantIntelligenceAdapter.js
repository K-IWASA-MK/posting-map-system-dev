/**
 * TenantIntelligenceAdapter.js
 * 
 * 階層構造定義、テナントコンテキスト、およびイベントタイムラインから、
 * 現在のアクティブなテナントに対応する Region / Area / イベント稼働状況を
 * 排他的にドリルダウン集計するアダプター。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測ロジックの実装は厳禁である。
 */

class TenantIntelligenceAdapter {
  /**
   * 階層観測データを集約・ドリルダウンした ViewModel を取得する
   * @returns {object} Immutable Drilldown Summary Object
   */
  static getTenantIntelligenceData() {
    const tenantCtx = window.DashboardTenantContext ? window.DashboardTenantContext.getContext() : { tenantId: "DEFAULT" };
    const timelineStore = window.DashboardEventTimelineStore;
    const intelStore = window.DashboardTenantIntelligenceStore;

    // 現在対象となるテナントID (未指定時は DEFAULT へフォールバック)
    const activeTenantId = tenantCtx.tenantId || "DEFAULT";

    // 階層定義のロード
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

    // タイムラインイベントの取得
    const timeline = timelineStore ? timelineStore.getTimeline() : [];
    
    // このテナントに関連するイベントのみを隔離抽出
    const tenantEvents = timeline.filter(e => e.tenantId === activeTenantId);

    // 1. tenantSummary
    const regionCount = tenantHierarchy.regions.length;
    const areaCount = tenantHierarchy.regions.reduce((acc, r) => acc + (r.areas ? r.areas.length : 0), 0);
    const tenantSummary = {
      tenantId: activeTenantId,
      tenantType: activeTenantId === "MIE-03" ? "political" : "enterprise",
      regionCount,
      areaCount,
      eventCount: tenantEvents.length
    };

    // 2. regionSummary
    const regionSummary = tenantHierarchy.regions.map(r => {
      const regEvents = tenantEvents.filter(e => e.regionId === r.regionId);
      return {
        regionId: r.regionId,
        regionType: r.regionType,
        areaCount: r.areas ? r.areas.length : 0,
        eventCount: regEvents.length
      };
    });

    // 3. areaSummary
    const areaSummary = [];
    tenantHierarchy.regions.forEach(r => {
      if (r.areas) {
        r.areas.forEach(a => {
          const areaEvents = tenantEvents.filter(e => e.regionId === r.regionId && e.areaId === a.areaId);
          let lastActivity = "-";
          if (areaEvents.length > 0) {
            const lastEvent = areaEvents[areaEvents.length - 1];
            lastActivity = lastEvent.timestamp || new Date().toLocaleTimeString();
          }
          areaSummary.push({
            areaId: a.areaId,
            areaType: a.areaType,
            eventCount: areaEvents.length,
            lastActivity
          });
        });
      }
    });

    // 4. fieldEventSummary
    const fieldOpsEvents = tenantEvents.filter(e => e.source === "FIELDOPS" || e.sourceType === "FIELDOPS");
    const fieldEventSummary = {
      totalFieldEvents: fieldOpsEvents.length,
      standbyStatus: fieldOpsEvents.length > 0 ? "CONNECTED" : "STANDBY"
    };

    return Object.freeze({
      tenantSummary: Object.freeze(tenantSummary),
      regionSummary: Object.freeze(regionSummary.map(r => Object.freeze(r))),
      areaSummary: Object.freeze(areaSummary.map(a => Object.freeze(a))),
      fieldEventSummary: Object.freeze(fieldEventSummary)
    });
  }
}

// グローバル公開
window.TenantIntelligenceAdapter = TenantIntelligenceAdapter;
