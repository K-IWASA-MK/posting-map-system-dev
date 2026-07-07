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

### 現在のスプリント: AIOS Dashboard KPI Data Binding Connection Foundation [現在のフェーズ]
* **目的**: ダッシュボードのモック表示から、GAS GET-JSON API（KPI Provider）へ接続する「Read Only KPI Data Binding Connection Layer」へ移行する。GET-JSON 取得の API クライアント（`DashboardAPIClient.js`）を構築し、通信タイムアウトやデータ欠損に対する Mock フォールバック挙動、および UI 状態モデル（LIVE, MOCK, WARNING, OFFLINE）を統合する。
* **今回実装するもの (対象)**:
  - ✅ 新規仕様定義 (DashboardAPIConnection, GASKPIProvider, DashboardConnectionError)
  - ✅ API クライアント実装 (`src/dashboard/DashboardAPIClient.js`): GET のみでの API 取得、Timeout 制限（5000ms）および通信中止
  - ✅ データアダプター更新 (`src/dashboard/DashboardDataAdapter.js`): API クライアント経由へのデータ取得統合、レスポンス検証（Schema Validation）、補完（Normalize）、エラー時の警告・フォールバック
  - ✅ 観測制御 JS ロジック更新 (`Dashboard.js`): `statusState`（LIVE, MOCK, WARNING, OFFLINE）に応じたヘッダーステータスバッジの点灯、およびモーション開始連携
  - ✅ 状態表示 UI 統合 (`DashboardApp.html`): `DashboardAPIClient.js` のスクリプトタグ追加、ステータス文字「LIVE」のマウント
  - ✅ スタイル定義追加 (`Dashboard.css`): WARNING（オレンジ）、OFFLINE（赤）の状態別バッジスタイル
  - ✅ 既存仕様（KernelDashboard.md, DashboardDataBinding.md, AGENTS.md）の対応追加
  - ✅ 現在のスプリント定義（PROJECT_SCOPE.md）の更新
* **今回実装しないもの (対象外)**:
  - ❌ `POST`, `PUT`, `PATCH`, `DELETE` 等の書き込みリクエスト
  - ❌ ダッシュボード UI 上からの Kernel 設定変更、契約決済の変更、Approval または Execute 操作ボタンの追加

### 次期フェーズ: AIOS Dashboard KPI Charts Components
* **目的**: SVG による折れ線グラフ（活動推移）、および新着リアルタイム活動ログなどのグラフ系ビジュアルコンポーネントの設計と構築。

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
   * 完成条件: SVGによる折れ線グラフの描画。Hover時のガイドライン（Hover Line）、アクティブデータポイントの発光（Point Glow: `#EA5F08`）、およびGlass Tooltipの実装。
5. **リアルタイム活動ログ (Activity Log)**  
   * 完成条件: 時系列ログ表示。新着追加時に3秒間オレンジにGlow（発光）するエフェクト。
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
