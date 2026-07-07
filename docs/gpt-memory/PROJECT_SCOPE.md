# Project Scope & Default Environment (SSOT)

## 📍 1. Current Default Tenant
- **Tenant ID**: `MIE-03`
- **Branch ID**: `MIE-03`
- **Branch Name**: `三重第3支部` (Display Name)
- **District**: `三重県 第3区`

## 📍 2. Tenant Abstraction Rules
- Always avoid hardcoding specific Tenant IDs (like `MIE-03` or `AICHI-05`) directly in application logic.
- Use the configuration layers (`CONFIG` object in frontend `config.js` and backend `v2_config.gs`) to lookup settings dynamically.
- The standard testing environment is default-mapped to `MIE-03`, but the system must be fully compatible with any generic tenant IDs (e.g. `AICHI-05`, `GIFU-02`, `SHIZUOKA-01`).

## 📍 3. AIOS 開発ロードマップ (Roadmap)

### 現在のスプリント: AIOS Dashboard Activity Log Auto-Scroll & Polling Foundation [現在のフェーズ]
* **目的**: ダッシュボードの時系列活動ログにおける自動スクロール演出、およびポーリング（一定間隔でのAPI読み込み更新）の論理構造と安全な統合設計・構築を行う。`DashboardEventBus` を介した疎結合更新通信と、`DashboardPollingController` による指数バックオフ障害制御を完結する。
* **今回実装するもの (対象)**:
  - ✅ 新規仕様定義 (DashboardPolling, ActivityLogAutoScroll, DashboardRealtimeFlow)
  - ✅ イベント仲介実装 (`src/dashboard/DashboardEventBus.js`): 疎結合 Publish/Subscribe 仲介
  - ✅ ポーリング制御実装 (`src/dashboard/DashboardPollingController.js`): setTimeout 定期 GET、指数バックオフ再試行制限
  - ✅ ログコンポーネント更新 (`src/dashboard/components/ActivityLogCard.js`): 差分 Prepend 用の renderItem 追記
  - ✅ レンダラー更新 (`DashboardRenderer.js`): EventBus ログ・更新イベントの購読と差分 DOM インサート
  - ✅ ロジック・モーション更新 (`Dashboard.js`, `DashboardMotion.js`): ポーリング開始、新着ログ追加時の Smooth Scroll と一定時間後の Glow 消灯演出
  - ✅ データアダプター更新 (`DashboardDataAdapter.js`): ログ差分抽出用補助メソッド (detectNewLogs)
  - ✅ 既存仕様（KernelDashboard.md, AGENTS.md, PROJECT_SCOPE.md）の対応追加
* **今回実装しないもの (対象外)**:
  - ❌ `POST`, `PUT`, `PATCH`, `DELETE` 等の書き込み通信リクエスト
  - ❌ ログコンポーネント内からの直接 API 呼び出し、およびログの削除や並べ替えなどの操作 UI (button/select等)
  - ❌ 自動バックオフ以外での Kernel パラメータの上書きや自動修復プロセスのトリガー

### 次期フェーズ: AIOS Dashboard Turnout component
* **目的**: 市別投票率の進捗バー表示専用ビジュアルコンポーネントの設計と構築。

### 将来フェーズ: ダッシュボード開発ロードマップ (Dashboard Development Sequence)
* **目的**: モックデータを用いてDashboardのアニメーション、および操作性のモックを完成させる。
* **要件**: モックデータは、将来の実データ接続時に容易にJSON差し替えが行えるよう、**データ構造とUI描画ロジックを完全に分離（疎結合）**して設計する。

#### 開発手順 (Implementation Order)
1. **骨格 (Skeleton)**  
   * ✅ 完成条件: Header, Sidebar, Main Grid, 100vhレイアウト, Glass Cards of 基礎構造の作成。中身は空で良く、余白・高さ・視線誘導のみをレビュー対象とする。
2. **アニメーションファースト (Motion First)**  
   * ✅ 完成条件: 画面読み込み時のFade, Slide, Glassトランジション、およびLIVEインジケーターのゆっくりとした呼吸アニメーション（Pulse）の実装。開いた瞬間の「気持ちよさ」を追求する。
3. **実績値表示 (KPI)**  
   * ✅ 完成条件: 活動人数、新規活動人数、保有枚数を表示。KPI更新時のRolling Number（ドラムロールエフェクト）の実装。
4. **活動推移グラフ (Activity Trend - 主役)**  
   * ✅ 完成条件: SVGによる折れ線グラフの描画。Hover時のガイドライン（Hover Line）、アクティブデータポイントの発光（Point Glow: `#EA5F08`）、およびGlass Tooltipの実装。
5. **リアルタイム活動ログ (Activity Log)**  
   * ✅ 完成条件: 時系列ログ表示。新着追加時に3秒間オレンジにGlow（発光）するエフェクト。
6. **投票率パネル (Turnout)**  
   * 完成条件: 市別投票率進捗バー of 静かで美しい表示。
7. **極限の微調整 (Polish)**  
   * 完成条件: 余白のミリピクセル調整、グラフ線の太さ、Tooltipの配置、Blur強度の磨き上げ。

* **開発モットー**:
  > **"Don't build a dashboard. Build the place people want to come back to every morning."**
  > (ダッシュボードを作るな。人々が毎朝戻ってきたくなる場所を作れ。)

---

> [!IMPORTANT]
> **AIへの重要命令**:  
> ダッシュボード開発フェーズにおいては、実データ（GAS）への接続コードは一切実装しないこと。すべてモックデータを用いて開発し、デザインシステム（DESIGN_SYSTEM.md）に定義された「滑らかなアニメーション」や「Glass Tooltip」などのUX体験の完成に全力を注ぐこと。
