/**
 * DashboardPatternAdapter.js
 * 
 * パターンオブジェクトを表示用ビューモデルへマッピングするアダプター。
 */

class DashboardPatternAdapter {
  /**
   * パターンオブジェクトを表示用モデルにマッピングする
   * @param {object} pat 
   * @returns {object} ビューモデル
   */
  static adapt(pat) {
    if (!pat) return null;

    const signature = pat.signature || 'SIG_UNKNOWN';
    const parts = signature.split('_');
    const source = parts[1] || 'UNKNOWN';
    const action = parts[2] || 'CHANGE';

    const patternName = `Recurrent ${action} pattern detected in ${source}`;
    const frequencyText = `Frequency: ${pat.occurrenceCount} times`;

    return {
      patternId: pat.patternId,
      patternName,
      source,
      frequencyText,
      lastObservedText: pat.lastObserved || 'N/A',
      category: (pat.category || 'runtime').toUpperCase()
    };
  }
}

// グローバル公開
window.DashboardPatternAdapter = DashboardPatternAdapter;
