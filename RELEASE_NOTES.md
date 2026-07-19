# Release Notes - v6.0.0-alpha.2

## 🚀 New Features & Enhancements

### 1. AIOS v6.0 Platform Boundary Enforcement (Phase 2)
- **Validation Runtime & Pipeline**: Introduced the `ValidationRuntime` platform execution engine, orchestrating validation via `ValidationPipeline` over 6 custom validators with unified results and CI-friendly exit codes (success on warnings, fail on errors).
- **6 Domain and Boundary Validators**:
  - `DependencyScanner`: Traverses files in a DAG structure and verifies layer separation; includes warnings for localized/legacy cycles in `sdk/`.
  - `ImportRuleChecker`: Prevents applications from directly importing kernel, runtime, and internal capabilities.
  - `ArchitectureValidator`: Enforces layer directions and infrastructure decoupling from domain services.
  - `SDKBoundaryValidator`: Verifies applications only import from `@aios/sdk`, and audits `sdk/index.ts` to prevent internal module leaks.
  - `DomainIsolationValidator`: Case-insensitively blocks forbidden words (Election, Posting, Flyer, District, Spreadsheet) in platform core. Emits warnings for `Dashboard` and compiles files into a Phase 3 rename registry (`DashboardRenamePreparation.md`).
  - `NamingValidator`: Validates PascalCase, camelCase, and UPPER_SNAKE_CASE rules across folders, files, classes, interfaces, and events.
- **Git Commit Gate & Quality Check Integration**: Integrated validations into Git pre-commit hooks (`hook_runner.js`) and standard quality checks (`npm run quality:check`), ensuring boundary violations block developer commits.

---

# Release Notes - v6.0.0-alpha.1

## 🚀 New Features & Enhancements

### 1. AIOS v6.0 Platform Separation & Standardized Workflows (Phase 1)
- **AIOS Development Governance**: Established the supreme governance policy (`AIOSDevelopmentGovernance.md`) that enforces compliance across all workflows, quality gates, and releases.
- **14 Constitutional Principles**: Standardized the core design values of AIOS (`AIOSConstitution.md`), including domain independence, blueprint-only services, immutable logging (`RuntimeLedger`), and stateless runtime engines.
- **Platform Boundary Enforcement**: Prohibited applications from directly importing kernel, runtime, or capability internals, designating the SDK (`sdk/`) as the sole entry point. Documented planned automated validators (Dependency Scanner, Import Checker, etc.) for Phase 2.
- **Architecture & Dependency Standards**: Formalized the 5 layers of AIOS (`ArchitectureLayers.md`) and strict unidirectional dependency rules (`DependencyRules.md`), integrating checks with existing architecture test tools.
- **Domain Isolation Rules**: Defined strict naming conventions (`NamingConvention.md`) preventing core platform code from using domain-specific terms (Election, Posting, Flyer, District, Dashboard, Spreadsheet).
- **Formalized Development & Git Lifecycles**: Codified the standard workflow sequence and set pre-commit requirements (Build, Lint, Unit Test, Architecture and SDK boundary checks) and pre-push requirements to guarantee codebase sanity.
- **Release & Target Subsystems**: Drafted release channels (Development, Stable, Hotfix) and future topology supporting CRM, ERP, RAG, and Agent-based applications on AIOS.

---

# Release Notes - v4.5.0-alpha.0

## 🚀 New Features & Enhancements

### 1. Self Evolution Runtime Foundation (Sprint X-19)
- **Evolution Orchestration**: Developed the final Generation 4 component bridging the gap to Generation 5, orchestrating safe self-improvement workflows for the AIOS.
- **Strict Simulation & Approval Separation**: Implemented a state machine that rigidly separates the safety verification (`SIMULATING`) phase from the governance authorization (`APPROVAL`) phase.
- **Advanced Metadata Models**: Introduced extensible `EvolutionCandidate` and `EvolutionPlan` models holding deep trace data, risk assessments, quality deltas, and expected outcomes to seed future ML-based strategy selection.
- **Simulation Facade Architecture**: Created the `EvolutionSimulationService` facade, decoupling discrete estimations into `ImpactEstimator`, `RiskEstimator`, `BenefitEstimator`, and `CompatibilityEstimator`.
- **Comprehensive Lifecycle Eventing**: Outfitted the `SelfEvolutionRuntime` with granular `EvolutionEventBus` events and tracking ledgers spanning from `CREATED` down through to `EVOLVED` and `REJECTED`.

---

# Release Notes - v4.4.0-alpha.0

## 🚀 New Features & Enhancements

