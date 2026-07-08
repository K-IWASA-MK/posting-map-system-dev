/**
 * DashboardEventCorrelationStore.js
 * 
 * 生成された相関チェーン（Correlation Chain）データを最大 200 件保持するデータストア。
 * 
 * 警告：本ファイル内への API 通信、自動承認、異常判定、推奨生成ロジックの実装は厳禁である。
 */

class DashboardEventCorrelationStore {
  static correlations = [];
  static maxCapacity = 200;

  /**
   * 相関チェーンオブジェクトを安全に追加する
   * @param {object} correlation 
   * @returns {boolean} 追加成功時は true, 重複時などは false
   */
  static addCorrelation(correlation) {
    if (!correlation || !correlation.correlationId) return false;

    // 1. 重複追加チェック
    const isDuplicate = this.correlations.some(item => item.correlationId === correlation.correlationId);
    if (isDuplicate) {
      console.warn(`[Dashboard Event Correlation Store] 重複登録を検知。DROP: ${correlation.correlationId}`);
      return false;
    }

    // 2. 厳格な不変性（Object.freeze）の適用
    const frozenCorrelation = Object.freeze({
      correlationId: correlation.correlationId,
      eventIds: Object.freeze([...(correlation.eventIds || [])]),
      category: correlation.category || 'runtime',
      timeRange: correlation.timeRange || '',
      relationType: correlation.relationType || 'TEMPORAL_SEQUENCE' // TEMPORAL_SEQUENCE, CATEGORY_GROUP, SOURCE_GROUP 固定値
    });

    this.correlations.push(frozenCorrelation);

    // 3. 最大 200 チェーンのスライディングウィンドウ制御
    this.applyCapacityLimit();

    return true;
  }

  /**
   * 最大容量超過分の切り落とし
   */
  static applyCapacityLimit() {
    if (this.correlations.length > this.maxCapacity) {
      const dropped = this.correlations.splice(0, this.correlations.length - this.maxCapacity);
      console.log(`[Dashboard Event Correlation Store] 容量上限（200件）超過により ${dropped.length} チェーンを破棄しました。`);
    }
  }

  /**
   * 相関チェーンリストの取得
   */
  static getCorrelations() {
    return this.correlations;
  }

  /**
   * ストアのクリア
   */
  static clear() {
    this.correlations = [];
    console.log('[Dashboard Event Correlation Store] ストアがクリアされました。');
  }
}

// グローバル公開
window.DashboardEventCorrelationStore = DashboardEventCorrelationStore;
