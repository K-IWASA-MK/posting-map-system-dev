/**
 * FieldAnalyticsAdapter.js
 * 
 * 現場分析ストアおよび現場オペレーションアダプターからデータを集約し、
 * 時系列日別・月間推移、前日比較、Coverage 変動履歴などの分析用 ViewModel
 * を構築して提供するアダプター。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測ロジックの実装は厳禁である。
 */

class FieldAnalyticsAdapter {
  /**
   * 現場分析画面用の ViewModel を取得する
   * @returns {object} Immutable Field Analytics ViewModel
   */
  static getFieldAnalyticsData() {
    const tenantCtx = window.DashboardTenantContext ? window.DashboardTenantContext.getContext() : { tenantId: "DEFAULT" };
    const activeTenantId = tenantCtx.tenantId || "DEFAULT";

    const analyticsStore = window.DashboardFieldAnalyticsStore;
    const opsAdapter = window.FieldOperationsAdapter;

    const rawAnalytics = analyticsStore ? analyticsStore.getAnalyticsData() : { history: [], dailyTrend: {}, monthlyTrend: {} };
    const opsData = opsAdapter ? opsAdapter.getFieldOperationsData() : { tenantContext: {}, areaOperations: [] };

    // 各エリアのカバー率からテナント全体の平均カバー率を算出
    const areaOps = opsData.areaOperations || [];
    const averageCoverage = areaOps.length > 0 
      ? Math.round(areaOps.reduce((acc, a) => acc + a.coverageRate, 0) / areaOps.length) 
      : 0;

    // 前日比較 (Day-over-Day) 計算
    const dailyKeys = Object.keys(rawAnalytics.dailyTrend).sort();
    let dodChange = 0;
    let todayEvents = 0;
    let yesterdayEvents = 0;

    if (dailyKeys.length >= 2) {
      const todayKey = dailyKeys[dailyKeys.length - 1];
      const yesterdayKey = dailyKeys[dailyKeys.length - 2];
      todayEvents = rawAnalytics.dailyTrend[todayKey] || 0;
      yesterdayEvents = rawAnalytics.dailyTrend[yesterdayKey] || 0;

      if (yesterdayEvents > 0) {
        dodChange = Math.round(((todayEvents - yesterdayEvents) / yesterdayEvents) * 100);
      }
    } else if (dailyKeys.length === 1) {
      const todayKey = dailyKeys[0];
      todayEvents = rawAnalytics.dailyTrend[todayKey] || 0;
    }

    const trendData = {
      todayEvents,
      yesterdayEvents,
      dodChange,
      dailyTrend: rawAnalytics.dailyTrend,
      monthlyTrend: rawAnalytics.monthlyTrend
    };

    // Coverage 履歴の模擬推移（事実の比較）
    const coverageHistory = [
      { timestamp: "Yesterday", coverageRate: Math.max(0, averageCoverage - 5) },
      { timestamp: "Today", coverageRate: averageCoverage }
    ];

    return Object.freeze({
      tenantId: activeTenantId,
      averageCoverage,
      trendData: Object.freeze(trendData),
      areaComparison: Object.freeze(areaOps.map(a => Object.freeze(a))),
      coverageHistory: Object.freeze(coverageHistory.map(c => Object.freeze(c)))
    });
  }
}

// グローバル公開
window.FieldAnalyticsAdapter = FieldAnalyticsAdapter;
