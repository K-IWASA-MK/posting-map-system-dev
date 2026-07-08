/**
 * DashboardCorrelationBuilder.js
 * 
 * イベント群から時間的近接度・カテゴリ共通性を基準にして、
 * 表示用関連モデル（相関チェーン）を抽出・生成するモジュール。
 * 
 * 警告：本ファイル内への因果（causation）推論、原因特定、成功失敗分析、異常検出ロジックの実装は厳禁である。
 */

class DashboardCorrelationBuilder {
  /**
   * イベントリストから相関関係オブジェクトの配列を自動生成する
   * @param {Array} events 時系列イベントリスト
   * @returns {Array} 相関オブジェクトのリスト
   */
  static build(events) {
    if (!events || events.length < 2) return [];

    const correlations = [];

    // 1. ルール：時系列連続（TEMPORAL_SEQUENCE） ─ 発生間隔が 60秒以内の近接イベントを接続
    const sorted = [...events].sort((a, b) => a.rawTimestamp - b.rawTimestamp);
    
    let tempChain = [];
    for (let i = 0; i < sorted.length; i++) {
      const current = sorted[i];
      if (tempChain.length === 0) {
        tempChain.push(current);
      } else {
        const last = tempChain[tempChain.length - 1];
        const diffMs = Math.abs(current.rawTimestamp - last.rawTimestamp);
        
        if (diffMs <= 60000) { // 60秒ルール
          tempChain.push(current);
        } else {
          if (tempChain.length >= 2) {
            correlations.push(this.createChain(tempChain, 'TEMPORAL_SEQUENCE'));
          }
          tempChain = [current];
        }
      }
    }
    if (tempChain.length >= 2) {
      correlations.push(this.createChain(tempChain, 'TEMPORAL_SEQUENCE'));
    }

    // 2. ルール：カテゴリ共通性（CATEGORY_GROUP） ─ 同一カテゴリが3つ以上連続または近接している場合
    const categoryBuckets = {};
    events.forEach(evt => {
      const cat = evt.category || 'runtime';
      if (!categoryBuckets[cat]) {
        categoryBuckets[cat] = [];
      }
      categoryBuckets[cat].push(evt);
    });

    Object.keys(categoryBuckets).forEach(cat => {
      const bucket = categoryBuckets[cat];
      if (bucket.length >= 3) {
        // 同一カテゴリで 3つ以上の関連
        correlations.push(this.createChain(bucket, 'CATEGORY_GROUP', cat));
      }
    });

    return correlations;
  }

  /**
   * 相関チェーンオブジェクトを構築する
   */
  static createChain(chainEvents, relationType, customCategory = null) {
    const eventIds = chainEvents.map(e => e.eventId);
    const startEvent = chainEvents[0];
    const endEvent = chainEvents[chainEvents.length - 1];
    
    const timeRange = `${startEvent.timestamp} - ${endEvent.timestamp}`;
    const category = customCategory || startEvent.category || 'runtime';
    const correlationId = `corr_${relationType}_${startEvent.eventId}_${endEvent.eventId}`;

    return {
      correlationId,
      eventIds,
      category,
      timeRange,
      relationType // TEMPORAL_SEQUENCE / CATEGORY_GROUP / SOURCE_GROUP
    };
  }
}

// グローバル公開
window.DashboardCorrelationBuilder = DashboardCorrelationBuilder;
