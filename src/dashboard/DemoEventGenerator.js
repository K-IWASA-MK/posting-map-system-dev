/**
 * DemoEventGenerator.js
 * 
 * デモ用の模擬リアルタイムイベントを一定時間ごとに EventBus に配信する独立したイベントプロバイダー。
 * Dashboard.js 等の UI 制御層から完全に分離されており、純粋なイベントソースとして機能する。
 * 
 * 警告：本ファイル内への異常判定、自律改善、推奨アクション、および操作用 UI 等の実装は厳禁である。
 */

class DemoEventGenerator {
  static timer = null;
  static currentIndex = 0;
  static intervalMs = 5000;

  /**
   * デモイベント自動配信の開始
   */
  static start() {
    if (this.timer) return;

    console.log('[Demo Event Generator] デモイベントの自動生成を開始します。間隔:', this.intervalMs, 'ms');
    
    // 初回イベントを少し遅らせて起動
    setTimeout(() => {
      this.generateNext();
    }, 1500);

    this.timer = setInterval(() => {
      this.generateNext();
    }, this.intervalMs);
  }

  /**
   * 模擬イベントの作成と EventBus へのパブリッシュ
   */
  static generateNext() {
    if (!window.DashboardEventBus) {
      console.warn('[Demo Event Generator] DashboardEventBus が存在しないため、イベント生成をスキップします。');
      return;
    }

    const demoEvents = [
      {
        category: 'runtime',
        severity: 'info',
        message: 'Runtime database connection established successfully.',
        details: 'Pool size: 10, timeout: 5000ms'
      },
      {
        category: 'governance',
        severity: 'warning',
        message: 'Governance threshold alert: unexpected rule mutation rate.',
        details: 'Mutation index: 1.45, threshold: 1.00'
      },
      {
        category: 'security',
        severity: 'danger',
        message: 'Security validation check failed: token verification latency.',
        details: 'Latency: 1450ms, allowed: 500ms'
      },
      {
        category: 'runtime',
        severity: 'success',
        message: 'System performance optimization job completed.',
        details: 'Allocated memory optimized: 24.5MB'
      }
    ];

    const rawEvent = demoEvents[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % demoEvents.length;

    // EventBus へイベントを配信 (これが Pipeline 全体を自動で駆動する)
    window.DashboardEventBus.publishRealtimeEvent({
      category: rawEvent.category,
      severity: rawEvent.severity,
      message: rawEvent.message,
      details: rawEvent.details,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 自動配信の停止
   */
  static stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      console.log('[Demo Event Generator] デモイベントの自動生成を停止しました。');
    }
  }
}

// DOM読み込み完了後に自動でデモ生成を駆動
window.addEventListener('DOMContentLoaded', () => {
  DemoEventGenerator.start();
});

// グローバル公開
window.DemoEventGenerator = DemoEventGenerator;
