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
   * モーションレイヤーの初期化 (API取得 ──> レンダリング完了後にアタッチ)
   */
  static hasBoundVisibility = false;

  static init() {
    console.log('[Dashboard Motion] モーションコントローラーを初期化します...');
    
    // 視覚的な Visibility 監視の統合
    if (!this.hasBoundVisibility) {
      this.hasBoundVisibility = true;
      document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
    }

    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. data-motion 要素を走査してフェード・スライドを実行
    const elements = document.querySelectorAll('[data-motion]');
    elements.forEach(el => {
      if (isReduced) {
        el.classList.add('motion-active');
      } else {
        const rawDelay = parseInt(el.getAttribute('data-delay') || '0', 10);
        const delay = Math.pow(rawDelay / 100, 1.15) * 80;
        setTimeout(() => {
          el.classList.add('motion-active');
        }, delay);
      }
    });

    // 2. メトリクス数値の Rolling Number アニメーションを開始
    this.startRollingFloat('quality-overall-score', 88.5, ' %');
    this.startRollingInt('knowledge-total', 1420);
    this.startRollingInt('knowledge-official', 1200);
    this.startRollingInt('knowledge-candidate', 220);
    this.startRollingInt('gov-pending', 2);
    this.startRollingInt('gov-approved', 84);
    this.startRollingInt('gov-rejected', 0);

    // 3. SVG 折れ線グラフの Stroke Dash ドローイングアニメーション
    const trendPath = document.querySelector('.trend-line');
    if (trendPath) {
      try {
        const length = trendPath.getTotalLength();
        trendPath.style.strokeDasharray = length;
        trendPath.style.strokeDashoffset = length;
        // リフロー強制 (描画トリガー)
        trendPath.getBoundingClientRect();
        if (isReduced) {
          trendPath.style.transition = 'none';
        } else {
          trendPath.style.transition = 'stroke-dashoffset 1.6s cubic-bezier(0.16, 1, 0.3, 1)';
        }
        trendPath.style.strokeDashoffset = '0';
      } catch (e) {
        console.warn('[Dashboard Motion] SVG線画延長の取得に失敗しました。代替描画を行います:', e.message);
      }
    }

    // 4. 投票率プログレスバー (Turnout fill) のイージングメーター拡張
    const turnoutFills = document.querySelectorAll('.turnout-fill');
    turnoutFills.forEach(fill => {
      const targetWidth = fill.getAttribute('data-target-width') || '0%';
      // 強制リフローによるアニメーション同期
      fill.getBoundingClientRect();
      if (isReduced) {
        fill.style.transition = 'none';
      } else {
        fill.style.transition = 'width 1.6s cubic-bezier(0.16, 1, 0.3, 1)';
      }
      fill.style.width = targetWidth;
    });
  }

  /**
   * 新着ログが差分追加された際のアニメーション演出 (Smooth Scroll & Glow 制御)
   */
  static animateNewLogs() {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const listContainer = document.querySelector('.log-container');
    const newItems = document.querySelectorAll('.new-log-glow');

    newItems.forEach(item => {
      // 1. 出現フェードイン
      item.getBoundingClientRect();
      item.classList.add('motion-active');

      if (isReduced) {
        // Reduced motion 時は Glow 演出をスキップする
        item.classList.remove('new-log-glow');
      } else {
        // 2. 3秒（3000ms）経過後に Glow クラスを除去
        setTimeout(() => {
          item.classList.remove('new-log-glow');
        }, 3000);
      }
    });

    // 3. ログコンテナをスクロール
    if (listContainer) {
      listContainer.scrollTo({
        top: 0,
        behavior: isReduced ? 'auto' : 'smooth'
      });
    }
  }

  /**
   * 整数型のドラムロール数値アニメーション
   */
  static startRollingInt(elementId, targetValue) {
    const el = document.getElementById(elementId);
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.innerText = targetValue;
      return;
    }

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

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.innerText = `${targetValue.toFixed(1)}${suffix}`;
      return;
    }

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

  /**
   * VisibilityState 変更検知時の視覚演出制御
   */
  static handleVisibilityChange() {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) return;

    const isHidden = document.visibilityState === 'hidden';
    console.log(`[Dashboard Motion] VisibilityState変更検知: hidden = ${isHidden}`);

    const gridContainer = document.getElementById('dashboard-grid-container');
    if (gridContainer) {
      if (isHidden) {
        gridContainer.classList.add('motion-paused');
      } else {
        gridContainer.classList.remove('motion-paused');
      }
    }
  }

  /**
   * リアルタイムイベント受信時にカード要素を一時的に発光させる演出
   * @param {HTMLElement} el 対象のカード要素
   */
  static glowCard(el) {
    if (!el) return;
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) return;

    el.classList.add('new-card-glow');
    setTimeout(() => {
      el.classList.remove('new-card-glow');
    }, 1500);
  }

  /**
   * 新着タイムラインアイテムに対するアニメーション・アクセシビリティ適用
   */
  static animateTimeline() {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const items = document.querySelectorAll('.timeline-item-new');
    items.forEach(item => {
      if (isReduced) {
        item.style.opacity = '1';
        item.style.transform = 'none';
        item.style.animation = 'none';
        item.classList.remove('timeline-item-new');
        return;
      }
      
      // アニメーション完了後にクラスを破棄
      setTimeout(() => {
        item.classList.remove('timeline-item-new');
      }, 1500);
    });
  }

  /**
   * 新着相関チェーンに対するアニメーション・アクセシビリティ適用
   */
  static animateCorrelation() {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const items = document.querySelectorAll('.correlation-chain-new');
    items.forEach(item => {
      if (isReduced) {
        item.style.animation = 'none';
        item.style.boxShadow = 'none';
        item.classList.remove('correlation-chain-new');
        return;
      }

      // 演出完了後にクラス破棄
      setTimeout(() => {
        item.classList.remove('correlation-chain-new');
      }, 1500);
    });
  }

  /**
   * 新着関係グラフ項目に対するアニメーション・アクセシビリティ適用
   */
  static animateGraph() {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const items = document.querySelectorAll('.event-graph-item-new');
    items.forEach(item => {
      if (isReduced) {
        item.style.animation = 'none';
        item.style.boxShadow = 'none';
        item.classList.remove('event-graph-item-new');
        return;
      }

      // 演出完了後にクラス破棄
      setTimeout(() => {
        item.classList.remove('event-graph-item-new');
      }, 1500);
    });
  }

  /**
   * 新着ナレッジ項目に対するアニメーション・アクセシビリティ適用
   */
  static animateKnowledge() {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const items = document.querySelectorAll('.knowledge-item-new');
    items.forEach(item => {
      if (isReduced) {
        item.style.opacity = '1';
        item.style.transform = 'none';
        item.style.animation = 'none';
        item.classList.remove('knowledge-item-new');
        return;
      }

      // 演出完了後にクラス破棄
      setTimeout(() => {
        item.classList.remove('knowledge-item-new');
      }, 1500);
    });
  }

  /**
   * 新着インサイト項目に対するアニメーション・アクセシビリティ適用
   */
  static animateInsight() {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const items = document.querySelectorAll('.insight-item-new');
    items.forEach(item => {
      if (isReduced) {
        item.style.opacity = '1';
        item.style.transform = 'none';
        item.style.animation = 'none';
        item.classList.remove('insight-item-new');
        return;
      }

      // 演出完了後にクラス破棄
      setTimeout(() => {
        item.classList.remove('insight-item-new');
      }, 1500);
    });
  }
}

// グローバルスコープへ公開
window.DashboardMotion = DashboardMotion;