### 1. Knowledge Promotion Runtime Foundation (Sprint X-18)
- **Promotion Orchestration**: Developed the final Generation 4 Runtime bridging Validation to Knowledge, executing the promotion cycle completely independently from the Knowledge Runtime.
- **KnowledgeMergeEngine Facade**: Implemented a highly decoupled merge pipeline: `MergePlanner` → `ConflictDetector` → `MergeSimulator` → `VersionGenerator` → `LineageUpdater` → `PromotionWriter`.
- **DAG-based Lineage Tracking**: Implemented Lineage tracking using an explicit `LineageGraph` with separated `LineageNode` and `LineageEdge` definitions to support future Knowledge Fusion.
- **Advanced State Machine**: Extended the Promotion State Machine with a dedicated `VERSIONING` state, supporting transitions from `CREATED` down to `PROMOTED` and `ARCHIVED`, including `REJECTED` edge cases.
- **Mock Simulation Framework**: Developed full in-memory foundations for Candidate Assessment, Semantic/Duplicate Conflict Detection, and Version assignment without triggering real storage writes (Blueprint Only).

---

# Release Notes - v4.3.0-alpha.0

## 🚀 New Features & Enhancements

### 1. Validation Orchestration Runtime Foundation (Sprint X-17)
- **DAG-based Validation Pipeline**: Implemented a topological sort execution strategy supporting DAG structures for complex validation dependencies.
- **Score-based Aggregation (3 Axes)**: Advanced aggregation returning `aggregatedScore`, `aggregatedSeverity`, and `overallConfidence`, enabling granular validation evaluation.
- **Isolated Retry Mechanism**: Validation specific flaky-test / network timeout retries, isolating retry bounds purely to the validation phase instead of repeating the entire execution loop.
- **Strict 9-Layer Architecture Compliance**: Implemented `Manifest`, `Policy`, `Registry`, `Services`, `State Machine`, `Ledger`, `Metrics`, `Observability`, and `Runtime` inside `src/core/aios/validation/` to perfectly align with Generation 4 Autonomous Runtimes structure.
- **Mock Validator Simulation**: Built Foundation with `MockSuccess`, `MockFailure`, `MockWarning`, and `MockTimeout` (Flaky) validators demonstrating complete state transitions from `CREATED` to `ARCHIVED`.

---

# Release Notes - v4.21-auth-immutable

## 🚀 New Features & Enhancements

### 1. Immutable Authorization Context & Dynamic Lock Overlays
- **認可コンテキストの一元化と凍結 (Object.freeze SSoAC)**:
  - 認証されたユーザーの ID、ポリシーモード、信頼スコア、セッションメタデータを集約した `Authorization Context` を起動時に一元生成。
  - `Object.freeze(authContext)` を適用し、クライアント側プログラムによる権限情報の不正上書き（権限昇格バグ・脆弱性）を物理的に遮断。更新時は新たな Context を freeze して参照置換（Immutability）。
- **認証・認可接続状態ロック (Loading Guard & Access Denied Overlay)**:
  - WebSocket による初期化イベントの受信（ポリシー解決）が完了するまで、画面全体をローディング状態で完全ロックする `loading-overlay` を実装。
  - セッション接続喪失時（Event Bus 切断）にも `authContext` を破棄し、自動的にローディング状態で UI を即時封印する防御機構を統合。
  - ポリシーが `BLOCKED` の場合、画面全体を巨大な赤色の「ACCESS DENIED」ロック画面で完全に覆う `blocked-overlay` を実装。

---

# Release Notes - v4.20-field-mvp

## 🚀 New Features & Enhancements

### 1. POSTING MAP MVP Foundation (Field Worker H-App Interface)
- **配布員アプリ (Hアプリ) MVP フレームワーク (field/index.html)**:
  - 巨大タッチターゲット（片手操作・高齢層対応）を施した漆黒のプレミアムグラスモーフィズム UI を構築。
  - ネットワークONLINE状態、アクティブポリシーモード、および自己の `trustScore` をヘッダーへリアルタイム同期投影。
- **配布完了＆GPS位置報告シミュレーター (field/app.js)**:
  - WebSocket による `INITIAL_STATE` および `FIELD_EXECUTED` (ASSIGN_FLYER) イベントの待ち受け。
  - 受信したチラシ割り当て部数、対象エリア名、および元の sourceEventId 紐付けメタデータをカード形式で自動描画。
- **現場への動的ポリシー執行**:
  - `SANDBOX` または `BLOCKED` モードへポリシーがコンパイルされた場合、Hアプリ上の「配布完了報告 (Confirm Distribution)」ボタンを物理的に無効化（Disabled / グレースケール化）し、現場での不正な配布書き込みを自動防御。GPS送信は常に許可。

---

# Release Notes - v4.19-field-bridge

## 🚀 New Features & Enhancements

