/**
 * DashboardEventMemoryStore.js
 * 
 * 構造変化パターンおよびエボリューション長期履歴（Memory Object）を最大 1000 件保持するデータストア。
 * 
 * 警告：本ファイル内への API 通信、自己改善の計画生成、予測判定などのインテリジェンスロジックの実装は厳禁である。
 */

class DashboardEventMemoryStore {
  static memories = [];
  static maxCapacity = 1000;

  /**
   * メモリオブジェクトを追加する
   * @param {object} memory 
   * @returns {boolean} 追加成功時は true, 重複時などは false
   */
  static addMemory(memory) {
    if (!memory || !memory.memoryId) return false;

    // 1. 重複チェック
    const isDuplicate = this.memories.some(m => m.memoryId === memory.memoryId);
    if (isDuplicate) {
      console.warn(`[Dashboard Event Memory Store] 重複メモリ登録検知。DROP: ${memory.memoryId}`);
      return false;
    }

    // 2. 厳格な不変性（Object.freeze）の適用
    const frozenMemory = Object.freeze({
      memoryId: memory.memoryId,
      sourceType: memory.sourceType || 'pattern',
      sourceId: memory.sourceId || '',
      snapshot: memory.snapshot ? Object.freeze({ ...memory.snapshot }) : null,
      createdAt: memory.createdAt || new Date().toISOString(),
      category: memory.category || 'runtime',
      referenceIds: Object.freeze([...(memory.referenceIds || [])])
    });

    this.memories.push(frozenMemory);

    // 3. 最大保持数（1000件）の適用
    this.applyCapacityLimit();

    return true;
  }

  /**
   * 容量上限超過時の切り落とし
   */
  static applyCapacityLimit() {
    if (this.memories.length > this.maxCapacity) {
      const dropped = this.memories.splice(0, this.memories.length - this.maxCapacity);
      console.log(`[Dashboard Event Memory Store] 容量上限（1000件）超過により ${dropped.length} メモリレコードを破棄しました。`);
    }
  }

  /**
   * メモリ一覧の取得
   */
  static getMemories() {
    return this.memories;
  }

  /**
   * ストアのクリア
   */
  static clear() {
    this.memories = [];
    console.log('[Dashboard Event Memory Store] ストアがクリアされました。');
  }
}

// グローバル公開
window.DashboardEventMemoryStore = DashboardEventMemoryStore;
