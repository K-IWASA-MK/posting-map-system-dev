/**
 * Dashboard.js
 * 
 * AIOS Observer Dashboard 用クライアントサイドスクリプト。
 * ローカルのモックJSONデータを読み込み、UIに安全にマッピングする。
 * 
 * 警告：本ファイル内への状態変更処理、自動修正、または本番APIへの接続コードの追加は厳禁である。
 */

// 1. 静的モックデータの定義 (Backend Isolation)
const MOCK_DASHBOARD_DATA = {
  kernelStatus: {
    execution: "Active",
    review: "Idle",
    quality: "Idle",
    learning: "Active",
    governance: "Idle",
    billing: "Active",
    simulation: "Idle"
  },
  quality: {
    overallScore: 88.5,
    reviewResult: "PASS",
    selfReviewResult: "Passed",
    improvementDelta: 4.2
  },
  knowledge: {
    totalKnowledge: 1420,
    officialCount: 1200,
    candidateCount: 220,
    healthScore: 94.6,
    gapCount: 12
  },
  governance: {
    pendingApproval: 2,
    approved: 84,
    rejected: 3,
    auditCount: 89
  },
  billing: {
    licenseStatus: "Authorized",
    subscriptionStatus: "active",
    paymentEventStatus: "Succeeded"
  },
  simulation: {
    lastSimulationResult: "Passed",
    qualityGateResult: "PASS",
    scenarioStatus: "SCN-NORMAL-001 PASS / Boundary Test PASS"
  }
};

class DashboardObserver {
  /**
   * モックデータを読み込みUI要素にマッピングする
   */
  static render(data) {
    console.log('[Dashboard Observer] モックデータをレンダリングしています...');

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
    document.getElementById('sim-last-result').innerText = data.simulation.lastSimulationResult;
    document.getElementById('sim-gate-result').innerText = data.simulation.qualityGateResult;
    document.getElementById('sim-scenario-status').innerText = data.simulation.scenarioStatus;

    // D. Quality Panel Mappings
    document.getElementById('quality-overall-score').innerText = `${data.quality.overallScore} %`;
    document.getElementById('quality-review-result').innerText = data.quality.reviewResult;
    document.getElementById('quality-self-result').innerText = data.quality.selfReviewResult;
    document.getElementById('quality-delta').innerText = `Delta: +${data.quality.improvementDelta}`;

    // E. Knowledge Panel Mappings
    document.getElementById('knowledge-total').innerText = data.knowledge.totalKnowledge;
    document.getElementById('knowledge-official').innerText = data.knowledge.officialCount;
    document.getElementById('knowledge-candidate').innerText = data.knowledge.candidateCount;
    document.getElementById('knowledge-health').innerText = `Score: ${data.knowledge.healthScore} %`;

    // F. Governance Panel Mappings
    document.getElementById('gov-pending').innerText = data.governance.pendingApproval;
    document.getElementById('gov-approved').innerText = data.governance.approved;
    document.getElementById('gov-rejected').innerText = data.governance.rejected;
    document.getElementById('gov-audit').innerText = `Total Audits: ${data.governance.auditCount}`;

    // G. Billing Panel Mappings
    document.getElementById('bill-license').innerText = data.billing.licenseStatus;
    document.getElementById('bill-subscription').innerText = data.billing.subscriptionStatus;
    document.getElementById('bill-payment').innerText = `Last Event: ${data.billing.paymentEventStatus}`;
  }

  /**
   * ステータスバッジのクラス名とテキストを更新する
   * @param {string} elementId 
   * @param {string} status 
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
}

// ページロード完了時にレンダリングを実行
window.addEventListener('DOMContentLoaded', () => {
  DashboardObserver.render(MOCK_DASHBOARD_DATA);
  if (window.DashboardMotion) {
    window.DashboardMotion.init();
  }
});