### 1. Secure Command Bridge & Validation Buffer integration (AIOS ➔ POSTING MAP Bridge Layer)
- **Field Command API の設計・統一**:
  - `ASSIGN_FLYER`, `CONFIRM_DISTRIBUTION`, `GPS_LOG`, `AREA_LOCK`, `USER_RESTRICT` 現場用実行命令スキーマを策定。
  - 判断の起源を追跡・監査可能とする `"sourceEventId"` フィールドをコマンド内に義務付け。
- **Command Validation Buffer Layer (安全窓バッファ)**:
  - コマンド要求を受信した際、即時パブリッシュを行わずに 2.0秒間 Draft キューにプール（安全窓）。
  - 待機時間が明けた時点で、最新の `compiled_policies.json` に基づき再バリデーション（Re-evaluation）を執行。
  - 待機時間中に Drift 劣化やペナルティが発生して `BLOCKED` または書込み不可へ遷移していた場合、コマンドは実行されずに **バッファ上で自動抹殺（Discard）** される現場防衛レイヤーを統合。
- **POSTING MAP Field Nodes 設計**:
  - 地域、配布員、配布タスク等の現場エンティティを階層グラフ化する `tools/field_nodes.json` ノード定義データベースを配置。

---

# Release Notes - v4.18-monitoring-pro

## 🚀 New Features & Enhancements

### 1. Reliable Event Bus & Stateless Projection Dashboard (AIOS Monitoring v3.1 Pro)
- **Node.js WebSocket Event Bus サーバー (tools/aios_event_bus.js)**:
  - 順序保証（sequenceId monotonic check）とパケット重複排除（eventId validation）を備えた WebSocket 高信頼配信ブローカーを構築。
- **高信頼ディスパッチャ & リトライレイヤー (urllib-based retry logic)**:
  - Python コアの各エンジンから、Event Envelope フォーマットでパケットを包み、最大3回のリトライ保証付きで Event Bus へ POST 送信するディスパッチャを実装。
  - 送信メッセージの `sequenceId` は、SoT であるイベントログの行数と決定論的同期を図り、順序ズレを防ぐ設計を適用。
- **完全ステートレス UI 投影 (Stateless DOM Projection)**:
  - リアルタイム配信されたイベントペイロードから直接ビューを構築するバニラ JavaScript 描画（`UI_STATE = f(event_stream)`）に全面移行。キャッシュや UI 側での状態保持を排除。
  - **Policy View**: コンパイル済みポリシー limits（write/exec/network）の許可・拒否をグリッドカード形式でリアルタイム可視化。
  - **Drift Timeline View**: 状態変化イベントをタイムラインへスクロール出力。
  - **Trust Graph Live View**: DAG トポロジカルマップを描画。各ノードの信頼スコアと Drift 減衰度合いをシームレスにビジュアル色変化（Active/Restrict/Sandbox/Blocked）で可視化。

---

# Release Notes - v4.17-governance-compiler

## 🚀 New Features & Enhancements

### 1. Governance Policy Compiler Layer & Offline Execution Separation (AIOS Phase 147)
- **ポリシー・コンパイラ・コア (Governance Policy Compiler Core)**:
  - 信頼スコア、経過時間劣化（Drift）、およびイベント履歴を入力として、実行時制約（AST）を規定した決定論的な Policy Object（`mode`, `limits: {write, exec, network}`）にコンパイルする `governance_compiler.py` を実装。
- **決定論的ポリシーコンパイル規則 (Immutable Law mapping)**:
  - スコアしきい値に対応した動作モード（FULL_ACCESS / LIMITED / SANDBOX / BLOCKED）のマッピングと、Drift/Penalty 発生時の BLOCKED 強制降格ルールを実装。
- **コンパイルと執行の物理的２層分離 (Offline Compile & Runtime Read-Only Enforcement)**:
  - 実行時に毎回コンパイルが走ることによる不安定さ（ポリシーの揺れ・順序依存）を防ぐため、コンパイル処理は非実行時（オフライン / バッチ）のみ実行とし、ポリシーキャッシュファイル `compiled_policies.json` を出力。
  - 実行時ゲート `architecture_reviewer.py` はコンパイル処理を一切行わず、事前キャッシュされたポリシーをロードして検証するのみ（Read-only 執行）に設計制限。
- **法秩序執行自動ロック (Law Enforcement Lock)**:
  - 事前コンパイルされた `ai_agent` のポリシー制限が `limits.write = False` または `mode = BLOCKED` の状態で実行された場合、Rule 022 に基づき即座にビルド・コミット処理全体を強制アボート。

---

# Release Notes - v4.16-trust-drift

## 🚀 New Features & Enhancements

