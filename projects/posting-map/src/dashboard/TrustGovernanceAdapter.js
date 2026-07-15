/**
 * TrustGovernanceAdapter.js
 * 
 * DashboardTrustStore のデータおよび TenantContext を集約し、
 * 不変なガバナンス・ビュー用モデル（Object.freeze）へ変換するアダプター。
 * 
 * 警告：本ファイル内への API 通信、認証認可チェック、Stripe接続ロジックの実装は厳禁である。
 */

class TrustGovernanceAdapter {
  /**
   * 現在のテナント情報を取得する
   * @returns {object} Immutable Tenant Context
   */
  static getTenantContext() {
    return window.DashboardTenantContext ? window.DashboardTenantContext.getContext() : Object.freeze({
      tenantId: "DEFAULT",
      tenantName: "DEFAULT BRANCH",
      environment: "SIMULATION"
    });
  }

  /**
   * 最新の監査レコードを集計してビュー用データオブジェクトを生成する
   * @returns {object} Immutable Governance View Data
   */
  static getGovernanceData() {
    // 最新メトリクスのビルドを強制同期
    if (window.DashboardTrustBuilder) {
      window.DashboardTrustBuilder.buildAuditMetrics();
    }

    const records = window.DashboardTrustStore ? window.DashboardTrustStore.getRecords() : [];
    const tenant = this.getTenantContext();

    // 順守率 (Compliance Score) の客観的算出: 3項目のスコア平均
    let totalScore = 0;
    if (records.length > 0) {
      const sum = records.reduce((acc, cur) => acc + cur.score, 0);
      totalScore = Math.round(sum / records.length);
    } else {
      totalScore = 100; // レコードなし時は初期完全順守とみなす
    }

    // 総合順守判定 (PASS / NOTICE / FAIL)
    let globalStatus = "PASS";
    if (records.some(r => r.status === "FAIL")) {
      globalStatus = "FAIL";
    } else if (records.some(r => r.status === "NOTICE")) {
      globalStatus = "NOTICE";
    }

    return Object.freeze({
      tenantId: tenant.tenantId,
      tenantName: tenant.tenantName,
      complianceScore: totalScore, // 100点満点表記
      status: globalStatus,
      records: Object.freeze(records.map(r => Object.freeze({ ...r })))
    });
  }
}

// グローバル公開
window.TrustGovernanceAdapter = TrustGovernanceAdapter;
