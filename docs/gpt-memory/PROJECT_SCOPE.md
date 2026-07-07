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

### 現在のスプリント: AIOS Dashboard KPI Data Binding Foundation [現在のフェーズ]
* **目的**: モック表示から進め、本番接続と論理隔離された状態で AIOS Kernel の Output メトリクスを安全に読み取る「Read Only KPI Data Binding Layer（`DashboardDataAdapter.js`）」を構築する。API 接続エラー時のフォールバック処理や、スキーマ検証、および Loading/Error 状態表示を UI へ統合する。
* **今回実装するもの (対象)**:
  - ✅ 新規仕様定義 (DashboardDataBinding, DashboardDataAdapter, DashboardKPISchema)
  - ✅ データアダプター実装 (`DashboardDataAdapter.js`): GETデータ取得、スキーマ検証、Normalize処理、モックフォールバック
  - ✅ 観測制御 JS ロジック更新 (`Dashboard.js`): アダプター連動、Loading/Error/Warning/Last Updated状態表示、データロード後のモーション開始制御
  - ✅ 状態表示 UI 統合 (`DashboardApp.html`): Loading overlay, Error overlay, Warning banner、DataAdapter スクリプトタグ追加
  - ✅ 状態演出 CSS スタイル追加 (`Dashboard.css`): スピナーアニメーション、Error 表示、Warning banner スタイル
  - ✅ 既存仕様（KernelDashboard.md, DashboardPrototype.md, IntegrationSimulation.md, AGENTS.md）の対応追加
  - ✅ 現在のスプリント定義（PROJECT_SCOPE.md）の更新
* **今回実装しないもの (対象外)**:
  - ❌ `POST`, `PUT`, `PATCH`, `DELETE` メソッドを用いた、状態変更や Kernel トリガー操作等の書き込み通信
  - ❌ ダッシュボード UI 上への Execute, Approve, Reject, Payment などの意思決定・操作用ボタンの配置
  - ❌ ダッシュボード側での KPI 数値や総合判定ロジックの算出・書き換え

### 次期フェーズ: AIOS Dashboard KPI Visual Components
* **目的**: プロトタイプで作成した各パーツ（KPIカード、グラフ、サイドナビ等）を再利用可能な独立コンポーネントとして共通化・整理する。

### 将来フェーズ: ダッシュボード開発ロードマップ (Dashboard Development Sequence)
* **目的**: モックデータを用いてDashboardのアニメーション、および操作性のモックを完成させる。
* **要件**: モックデータは、将来の実データ接続時に容易にJSON差し替えが行えるよう、**データ構造とUI描画ロジックを完全に分離（疎結合）**して設計する。

#### 開発手順 (Implementation Order)
1. **骨格 (Skeleton)**  
   * ✅ 完成条件: Header, Sidebar, Main Grid, 100vhレイアウト, Glass Cards of 基礎構造の作成。中身は空で良く、余白・高さ・視線誘導のみをレビュー対象とする。
2. **アニメーションファースト (Motion First)**  
   * ✅ 完成条件: 画面読み込み時のFade, Slide, Glassトランジション、およびLIVEインジケーターのゆっくりとした呼吸アニメーション（Pulse）の実装。開いた瞬間の「気持ちよさ」を追求する。
3. **実績値表示 (KPI)** [次期フェーズ]
   * 完成条件: 活動人数、新規活動人数、保有枚数を表示。KPI更新時のRolling Number（ドラムロールエフェクト）の実装。
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

### 将来フェーズ (Future Dashboard Phases)
* **フェーズ 2: UI Component化**: プロトタイプで作成した各パーツ（KPIカード、グラフ、サイドナビ等）を再利用可能な独立コンポーネントとして共通化・整理する。
* **フェーズ 3: GAS Connection (JSON取得)**: バックエンド（GAS）と通信させ、ダッシュボード用の集計JSONを取得可能にする。
* **フェーズ 4: リアルデータ反映 ＆ チューニング**: 完成したUIコンポーネントに実データを流し込み、アニメーションの滑らかさやパフォーマンスのチューニングを行う。

---

> [!IMPORTANT]
> **AIへの重要命令**:  
> ダッシュボード開発フェーズにおいては、実データ（GAS）への接続コードは一切実装しないこと。すべてモックデータを用いて開発し、デザインシステム（DESIGN_SYSTEM.md）に定義された「滑らかなアニメーション」や「Glass Tooltip」などのUX体験の完成に全力を注ぐこと。
