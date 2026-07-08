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

## レイアウト階層 (Layout Hierarchy)
ダッシュボード全体の画面構成および余白配置は、統合的な Visual Spacing System に基づき論理定義される。
1. **アプリコンテナ (Outer Container)**: 100vh 固定、スクロール非許容。ヘッダーとボディの高さ分割を固定する。
2. **ボディコンテナ (Body Container)**: Sidebar（固定幅 240px）と Main Content Grid（可変幅・縦スクロール許容）を左右に配置。
3. **メイングリッド (Main Grid)**: カラム幅を最小 320px、Gap を 24px（画面縮小時は 16px）とし、コンテンツカード群（Card）を自動配置する。

## 視覚的オブザーバー定義 (Visual Observer Layer Definition)
ダッシュボードは「表示・観測専用レイヤー」であり、データモデル（Props）を受信して一方向にバインドすることのみが許される。
- **視覚演出の分離**: 描画完了後のフェード・スライドなどのモーション（Stagger / Easing 等）は、`DashboardMotion` が一括管理し、コンポーネント内部にアニメーション制御用のタイマー処理やライフサイクル関数を混入させてはならない。

## アクセシビリティ・オブザーバー・レイヤー (Accessibility Observer Layer)
ダッシュボードは操作を伴わない表示専用の情報提示であるため、スクリーンリーダーやキーボードによる「情報の受け取りやすさ」のみをアクセシビリティの目的とする。
- **情報説明メタデータの付与**: カードや重要指標に説明的な `aria-label` を付与し、非テキスト情報（グラフ等）には適正な `role="img"` を定義する。操作コントロールを模した `role="button"` や `role="textbox"` を記述することは禁止する。
- **動的ログのアナウンス**: システムの実行・監視ログの追加は `aria-live="polite"` にて通知し、読み上げを妨げずに新着情報を追跡可能にする。
- **Reduced Motionへの適合**: 前庭器官への配慮として、OSレベルの視覚効果軽減が検知された場合、JSのドラムロール数値スクロール等の演出は即座にバイパスして最終結果を提示する。

## レスポンシブ・レイアウト規則 (Responsive Layout Rule)
ダッシュボードはあらゆるアスペクト比で崩壊しない頑健なレスポンシブグリッドを敷設する。
- **メディアクエリ制御**: ブレイクポイントは 4 段階（Large Desktop, Desktop, Tablet, Small Screen）とし、Grid のカラム数や Margin などを CSS レベルでのみ自動スケーリング・再配置する。
- **サイドバーの再配置**: モバイル環境では、操作トグルボタンの追加を一切行わず、CSS によって画面下部にフレックス横並びメニューとして自動再配置する。

## パフォーマンス・オブザーバー規則 (Performance Observer Layer & Rendering Responsibility)
ダッシュボードは、長時間稼働および高頻度のデータ更新においても、極小のフットプリントと描画効率を維持しなければならない。
- **データ不変キャッシュによる不要再描画防止**: 
  `DashboardRenderCache` に保存された前回の Props 値（JSON 表現）と今回の Props 値を評価し、差分がない場合は DOM 書き換えをスキップする。
- **カード単位の部分的 DOM 更新（差分マウント）**:
  更新が必要と判定されたカードのみ、`gridContainer.children[index].outerHTML` 等を用いてピンポイントで更新し、ページ全体の再構築や他のカードへの影響を遮断する。
- **Visibility API による不要リソース消費の抑制**:
  タブが非表示（`document.visibilityState === 'hidden'`）の際は、自動ポーリングリクエストを一時停止し、CSS / JS のすべてのアニメーション（脈動バッジ、SVG 描画）を停止してリソースを解放する。
- **明示的メモリ解放 (Memory Leak Prevention)**:
  EventBus の重複リスナー登録防止機構を敷設し、アンロード時にはすべての購読とタイマーを破棄し、クロージャや Detached DOM ノードによるリークを排除する。

## リアルタイム監視観測規則 (Realtime Observer Layer & Event Stream Mapping)
ダッシュボードは、定時ポーリング監視に加え、Kernel Runtime で発生するイベントを一方向のストリーム（Server-Sent Events）経由でリアルタイム観測する。
- **一方向ストリームの順守**: 双方向接続（WebSocket等）の使用は禁止し、受信専用チャネル（EventSource）のみで運用すること。
- **セキュリティ・検証チェック**: 受信イベントはアダプター（`DashboardRealtimeAdapter`）の入口で、IDの重複（Replay防止）、タイムスタンプ範囲（現在時刻から過去5分・未来1分以内）の検証を行う。
- **協調状態マシンの稼働**: SSE 接続のオンライン/オフライン検知と連動し、リアルタイム観測（LIVE STREAM）と、接続切断時の自動ポーリングによるフォールバック（POLLING_BACKUP）の間で自動的に監視モードを切り替え、監視の永続性を確保する。

## イベントインテリジェンス・アテンション制御規則 (Event Intelligence Observer Layer & Attention Queue Priority Mapping)
ダッシュボードは、受信したリアルタイムイベントをルールベースで分類・重要度マッピングし、重要度優先順にソート表示する。
- **決定論的ルールの順守**: AI予測（`AI.predict`等）や自律意思決定は一切禁止し、静的なルールベース判定のみでイベントを分類・重要度判定すること。
- **重要度優先アテンションキュー**: イベントは `CRITICAL` ➔ `WARNING` ➔ `INFO` の順に自動ソートし、最大 `50` 件に件数を制限してメモリ内に不変（Object.freeze）で保持する。
- **視覚的ルーティング (Visual Routing)**: アラーム音やメール等の自動通知アクションは一切行わず、`CRITICAL` 受信時の `StatusCard` の Glow 発光、および `WARNING` 受信時の Activity ログ枠線ハイライトに限定した表示上の警告のみを行う。

