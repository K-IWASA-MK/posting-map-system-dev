/**
 * DashboardTrustStore.js
 * 
 * ガバナンス規約順守メトリクス（TrustAuditRecord）を最大 500 件保持するデータストア。
 * 
 * 警告：本ファイル内への API 通信、推奨生成、自己修復ロジックの実装は厳禁である。
 */

class DashboardTrustStore {
  static auditRecords = [];
  static maxCapacity = 500;

  /**
   * 監査レコードを追加する
   * @param {object} record 
   * @returns {boolean} 成功時 true
   */
  static addRecord(record) {
    if (!record || !record.recordId) return false;

    const activeTenantId = (window.DashboardTenantContext && window.DashboardTenantContext.getContext())
      ? window.DashboardTenantContext.getContext().tenantId
      : 'DEFAULT';

    const frozenRecord = Object.freeze({
      tenantId: record.tenantId || activeTenantId,
      recordId: record.recordId,
      category: record.category || 'observer_boundary',
      metricName: record.metricName || '',
      status: record.status || 'PASS',
      score: record.score !== undefined ? record.score : 100,
      lastChecked: record.lastChecked || new Date().toISOString(),
      details: record.details || ''
    });

    this.auditRecords.push(frozenRecord);
    this.applyCapacityLimit();
    return true;
  }

  static applyCapacityLimit() {
    if (this.auditRecords.length > this.maxCapacity) {
      this.auditRecords.splice(0, this.auditRecords.length - this.maxCapacity);
    }
  }

  /**
   * 監査レコードを取得する
   */
  static getRecords() {
    return this.auditRecords;
  }

  /**
   * ストアをクリアする
   */
  static clear() {
    this.auditRecords = [];
  }
}

// グローバル公開
window.DashboardTrustStore = DashboardTrustStore;
