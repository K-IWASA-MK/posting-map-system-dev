/**
 * FieldOpsEventProvider.js
 * 
 * POSTING MAP の現場から発生した活動ログイベントを収集・正規化し、
 * AIOS EventBus へ publish するブリッジプロバイダー。
 * 
 * 警告：本ファイル内への実機DB接続、本番Webhook接続、認証・認可、および配布員への指示ロジックの実装は厳禁である。
 */

class FieldOpsEventProvider {
  /**
   * 現場活動イベントを受け取り、正規化・不変化したうえで Pipeline に供給する
   * @param {object} rawEvent 現場からの生イベントデータ
   * @returns {boolean} 供給成功時 true
   */
  static injectEvent(rawEvent) {
    if (!rawEvent) return false;

    const activeTenantId = (window.DashboardTenantContext && window.DashboardTenantContext.getContext())
      ? window.DashboardTenantContext.getContext().tenantId
      : 'DEFAULT';

    const activeRegionId = (window.DashboardHierarchyContext && window.DashboardHierarchyContext.getContext())
      ? window.DashboardHierarchyContext.getContext().regionId
      : 'DEFAULT';
    const activeAreaId = (window.DashboardHierarchyContext && window.DashboardHierarchyContext.getContext())
      ? window.DashboardHierarchyContext.getContext().areaId
      : 'DEFAULT';

    // スキーマ適合と Object.freeze による不変性保証
    const fieldOpsEvent = Object.freeze({
      eventId: rawEvent.eventId || `evt-field-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      tenantId: rawEvent.tenantId || activeTenantId,
      regionId: rawEvent.regionId || activeRegionId,
      areaId: rawEvent.areaId || activeAreaId,
      sourceType: "FIELDOPS",
      category: "field_operation",
      action: rawEvent.action || "ACTIVITY_LOG",
      timestamp: rawEvent.timestamp || new Date().toLocaleTimeString(),
      rawTimestamp: rawEvent.rawTimestamp || Date.now(),
      payload: Object.freeze({
        staffId: (rawEvent.payload && rawEvent.payload.staffId) || "anonymous-staff",
        volume: (rawEvent.payload && rawEvent.payload.volume) || 0,
        latitude: rawEvent.payload ? rawEvent.payload.latitude : undefined,
        longitude: rawEvent.payload ? rawEvent.payload.longitude : undefined,
        details: (rawEvent.payload && rawEvent.payload.details) || ""
      })
    });

    // EventBus が存在する場合は publishRealtimeEvent してパイプラインに流す
    if (window.DashboardEventBus) {
      window.DashboardEventBus.publishRealtimeEvent(fieldOpsEvent);
      return true;
    } else {
      console.warn("[FieldOps Event Provider] DashboardEventBus が見つからないため、直接 TimelineStore へ注入を試みます。");
      if (window.DashboardEventTimelineStore) {
        return window.DashboardEventTimelineStore.add(fieldOpsEvent);
      }
    }
    return false;
  }
}

// グローバル公開
window.FieldOpsEventProvider = FieldOpsEventProvider;
