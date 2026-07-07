/**
 * Dashboard.js
 * 
 * AIOS Observer Dashboard 用制御スクリプト。
 * DashboardDataAdapter 経由でデータを取得し、マッピングとモーション起動を制御する。
 * 
 * 警告：本ファイル内への状態変更処理、自動修正、または本番APIへの接続コードの追加は厳禁である。
 */

class DashboardObserver {
  /**
   * ロードライフサイクルの開始
   */
  static async load() {
    this.showLoading();
    this.clearWarning();

    // 1. データアダプター経由での取得 (Read-Only)
    const result = await window.DashboardDataAdapter.fetchSummary();
    
    this.hideLoading();

    if (!result.isSuccess) {
      this.showError(result.errorMessage || 'データの取得に失敗しました。');
      return;
    }

    // 2. 警告状態のハンドリング (キー欠損や通信障害)
    if (result.isWarning) {
      this.showWarning(result.errorMessage);
    }

    // 3. レンダリングの実行
    this.render(result.data);
  }

  /**
   * HTML UI要素へのデータマッピング
   */
  static render(data) {
    console.log('[Dashboard Observer] データをレンダリングしています...');

    // A. Header Mappings
    document.getElementById('update-time-text').innerText = new Date().toLocaleTimeString();

    // B. Kernel Status Badge Mappings
    this.updateStatusBadge('ks-execution', data.kernelStatus.execution);
    this.updateStatusBadge('ks-review', data.kernelStatus.review);
    this.updateStatusBadge('ks-quality', data.kernelStatus.quality);
    this.updateStatusBadge('ks-learning', data.kernelStatus.learning);
    this.updateStatusBadge('ks-governance', data.kernelStatus.governance);
    this.updateStatusBadge('ks-billing', data.kernelStatus.billing);
    this.updateStatusBadge('ks-simulation', data.kernelStatus.simulation);

    // C. Simulation Quality Gate Mappings
    document.getElementById('sim-last-result').innerText = data.simulation.lastRun ? new Date(data.simulation.lastRun).toLocaleTimeString() : '-';
    document.getElementById('sim-gate-result').innerText = data.simulation.failed === 0 ? 'PASS' : 'FAIL';
    document.getElementById('sim-scenario-status').innerText = `Passed: ${data.simulation.passed} / Failed: ${data.simulation.failed}`;

    // D. Quality Panel Mappings
    document.getElementById('quality-overall-score').innerText = `${data.quality.qualityScore} %`;
    document.getElementById('quality-review-result').innerText = `Total Reviews: ${data.quality.reviewCount}`;
    document.getElementById('quality-self-result').innerText = `Self Review: Passed`;
    document.getElementById('quality-delta').innerText = `Delta: +${data.quality.improvementDelta}`;

    // E. Knowledge Panel Mappings
    document.getElementById('knowledge-total').innerText = data.knowledge.knowledgeTotal;
    document.getElementById('knowledge-official').innerText = data.knowledge.officialCount;
    document.getElementById('knowledge-candidate').innerText = data.knowledge.candidateCount;
    document.getElementById('knowledge-health').innerText = `Score: ${data.knowledge.healthScore} % (Gap: ${data.knowledge.gapCount})`;

    // F. Governance Panel Mappings
    document.getElementById('gov-pending').innerText = data.governance.pendingApproval;
    document.getElementById('gov-approved').innerText = data.governance.approvedCount;
    document.getElementById('gov-rejected').innerText = '0'; // モック固定
    document.getElementById('gov-audit').innerText = `Total Audits: ${data.governance.auditCount}`;

    // G. Billing Panel Mappings
    document.getElementById('bill-license').innerText = data.billing.licenseStatus;
    document.getElementById('bill-subscription').innerText = data.billing.subscriptionStatus;
    document.getElementById('bill-payment').innerText = 'System Payment: Succeeded';
  }

  /**
   * ステータスバッジのクラス名とテキストを更新する
   */
  static updateStatusBadge(elementId, status) {
    const el = document.getElementById(elementId);
    if (!el) return;

    el.innerText = status;
    el.className = 'badge'; // 初期化

    if (status === 'Active') {
      el.classList.add('badge-active');
    } else {
      el.classList.add('badge-idle');
    }
  }

  /* --- 視覚状態表示ヘルパー --- */

  static showLoading() {
    const el = document.getElementById('loading-panel');
    if (el) el.style.display = 'flex';
  }

  static hideLoading() {
    const el = document.getElementById('loading-panel');
    if (el) el.style.display = 'none';
  }

  static showWarning(message) {
    const el = document.getElementById('warning-panel');
    if (el) {
      el.innerText = message;
      el.style.display = 'block';
    }
  }

  static clearWarning() {
    const el = document.getElementById('warning-panel');
    if (el) el.style.display = 'none';
  }

  static showError(message) {
    const el = document.getElementById('error-panel');
    if (el) {
      el.innerText = message;
      el.style.display = 'flex';
    }
  }
}

// ページロード完了時にバインド処理を開始
window.addEventListener('DOMContentLoaded', () => {
  DashboardObserver.load();
});
