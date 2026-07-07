/**
 * DashboardRenderer.js
 * 
 * コンポーネントマウント＆配置制御レンダラー。
 * データの取得や状態計算は行わず、Props データを各コンポーネントへ引き渡して DOM へ一元描画する。
 */

class DashboardRenderer {
  /**
   * 正規化されたデータを受け取り、対応する各ビジュアルコンポーネントを DOM へ一元マウントする
   * @param {object} data 正規化されたデータ構造 (DashboardDataAdapter)
   */
  static render(data) {
    const gridContainer = document.getElementById('dashboard-grid-container');
    if (!gridContainer) {
      console.warn('[Dashboard Renderer] マウントターゲット (#dashboard-grid-container) が見つかりません。');
      return;
    }

    console.log('[Dashboard Renderer] コンポーネント群をレンダリングしています...');

    let html = '';

    // 1. Kernel Status Card
    html += window.StatusCard.render({
      title: 'Kernel Status',
      delay: 150,
      statusMap: data.kernelStatus
    });

    // 2. Simulation Quality Gate Card
    html += window.SimulationCard.render({
      lastRun: data.simulation.lastRun,
      passed: data.simulation.passed,
      failed: data.simulation.failed,
      delay: 200
    });

    // 3. Quality Metrics Card
    html += window.MetricCard.render({
      qualityScore: data.quality.qualityScore,
      reviewCount: data.quality.reviewCount,
      improvementDelta: data.quality.improvementDelta,
      delay: 250
    });

    // 4. Knowledge Metrics Card
    html += window.KnowledgeCard.render({
      knowledgeTotal: data.knowledge.knowledgeTotal,
      officialCount: data.knowledge.officialCount,
      candidateCount: data.knowledge.candidateCount || (data.knowledge.knowledgeTotal - data.knowledge.officialCount),
      healthScore: data.knowledge.healthScore,
      gapCount: data.knowledge.gapCount,
      delay: 300
    });

    // 5. Governance Metrics Card
    html += window.GovernanceCard.render({
      pendingApproval: data.governance.pendingApproval,
      approvedCount: data.governance.approvedCount,
      auditCount: data.governance.auditCount,
      delay: 350
    });

    // 6. Billing Metrics Card
    html += window.BillingCard.render({
      licenseStatus: data.billing.licenseStatus,
      subscriptionStatus: data.billing.subscriptionStatus,
      delay: 400
    });

    // 一括インサート (途中状態のチラつき防止)
    gridContainer.innerHTML = html;
  }
}

// グローバル公開
window.DashboardRenderer = DashboardRenderer;
