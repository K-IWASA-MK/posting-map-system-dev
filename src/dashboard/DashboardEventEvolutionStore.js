/**
 * DashboardEventEvolutionStore.js
 * 
 * 構造変化差分（Evolution Object）を最大 500 件保持するデータストア。
 * 
 * 警告：本ファイル内への API 通信、自動改善、および操作トリガーの実装は厳禁である。
 */

class DashboardEventEvolutionStore {
  static evolutions = [];
  static maxCapacity = 500;

  /**
   * エボリューションオブジェクトを追加する
   * @param {object} evolution 
   * @returns {boolean} 追加成功時は true, 重複時などは false
   */
  static addEvolution(evolution) {
    if (!evolution || !evolution.evolutionId) return false;

    // 1. 重複チェック
    const isDuplicate = this.evolutions.some(e => e.evolutionId === evolution.evolutionId);
    if (isDuplicate) {
      console.warn(`[Dashboard Event Evolution Store] 重複エボリューション登録検知。DROP: ${evolution.evolutionId}`);
      return false;
    }

    // 2. 厳格な不変性（Object.freeze）の適用
    const frozenEvolution = Object.freeze({
      evolutionId: evolution.evolutionId,
      sourceType: evolution.sourceType || 'knowledge',
      sourceId: evolution.sourceId || '',
      previousState: evolution.previousState ? Object.freeze({ ...evolution.previousState }) : null,
      currentState: evolution.currentState ? Object.freeze({ ...evolution.currentState }) : null,
      changeType: evolution.changeType || 'MODIFY',
      timestamp: evolution.timestamp || new Date().toISOString()
    });

    this.evolutions.push(frozenEvolution);

    // 3. 最大保持数（500件）の適用
    this.applyCapacityLimit();

    return true;
  }

  /**
   * 容量上限超過時の切り落とし
   */
  static applyCapacityLimit() {
    if (this.evolutions.length > this.maxCapacity) {
      const dropped = this.evolutions.splice(0, this.evolutions.length - this.maxCapacity);
      console.log(`[Dashboard Event Evolution Store] 容量上限（500件）超過により ${dropped.length} エボリューションを破棄しました。`);
    }
  }

  /**
   * エボリューション一覧の取得
   */
  static getEvolutions() {
    return this.evolutions;
  }

  /**
   * ストアのクリア
   */
  static clear() {
    this.evolutions = [];
    console.log('[Dashboard Event Evolution Store] ストアがクリアされました。');
  }
}

// グローバル公開
window.DashboardEventEvolutionStore = DashboardEventEvolutionStore;
