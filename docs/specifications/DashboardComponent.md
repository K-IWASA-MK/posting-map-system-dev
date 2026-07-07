# ダッシュボードコンポーネント仕様書 (Dashboard Component Specification)

## 目的
Observer Dashboard 内を構成する各 UI エレメント（コンポーネント）の構造、レイアウト要件、および表示内容の責務境界を規定する。

---

## 各コンポーネントの責務定義 (Component Responsibilities)

### 1. ヘッダーコンポーネント (Header Component)
- **表示内容**:
  - `AIOS Kernel Dashboard` (大見出し)
  - Environment: `LOCAL SIMULATION`
  - System Status: `HEALTHY` (緑色表示)
  - Last Update: データロード完了時のタイムスタンプ
- **レイアウト**: 上部固定。高さ 70px。下部境界線（rgba(255,255,255,0.1)）あり。

### 2. サイドバーコンポーネント (Sidebar Component)
- **表示内容**: Navigation メニューの表示のみ。
  - `Dashboard`, `Kernel Status`, `Quality`, `Knowledge`, `Governance`, `Billing`, `Simulation`, `Audit`
- **制約**:
  - 各メニューは静的なナビゲーション表示のみを担当し、Kernelを実行させたり意思決定を変更させるような操作ボタン（Action Trigger）は一切持たない。
- **レイアウト**: 左側固定。幅 240px。右部境界線あり。

### 3. ステータスカードコンポーネント (Status Card Component)
- **表示内容**: 各カーネルのライフサイクル稼働状況の可視化。
  - 対象: Execution, Review, Quality, Learning, Governance, Billing, Simulation 等。
  - ステータスバッジ: `Active` (緑パルス), `Idle` (青), `Warning` (黄), `Error` (赤), `Disabled` (灰)。

### 4. メトリクスカードコンポーネント (Metrics Card Component)
- **表示内容**: 各レイヤーのモック結果値の表示。
  - **Quality Panel**: Quality Score, Review Result, Improvement Delta。
  - **Knowledge Panel**: Total Knowledge, Health Score, Merge Candidate。
  - **Governance Panel**: Pending, Approved, Rejected 件数。
  - **Billing Panel**: License, Subscription, Payment Event 状態。
- **制約**:
  - 表示データはダッシュボード側で計算・改変せず、取得したモック JSON レコードをそのまま描画する。

---

## 各コンポーネントのモーション責任 (Component Motion Responsibility)
各 UI コンポーネントが担当するモーションの動作・演出要件。
- **Header component**:
  - `Slide Down & Fade`: 初期ロード時に上部から下方向へ 500ms かけてスライドフェードインする。
- **Sidebar component**:
  - `Slide In Left & Hover`: 初期ロード時に左端から 500ms かけてスライドイン。メニュー項目へのマウスホバー時に左境界線のインジケーター（アクセント青）をハイライト表示する。
- **Cards component**:
  - `Fade Up & Staggered scale`: 各情報カードは、下部から上方向へ階段状の遅延（Staggered Delay: 50ms差）をもってフェードインし、同時にスケールを 98% から 100% へイージング拡大する。
- **KPI component**:
  - `Rolling Number`: 画面描画開始から 600ms の時間で、数値メトリクス（スコアや件数）を現在の最終目標値までドラムロールカウントアップする。
- **Status component**:
  - `Pulse Badge`: `Active` (緑) または `Idle` (青) のステータスバッジの周囲に、柔らかい波紋状 of 光彩アニメーション（Gentle/Slow Pulse）を無限ループ再生する。

---

## コンポーネント構造の独立分離 (Visual Component Architecture)
ダッシュボードプロトタイプの発展に伴い、各カードおよび表示要素は `src/dashboard/components/` 配下の再利用可能な表示専用クラス群へリファクタリングされる。
- **Props 受信と View 責務の分離**:
  - `KPICard.js`, `StatusCard.js`, `MetricCard.js`, `KnowledgeCard.js`, `GovernanceCard.js`, `BillingCard.js`, `SimulationCard.js` は、一切の通信・計算ロジックを排除し、静的な Props 情報から HTML を返すのみとする。
- **DashboardRenderer の仲介**:
  - 各カードの DOM への配置および Props データのバインド・インサート処理は、`DashboardRenderer.js` が一括して制御し、チラつきのない段階的マウントを実現する。
- **グラフおよびログコンポーネント責任 (Chart & Log Visual Components)**:
  - `ActivityTrendCard.js` (活動推移折れ線 SVG グラフ) および `ActivityLogCard.js` (システム活動ログ) は、時系列データやメッセージ配列を Props 受信し、静的に HTML/SVG を出力する責任のみを持つ。トレンドの予測計算や分析、およびログの動的追加・削除処理は行わない。
