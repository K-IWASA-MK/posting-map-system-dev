# カーネルダッシュボード仕様書 (Kernel Dashboard Specification)

## 設計思想 (Philosophy)
> ダッシュボードは実行（Execution）や意思決定（Decision）の責務を持たない。
> AIOS Kernel の各レイヤー（Execution, Review, Quality, Self Review, Self Improvement, Learning, Optimization, Governance）の
> 稼働ステータスや実績メトリクスを横断的に観測・可視化することに特化した、純粋な「表示・観測専用レイヤー（Observer Layer）」である。

---

## 目的
AIOS（品質保証オペレーティングシステム）において、各カーネルレイヤーの実行結果、品質スコア、蓄積ナレッジの健康度、承認待ち状況、および監査ログを人間（管理者）がリアルタイムに俯瞰確認するための「可視化基盤（Dashboard Foundation）」を定義する。

---

## 責務
- 各カーネルモジュールからイベントやデータファイル（JSON）として出力される状態・指標データを収集（Status Tracking）。
- 収集したデータを再計算・加工せず、定義されたUIコンポーネントを用いて人間が理解しやすい形に可視化（Visualization）。
- 承認待ち要求（Pending Approval）のリストアップと、管理者への通知表示（Bypass不可）。
- ガードレール：**ダッシュボード内からのルール変更、承認実行、ナレッジ編集、およびパイプライン制御などの変更アクションは一切行えない（Read-Only）。**

---

## 観測モデル (Observer Pattern)
ダッシュボードは、以下の通り AIOS Kernel 各レイヤーの状態と疎結合に通信し、一方向（データソースからダッシュボードへ）のみのデータ伝播を保障する。

```
[AIOS Kernel Layer (データソース)]
           │
           ├─(状態イベント発報 / JSON出力)
           ▼
[Observer Agent (状態監視部)] ──> [UI描画 (Visualization)] ──> [人間 (管理者)]
```

### データソース (Data Sources)
ダッシュボードが表示するデータのソースは以下の定義済み出力に限定し、ダッシュボード内での再計算（品質スコアや健康度の独自再計算など）は行わない。
- **カーネル状態**: `KernelStatus.md` に定義される各レイヤーのアクティブ状態。
- **品質情報**: `QualityScore` レイヤーが出力するスコア JSON。
- **ナレッジ情報**: `KnowledgeOptimization` レイヤーが出力する `Optimization Report` (Health/Merge/Gap/Metrics)。
- **ガバナンス情報**: `Governance` レイヤーが出力する `Governance Decision` & `Governance Audit`。
- **課金・ライセンス情報**: `Billing` & `License` レイヤーから出力される `LicenseRecord` および `SubscriptionRecord` の不変情報。
- **CLI実行・オーケストレーション情報**: `CLIOrchestrator` レイヤーから出力される `RunContext` および `CLIAuditRecord` の実行履歴。
- **シミュレーション結果**: `IntegrationSimulation` レイヤーから出力される `SimulationResultRecord` および `SimulationAuditRecord` のログ履歴。

### 課金・ライセンス表示項目 (Billing & License Mappings)
ダッシュボード上に「ライセンス・お支払い状況監視パネル」を表示する。表示項目はすべて読み取り専用（Read-Only）とし、契約変更や決済実行ボタンは一切排除する。
- **License Status**: ライセンスの有効期限および現在の状態（Active / Suspended 等）。
- **Subscription Status**: 次回請求更新予定日およびサブスクリプションの状態（Trial / Active / Past Due 等）。
- **Billing History**: 過去の `PaymentEvent`（決済履歴）の一覧表示。

### CLI 実行状況表示項目 (CLI Run Status Mappings)
ダッシュボード上に「CLI実行・オーケストレーション監視パネル」を表示する。表示項目はすべて読み取り専用（Read-Only）とし、ダッシュボード内からのコマンドの再実行や中断操作ボタンは一切排除する。
- **Run Status**: 現在実行中の `Run ID`、処理進捗状況（ステータスが Running / Completed / Failed 等）、および実行ユーザー。
- **Command Status**: 現在起動しているコマンド名（例: `run-pipeline`）および呼び出し引数。
- **Error Status**: 実行に失敗したタスクのエラーコード、エラーメッセージ、および発生日時。

