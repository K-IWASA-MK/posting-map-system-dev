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
        sourceType: 'FIELDOPS',
        category: 'field_operation',
        severity: 'INFO',
        action: 'DISTRIBUTION_ACTIVITY',
        message: 'Field Operations Activity: staff-028 distributed volume: 150.',
        payload: {
          staffId: 'staff-028',
          volume: 150,
          details: 'Distributed leaflets in AREA-302'
        }
      },
      {
        category: 'security',
        severity: 'danger',
        message: 'Security validation check failed: token verification latency.',
        details: 'Latency: 1450ms, allowed: 500ms'
      },
      {
        sourceType: 'FIELDOPS',
        category: 'field_operation',
        severity: 'INFO',
        action: 'AREA_MOVEMENT',
        message: 'Field Operations Movement: staff-012 entered AREA-305.',
        payload: {
          staffId: 'staff-012',
          areaId: 'AREA-305',
          details: 'Entered AREA-305 for posting'
        }
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

    const eventId = `EVT_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    if (rawEvent.sourceType === 'FIELDOPS') {
      if (window.FieldOpsEventProvider) {
        window.FieldOpsEventProvider.injectEvent({
          eventId: eventId,
          sourceType: rawEvent.sourceType,
          category: rawEvent.category,
          severity: rawEvent.severity,
          action: rawEvent.action,
          message: rawEvent.message,
          timestamp: new Date().toLocaleTimeString(),
          rawTimestamp: Date.now(),
          payload: rawEvent.payload
        });
      }
    } else {
      window.DashboardEventBus.publishRealtimeEvent({
        eventId: eventId,
        category: rawEvent.category,
        severity: rawEvent.severity,
        message: rawEvent.message,
        details: rawEvent.details,
        timestamp: new Date().toLocaleTimeString(),
        rawTimestamp: Date.now()
      });
    }
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
