/**
 * DashboardMotion.js
 * 
 * AIOS Observer Dashboard 専用モーション制御コントローラー。
 * データの変更・更新や Kernel の呼び出し・操作は行わず、純粋に表示演出のみを制御する。
 * 
 * 警告：本ファイル内へのデータ変更処理、Kernel 操作、外部 API 通信の追加は厳禁である。
 */

class DashboardMotion {
  /**
   * モーションレイヤーの初期化
   */
  static init() {
    console.log('[Dashboard Motion] モーションコントローラーを初期化します...');
    
    // 1. data-motion 要素を走査してフェード・スライドを実行
    const elements = document.querySelectorAll('[data-motion]');
    elements.forEach(el => {
      const delay = parseInt(el.getAttribute('data-delay') || '0', 10);
      setTimeout(() => {
        el.classList.add('motion-active');
      }, delay);
    });

    // 2. メトリクス数値の Rolling Number アニメーションを開始
    this.startRollingFloat('quality-overall-score', 88.5, ' %');
    this.startRollingInt('knowledge-total', 1420);
    this.startRollingInt('knowledge-official', 1200);
    this.startRollingInt('knowledge-candidate', 220);
    this.startRollingInt('gov-pending', 2);
    this.startRollingInt('gov-approved', 84);
    this.startRollingInt('gov-rejected', 3);
  }

  /**
   * 整数型のドラムロール数値アニメーション
   */
  static startRollingInt(elementId, targetValue) {
    const el = document.getElementById(elementId);
    if (!el) return;

    const start = Math.max(0, targetValue - 30); // 30カウント前から開始
    let current = start;
    const duration = 600; // 600ms
    const steps = targetValue - start;
    if (steps <= 0) {
      el.innerText = targetValue;
      return;
    }
    const stepTime = Math.floor(duration / steps);

    const timer = setInterval(() => {
      current++;
      el.innerText = current;
      if (current >= targetValue) {
        el.innerText = targetValue;
        clearInterval(timer);
      }
    }, Math.max(10, stepTime));
  }

  /**
   * 小数型のドラムロール数値アニメーション
   */
  static startRollingFloat(elementId, targetValue, suffix = '') {
    const el = document.getElementById(elementId);
    if (!el) return;

    const start = Math.max(0, targetValue - 8.0);
    let current = start;
    const steps = 30;
    const stepTime = 20; // 計600ms
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = start + (targetValue - start) * (step / steps);
      el.innerText = `${current.toFixed(1)}${suffix}`;
      if (step >= steps) {
        el.innerText = `${targetValue.toFixed(1)}${suffix}`;
        clearInterval(timer);
      }
    }, stepTime);
  }
}

// グローバルスコープへ公開 (Dashboard.js からロード完了時に呼び出すため)
window.DashboardMotion = DashboardMotion;