### 1. Temporal Trust Drift Engine & Dynamic Decay Gates (AIOS Phase 146)
- **時間依存型信頼劣化モデル (Temporal Trust Decay Model)**:
  - 信頼スコアを静的スナップショットから、最終検証経過時間 `t` に依存する動的指数関数 `Trust(t) = BaseTrust * T_time * T_event * T_graph` へ変革する `trust_drift_engine.py` を実装。
- **3層決定論的統合 (Deterministic Integration Formula)**:
  - `T_time` (時間減衰因子: `e^(-λt)`), `T_event` (履歴ペナルティ: `0.2` or `1.0`), `T_graph` (構造的な親ノード減衰の引き継ぎ) の3つを、`Time ➔ Event ➔ Graph` の順にシングルパスでトポロジカル計算する決定論的エンジンを構築。
- **下流ノードへの減衰増幅伝播 (Drift Propagation & Amplification)**:
  - 親ノードの信頼低下が、下流のノード（Reviewer 1.1倍, Plugin 1.2倍, Agent 1.3倍）へドミノ倒しのように増幅して伝播されるセキュア設計を結合。
- **時間切れ自動ロック (Stale validation Lock)**:
  - `architecture_reviewer.py` の実行時、最終検証から一定時間放置され、AIエージェントのスコアが `Critical Drift (<0.3)` へ落ち込んでいる場合、Rule 021 に基づき即座にビルド・コミット処理全体を強制アボートする執行ゲートを統合。

---

# Release Notes - v4.15-trust-propagation

## 🚀 New Features & Enhancements

### 1. Stateless Trust Propagation Graph & Append-Only Event Logs (AIOS Phase 145)
- **動的信頼伝播グラフ (Trust Propagation State Graph) の構築**:
  - システム内の各コンポーネント（Kernel, Reviewer, Plugin, AI Agent）をノードとし、減衰係数を伴う有向非巡回グラフ（DAG）モデルに基づき動的信頼スコアを伝播計算するエンジン `trust_graph_engine.py` を実装。
- **追加専用イベントログ (Append-Only Event Log) による SSOT 化**:
  - `trust_event_log.jsonl` を不変の信頼源（SoT）として運用。状態変更イベント（`BOOT_SUCCESS`, `VALIDATION_FAILED`, `RE_APPROVE`）を時系列追記する仕組みへ変更。
  - `trust_registry.json` は計算結果の読み取り専用キャッシュ（Derived State）に格下げし、改ざん脆弱性を解消。
- **計算（Stateless Core）と執行（Enforcement）の分離**:
  - 状態を持たない純粋関数としての `compute_trust_graph()` と、しきい値ポリシー（ACTIVE/Restrict/SANDBOX/BLOCKED）を適用する `enforce_trust_policy()` に分割。レビューエンジンは読み取り専用で結果を執行するのみとし、循環評価を完全に防止。

---

# Release Notes - v4.14-boot-trust

## 🚀 New Features & Enhancements

### 1. Kernel Trust Bootstrap & Double-Embedded Golden Anchors (AIOS Phase 144)
- **信頼の起源 (Root of Trust) の確立**:
  - `aios_kernel_daemon.js` の SHA-256 不変ゴールデンハッシュ値を定義し、外部JSONではなくスクリプト内（Nodeデーモン、Pythonプロキシ、レビューエンジン）に二重ハードコード（Double-Embedded constants）で保持。AIによるハッシュ改ざんの攻撃面を完全に排除。
- **ブートストラップ循環依存の解消 (Pre-Boot / Trusted Mode)**:
  - 起動直後の **Pre-Trust Mode (Pre-Boot)** を実装。IPC（標準入出力）を完全にシャットアウトし、HMACセッション鍵もメモリ上に存在しない状態から開始。
  - 自身のファイルハッシュ（ハッシュ埋め込み行のコメント部を除外した正規ハッシュ）を計算し、Embedded Root Hash と照合する Pre-Boot 整合性検証を実行。
  - 検証が PASS した時点でのみ **Trusted Mode** へ状態遷移し、初めて HMAC セッションキーをロード・生成して IPC ポートをアンロック（ハッシュ不一致時は `exit 1` 強制停止）。
- **最上位検証ゲート (Rule 019: Kernel Attestation)**:
  - `architecture_reviewer.py` の静的検査開始時、一番最初にプロキシを介して `getKernelAttestation` を呼び出し、カーネルが整合性チェックをパスして `TRUSTED` であることをダブルチェックで検証する最上位強制ゲートを構築。

---

# Release Notes - v4.13-isolated-kernel

## 🚀 New Features & Enhancements

### 1. Physical OS Kernel Separation & IPC Sandbox Layer (AIOS Phase 143)
- **カーネルプロセスの物理隔離 (Physical Separation)**:
  - AI プロセス（Python/Gemini）から完全に隔離された独立の **Node.js カーネルデーモン (`aios_kernel_daemon.js`)** を新規実装。
