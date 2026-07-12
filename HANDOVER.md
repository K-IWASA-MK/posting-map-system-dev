# AIOS Platform Development Handover (AIOS Core)

次回の担当AIへ。以下のコンテキストを読み込み、開発ルールと現在地を確認して作業を開始してください。

---

## 📍 1. Current Location (現在地)

- **Platform**: `POSTING MAP System`
- **Completed**: `Performance Metrics Foundation`
- **Milestone**: `Sprint 6 / Phase S6-2 COMPLETED`
- **Tag**: `v6.2-performance-metrics-completed`
- **Current Phase**: `Sprint 6`
- **Next Action**: `Sprint 6 Next Phase`
- **Branch**: `main`

---

## ⚙️ 2. Development Rules (開発ルール)

次の担当AIが確実に順守すべき開発プロセス・ポリシーです。

- **Foundation First**: 常に基盤の整合性と動作保証を最優先とする。
- **Implementation Plan Required**: 実装前に必ず実行計画を作成・提示する。
- **Review Required**: 実装・変更の開始には必ず岩佐CEOの承認（GO）を得る。
- **One Responsibility per Step**: 1ステップにつき1つの責務のみを実装・更新する。
- **Verify Required**: コミット前に必ず健全性検証を実行する。
- **Git Commit Required**: 正常動作を確認した段階でローカルコミットを行う。
- **Git Push Policy**: The AI may perform Git Push after the approved implementation workflow, subject to the configured Review Policy.
- **Milestone Audit**: 節目のフェーズ（Phase 100 / 200 / 300）到達時は、Foundation Audit、サードパーティレビュー、および Fix Pack による全体品質の引き締めを実施する。

---

## 🤖 3. AIOS Standard Communication Specification (ASCS)

- **Version**: `ASCS v1.0`
- **Purpose**: Standard communication protocol for AI-to-AI / AI-to-Human collaboration.
- **Scope**: Applies to all AIOS development projects and environments.

### Requirements (通信規約)
- **Single Code Block Rule**: 回答は必ず1つのマークダウンコードブロックのみで提出すること。コードブロック外への文章・補足・説明・前置き・あとがきは例外なく一切禁止する。
- **Output Rule**: 回答は追加説明が不要な完成版のみを出力し、途中でユーザーへの追加説明の要求や質問を行わないこと。
- **Copy Safe Rule**: すべての回答は GPT ➔ User ➔ Flash ➔ Claude ➔ Gemini などの AI 間でコピー＆ペーストされることを前提として作成し、途中でコンテキストや情報が欠落する構成は禁止する。

---

## 📞 4. AI Communication Rules (協調規約)

AIOS 開発エージェント間で引き継ぎされるべき通信・作業の前提条件です。

- 回答は実装可能な完成版のみを提出し、そのまま採用・実行可能なコードや計画を提示すること。
- 過去に合意した Development Rules を確実に継承して引き継ぐこと。

---

## 🗺️ 5. Roadmap (ロードマップ)

- **Foundation** (Phase1-90) ✅
- **Execution Runtime** (Phase91-120)
- **Execution Engine** (Phase121-180)
- **Distributed Runtime** (Phase181-240)
- **AIOS Core** (Phase241-300)

---

## 📦 6. Git Information

- **Latest Commit**: Use `git log -1` to check the current HEAD commit details.
- **Commit History**: Keep only the latest 5 commits. (Older history should be retrieved using `git log`.)

---

## 🚀 Startup Checklist

Before starting development:

1. Read Current Location
2. Create Implementation Plan
3. Review & Approval (GO)
4. Implementation
5. Verify (CIE verify)
6. Doctor (CIE doctor)
7. pytest
8. HANDOVER.md Update
9. Git Commit
10. Git Push (Subject to Review Policy)
11. Completion Report (Verify Commit Hash, Verify/Doctor PASS, pytest PASS, HANDOVER updated, Push completed, Working Tree Clean)


---

## 7. Branding & Design System Consensus (ブランド設計確定)

