/**
 * DashboardEventTimelineStore.js
 * 
 * リアルタイムイベントを時系列降順に最大 500 件不変保持するデータストア。
 * 
 * 警告：本ファイル内への API 通信、自動対応、コマンド送信ロジックの実装は厳禁である。
 */

class DashboardEventTimelineStore {
  static timeline = [];
  static maxCapacity = 500;

  /**
   * タイムラインイベントを安全に追加し、時系列ソートを行う
   * @param {object} event 
   * @returns {boolean} 追加成功時は true, 重複時などは false
   */
  static add(event) {
    if (!event || !event.eventId) return false;

    // 1. 重複排除
    const isDuplicate = this.timeline.some(item => item.eventId === event.eventId);
    if (isDuplicate) {
      console.warn(`[Dashboard Event Timeline Store] 重複を検知しました。DROP: ${event.eventId}`);
      return false;
    }

    const activeTenantId = (window.DashboardTenantContext && window.DashboardTenantContext.getContext())
      ? window.DashboardTenantContext.getContext().tenantId
      : 'DEFAULT';

    const activeRegionId = (window.DashboardHierarchyContext && window.DashboardHierarchyContext.getContext())
      ? window.DashboardHierarchyContext.getContext().regionId
      : 'DEFAULT';
    const activeAreaId = (window.DashboardHierarchyContext && window.DashboardHierarchyContext.getContext())
      ? window.DashboardHierarchyContext.getContext().areaId
      : 'DEFAULT';

    // 2. スキーマ定義に基づく Object.freeze 不変性担保
    const frozenEvent = Object.freeze({
      tenantId: event.tenantId || activeTenantId,
      regionId: event.regionId || activeRegionId,
      areaId: event.areaId || activeAreaId,
      eventId: event.eventId,
      timestamp: event.timestamp || new Date().toLocaleTimeString(),
      rawTimestamp: event.rawTimestamp || Date.now(),
      category: event.category || 'runtime',
      severity: event.severity || 'INFO',
      message: event.message || '',
      source: event.source || event.sourceType || (event.payload && event.payload.source) || 'Kernel',
      payload: event.payload ? Object.freeze({ ...event.payload }) : {}
    });

    // 3. 追加
    this.timeline.push(frozenEvent);

    // 4. 時系列降順（新しい順）ソート
    this.sortTimeline();

    // 5. 最大 500 件のスライディングウィンドウ制御
    this.applyCapacityLimit();

    return true;
  }

  /**
   * タイムスタンプ降順にソートする
   */
  static sortTimeline() {
    this.timeline.sort((a, b) => b.rawTimestamp - a.rawTimestamp);
  }

  /**
   * 容量制限 (500件) 超過分の自動切り落とし
   */
  static applyCapacityLimit() {
    if (this.timeline.length > this.maxCapacity) {
      const dropped = this.timeline.splice(this.maxCapacity);
      console.log(`[Dashboard Event Timeline Store] 容量制限 (500件) 超過により ${dropped.length} 件を破棄しました。`);
    }
  }

  /**
   * ストア配列の取得
   */
  static getTimeline() {
    return this.timeline;
  }

  /**
   * ストアのクリア
   */
  static clear() {
    this.timeline = [];
    console.log('[Dashboard Event Timeline Store] タイムラインストアがクリアされました。');
  }
}

// グローバル公開
window.DashboardEventTimelineStore = DashboardEventTimelineStore;