- **リプレイ対策付き Secure IPC 通信**:
  - stdin/stdout パイプラインを介した JSON-RPC プロトコル。
  - 各メッセージに `executionSessionId`, `timestamp`, およびランダムな `nonce` を付与し、タイムスタンプドリフト（10秒）の検証およびメモリ内 `nonce` 重複排除によりリプレイ攻撃を物理防止。
- **暗号署名と問合せ型検証 (Kernel-Mediated Verification)**:
  - 署名用 HMAC-SHA256 キーをデーモン側の隔離された一時シークレットファイル `.kernel_secret` 内にのみ保持。
  - 静的レビュー時（`architecture_reviewer.py`）は、プロキシ経由で外部デーモンに `--verify-signature` 要求を送信し、署名の有効性を照合する問合せ型検証（秘密鍵の完全隔離）を実装。
- **改ざん証明書の物理検知**:
  - AIエージェント側で検証証明書の JSON を直接改ざんした場合に、署名検証エラーが発生してコミット・プッシュを完全アボートする振る舞いを実証。

---

# Release Notes - v4.12-logical-sandbox

## 🚀 New Features & Enhancements

### 1. Pre-Execution Validation Layer & Logical Sandbox (AIOS Phase 142)
- **論理的カーネル分離 (Logical Kernel Separation) の導入**:
  - AI プロセスの実行権限を剥離し、直接のコード編集を制限する論理隔離モデルを構築。
  - AI エージェントの修正提案を評価する独立コンポーネント `aios_kernel.py` (Logical Kernel) を新規実装。
- **実行前ゲート (Pre-Execution Validation Layer) と検証証明書の発行**:
  - `--validate-proposal <taskId> --proposal <patchFile>` コマンドにより、カーネルは「判断（検証）のみを行い、物理的な書き込み（実行）は行わない」境界要件に従って検証を処理。
  - すべての検証項目（`executionToken` や Rule 011〜017）をパスした場合に、署名付きの検証結果証明書 `proposal_validation_result.json` を発行する仕組みをプロトタイプ化。
- **Rule 016 (Kernel Isolation) & Rule 017 (Sandbox Enforcement)**:
  - 直接的なコード編集を禁止し、検証パス証明書を保持しないワーキングツリーの変更を物理ブロック。

---

# Release Notes - v4.11-execution-gate

## 🚀 New Features & Enhancements

### 1. Execution Gate & Self-Constraint OS (AIOS Phase 141)
- **AI 実行認可制御と Execution Token / Session の導入**:
  - 承認（`--approve`）に連動して発行される `executionToken` に加え、実装の開始および終了を管理する `executionSession`（`executionSessionId`, `executionStartedAt`, `executionEndedAt`）を導入。
  - セッションと実行主体エージェントを紐付ける **Execution Ownership (`executionOwner`)** 構造を構築。
- **5段階実行ステートマシンの統合**:
  - タスクの実行状態を `LOCKED` ➔ `AUTHORIZED` ➔ `RUNNING` ➔ `FINISHED` ➔ `EXPIRED` の5段階ステートとして厳密に制御。
  - セッション開始（`--start-execution`）およびセッション終了（`--finish-execution`）コマンドを実装。
- **Rule 013 (Execution Gate Rule) の保護対象拡張**:
  - `RUNNING` 状態以外の全ステータスにおいて、ソースコードに加え、walkthrough、release notes、plan定義、監査結果などの「AIが生成するすべての成果物」の書き出し・Git操作を禁止。
- **Rule 014 (Execution Token Validation) & Rule 015 (Single Active Execution)**:
  - `Rule 014`: トークン欠落・不整合・期限切れ時の実装を完全にブロック。
  - `Rule 015`: 1つのタスク（あるいはプロジェクト全体）で同時に `RUNNING` ステートになれるアクティブセッションを最大1つに制限し、競合時の実行開始要求を明確に拒否。

---

# Release Notes - v4.10-lifecycle-integration

## 🚀 New Features & Enhancements

### 1. Implementation Plan Hash Lock & Lifecycle Integration (AIOS Phase 140)
- **計画書ハッシュロックと Rule 012 の導入**:
  - 承認時に、現在の計画書（`implementation_plan.md`）の SHA-256 ハッシュ値を自動計算し、タスクの `"approvalHash"` に記録。
  - レビューエンジン `architecture_reviewer.py` に **Rule 012 (Implementation Plan Hash Rule)** を追加し、承認後の計画書の変更を静的エラーとして完全に検知・ブロック。
