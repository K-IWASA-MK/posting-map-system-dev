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