### シミュレーション結果表示項目 (Simulation Results Mappings)
ダッシュボード上に「統合接続シミュレーション監視パネル」を表示する。表示項目はすべて読み取り専用（Read-Only）とし、テストの強制実行や再開、およびモック結果の本番適用ボタンは一切排除する。
- **Simulation Status**: 現在動いている、または直近に実行された `Simulation ID`、および稼働中のシナリオID。
- **Scenario Result**: テスト結果の最終適否判定（ステータスが Passed / Failed / Warning）。
- **Failed Layer**: 接続契約（Contract）の検証において、スキーマエラーや不整合を起こして不合格（Failed）となった模擬レイヤーの名前。
- **Validation Result**: 契約仕様と検証内容の差分（未充足フィールド等）のログ表示。

### ローカルシミュレーションテスト表示項目 (Local Simulation Test Mappings)
ダッシュボード上に「ローカルシミュレーションテスト・品質ゲート監視パネル」を表示する。表示項目はすべて読み取り専用（Read-Only）とし、ダッシュボード内からのテスト再実行、結果変更、または不合格（FAIL）時の品質ゲート（Quality Gate）の強制通過解除ボタンは一切排除する。
- **Last Test**: 直近に実行されたローカルテストの実行完了日時、およびセッションID（`Test Run ID`）。
- **Result**: 品質ゲートの総合合否結果（PASS / FAIL / WARNING）。
- **Failure Count**: テストスイート内で不合格（FAIL）となったテストケースの件数。
- **Warning Count**: 契約バージョン警告など、警告（WARNING）が検知されたテストケースの件数。

### フック品質ゲート表示項目 (Hook Quality Gate Mappings)
ダッシュボード上に「開発フロー統合・フック品質ゲート監視パネル」を表示する。表示項目はすべて読み取り専用（Read-Only）とし、ダッシュボード内からのフック強制解除や再試行操作は一切排除する。
- **Hook Installed Status**: 開発者のローカル環境における Git pre-commit フックのインストール状況（Installed / Missing）、およびインストール日時。
- **Last Commit Gate**: 直近に実行された Git コミット時の検証結果（Passed / Blocked）。
- **Last Deploy Gate**: 直近に実行された clasp デプロイ時の検証結果（Passed / Blocked）。
- **Last Quality Gate**: 直近に実行されたフックの品質ゲート実行完了ステータス（Passed / Blocked）。
- **Commit Check Status**: Git コミット検証の成否、フックID、および発生タイムスタンプ。
- **Deploy Check Status**: デプロイ前検証（`clasp push` 前等）の成否、フックID、および発生タイムスタンプ。

### プロトタイプUIマッピング (Prototype UI Mapping & Component Mapping)
ダッシュボードプロトタイプにおける各 UI 要素とモックデータのマッピング対応。
- **Header component -> System Mappings**:
  - `Environment` -> `MOCK_DASHBOARD_DATA.simulation.scenarioStatus` 等をインジケーターとしてマップ。
  - `System Status` -> `healthy` (固定)。
- **Sidebar component -> Nav Mappings**:
  - 静的な読み取り専用メニュー。選択されたビュー項目を強調表示するのみ。
- **Cards / Panels component -> Metrics Mappings**:
  - `Kernel Status Card` -> `MOCK_DASHBOARD_DATA.kernelStatus` をバッジ描画。
  - `Quality Card` -> `MOCK_DASHBOARD_DATA.quality` をスコア出力。
  - `Knowledge Card` -> `MOCK_DASHBOARD_DATA.knowledge` を数量出力。
  - `Governance Card` -> `MOCK_DASHBOARD_DATA.governance` を認可状態出力。
  - `Billing Card` -> `MOCK_DASHBOARD_DATA.billing` を契約ステータス出力。
  - `Simulation Card` -> `MOCK_DASHBOARD_DATA.simulation` をテスト適合度出力。