- **一意の承認 ID (approvalId) の割り当て**:
  - `python3 tools/ai_project_manager.py --approve` コマンドにより、一意のアプルーバル ID (`APR-<YYYYMMDD>-XXXX` 形式) を自動発行し、監査トレース能力を向上。
- **承認有効期限自動チェック (Approval Expiration)**:
  - 承認日時（`approvedAt`）から一定期間（デフォルト: 30日、環境変数により短縮可能）経過した承認を自動失効（`isApproved` を `false` に自動リセット）する時間監視ロジックを進行処理（`--tick` およびステータス遷移）へ統合。

---

# Release Notes - v4.9-approval-gate

## 🚀 New Features & Enhancements

### 1. Human Approval Gate OS Foundation 完成 (AIOS Phase 139)
- **構造化承認メタデータの適用 (`tools/ai_tasks.json`)**:
  - 各タスクに `approvalVersion: "1.0.0"`, `requiresApproval`, `isApproved`, `approvedBy`, `approvedAt` を含む `approval` オブジェクトを新設。
- **アプルーバルレベル (NONE / NORMAL / CRITICAL) の実装**:
  - `NONE`: 承認をバイパスして実装進行可。
  - `NORMAL`: 明示的な人間の承認（`isApproved == true`）を必須化。
  - `CRITICAL`: 人間の承認に加え、自動レビュー結果（`AUDIT_REVIEW_RESULT.json`）が PASS であることを進行条件に指定。
  - `ai_team_orchestrator.py` にて、`ASSIGNED` ➔ `IN_PROGRESS` への進行をこれら条件に基づき物理ロック。
- **承認制御 CLI の導入 (`tools/ai_project_manager.py`)**:
  - `python3 tools/ai_project_manager.py --approve <taskId> --by "Human"` を実装。承認実行により、監査ログ `APPROVAL_GRANTED` (eventVersion: "1.0.0") を `orchestrator_events.json` へ追跡記録。
- **静的レビュー検証ルール Rule 011 (Human Approval Rule) の統合**:
  - 未承認のタスクが存在する（コード編集が開始されているが、`isApproved == false`）場合に、`architecture_reviewer.py` およびプリコミットフック側で自動検知して `FAILED (ERROR)` ブロックする静的監査ガードを実装。

---

# Release Notes - v4.8-knowledge-os

## 🚀 New Features & Enhancements

### 1. Knowledge OS Foundation 完成 (AIOS Phase 138)
- **Project Manifest 基盤の導入 (`tools/ai_project_manifest.json`)**:
  - プロジェクトが依存している AIOS バージョン（`architectureVersion: "4.7"`, `minimumReviewVersion: "1.1.0"` など）の宣言的マニフェストファイルを新設。
- **自律的エラー学習エンジン (`tools/knowledge_compiler.py`)**:
  - 過去の全レビュー履歴から、繰り返し発生しているバグパターンのトリガーキー（正規表現等）と、解決テンプレート（`nextAction` などから自動構築）を自動コンパイルして `tools/knowledge_base.json` (知識データベース) へ動的蓄積。
- **実装前アドバイザリーエンジン (`tools/knowledge_consultant.py`)**:
  - 開発AIモデルが実装に入る直前に、過去にそのカテゴリで起こした違反傾向から、回避すべきナレッジと解決策テンプレートを事前にコンソール/JSONへ警告出力するコンサルティングシステムを構築。

### ⚠️ Known Issue & Post-Mortem (教訓)
- **課題**: Phase 138 において、人間の明示的な承認（Human Approval）を得る前に実装コードの作成が開始されてしまいました。
- **根本原因**: AIOS 自体のタスクアサイン・実行フローに、人の承認を強制ブロックする「Human Approval Gate」が設計に組み込まれていませんでした。
- **解決策**: 次のフェーズにおいて、承認が完了するまで次のステータス進行およびアサインをロックする「Human Approval Gate OS」を実装し、プロセスをシステムレベルで強制できるようにします。

---

# Release Notes - v4.7-project-os

## 🚀 New Features & Enhancements

### 1. Project OS Foundation 完成 (AIOS Phase 137)
- **複数 Workflow 統合 & マイルストーン制御**:
  - `ai_projects.json` にてマイルストーンを定義。複数のワークフローIDファイル（例: `WF-20260706-0001.json`、`WF-20260706-0002.json`）をマイルストーンに紐付けて包括的にライフサイクル制御。
- **Project State Machine (状態遷移マシン)**:
  - `PLANNING` ➔ `ACTIVE` ➔ `RELEASE_CANDIDATE` ➔ `RELEASED` ➔ `DEPLOYED` ➔ `ARCHIVED` 等のプロジェクトステート遷移と禁止逆行の整合性をガード。
