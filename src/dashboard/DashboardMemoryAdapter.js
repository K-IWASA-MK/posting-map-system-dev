/**
 * DashboardMemoryAdapter.js
 * 
 * メモリオブジェクトを表示用ビューモデルへマッピングするアダプター。
 */

class DashboardMemoryAdapter {
  /**
   * メモリオブジェクトを表示用モデルにマッピングする
   * @param {object} mem 
   * @returns {object} ビューモデル
   */
  static adapt(mem) {
    if (!mem) return null;

    const category = (mem.category || 'runtime').toUpperCase();
    const saveState = `ARCHIVED SNAPSHOT (${mem.sourceType.toUpperCase()})`;
    const referenceText = `Ref ID: ${mem.sourceId} (${mem.referenceIds.length} references)`;

    const snapshot = mem.snapshot || {};
    const historicalDataText = `Signature: ${snapshot.signature || 'N/A'}\nCount: ${snapshot.occurrenceCount || 0}\nLast: ${snapshot.lastObserved || 'N/A'}`;

    return {
      memoryId: mem.memoryId,
      saveState,
      referenceText,
      historicalDataText,
      timeText: mem.createdAt || 'N/A',
      category
    };
  }
}

// グローバル公開
window.DashboardMemoryAdapter = DashboardMemoryAdapter;
