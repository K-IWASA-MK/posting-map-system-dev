# AIOS Platform Development Handover (AIOS Core)

次回の担当AIへ。以下のコンテキストを読み込み、開発ルールと現在地を確認して作業を開始してください。

---

## 📍 1. Current Location (現在地)

- **Platform**: `CIE Platform v2.3.0-alpha.0`
- **Completed**: `Architecture Migration Complete`
- **Milestone**: `Sprint 4 / Architecture Migration COMPLETED`
- **Tag**: `v4.66-architecture-migration-completed`
- **Current Phase**: `Sprint 5`
- **Next Action**: `Sprint 5 Domain Development`
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