- **Release Pipeline Stage Auto-Promotion**:
  - タスクおよび全ワークフローの進捗率を `--tick` で自動計算・集計（`summary` プロパティへ自動マージ）し、完了をトリガーにパイプラインステージを自動的に昇格。
- **Project Integrity Audit (構成整合性監査)**:
  - `--audit` により、指定されたマイルストーン/ワークフローファイルの有無、MilestoneID重複、不正ステージ進行などをビルド前に静的監査。
- **Project-wide Rollback & Event Auditing**:
  - 指定マイルストーンより先の進行度・アサインを一括で初期化するプロジェクトロールバック（`--rollback`）機能を実装。
  - ロールバック実行履歴は `PROJECT_ROLLBACK` イベントとして `orchestrator_events.json` へ `eventVersion: "1.0.0"` で自動的に追跡ログ記録。

---

# Release Notes - v4.6-workflow-engine

## 🚀 New Features & Enhancements

### 1. Workflow Engine Foundation 完成 (AIOS Phase 136)
- **並列タスクルーティング制御 (`parallelGroups`)**:
  - 先行の `TSK-0001` 完了後、依存する複数の並列タスク（`TSK-0002` と `TSK-0003`）を同時に活性化・アサインさせる並列グラフ解決機能を実装。
- **Merge Gate (マージゲート) 機能**:
  - 指定された全開発タスク（`TSK-0002`, `TSK-0003`）が完了するまで、最終リリースフェーズ（`TSK-0004`）のアサインをロックする不整合制御。ゲートにロック解除条件や理由を明示的に保持。
- **Workflow Integrity Audit (不整合監査システム)**:
  - `--audit` コマンドにより、閉路探索(DFS)を用いた循環依存（無限ループ）、デッドロック、タスクの欠落、マージゲート不整合を検出し、ビルドやプロジェクト実行前に未然に防ぐ品質ゲートを構築。
- **Task State Machine (状態遷移マシン) の厳格化**:
  - `TODO` ➔ `ASSIGNED` ➔ `IN_PROGRESS` ➔ `UNDER_REVIEW` ➔ `COMPLETED` 等の状態遷移ルールを定義。完了後のステータス逆行や不正ステップをガード。
- **Orchestration Event History (監査イベントログ) の構築 (`tools/orchestrator_events.json`)**:
  - 各レコードに `eventVersion: "1.0.0"` を持たせ、アサインやリトライ、フォールバック、ステータス変更の全遷移履歴をタイムスタンプ付きで記録。

---

# Release Notes - v4.5-ai-team-orchestration

## 🚀 New Features & Enhancements

### 1. AI Team Orchestrator Foundation 完成 (AIOS Phase 135)
- **Agent Registry の独立化 (`tools/ai_agents.json`)**:
  - AIモデルのアサイン可否、役割、および得意分野（`capabilities`：UI, GAS, Architecture 等）を管理する能力プロファイルを品質データと分離して定義。
- **タスク依存関係制御 (`dependsOn`)**:
  - 先行するタスクIDが `COMPLETED` になるまでアサインをロックする制約を追加。
- **最適AIモデルの自動マッチングと選定理由 (`assignmentReason`)**:
  - タスクの要求カテゴリに応じて適合するエージェントを自動選別し、さらに `ai_quality_report.json` 内で最もパフォーマンスが高いモデルをマッチング。アサイン理由を客観的メトリクスと共にログに記録。
- **リトライ管理 (`retryCount`) とエージェントの自動スイッチ（フォールバック）**:
  - レビューに3回以上連続で失敗した際、アサイン対象を他の適合エージェントに自動的に切り替えて警告を発生させるフォールバックシステムを実装。
- **ハンドオーバー仕様のバージョン管理 (`handoverVersion: "1.0.0"`)**:
  - レビュー失敗時の違反情報および self-healing 用の nextAction を引き渡す `tools/ai_handover.json` をバージョン管理付きで自動生成。

---

# Release Notes - v4.4-ai-continuous-improvement

## 🚀 New Features & Enhancements

### 1. AI Continuous Improvement Foundation 完成 (AIOS Phase 134)
- **構造化された Action Recommendations の自動生成**:
  - ルール違反の発生傾向を分析し、重要度・ステータス（`OPEN`）・根拠（`basedOn`：件数やそのカテゴリの合格率）を定義した機械的に処理可能な修正アドバイスを動的に出力。
- **Quality Score 構成要素の細分化**:
  - スコア算出式（`Score = 100 - errorPenalty - warningPenalty`）を明確に定義し、計算の透明性と追跡性を保持。
- **Trend Analysis (多層タイムウィンドウ)**:
  - 短期（`last10`）、中期（`last30`）、および長期（`overall`）の合格率を分離して追跡し、品質トレンドの変遷を記録。