### データソース境界定義 (Dashboard Data Source Boundary)
ダッシュボードプロトタイプにおける、開発検証時のオフラインモックと、将来的な本番接続の論理接続境界を定義する。
- **MOCK データソースモード (Default)**:
  - アダプター層（`DashboardDataAdapter.js`）は外部 API を一切叩かず、内部のモックデータを非同期でロードする。
- **API データソースモード**:
  - API 接続モードの切替時、アダプターは `GET /api/dashboard/summary` からのみデータを読み込み、スキーマアサーションを実行後に UI へ渡す。
  - アダプターおよびダッシュボード内には、本番のカーネルや Spreadsheet の書き換えを引き起こす Write 接続（POST/PUT等）は一切露出・マッピングされない。

### コンポーネント・オブザーバー・マッピング (Component Observer Mapping)
ダッシュボードコンポーネントがProps受信描画（Observer）として動作する際のマッピング構造。
- **StatusCard** -> `data.kernelStatus` を受信し、`ks-execution`, `ks-review` 等のバッジ描画。
- **MetricCard** -> `data.quality` を受信し、`quality-overall-score` などの主要品質メトリクスを描画。
- **KnowledgeCard** -> `data.knowledge` を受信し、ナレッジ量および Health 率を描画。
- **GovernanceCard** -> `data.governance` を受信し、承認履歴およびポリシー適合率を描画。
- **BillingCard** -> `data.billing` を受信し、ライセンスの有効状況を描画。
- **SimulationCard** -> `data.simulation` を受信し、テストゲート通過状況（PASS/FAIL）を描画。

### API 接続状態および UI マッピング (API Connection Status Model)
接続エラーや応答速度に起因するダッシュボード状態の UI マッピング規則。
- **LIVE**:
  - API から正常にすべての KPI 情報を取得完了。ステータスは緑色の「LIVE」バッジで表示される。
- **MOCK**:
  - デバッグ検証等で `DATA_SOURCE = 'MOCK'` が設定されている場合。ステータスは青色の「MOCK」で表示される。
- **WARNING**:
  - API レスポンスの一部項目にスキーマ不整合やパラメータ欠損がある場合。ステータスはオレンジの「WARNING」で表示され、上部バナーに警告メッセージが表示される。
- **OFFLINE**:
  - 通信断または 5000ms 以上の Timeout が発生した場合。ステータスは赤色の「OFFLINE」で表示され、ローカル代替 Mock データをロードして描画を維持する。

### チャートおよびログ・コンポーネント・マッピング (Chart & Log Component Mapping)
グラフおよびログコンポーネントにおけるデータマッピング規則。
- **ActivityTrendCard**:
  - `data.trendData`（配列）を受信し、折れ線のパスおよび主要データポイントの SVG グラフィックを出力。
- **ActivityLogCard**:
  - `data.logs`（配列）を受信し、システムアクティビティ履歴リスト（ログ時間、モジュール、メッセージ）を出力。

### ポーリング・自動スクロール制御 (Polling & Auto-Scroll Mechanics)
- **定期取得 (Polling)**:
  - `DashboardPollingController` により 10000ms 間隔で GET 呼び出しを実行し、データ更新時に `DashboardEventBus` を介して描画レイヤーへ伝播。障害時は指数バックオフ再試行を適用する。
- **自動スクロール・Glow 演出 (Log Auto-Scroll & Glow)**:
  - 新着ログ差分検知時、最上部に Prepend 挿入し、コンテナを最上部へ Smooth Scroll させるとともに、先頭要素に 3 秒間 Glow 光彩演出（`.new-log-glow`）を施す。
- **TurnoutCard**:
  - `data.turnout`（オブジェクト）を受信し、地区全体の平均投票率および `TurnoutProgressBar` を用いた市区町村別の投票率実績進捗バーを出力。

---

## 将来拡張ポイント (Future Extensions)
- **マルチテナント統合監視 (Multi-Tenant Global Dashboard)**:
  複数の支部（例: MIE-03, TOKYO-01）の各 AIOS インスタンスから最適化およびガバナンスメトリクスを集約し、企業・本部レベルで全体の稼働健全度やルール不適合率を比較・統制するグローバル監視ビューの追加。
