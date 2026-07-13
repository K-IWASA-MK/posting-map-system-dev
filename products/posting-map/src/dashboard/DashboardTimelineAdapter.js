/**
 * DashboardTimelineAdapter.js
 * 
 * イベントデータから Timeline 表示用の View Model への変換を決定論的に行うモジュール。
 * 
 * 警告：本ファイル内への推論、予測、AI 分析、および優先順位変更ロジックの実装は厳禁である。
 */

class DashboardTimelineAdapter {
  /**
   * Raw イベントオブジェクトを表示用構造に静的マッピング変換する
   * @param {object} event 
   * @returns {object|null}
   */
  static transform(event) {
    if (!event) return null;

    const timeLabel = event.timestamp || new Date().toLocaleTimeString();

    // 重要度（Severity）に応じた CSS クラス名の割り当て
    let severityClass = 'timeline-info';
    if (event.severity === 'CRITICAL') {
      severityClass = 'timeline-critical';
    } else if (event.severity === 'WARNING') {
      severityClass = 'timeline-warning';
    }

    // 表示メッセージの決定
    const displayMessage = event.message || `System event: ${event.type || 'UNKNOWN'}`;

    return {
      timeLabel,
      severityClass,
      displayMessage
    };
  }
}

// グローバル公開
window.DashboardTimelineAdapter = DashboardTimelineAdapter;