- **Rule Heatmap (エラーヒートマップ) 可視化**:
  - ルールID（001〜010）ごとの違反件数を集計し、コンソール上に `■` を使ったヒートマップグラフを出力するダッシュボード機能を統合。

---

# Release Notes - v4.2-multi-ai-review

## 🚀 New Features & Enhancements

### 1. Multi-AI Review Orchestration Foundation 完成 (AIOS Phase 132)
- **エージェント識別メタデータの統合**: 
  - 成果物を提出したAIモデルを特定・追跡するための構造体（`agentId`, `agentName`, `agentRole`）をレビュー結果に統合。
- **3段階のレビュー検証ステータス**:
  - レビューの検証結果を `PASS` (違反0), `PASS_WITH_WARNING` (警告のみ), `FAILED` (エラーあり) の3段階で正確に評価・記録する仕組みを構築。
- **データカテゴリ集計とサマリー出力**:
  - `Database`, `Architecture`, `Security`, `UI`, `API` などのカテゴリ別に、違反件数（Errors, Warnings）およびステータスを可視化するサマリー集計を自動化。
- **AI向け構造化 `nextAction` および `remediation`**:
  - 違反を検出した際、AIが自己修復できるように具体的な修正アクションを配列形式（`nextAction`）および人間向けの修正方針（`remediation`）として JSON 出力に統合。

### 2. 外部 JSON Rule Engine 方式の採用
- 各ルールを Python 内に直接ハードコードせず、`tools/architecture_rules.json` (v1.1.0) に完全外出し。
- 今後のルール追加の際、Python エンジンを変更することなく JSON の設定変更のみで対応できる高い拡張性を担保。

---

# Release Notes - v4.1-audit-data-integrity

## 🚀 New Features & Enhancements

### 1. Area Metadata Foundation v1 完成
- `cityKana` / `townKana` の Single Source of Truth (SSOT) 確立。
  - 生成責務を `v2_extract.gs` に一本化し、`v2_map.gs` における二重生成・CSV再解析を完全排除しました。
  - カナ情報を `__TEMP_ADDRESSES__` (一時マスタ) ➔ `__SYSTEM_CACHE__` ➔ `areaSummary` ➔ Hアプリの順に一貫して伝播するクリーンなデータフローを構築。
- `AreaSummary` API の JSON レスポンス仕様（`version: 1`, `cityKana`, `townKana`, `repAddress` 等）を固定化。
- 将来の `AreaID` / `District` / `Prefecture` 等の拡張に備えたロードマップ設計（v1, v2, v3）を整備。

### 2. Hアプリ（配布員アプリ）検索・五十音インデックス基盤完成
- `active/mobile/render.js` および `app.js` を刷新。
- 第1層（自治体一覧）における各自治体の所属エリア数（シート数）の動的集計・表示。
- 第2層（エリア一覧）上部への「🔍 エリア検索窓」および「あ〜わ」の五十音インデックスボタンパネルの追加。
- サーバー通信を発生させずにメモリ上で即座にフィルタリングする `renderFilteredAreaList()` による爆速のUI応答性能を確保。

### 3. Audit OS v3.2（Data Integrity Audit）実装・検証完了
- `active/gas/v2_kernel.gs` (Version 3.2) におけるデータ整合性監査（Data Integrity Audit）の実装。
- 各工程（EXTRACT ➔ BATCH ➔ CACHE ➔ API）のタイミングにおいて、以下の論理的整合性をインメモリで検証し、`02_SYSTEM` フォルダへ `AUDIT_DATA_*.json` を自動保存する仕組みを統合。
  - **Sort Integrity (`auditSortIntegrity`)**: カナ順ソートの維持検証。
  - **Metadata Integrity (`auditMetadataIntegrity`)**: 必須カナ項目およびバージョン欠損の検出。
  - **Count Integrity (`auditCountIntegrity`)**: ステージ間におけるデータ件数ズレの検証。
  - **Hash Integrity (`auditHashIntegrity`)**: 改ざん検知用のステージ固有正規化ハッシュ比較検証。
  - **Schema Integrity (`auditSchemaIntegrity` - 予約実装)**: 将来のスキーマ拡張に追従する監査プレースホルダー。
- リセット（`deleteAllAreaSheets`）実行時に「チラシ保管庫」シートのデータ行も自動初期化（クリア）する安全なリセットポリシーを統合。

---

## 🐛 Bug Fixes
- **郵便番号ソート問題の解消**: `v2_batch.gs` の `forceStartBatch()` 内で SSOT 五十音ソート順を上書き破壊していた `addresses.sort()` 処理を完全に削除し、五十音順でのエリアシート生成順序を保護しました。
