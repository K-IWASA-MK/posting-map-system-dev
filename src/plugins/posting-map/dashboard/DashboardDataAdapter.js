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
  },
  trendData: [25, 38, 55, 48, 72, 88.5],
  logs: [
    { time: '22:45:10', module: 'Simulation', message: 'Local Simulation PASS' },
    { time: '22:43:08', module: 'Quality', message: 'Regression audit PASS' },
    { time: '22:40:01', module: 'Governance', message: 'Boundary protection check active' }
  ],
  turnout: {
    overall: 54.2,
    updatedAt: new Date().toISOString(),
    cities: [
      { city: "津市", turnoutRate: 52.8, status: "Stable" },
      { city: "四日市市", turnoutRate: 55.4, status: "Active" },
      { city: "伊勢市", turnoutRate: 53.0, status: "Stable" }
    ]
  }
};

class DashboardDataAdapter {
  // 'MOCK' または 'API' の切替構造 (本番干渉の論理隔離)
  static DATA_SOURCE = 'MOCK';

  // 定期更新用のログ比較キャッシュ
  static lastLogCache = [];

  /**
   * 概要情報を非同期取得する
   * @returns {Promise<{isSuccess: boolean, statusState: string, errorMessage: string, data: object}>}
   */
  static async fetchSummary() {
    if (this.DATA_SOURCE === 'MOCK') {
      // 擬似非同期ロードを再現してLoading表示と滑らかに連携
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // デバッグ用に、一定確率または特定の秒数で擬似新着ログを注入する
      const mockData = JSON.parse(JSON.stringify(MOCK_FALLBACK_DATA));
      const seconds = new Date().getSeconds();
      if (seconds % 20 === 0) {
        // 20秒周期で擬似新着ログを先頭に注入
        const timestamp = new Date().toLocaleTimeString();
        mockData.logs.unshift({
          time: timestamp,
          module: 'Polling',
          message: `Live update tick dynamic simulated log`
        });
      }

      return {
        isSuccess: true,
        statusState: 'MOCK',
        errorMessage: '',
        data: mockData
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
    if (!data.turnout || typeof data.turnout.overall === 'undefined') return false;

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
    if (raw.trendData) base.trendData = raw.trendData;
    if (raw.logs) base.logs = raw.logs;
    if (raw.turnout) Object.assign(base.turnout, raw.turnout);

    return base;
  }

  /**
   * 最新ログ配列から、キャッシュに存在しない新着ログ項目のみを差分抽出する
   * @param {Array<object>} latestLogs 最新ログ配列
   * @returns {Array<object>} 新着ログのみの配列
   */
  static detectNewLogs(latestLogs) {
    if (!latestLogs || latestLogs.length === 0) return [];

    // 初回はキャッシュ構築のみ行い、新着通知は行わない（画面ロード時のStaggerアニメーションに任せるため）
    if (this.lastLogCache.length === 0) {
      this.lastLogCache = JSON.parse(JSON.stringify(latestLogs));
      return [];
    }

    // キャッシュに同一項目（時間、モジュール、メッセージ）が存在しないものを差分抽出する
    const newLogs = latestLogs.filter(latestItem => {
      return !this.lastLogCache.some(cachedItem => 
        cachedItem.time === latestItem.time &&
        cachedItem.module === latestItem.module &&
        cachedItem.message === latestItem.message
      );
    });

    // キャッシュの更新
    if (newLogs.length > 0) {
      this.lastLogCache = JSON.parse(JSON.stringify(latestLogs));
    }

    return newLogs;
  }
}

// グローバル公開
window.DashboardDataAdapter = DashboardDataAdapter;
