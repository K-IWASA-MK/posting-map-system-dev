/**
 * DashboardDataAdapter.js
 * 
 * AIOS Dashboard 用 Read Only データ接続および正規化アダプター。
 * API の状態変更操作、Stripe接続、SS App参照などは一切含まない。
 * 
 * 警告：本ファイル内への書き込み用 API の追加、自動修正ロジックの追加は厳禁である。
 */

// フォールバック用のローカルデータ定義
const MOCK_FALLBACK_DATA = {
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
    qualityScore: 88.5,
    reviewCount: 142,
    improvementDelta: 4.2
  },
  knowledge: {
    knowledgeTotal: 1420,
    officialCount: 1200,
    healthScore: 94.6,
    gapCount: 12,
    mergeCandidates: 5
  },
  governance: {
    pendingApproval: 2,
    approvedCount: 84,
    auditCount: 89
  },
  billing: {
    licenseStatus: "Authorized",
    subscriptionStatus: "active"
  },
  simulation: {
    lastRun: new Date().toISOString(),
    passed: 6,
    failed: 0
  }
};

class DashboardDataAdapter {
  // 'MOCK' または 'API' の切替構造 (本番干渉の論理隔離)
  static DATA_SOURCE = 'MOCK';

  /**
   * 概要情報を非同期取得する
   * @returns {Promise<{isSuccess: boolean, statusState: string, errorMessage: string, data: object}>}
   */
  static async fetchSummary() {
    if (this.DATA_SOURCE === 'MOCK') {
      // 擬似非同期ロードを再現してLoading表示と滑らかに連携
      await new Promise(resolve => setTimeout(resolve, 800));
      return {
        isSuccess: true,
        statusState: 'MOCK',
        errorMessage: '',
        data: MOCK_FALLBACK_DATA
      };
    }

    try {
      // API クライアント経由で取得 (GET のみ、タイムアウト制御あり)
      const rawData = await window.DashboardAPIClient.fetchSummary();

      // スキーマの検証
      if (!this.validateSchema(rawData)) {
        console.warn('[Dashboard Data Adapter] 必須キーが欠落しています。フォールバック正規化を適用します。');
        return {
          isSuccess: true,
          statusState: 'WARNING',
          errorMessage: 'Warning: スキーマ不整合を検知したため、代替値で補完表示しています。',
          data: this.normalize(rawData)
        };
      }

      return {
        isSuccess: true,
        statusState: 'LIVE',
        errorMessage: '',
        data: this.normalize(rawData)
      };

    } catch (error) {
      console.warn('[Dashboard Data Adapter] API接続に失敗したためオフラインフォールバックを作動します:', error.message);
      return {
        isSuccess: true,
        statusState: 'OFFLINE',
        errorMessage: `Offline: ${error.message}。ローカルのオフラインデータを使用中。`,
        data: MOCK_FALLBACK_DATA
      };
    }
  }

  /**
   * KPIスキーマの必須アサーション検証
   * @param {object} data 
   * @returns {boolean}
   */
  static validateSchema(data) {
    if (!data) return false;
    
    // 各コンポーネントキーと重要属性の存在確認
    if (!data.quality || typeof data.quality.qualityScore === 'undefined') return false;
    if (!data.knowledge || typeof data.knowledge.knowledgeTotal === 'undefined') return false;
    if (!data.governance || typeof data.governance.pendingApproval === 'undefined') return false;
    if (!data.billing || typeof data.billing.licenseStatus === 'undefined') return false;
    if (!data.simulation || typeof data.simulation.lastRun === 'undefined') return false;

    return true;
  }

  /**
   * 欠損属性の自動補正と標準化 (Normalize)
   * @param {object} raw 
   * @returns {object}
   */
  static normalize(raw) {
    const base = JSON.parse(JSON.stringify(MOCK_FALLBACK_DATA)); // ディープコピー

    if (raw.kernelStatus) Object.assign(base.kernelStatus, raw.kernelStatus);
    if (raw.quality) Object.assign(base.quality, raw.quality);
    if (raw.knowledge) Object.assign(base.knowledge, raw.knowledge);
    if (raw.governance) Object.assign(base.governance, raw.governance);
    if (raw.billing) Object.assign(base.billing, raw.billing);
    if (raw.simulation) Object.assign(base.simulation, raw.simulation);

    return base;
  }
}

// グローバル公開
window.DashboardDataAdapter = DashboardDataAdapter;
