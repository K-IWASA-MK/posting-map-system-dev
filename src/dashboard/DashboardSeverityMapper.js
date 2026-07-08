/**
 * DashboardSeverityMapper.js
 * 
 * イベントタイプから重要度（CRITICAL, WARNING, INFO）および UI レベルへの静的マッピングを管理する。
 * 
 * 警告：本ファイル内への統計的分析、複合判定、しきい値評価などのビジネスロジック混入は厳禁である。
 */

class DashboardSeverityMapper {
  /**
   * イベントタイプに紐づく重要度レベルを取得する (完全な静的辞書マッチング)
   * @param {string} type イベントタイプ
   * @returns {string} CRITICAL / WARNING / INFO
   */
  static getSeverity(type) {
    if (!type) return 'INFO';

    const upperType = type.toUpperCase();

    // 1. 最優先 CRITICAL アラート基準
    if (
      upperType === 'TRUST_BOUNDARY_ALERT' ||
      upperType === 'KERNEL_FAILURE' ||
      upperType === 'KERNEL_FATAL_ERROR'
    ) {
      return 'CRITICAL';
    }

    // 2. WARNING アラート基準
    if (
      upperType.endsWith('_FAIL') ||
      upperType.includes('VIOLATION') ||
      upperType.includes('WARNING') ||
      upperType.includes('DRIFT')
    ) {
      return 'WARNING';
    }

    // 3. その他すべては通常 INFO
    return 'INFO';
  }

  /**
   * 重要度レベルに対応する UI アラート表示用クラス文字列（danger, warning, success, info）を取得する
   * @param {string} severity CRITICAL / WARNING / INFO
   * @returns {string}
   */
  static getUiLevel(severity) {
    switch (severity) {
      case 'CRITICAL':
        return 'danger';
      case 'WARNING':
        return 'warning';
      case 'INFO':
        return 'success';
      default:
        return 'info';
    }
  }
}

// グローバル公開
window.DashboardSeverityMapper = DashboardSeverityMapper;