## イベントタイムライン監視規則 (Event Timeline Observer Layer)
ダッシュボードは、イベント履歴を時系列降順に可視化するタイムライン機能を提供する。
- **タイムラインストアによる履歴管理**: 受信イベントを `eventId` 重複排除のうえ、最大 `500` 件までメモリ上に不変（freeze）で保持するスライディングウィンドウを敷設する。
- **マーカー別ビジュアル可視化**: `CRITICAL` アラート時の赤色 Glow パルスマーカー、`WARNING` アラート時のオレンジ色マーカー、`INFO` 時の白色マーカーで重要度を瞬時に見分けられるようにする。
- **純粋描画・計算ロジック排除**: タイムラインコンポーネント内でのデータの再計算や、コマンドの逆方向送信、自動承認ロジックの実装は完全に排除すること。

## イベント相関関係監視規則 (Event Correlation Observer Layer)
ダッシュボードは、イベント履歴の前後関係や共通属性に基づき客観的相関を可視化する相関グラフ機能を提供する。
- **因果推論の厳禁**: イベント間の前後関係やカテゴリ分類による関係マッピングのみを可視化し、原因追論・Root Cause Analysisなどの因果判断（Causation）は一切扱わないこと。
- **相関ストアによる履歴上限管理**: 構築された相関チェーンオブジェクトは、`Object.freeze` で不変性を担保し、最大 `200` 件まで保持する容量限界制御（超過時 DROP）を敷設する。
- **固定配置によるグラフ描画**: D3.js などの動的な力学配置や AI による動的配置は禁止し、CSS Flex / Grid を用いた安定した固定縦方向（Vertical Layout）のみで表示すること。

## イベント関係構造グラフ監視規則 (Event Graph Observer Layer)
ダッシュボードは、相関チェーン内のイベントとそのトポロジー情報をトポロジーグラフとして表示する機能を提供する。
- **意思決定エンジンの排除**: 関係トポロジーを描画するのみとし、AI Graph Analysis、自動での意思決定（Auto Decision）、および Kernel 操作（Kernel Command）は一切行わないこと。
- **厳格な容量制限管理**: ストア内に最大 `100` グラフ、合計 `1000` ノードまでの容量制約を敷設し、超えた場合は最も古いグラフ要素から自動で切り落とすこと。
- **重要度別ビジュアル同期**: 重要度（Severity）に連動し、ノード枠やエッジ接続線のカラーおよび発光演出（CRITICAL時は赤色 Glow）を同期して描画すること。

## イベント観測知識監視規則 (Event Knowledge Observer Layer)
ダッシュボードは、トポロジーグラフや相関情報から客観的な観測知識を要約・提示するナレッジ機能を提供する。
- **AI推論判定の完全排除**: 生成されるサマリーは静的な定型ルールマッピングによる客観記述に限定し、トラブルの原因判定や意思決定、推奨（Recommendation）は行わないこと。
- **ストアによる不変ナレッジ管理**: 生成されたナレッジは `Object.freeze` で不変保存し、最大 `500` 件まで保持する容量限界制御（超過時 DROP）を適用すること。
- **表示専用およびリンク配置**: 各ナレッジは完全表示専用とし、タイムライン・関係グラフカードと連動する表示アンカー以外の操作ボタンは配置しないこと。

## イベント観測インサイト監視規則 (Event Insight Observer Layer)
ダッシュボードは、ナレッジ情報から客観的な集計や時系列トレンド、発生比率を提示するインサイト機能を提供する。
- **自律判断・推奨の厳禁**: インサイトビルダーにおける、AIによる障害の原因分析、推奨アクション（Recommendation）の提示、および自動対応・承認の自動実行（Kernelへのコマンド逆流）は一切禁止する。
- **容量制限管理の敷設**: インサイトオブジェクトは `Object.freeze` で不変性を担保し、ストア内に最大 `100` 件までの容量制約を敷設し、超過時は古い順に破棄すること。
- **表示専用および操作UIの排除**: コピー操作や位置確認インジケータ以外の、対話型操作要素（ボタン、フォーム、input）は一切配置しないこと。

## イベント構造変化履歴監視規則 (Event Evolution Observer Layer)
ダッシュボードは、各種データ（Timeline/Correlation/Graph/Knowledge/Insight）の時間経過に伴う構造・状態変化の差分を提示するエボリューション機能を提供する。
- **自動改善・異常判定の厳禁**: ビルダーおよびコンポーネント内における、AIによる異常判定、改善提案、および自律自動対応アクションの生成・トリガーは一切禁止する。
- **ストアによる不変履歴管理**: エボリューションオブジェクトは `Object.freeze` で不変保存し、最大 `500` 件までの容量制約を敷設し、超過時は古い順に破棄すること。
- **表示専用およびリンク配置**: 各変化差分項目は完全表示専用とし、対話型ボタンや入力要素は配置しないこと。

---

## 将来拡張ポイント (Future Extensions)
- **マルチテナント統合監視 (Multi-Tenant Global Dashboard)**:
  複数の支部（例: MIE-03, TOKYO-01）の各 AIOS インスタンスから最適化およびガバナンスメトリクスを集約し、企業・本部レベルで全体の稼働健全度やルール不適合率を比較・統制するグローバル監視ビューの追加。