- **正式ブランド名**: `POSTING MAP` (スマートフォンWebアプリ / PC管理画面 `POSTING MAP Dashboard`)
- **開発コードネームの排除**: `H-App` / `Hアプリ` / `管理者アプリ` などの開発ネームはユーザー向けには一切使用しない。
- **保存先 (SSOT)**: 
  - [docs/gpt-memory/BRANDING.md](file:///Volumes/SSD_DATA/posting-map-system/docs/gpt-memory/BRANDING.md)
  - [AGENTS.md](file:///Volumes/SSD_DATA/posting-map-system/AGENTS.md)（Brand Identityセクション）
- 今後のUI設計・営業資料・マニュアル・実装は本決定に厳密に従うこと。

---

## 8. Architecture Milestones (アーキテクチャマイルストーン)

| Milestone | Phase Range | Tag | Status | Date |
| :--- | :--- | :--- | :--- | :--- |
| Execution Runtime Foundation | Phase 206 – 229 | `v4.31-runtime-foundation` | ✅ Completed | 2026-07-10 |
| Runtime Boot Foundation | Phase 216 | - | ✅ Completed | 2026-07-10 |
| Runtime Orchestrator Foundation | Phase 217 | - | ✅ Completed | 2026-07-10 |
| Runtime Execution Pipeline Foundation | Phase 218 | - | ✅ Completed | 2026-07-10 |
| Runtime Context Manager Foundation | Phase 219 | - | ✅ Completed | 2026-07-10 |
| Runtime State Manager Foundation | Phase 220 | - | ✅ Completed | 2026-07-10 |
| Runtime Session Manager Foundation | Phase 221 | - | ✅ Completed | 2026-07-10 |
| Runtime Instance Blueprint Foundation | Phase 222 | - | ✅ Completed | 2026-07-10 |
| Runtime Loader Foundation | Phase 223 | - | ✅ Completed | 2026-07-10 |
| Runtime Builder Foundation | Phase 224 | - | ✅ Completed | 2026-07-10 |
| Runtime Composer Foundation | Phase 225 | - | ✅ Completed | 2026-07-10 |
| Runtime Executor Foundation | Phase 226 | - | ✅ Completed | 2026-07-10 |
| Runtime Engine Foundation | Phase 227 | - | ✅ Completed | 2026-07-10 |
| Runtime Blueprint Interpreter Foundation | Phase 228 | - | ✅ Completed | 2026-07-10 |
| Runtime Kernel Foundation | Phase 229 | - | ✅ Completed | 2026-07-10 |
| Runtime Kernel Engine Foundation | Phase 230 | - | ✅ Completed | 2026-07-10 |
| Runtime Thread Foundation | Phase 231 | - | ✅ Completed | 2026-07-10 |
| Runtime Scheduler Foundation | Phase 232 | - | ✅ Completed | 2026-07-10 |
| Runtime Queue Foundation | Phase 233 | - | ✅ Completed | 2026-07-10 |
| Runtime Task Foundation | Phase 234 | - | ✅ Completed | 2026-07-10 |
| Runtime Worker Foundation | Phase 235 | - | ✅ Completed | 2026-07-10 |
| Runtime Dispatcher Foundation | Phase 236 | - | ✅ Completed | 2026-07-10 |
| Runtime Event Foundation | Phase 237 | - | ✅ Completed | 2026-07-10 |
| Runtime Event Bus Foundation | Phase 238 | - | ✅ Completed | 2026-07-10 |
| Runtime Message Router Foundation | Phase 239 | - | ✅ Completed | 2026-07-10 |
| Runtime Transport Foundation | Phase 240 | - | ✅ Completed | 2026-07-10 |
| Runtime Connection Foundation | Phase 241 | - | ✅ Completed | 2026-07-10 |
| Runtime Protocol Foundation | Phase 242 | - | ✅ Completed | 2026-07-10 |
| Runtime Session Foundation | Phase 243 | - | ✅ Completed | 2026-07-10 |

---

### Runtime Foundation

Execution Runtime Foundation（Phase 206 ～ 229）完了。

Static Blueprint Foundation を凍結。

Dynamic Runtime Series は Phase 230 より開始。

Runtime Foundation Tag

```text
v4.31-runtime-foundation
```

### Runtime Kernel Engine Foundation

Runtime Kernel Engine Foundation（Phase 230）完了。

静的 Blueprint（Kernel Engine Schema）の策定、不変定義および検証テストを実装。

### Runtime Thread Foundation

Runtime Thread Foundation（Phase 231）完了。

静的 Blueprint（Thread Schema）の策定、不変定義、および検証テストを実装。

### Runtime Scheduler Foundation

Runtime Scheduler Foundation（Phase 232）完了。

静的 Blueprint（Scheduling Schema）の策定、不変定義（NO_PRIORITY_CALCULATION, NO_LOAD_BALANCING ポリシー追加）、および検証テストを実装。

### Runtime Queue Foundation

Runtime Queue Foundation（Phase 233）完了。

静的 Blueprint（Queue Schema）の策定、不変定義（NO_PRIORITY, NO_SORT, NO_REORDER ポリシーおよび supportedQueuePolicies、queueSchemaVersion 追加）、および検証テストを実装。

### Runtime Task Foundation

Runtime Task Foundation（Phase 234）完了。

静的 Blueprint（Task Schema）の策定、不変定義（TaskCapability, TaskDependencyPolicy, supportedTaskPolicies, taskSchemaVersion 等の追加）、および検証テストを実装。

### Runtime Worker Foundation

Runtime Worker Foundation（Phase 235）完了。

静的 Blueprint（Worker Schema）の策定、不変定義（WorkerCapability, WorkerDependencyPolicy, supportedWorkerPolicies, workerSchemaVersion 等の追加）、および検証テストを実装。

### Runtime Dispatcher Foundation

Runtime Dispatcher Foundation（Phase 236）完了。

静的 Blueprint（Dispatch Schema）の策定、不変定義（DispatcherCapability, DispatcherExecutionPolicy, DispatcherDependencyPolicy, dispatcherSchemaVersion 等の追加）、および検証テストを実装。

### Runtime Event Foundation

Runtime Event Foundation（Phase 237）完了。

静的 Blueprint（Event Schema）の策定、不変定義（EventCategory, EventDirection, EventPriorityPolicy, supportedCapabilities, supportedEventPolicies, eventSchemaVersion 等の追加）、および検証テストを実装。

### Runtime Event Bus Foundation

Runtime Event Bus Foundation（Phase 238）完了。

静的 Blueprint（Event Bus Schema）の策定、不変定義（EventBusTopology, EventBusDeliveryPolicy, EventBusReliabilityPolicy, EventBusCategory, EventBusChannelPolicy, eventBusSchemaVersion 等の追加）、および検証テストを実装。

### Runtime Message Router Foundation

Runtime Message Router Foundation（Phase 239）完了。

静的 Blueprint（Message Router Schema）の策定、不変定義（RouterTopology, RouterReliabilityPolicy, RouterCategory, RouterSelectionPolicy, RouterTransportPolicy, RouterSecurityPolicy, routerSchemaVersion 等の追加）、および検証テストを実装。

### Runtime Transport Foundation

Runtime Transport Foundation（Phase 240）完了。

静的 Blueprint（Transport Schema）の策定、不変定義（TransportTopology, TransportReliabilityPolicy, TransportSecurityPolicy, TransportCategory, TransportProtocolPolicy, supportedConnectionPolicies, supportedProtocolPolicies, transportSchemaVersion 等の追加）、および検証テストを実装。

### Runtime Connection Foundation

Runtime Connection Foundation（Phase 241）完了。

静的 Blueprint（Connection Schema）の策定、不変定義（ConnectionTopology, ConnectionSecurityPolicy, ConnectionStatePolicy, ConnectionDependencyPolicy, supportedAuthenticationPolicies, supportedConnectionModes, connectionSchemaVersion 等の追加）、および検証テストを実装。

### Runtime Protocol Foundation

Runtime Protocol Foundation（Phase 242）完了。

静的 Blueprint（Protocol Schema）の策定、不変定義（ProtocolTopology, ProtocolSerializationPolicy, ProtocolVersionPolicy, ProtocolMessageFormatPolicy, ProtocolCompatibilityPolicy, ProtocolValidationPolicy, protocolSchemaVersion 等の追加）、および検証テスト（禁止命令コードの静的スキャナーを含む）を実装。

### Runtime Session Foundation

Runtime Session Foundation（Phase 243）完了。

静的 Blueprint（Session Schema）の策定、不変定義（SessionTopology, SessionSecurityPolicy, SessionStatePolicy, SessionTimeoutPolicy, SessionIsolationPolicy, SessionIdentityPolicy, supportedConnectionPolicies, supportedTransportPolicies, supportedProtocolPolicies, sessionSchemaVersion 等の追加）、および検証テスト（禁止命令コードおよび実行系クラスの静的スキャナーを含む）を実装。
次のフェーズ（Phase 244：Runtime Secure Channel Foundation）へ安全に移行可能。

### POSTING MAP Product Sprint 2 Phase S2-1: Google Maps Engine Foundation

Google Maps Engine Foundation（Sprint 2 Phase S2-1）完了。

`MapEngine` 抽象化インターフェースを実装した `GoogleMapsEngine` を新設し、設定プロバイダー `GoogleMapsConfiguration`、多重ロード防止の `GoogleMapsScriptLoader`、カメラ制御の `GoogleMapsCameraController`、個別レイヤー制御（Area, VoteTurnout, Activity, Marker）を行う `GoogleMapsLayerManager` を整備。`MapPanel` との結合および `DOMMapEngine` との後方互換性を完全に保った状態での移行を検証完了。

### POSTING MAP Product Sprint 2 Phase S2-2: H-App Real Connection Foundation

H-App Real Connection Foundation（Sprint 2 Phase S2-2）完了。

接続状態管理（HAppConnectionState）、新着ログのUI自動配信（EventLogDispatcher, HAppEventSubscriber）、ポーリング＆オフライン制御（HAppSynchronizationController）、重複検知および地区進捗モデル不変再計算（DashboardStateModel）の実データ連携基盤を構築。

### POSTING MAP Product Sprint 2 Phase S2-3: Real Data Synchronization Foundation

Real Data Synchronization Foundation（Sprint 2 Phase S2-3）完了。

差分同期（DeltaSynchronizationManager）、TTLキャッシュ（CacheManager）、指数バックオフ（RetryController）、デグレード防止マージ競合解決（ConflictResolver）、および状態同期（SynchronizationScheduler）の同期基盤を実装。

### POSTING MAP Product Sprint 2 Phase S2-4: Dashboard Operational Foundation

Dashboard Operational Foundation（Sprint 2 Phase S2-4）完了。

システム健全性監視（SystemHealthMonitor）、状態マシン管理（OperationalStatusManager）、メトリクス集約（MetricsAggregator）、インメモリ通知＆DOMトースト（NotificationCenter）、ガラスモーフィズムインジケータ（HealthIndicator）、およびForce Refreshクリアフローを実装。

### POSTING MAP Product Sprint 2 Phase S2-5: Field Operation Foundation

Field Operation Foundation（Sprint 2 Phase S2-5）完了。

活動状況管理（DistributionStatusManager）、手持ちチラシ僅少アラート（InventoryMonitor）、GPS位置追跡（GPSEvidenceMonitor）、写真証跡（PhotoEvidenceMonitor）、現場統合メトリクス（FieldOperationMetrics）、現場統制（FieldOperationController）を構築し、AreaDetailPanelに証跡情報を統合可視化。

### POSTING MAP Product Sprint 2 Phase S2-6: Product Release Candidate

Product Release Candidate（Sprint 2 Phase S2-6）完了。

製品構成管理（ProductConfiguration）、機能トグル（FeatureToggle）、起動前環境パラメータ＆エディション整合性検証（ProductRuntimeValidator）、検証失敗時の高精細警告オーバーレイおよび起動ブロック処理を実装・統合。Sprint 2 の全10件のテストスイートが回帰フリーでパスすることを確認。

### POSTING MAP Product Sprint 3 Phase S3-1: GAS API Production Foundation

GAS API Production Foundation（Sprint 3 Phase S3-1）完了。

設定管理（GasConfigurationProvider）、一方向決定論的キャッシュ（CacheServiceProvider）、タイムアウト付再試行型直列排他ロック（LockServiceProvider）、物理一括読み書き（SpreadsheetBatchReader, SpreadsheetBatchWriter）、物理I/O分離リポジトリ（SpreadsheetRepository）、実行コンテキスト監査（ApiExecutionContext）、および性能メトリクス（GasPerformanceMonitor）の全TSクラスと Code.gs への統合を完了。全11件のテストが完全パス。

### POSTING MAP Product Sprint 3 Phase S3-2: API Routing & Endpoint Foundation

API Routing & Endpoint Foundation（Sprint 3 Phase S3-2）完了。

不変オブジェクト `ApiRequest` (HTTP抽象)、`ApiResponse` (標準レスポンスラッパー)、`RoutePolicy` (メソッド制限ポリシー)、`ApiVersionResolver` (APIバージョン解決)、および `RouteKey` (一意キー形式 `METHOD:VERSION:PATH`) を構築。`EndpointRegistry` (ルーティング定義テーブル) と `ApiRouter` (ディスパッチャー) によるルーティング基盤の実装を完了。
`doGet` / `doPost` を `ApiRouter` 経由のパイプラインに移行し、レガシーパラメータを自動変換・委譲する `LegacyApiFallbackHandler` を通じた100%の後方互換性を達成。全12件のテストが完全パス。

### POSTING MAP Product Sprint 3 Phase S3-3: Validation Pipeline Foundation

Validation Pipeline Foundation（Sprint 3 Phase S3-3）完了。

リクエスト入力基本構造（`RequestValidator` / `REQUEST_VALIDATOR`）、HTTP メソッド（`MethodValidator` / `METHOD_VALIDATOR`）、バージョン指定（`VersionValidator` / `VERSION_VALIDATOR`）、ルート存在（`RouteValidator` / `ROUTE_VALIDATOR`）、および機能フラグ（`FeatureValidator` / `FEATURE_VALIDATOR`）の各バリデーターを一意の ID 識別子付きで実装。
最初のエラーで処理を遮断するフェイルファスト（Fail-Fast）チェインエンジン `ValidatorChain` を構築。バリデーションエラーを標準 HTTP ステータスコード（400/404/405/422）へマッピングする不変オブジェクト `ValidationResult` / `ValidationException` を定義。
`doGet` / `doPost` の最前段にパイプラインを差し込み、レガシー互換マッピングを通過させた上で一律にバリデーションを通過させるよう結合完了。全13件のテストが完全パス。

### POSTING MAP Product Sprint 3 Phase S3-4: Exception Framework Foundation

Exception Framework Foundation（Sprint 3 Phase S3-4）完了。

共通基底例外 `ApiException` と例外発生時の診断情報 `ExceptionMetadata` / `ExceptionCategory` を定義。
カスタム例外（`SystemException`, `RoutingException`, `ConfigurationException`, `FeatureException`）の一意エラーコード（`PM-SYS-001` 等）および外部（ユーザー向け安全な文言）・内部（デバッグ用トレース）メッセージ分離（External/Internal Message Separation）を実装。
例外を不変な `ApiResponse` に決定論的に変換する `ExceptionMapper` と、S3-5 で予定されている Monitoring & Audit 向けに拡張可能なイベント通知リスナー（`addListener`）を備えた `ExceptionHandler` を構築。
`doGet()` / `doPost()` を単一の try-catch に集約し、例外発生時は一元処理を行う構造にリファクタリング。全14件のテストが完全パス。

### POSTING MAP Product Sprint 3 Phase S3-5: Monitoring & Audit Foundation

Monitoring & Audit Foundation（Sprint 3 Phase S3-5）完了。

監視イベント共通モデル `MonitoringEvent` を定義し、単調増加する `sequenceNumber` によるイベント発生順序保証およびカテゴリ（`AUDIT`, `METRICS`, `LIFECYCLE`, `EXCEPTION`）分類を実装。
`EventDispatcher` を用いた同期型イベント配信処理を構築し、メモリ上にイベントを蓄積する `AuditCollector` および `MetricsCollector` を実装。
API ライフサイクル（開始、検証成功、ルーティング成功、ハンドラー完了、リクエスト終了、リクエスト失敗）をフックしてイベントを自動ディスパッチする `MonitoringPipeline` と `ApiLifecycleObserver` を整備。
`ExceptionHandler` にオブザーバーをバインドし、バリデーション例外や未捕捉システムエラー発生時に `REQUEST_FAILED` 監査ログイベントを自動収集する機構を統合。
`doGet()` / `doPost()` にライフサイクルオブザーバーを統合し、検証・ルーティング・ハンドラー各ステージの実行時間の個別計測および可観測性を確立。全15件のテストが完全パス。

### POSTING MAP Product Sprint 3 Phase S3-6: Production Hardening Foundation

Production Hardening Foundation（Sprint 3 Phase S3-6）完了。

システム各要素（CONFIG, REPOSITORY, CACHE, LOCK, MONITOR, ROUTER）の状態を個別にチェックして HEALTHY/DEGRADED/UNAVAILABLE 判定を行う `HealthCheckService` と不変な `HealthStatus` を実装。
リクエストパラメータ数およびボディデータのサイズ制限チェックを実行し、超過時に 400 Bad Request / 413 Payload Too Large を返却する `RequestGuard` と `GuardResult` モデルを構築。
インメモリでのサーキット開閉状態管理（CLOSED, OPEN, HALF_OPEN）および状態遷移、障害要因（TIMEOUT, CONFIG, RESOURCE）記録、OPEN 状態時の 503 Service Unavailable 遮断ロジックを提供する `CircuitBreakerFoundation` を実装。
タイムアウト設定値（`TimeoutPolicy`）および過剰システム実行時間を監視して安全に処理を打ち切る `ResourceGuard` を実装。
設定やトグルの整合性を検証する `ProductionReadinessPolicy` と起動可能判定を行う `ReadinessValidator` を実装。
`doGet()` / `doPost()` パイプラインの最前段（バリデーションの前段）に `HardeningPipeline` を結合し、実行時間制限や過大ペイロード、サーキットオープンなどを高速遮断する堅牢なエンドポイント保護を統合。全16件のテストが完全パス。

スプリント3すべての開発項目を完了。次のスプリント（Sprint 4 Phase S4-1：Premium Feature Expansion & Edition Licensing）へ移行可能。

### Architecture Migration Completed

Phase C-0〜C-7 completed.

Completed:
- Repository Cleanup
- Source Layer Separation
- GAS Bundle Split
- Test Organization
- Dependency Rules
- Architecture Enforcement
- Regression Integrity Fix

Quality Gate:
- npm run quality:check PASS

### POSTING MAP Product Sprint 5 Phase S5-12: Workspace Onboarding Foundation

Workspace Onboarding Foundation（Sprint 5 Phase S5-12）完了。

- アクセス経路情報である `WorkspaceUrl`（LINE URL / Dashboard URL）を値オブジェクトとして独立定義。`Workspace` エンティティはドメイン情報の保持に特化。
- ローマ字対応マッピング、漢数字対応、および1桁の支部番号を2桁にゼロ埋めする正規化（例: `mie-04`, `tokyo-02`, `aichi-14`）を行う `WorkspaceIdGenerator` を Application サービスとして実装。
- ID生成時の重複存在チェックロジックをリポジトリ経由で実装し、存在時は `-2`, `-3` のように動的にサフィックスをインクリメント（例: `mie-04` ➔ `mie-04-2`）。
- 初期サブスクリプション有効期間を設定値化し、デフォルト1ヶ月（既存ビジネスルールに準拠）として活性化。
- `POST /operations/workspaces`（新規作成）および `GET /operations/workspaces`（プロビジョニング状況確認）の API エンドポイントを追加。
- 運営ダッシュボード（`operations/index.html`, `manager.js`）へ新規作成フォームおよびプロビジョニング結果表示枠を設置。
- 全ユニットテスト、統合テスト、および GAS ビルド検証をパス。

### POSTING MAP Product Sprint 5 Phase S5-13: Workspace Invitation Template Foundation

Workspace Invitation Template Foundation（Sprint 5 Phase S5-13）完了。

- **5分割ナビゲーションメニュー実装**: 支部ダッシュボード（Dashboard）に「ホーム」「チラシ保有状況」「活動状況」「メールテンプレート」「設定」の5つのタブ表示領域を実装し、ナビゲーションメニューで切り替える機能を追加。
- **動的メールテンプレート機構 (スプレッドシート連携)**:
  - マスタースプレッドシートの「メールテンプレート」シート（スキーマ: `templateId`, `templateName`, `subject`, `body`, `enabled`）から動的にテンプレートを読み込む `EmailTemplateService` を実装。
  - シート未作成または読み込み例外時は、初期値（`MAIL001`：参加案内メール、`MAIL002`：チラシ保有ご協力のお願いメール、いずれも禁止用語を排除した最新仕様）へ自動フォールバック。
- **UI表示における禁止用語の完全排除**: 「Kアプリ」「配布員」「参加者」「スタッフ」「保管場所」「住所登録」等の表記をUI上から完全排除。支部内のメンバーを「党員さん・サポーターさん」、活動状況を「ポスティング活動」等に統一。
- **チラシ保有状況の一覧表示**: テーブルカラムを「ID」「氏名」「市町村」「チラシ枚数」に統一。詳細な番地や自宅情報、自宅といった個人情報の保持および表示を排除。
- **市町村名の抽出クリーニング**: `SpreadsheetFlyerHoldingRepository` において、`保管場所`列のデータから市区町村名のみを正規表現で抽出し、詳細な地番や「自宅」等の不要な情報をクリーニングして `cityName` にマッピングするロジックを実装。
- **メール招待テンプレートの選択とプレビュー**: 
  - 支部ダッシュボードにてセレクトボックスからテンプレートを選択可能とし、プレースホルダー (`{{workspaceName}}`, `{{lineAppUrl}}`) を置換した状態でプレビュー表示。
  - 「メールソフトを起動する」ボタンから `mailto:` スキームを介して下書きを標準メールアプリにシームレスに引き渡す基盤を整備。
- 全ユニットテスト、統合テスト、および GAS ビルド検証をパス。

### POSTING MAP Product Sprint 5 Phase S5-14: Staff Registration Integration Foundation

Staff Registration Integration Foundation（Sprint 5 Phase S5-14）完了。

- **`RegisterStaffCommand` の拡張**: `staffNo` をオプショナル (`string | undefined`) に変更。
- **支部単位での自動ID採番 (`S001`～) 実装**:
  - `IStaffRepository` に `getNextStaffNo(workspaceId)` インフェースを追加。
  - `SpreadsheetStaffRepository` にて特定の `workspaceId` に属するスタッフID (`S\d+`) の中から最大値を取得し、支部ごとに独立した順序で `S001` からインクリメントして自動採番するロジックを実装。
  - `StaffApplicationService.registerStaff` にて `staffNo` が指定されていない場合は動的にIDを採番する処理、および同一 `lineUserId` での二重登録要求の際に既存データを返却して重複を防止する安全ロジックを実装。
- **APIルーティングおよびハンドラー統合**:
  - `PlatformIntegrationPipeline.ts` にて、レガシーアクション `'registerStaff'` を `/field/distributors` (POST) へマッピング。
  - `DistributorHandler.ts` に `POST` 処理ルーティングを追加し、受け取ったリクエストから `RegisterStaffCommand` を構築して登録処理を実行。結果をレガシー互換の `DistributorDto` 構造へマッピング。
- **H-App 互換性および API レスポンス変換保証**:
  - `v2_api.gs` の `createJsonResponseFromApiResponse()` にて、レスポンスデータ内の `id`, `name`, `message` をレスポンスオブジェクトのルートレベルへコピーする処理を追加。これによりモバイルアプリ側での `res.id` の直接参照動作を保証。
- **モバイルアプリ（H-App）の動的 ID 適用**:
  - `active/mobile/config.js` のデフォルト支部IDを、S5-12仕様に適合した小文字ゼロ埋め形式の `"mie-04"` に更新。
  - `active/mobile/app.js` の `WS-MIE-03` ハードコーディングを `CONFIG.DEFAULT_BRANCH_ID` 参照へ置き換え、登録 API 呼び出し時にワークスペースIDを正しく渡すよう修正。
- **テストスイートの追従**:
  - TSコンパイルエラー回避のため、テストファイル内の各 `MockStaffRepository` クラスに `getNextStaffNo` のダミーメソッドを実装。
- 全ユニットテスト、統合テスト、および GAS ビルド検証をパス。

### POSTING MAP Product Sprint 5 Phase S5-15: Flyer Holding Integration Foundation

Flyer Holding Integration Foundation（Sprint 5 Phase S5-15）完了。

- **`HoldingHandler` の新設**: `/holding` (GET & POST) を新設し、`HoldingApplicationService` に接続。
- **リポジトリへの `findAllRaw` 実装**: `SpreadsheetFlyerHoldingRepository` で全チラシ在庫情報を抽出し、H-Appに適合する `stocks` 配列データをマッピング。保管場所列から市区町村名のみを抽出クリーニングする処理を統合。
- **検証とビルド**: `HoldingHandler.test.ts` を追加し、全検証パス。

### POSTING MAP Product Sprint 5 Phase S5-16: Posting Activity Integration Foundation

Posting Activity Integration Foundation（Sprint 5 Phase S5-16）完了。

- **`ActivityHandler` の新設**: `/field/distributors/activities` (POST) を新設し、`ActivityApplicationService` に接続。
- **`RecordFieldActivityCommand` の新設**: 活動実績、位置、Base64写真などの詳細データをカプセル化するコマンドを追加。
- **`ActivityApplicationService` への処理集約**:
  - `recordFieldActivity` メソッドを実装し、Google DriveへのJPEGファイル保存（ファイルID取得）、地区シートの該当行更新（D〜J列に完了状態、枚数、GPS、写真IDなどを書き込み）、EventLogへの追記（`appendEventLog` 呼び出し）、および `Activity` シート（`SpreadsheetActivityRepository.save`）への追記処理を一元化してカプセル化。
  - 写真がない活動報告時は、`photoUrl` を `"none"` に正規化して `DistributionActivity` ドメインモデルのバリデーションを通過させる仕組みを実装。
- **APIルーティングの統合**: `PlatformIntegrationPipeline.ts` にて、レガシーアクション `'updateRecordWithGPSPhoto'` および `'submitDistribution'` を自動的に `/field/distributors/activities` に変換してルーティングするルールを追加。さらに、バージョン未指定時に `v2` へフォールバックする安全機構を追加。
- **検証とビルド**: 新規統合テスト `test_activity_flow.ts` を追加し、全テストパスを確認。

Quality Gate:
- npm run quality:check PASS


### POSTING MAP Product Sprint 5 Phase S5-19: Workspace Goal Management Foundation

Workspace Goal Management Foundation（Sprint 5 Phase S5-19）完了。

- **Workspace ドメインの拡張**: `Workspace` エンティティへ `distributionGoal`（目標値）、`goalUpdatedAt`（更新日時）、`goalUpdatedBy`（更新者）のフィールドを追加し、値の更新時にメタ情報を自動設定するドメインロジックを実装。
- **Spreadsheet永続化の拡張**: `SpreadsheetWorkspaceRepository` を拡張し、`Workspaces` シートに「月間配布目標」「目標更新日時」「最終更新者」列を追加・対応。
- **DTOおよびサービスの移行・進化**: 旧 `WorkspaceOnboardingService` とオンボーディング用 DTO を廃止し、目標管理機能も内包した `WorkspaceApplicationService` と `WorkspaceDto` へリファクタリング。`WorkspaceIdGenerator` も `workspace` ディレクトリへ移行（MOVE）。
- **APIおよびルーティング更新**: エンドポイント `/operations/workspaces` (GET / POST) のハンドラーを `WorkspaceHandler` に統合。目標更新のアクション（`updateWorkspaceGoal`）および取得アクション（`getWorkspaceDashboard`）を適切にRESTパスにマッピングする処理を `PlatformIntegrationPipeline.ts` に追加し、目標更新処理をトランザクション書込ロック対象に指定。
- **Dashboard 連携**: `DashboardApplicationService` の `getWorkspaceDashboard` から目標引数を削除し、Workspace の目標設定値に基づいて達成率と目標値を自動算出する正式設計へ移行。
- **フロントエンド UI の更新**: 設定タブに「月間配布目標」の入力フォーム（保存ボタン含む）と、最終更新日・更新者の表示要素を追加。目標更新時に即座にデータを再取得してホームの達成率を更新するフローを `manager.js` に実装（※履歴表示一覧は Sprint 6 へ延期）。
- 全ユニットテスト、統合テスト、および GAS ビルド検証をパス。

### POSTING MAP Product Sprint 6 Phase S6-1: Performance Foundation (Dashboard API Optimization)

Performance Foundation（Sprint 6 Phase S6-1）完了。

- **Spreadsheet 読み込み最適化**: 各リポジトリ（Staff, Holding, Activity）で `findAll` メソッドを整備し、全データを一括取得してメモリ上でキャッシュ（Map化）するように変更。
- **O(1) ルックアップ**: DashboardApplicationService 内での N+1 問題（`findByStaffNo` などをループで呼び出す問題）を解消し、Map からの取得へ切り替え。
- 実行時間と Spreadsheet API の呼び出し回数を劇的に削減。

### POSTING MAP Product Sprint 6 Phase S6-2: Performance Metrics Foundation

Performance Metrics Foundation（Sprint 6 Phase S6-2）完了。

- **DTO 化**: `PerformanceMetricsDto.ts` を定義し、レスポンスにパフォーマンス情報を含める仕組みを実装。
- **可視化**: Spreadsheet アクセス回数、処理時間などを計測し、フロントエンド側へ返却。

### POSTING MAP Product Sprint 6 Phase S6-3: Repository Performance Foundation

Repository Performance Foundation（Sprint 6 Phase S6-3）完了。

- **`RepositoryPerformanceProfiler` の実装**:
  - Request Scope Singleton として振る舞うプロファイラを新規作成。
  - リポジトリ別呼び出し回数、シート別 Read/Write 回数、合計実行時間を管理。
- **各リポジトリへの組み込み**:
  - `SpreadsheetReader`, `SpreadsheetWriter` および各 `SpreadsheetXXXRepository` の全パブリックメソッドへ Profiler 計測ロジックを追加。
  - `IActivityRepository` および実装へ `findById` を追加し、API の完全性を確保。
- **DashboardApplicationService の SSOT（Single Source of Truth）化**:
  - これまで独自の stats 変数で管理していたメトリクス集計を廃止し、Profiler から取得した値をそのまま DTO へ流し込む形へリファクタリング。
- **ライフサイクル管理**:
  - `DashboardHandler` の `finally` ブロックにて明示的に `reset()` を呼び出し、リクエストを跨いだメトリクスの混在を防止。
- 全テスト（ユニット、統合）および GAS ビルド検証をパス。

### POSTING MAP Product Sprint 6 Phase S6-4: Performance Policy Foundation

Performance Policy Foundation（Sprint 6 Phase S6-4）完了。

- **`PerformancePolicy` 基盤の実装**:
  - `src/core/performance/policy/` 配下に `PerformancePolicyEngine`, `PerformancePolicyRegistry`, `PerformancePolicyResult`, `PerformancePolicyReport` などを構築。
  - Profiler との依存は「Profiler → Engine」への単方向とし、Engine側で静的コードとメトリクス情報をまとめて評価する設計とした。
  - レポートには新たに `INFO` ステータスと `Performance Score` (100点満点減点方式) を追加。Developer 向けに `PerformancePolicyReport.json` への出力スクリプトを整備した。
- **ルールチェッカーの実装**:
  - AST に依存せず、軽量な Regex でループ内 Read/Write や不適切なレイヤーからの Spreadsheet へのアクセスを禁止するルール（RULE-001〜RULE-006）を実装。
  - リポジトリの API 一貫性確認（RULE-007）、および Profiler 使用の義務化（RULE-008）を追加し、実装者の努力に依存しないパフォーマンスとアーキテクチャの担保基盤を導入した。
- 全テストおよび品質ゲート検証をパス。

### POSTING MAP Product Sprint 6 Phase S6-5: Performance Validation Foundation

Performance Validation Foundation（Sprint 6 Phase S6-5）完了。

- **Validation 責務の分離とデータ構造の構築**:
  - `src/core/performance/validation/` に `PerformanceValidationSummary`, `PerformanceValidationResult` を作成。
  - `Result` は `metadata` (`toolVersion`, `schemaVersion`, `runtime`, `generatedAt`), `summary` (全体の `status` 含む), `metrics` (Optional), `report` (Policyの違反情報) の4ブロック構成とした。
- **Runner と Exporter の実装**:
  - `PerformanceValidationRunner.ts`: ソースコードの収集から Engine への受け渡し、Result の構築（静的解析時は Profiler `metrics` を `undefined` として許容）を一元管理。
  - `PerformanceValidationExporter.ts`: Console および JSON への出力を担当。
- **既存基盤の統合整理**:
  - `PerformancePolicyEngine.ts` から `exportReportToJson` を削除し、責務を分離。
  - エントリーポイント `run_policy_validation.ts` を Runner を使用するシンプルな構造へリファクタリング。
- 全テストおよび品質ゲート検証をパス。これにより CI/CD や Governance Foundation への接続基盤が整った。

### POSTING MAP Product Sprint 6 Phase S6-6: Performance Governance Foundation

Performance Governance Foundation（Sprint 6 Phase S6-6）完了。
これにて Sprint 6 の Performance Architecture が完成。

- **Governance 基盤の実装**:
  - `src/core/performance/governance/` に `PerformanceGovernancePolicy`, `PerformanceGovernanceEngine`, `PerformanceGovernanceDecision` などを構築。
  - Validation 層は事実（Failed, Warningの数など）をそのまま出力し、Governance 層が独自の基準（PASS=90点以上等）と「FAILED優先ルール（1つでもFailedがあればBLOCK）」で最終判定を下す責務分離を確立。
  - アクションとして拡張性の高い Enum `PerformanceGovernanceAction` (`PROCEED`, `REVIEW_REQUIRED`, `BLOCK`) を導入。
- **データ構造の整理**:
  - `PerformanceGovernanceResult` は `metadata` -> `decision` -> `validationResult` の順に構成。意思決定内容が最上位にくるように整備。
- **Exporter の統合**:
  - `PerformanceGovernanceExporter` が Console および JSON に `STATUS`, `ACTION`, `RECOMMENDATION` と共に全情報を出力する仕組みを実装。
- **エントリーポイントの統合**:
  - `run_policy_validation.ts` を Governance エンジンによる評価と Exporter を利用する構造へ拡張し、最終的な品質ゲート判定を出力できるように対応。
- 追加の Unit Test を実装し、全てのテストがパスすることを確認。これにより Sprint 7 以降の各種自動化連携への接続準備が完了。

### AIOS Core Sprint 7 Phase S7-1: Development Context Foundation

AIOS Core の「プロセス空間」の基礎となる S7-1 が完了しました。

- **AIOS OS 構造の固定**:
  - `src/core/aios/` 階層を新設し、`context/`, `engine/`, `plugin/`, `validation/`, `governance/`, `reviewer/`, `ledger/` の7ディレクトリを配置して OS の全体像を固定。
- **Context の実装と SSOT 化**:
  - `DevelopmentContext.ts` を定義し、メタデータの型を `Readonly<Record<string, unknown>>` に強化。`contextVersion` (後方互換性) と `createdAt` (タイムスタンプ) を追加。
  - レビュー種別 (`DevelopmentContextType`)、実行モード (`DevelopmentExecutionMode`)、ライフサイクル (`DevelopmentContextStatus`) を Enum で定義。
- **Builder パターンと不変性の保証**:
  - `DevelopmentContextBuilder` を導入。必須チェックに加え、`build()` メソッド内で `Object.freeze()` を行い、プラグインからの変更を完全に防止する「Immutable 設計」を確立。
- **検証**:
  - `DevelopmentContextBuilder.test.ts` を作成し、必須項目のバリデーションおよび生成されたオブジェクトに対する Runtime 上での変更（Strict mode における `TypeError`）が適切にブロックされることをテストで保証。

### AIOS Core Sprint 7 Phase S7-2: Development Rule Plugin Interface Foundation

AIOS Core が Plugin を管理・実行するための標準契約（Contract）となる S7-2 の実装が完了しました。

- **Plugin 識別子と能力の定義**:
  - `DevelopmentPluginId`, `DevelopmentCapability` (Validation, Governance, Audit など) の Enum を実装。
- **Immutable Metadata と API 互換性**:
  - `DevelopmentPluginMetadata` インターフェースを定義し、`apiVersion` を導入。テストにて `Object.freeze()` による不変性の保証と、Strict モードでの意図しないプロパティ変更のガードを確認しました。
- **実行結果の契約拡張**:
  - `DevelopmentPluginResult` に `confidence` を追加し、Governance フェーズでの意思決定精度を高める構造としました。
- **OS の責務としての Lifecycle 管理**:
  - 「Plugin は機能のみを持つ」という設計原則に則り、`IDevelopmentPlugin` から状態遷移の責務を完全に排除し、`initialize`, `validate` 等の契約のみを定義しました。
  - 状態遷移のバリデーションは、OS 側の責務として `PluginLifecycleManager` に集約しました。テストにおいて `UNLOADED -> DISCOVERED` 等の許可遷移と、`UNLOADED -> RUNNING` 等の不正遷移のブロックが機能することを実証済みです。

### AIOS Core Sprint 7 Phase S7-3: Development Rule Engine Foundation

AIOS の「心臓部」であり、Plugin を自律的に実行・管理する Development Rule Engine の構築が完了しました。

- **`ExecutionSession` & `PluginExecutionContext` の導入**:
  - 実行全体を管理する `ExecutionSession` (将来の並列・リトライ・分散実行への布石) を導入。
  - プラグインの入力 IF を `PluginExecutionContext` に一本化し、`DevelopmentContext` や `PluginExecutionPlan` との依存を綺麗にラップしました（Rule-009）。
- **`PluginRegistry` & `PluginLoader` の連携**:
  - `Registry` に `findSupported(context)` を実装し、`Loader` が `supports()` 判定に基づき該当プラグインのみを自動抽出するルーティング基盤を確立しました。将来の Manifest 駆動への移行準備が整っています。
- **`DevelopmentRuleEngine` の実装**:
  - Engine は特定の Plugin を一切知らず、`Context` を起点として `Discovery -> Loader -> Execution Plan -> Lifecycle Orchestration` を実行する完全な OS オーケストレーターとして完成しました。
  - テストにおいて、Context の種類に応じて対象プラグインのみが自律的に選択され、全 Lifecycle が回ることを実証しました。

### AIOS Core Sprint 7 Phase S7-4: Validation Pipeline Foundation

AIOS の「推論エンジン」となる 5-Layer Validation Pipeline (Regex -> AST -> Semantic -> Context -> AI Review) の骨格実装を完了しました。

- **Immutable Artifacts (`ValidationArtifact`)**:
  - Functional Programming パターンを採用し、各 Validation Stage は前段の Artifact をミューテートせず、抽出データを付与した新しい Artifact を返す仕組みとしました。
- **コスト・パフォーマンス指標の充実 (`ValidationStageMetadata` & `ValidationPipelineResult`)**:
  - 各 Stage のメタデータに `estimatedCost` (Regex:1, AST:10, AI:1000 等) を設定しました。
  - Pipeline 実行結果に `executedStages`, `skippedStages`, `estimatedCost`, `actualCost` などのメトリクスを保持させ、S7-6 で実装予定の Governance が「今回は高コストな推論が走ったか」などを判断するための強力な基礎を築きました。
- **5-Layer Mock Stages の確立**:
  - Regex, AST, Semantic, Context, AI_REVIEW の5つのレイヤーを `IValidationStage` の実装（モック）として構築し、Pipeline Builder を用いたソートと一連のバケツリレーが正常に稼働することをテストで実証しました。

### AIOS Core Sprint 7 Phase S7-5: Reviewer Adapter Foundation

AIOS 最大の差別化ポイントとなる「LLM/AI の完全な抽象化と Driver 化」を実現するレイヤー構築が完了しました。

- **AI と Human の統一契約化 (`ReviewRequest` / `ReviewResult`)**:
  - `instructions` プロパティの導入により Prompt の概念を一般化し、人間にも AI にも全く同じ DTO で入力・出力の受け渡しができる体制を構築しました。
  - レビュー成果物（コード修正提案など）を独立した `ReviewArtifact` オブジェクトに切り離し、将来の多様な出力形式に対応可能な Single Source of Truth として確立しました。
- **動的ルーティングと堅牢な Fallback 機構 (`ReviewerLoader` & `AIReviewValidationStage`)**:
  - メタデータの `priority` と `weight` に基づいて最適なレビュアーを自動ソート抽出し、`selectionReason` を付与する仕組みを構築。
  - メインの AI（例: Gemini）がダウンしていた際に自動的に代替 AI（例: Claude）や人間（Human）へフォールバックして処理を完遂させる強固なフェイルオーバー機構を実装し、テストで実証しました。

### AIOS Core Sprint 7 Phase S7-6: Development Governance Foundation

Validation（事実）と Reviewer（推論）の統合結果を受け取り、AIOS の最終的な意思決定を下す Governance カーネルを構築しました。

- **`DevelopmentGovernanceDecision` と Immutable Policy**:
  - Decision に `decisionId`, `decisionVersion`, `confidenceSource` を持たせることで、次フェーズの Execution Ledger への連携基盤を確立しました。
  - Policy クラスにて、Validation の失敗数や Reviewer の確信度（Confidence）をもとに、人間へのエスカレーション（`ESCALATE`）やブロック（`BLOCK`）といった意思決定を再現可能な形で自動判定する仕組みを実装しました。
- **複数レビュアーの Consensus ロジック**:
  - 複数のレビュアーが参加した場合、最も高い確信度を出したレビュアーの結論を優先し、`Consensus(ReviewerId)` として Source を明記する合意形成ロジックを確立しました。

### AIOS Core Sprint 7 Phase S7-7: Execution Ledger Foundation

AIOS の全実行履歴を単なるログとしてではなく、「イベントグラフ（ツリー）」として永続化する基盤を構築しました。

- **Event Sourcing の実装 (`ExecutionLedgerEntry`)**:
  - 各イベント（Entry）に `sequenceNo`, `parentEntryId`, `correlationId` を持たせることで、実行プロセスの階層的な連鎖（Context -> Plugin -> Validation -> Review -> Governance）を完全に追跡・再現できるデータ構造を確立しました。
- **Adapter によるインフラの抽象化**:
  - `IExecutionLedgerWriter` と `IExecutionLedgerReader` を定義し、今回は JSON 保存モック実装である `JsonExecutionLedgerAdapter` を導入しました。これにより、将来的な Storage の差し替えが AIOS Core に影響を与えず行えます。
- **`ExecutionRecorder` (Facade) の導入**:
  - Engine 側からの保存要求を受け付け、`sequenceNo` の管理と親子紐づけを隠蔽し透過的に行う Recorder を用意しました。
