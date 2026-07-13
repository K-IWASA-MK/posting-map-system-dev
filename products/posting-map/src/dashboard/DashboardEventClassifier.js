/**
 * DashboardEventClassifier.js
 * 
 * イベントタイプをルールベースに則って決定論的にカテゴリ分類するモジュール。
 * 
 * 警告：本ファイル内への AI による予測（AI.predict 等）、自律決定、およびカーネル操作ロジックの実装は厳禁である。
 */

class DashboardEventClassifier {
  /**
   * ルールベースの単純な文字列判定により、イベントを論理カテゴリに分類する
   * @param {string} type イベントタイプ
   * @returns {string} runtime / governance / quality / simulation / trust
   */
  static classify(type) {
    if (!type) return 'runtime';

    const upperType = type.toUpperCase();

    if (upperType.startsWith('KERNEL_')) {
      return 'runtime';
    }
    if (upperType.startsWith('GOVERNANCE_')) {
      return 'governance';
    }
    if (upperType.startsWith('QUALITY_')) {
      return 'quality';
    }
    if (upperType.startsWith('SIMULATION_')) {
      return 'simulation';
    }
    if (upperType.startsWith('TRUST_') || upperType.includes('BOUNDARY') || upperType.includes('ALERT')) {
      return 'trust';
    }

    return 'runtime'; // デフォルト分類
  }
}

// グローバル公開
window.DashboardEventClassifier = DashboardEventClassifier;
