/**
 * DashboardEventPatternStore.js
 * 
 * 抽出された繰り返しパターンデータ（Pattern Object）を最大 300 件保持するデータストア。
 * 
 * 警告：本ファイル内への API 通信、推奨・予測生成、および自動対応の実装は厳禁である。
 */

class DashboardEventPatternStore {
  static patterns = [];
  static maxCapacity = 300;

  /**
   * パターンオブジェクトを追加する
   * @param {object} pattern 
   * @returns {boolean} 追加成功時は true, 重複時などは false
   */
  static addPattern(pattern) {
    if (!pattern || !pattern.patternId) return false;

    // 1. 重複チェック
    const isDuplicate = this.patterns.some(p => p.patternId === pattern.patternId);
    if (isDuplicate) {
      console.warn(`[Dashboard Event Pattern Store] 重複パターン登録検知。DROP: ${pattern.patternId}`);
      return false;
    }

    const activeTenantId = (window.DashboardTenantContext && window.DashboardTenantContext.getContext())
      ? window.DashboardTenantContext.getContext().tenantId
      : 'DEFAULT';

    // 2. 厳格な不変性（Object.freeze）の適用
    const frozenPattern = Object.freeze({
      tenantId: pattern.tenantId || activeTenantId,
      patternId: pattern.patternId,
      signature: pattern.signature || '',
      occurrenceCount: pattern.occurrenceCount || 0,
      associatedEvolutionIds: Object.freeze([...(pattern.associatedEvolutionIds || [])]),
      category: pattern.category || 'runtime',
      lastObserved: pattern.lastObserved || new Date().toISOString()
    });

    this.patterns.push(frozenPattern);

    // 3. 最大保持数（300件）の適用
    this.applyCapacityLimit();

    return true;
  }

  /**
   * 容量上限超過時の切り落とし
   */
  static applyCapacityLimit() {
    if (this.patterns.length > this.maxCapacity) {
      const dropped = this.patterns.splice(0, this.patterns.length - this.maxCapacity);
      console.log(`[Dashboard Event Pattern Store] 容量上限（300件）超過により ${dropped.length} パターンを破棄しました。`);
    }
  }

  /**
   * パターン一覧の取得
   */
  static getPatterns() {
    return this.patterns;
  }

  /**
   * ストアのクリア
   */
  static clear() {
    this.patterns = [];
    console.log('[Dashboard Event Pattern Store] ストアがクリアされました。');
  }
}

// グローバル公開
window.DashboardEventPatternStore = DashboardEventPatternStore;
