# Execution Runtime Identity Specification

## 1. 目的 (Purpose)
Execution Runtime Identity は、AIOS (Artificial Intelligence Operating System) における論理メッセージ/チャネル等の認証主体（Identity Schema）の静的 Blueprint を定義し、その境界を表現する。ランタイム Identity 生成・検証・トークン処理等のロジックを持たない Read-Only Blueprint である。

## 2. 役割と責務境界 (Responsibilities & Boundaries)

### 2.1. 責務 (Responsibilities)
- 実行主体のメタデータ、コンテキスト、および静的モデルデータを定義する。
- 実行主体の静的 Blueprint を公開する。
- メタデータ、コンテキスト、モデルデータ、および Blueprint Container を多層的に `Object.freeze()` して完全な不変性を保証する。

### 2.2. 境界ルール (Boundary Rules) — Identity 生成・認証処理の完全排除
本 Identity は主体そのものを生成・認証・検証するクラスではなく、主体スキーマの Blueprint（定義情報）のみを表現する。
以下の操作・処理は完全に排除される：
- `createIdentity()`, `generateIdentity()`, `validateIdentity()`, `authenticate()`, `authorize()`, `issueToken()`, `createToken()`, `refreshToken()` などの動的実行ロジック。
- 主体の実データ（パスワード、トークン、秘密鍵、公開鍵、認証シークレット等）の保持。
- Promise, async / await, Timer, EventEmitter, Buffer操作, Stream操作。
- Session, Connection, SecureChannel, Protocol 等のインスタンスの保持・管理・生成。

> [!IMPORTANT]
> Identity はデータ契約のみを定義し、Runtime Identity Instance を生成しない。
> 将来 Execution Runtime Identity Runtime が追加されても、本 Blueprint は変更せず参照専用とする。

### 2.3. Context の制約
- `ExecutionRuntimeIdentityContext` は `runtimeIdentityId` のみ保持し、`identityRef`・`credential`・`token`・`sessionRef`・`connectionRef` 等の実体参照や状態を示すプロパティを含まない（Context ID Only）。

---

## 3. 構造定義 (Structures)

### 3.1. IdentityType (分類定義)
主体の分類を示す静的列挙型。
- `FOUNDATION`: 基礎主体
- `RUNTIME`: 実実行主体

> [!IMPORTANT]
> `IdentityType` は Foundation における静的分類定義であり、ランタイムによる動的な追加・変更は完全に禁止される。

### 3.2. IdentityScope (スコープ定義)
主体のスコープを示す静的列挙型。
- `SYSTEM`: システムスコープ

> [!IMPORTANT]
> `IdentityScope` は Foundation における静的なスコープの定義であり、ランタイムによる動的な追加・変更は完全に禁止される。

### 3.3. RuntimeIdentityType (実行主体タイプ定義)
主体の役割を示す静的列挙型。
- `SYSTEM_IDENTITY`: システム主体
- `CORE_IDENTITY`: コア主体
- `APPLICATION_IDENTITY`: アプリケーション主体
- `PLUGIN_IDENTITY`: プラグイン主体
- `FIELD_IDENTITY`: フィールド主体

### 3.4. IdentityLifecycleState (主体ライフサイクル定義)
主体が経るべき静的ライフサイクル定義。
- `CREATED`: 生成状態
- `READY`: 準備完了状態
- `WAITING`: 待機状態
- `SEALED`: 封印状態
- `TERMINATED`: 終了状態

### 3.5. IdentityCapability (主体ケーパビリティ定義)
主体がサポートする能力を示す静的列挙型。
- `SYSTEM`, `APPLICATION`, `PLUGIN`, `FIELD`, `LOCAL`, `REMOTE`, `DISTRIBUTED`, `INTER_PROCESS`, `INTER_NODE`, `AI`, `WORKFLOW`, `MONITORING`

### 3.6. IdentityCategory (主体カテゴリ定義)
主体の論理的カテゴリ。
- `USER`, `SERVICE`, `SYSTEM`, `DEVICE`, `AGENT`, `PLUGIN`, `FIELD`, `SCHEMA_ONLY`

### 3.7. IdentityTrustPolicy (信頼ポリシー定義)
- `NONE`, `STATIC_TRUST`, `CERTIFICATE_REFERENCE`, `ATTESTATION_REFERENCE`, `SCHEMA_ONLY`

### 3.8. IdentityValidationPolicy (バリデーションポリシー定義)
主体が要求する検証ポリシーの静的定義。
- `NONE`, `SCHEMA`, `HEADER_ONLY`, `FULL`, `SCHEMA_ONLY`

### 3.9. IdentitySecurityPolicy (セキュリティポリシー定義)
- `NONE`, `SIGNATURE_REFERENCE`, `AUTH_REFERENCE`, `TRUST_REFERENCE`, `SCHEMA_ONLY`

### 3.10. IdentityExecutionPolicy (実行ポリシー定義)
不変性・決定論の保証、および一切の実行時処理を禁止するポリシーリスト。
- `READ_ONLY`, `DETERMINISTIC`, `IMMUTABLE_SCHEMA`
- `NO_THREAD`, `NO_QUEUE`, `NO_TASK`, `NO_WORKER`, `NO_DISPATCHER`, `NO_EVENT`, `NO_EVENT_BUS`, `NO_ROUTER`, `NO_TRANSPORT`, `NO_CONNECTION`, `NO_PROTOCOL`, `NO_SESSION`
- `NO_TOKEN`, `NO_CREDENTIAL`, `NO_AUTHENTICATION`, `NO_AUTHORIZATION`
- `NO_IDENTITY_CREATE`, `NO_IDENTITY_VALIDATE`

### 3.11. IdentityDependencyPolicy (依存関係ポリシー定義)
- `NO_DEPENDENCY`, `STATIC_DEPENDENCY`, `SCHEMA_ONLY`

### 3.12. IdentityTopology (トポロジー定義)
- `LOCAL`, `PROCESS`, `NODE`, `CLUSTER`, `DISTRIBUTED`

### 3.13. RuntimeIdentityMetadata (モデルメタデータ)
- `identityModelVersion`: 主体モデルバージョン
- `identitySchemaVersion`: 主体スキーマバージョン

### 3.14. RuntimeIdentityModel (静的モデル定義)
- `identityOrder`: 解決順序
- `supportedCapabilities`: ケーパビリティリスト
- `supportedTrustPolicies`: 信頼ポリシーリスト
- `supportedSecurityPolicies`: セキュリティポリシーリスト
- `supportedValidationPolicies`: バリデーションポリシーリスト
- `dependencyPolicy`: 依存ポリシー
- `topology`: ネットワークトポロジー
- `lifecycleStates`: ライフサイクル状態リスト
- `executionPolicies`: 実行ポリシーリスト
- `allowedSteps`: 許容ステップリスト
- `supportedSessionPolicies`: セッションポリシー
- `supportedConnectionPolicies`: コネクションポリシー
- `supportedSecureChannelPolicies`: セキュアチャネルポリシー

### 3.15. IdentityMetadata (主体メタデータ)
- `id`: 主体ID
- `name`: 主体名称
- `version`: バージョン
- `description`: 詳細説明
- `layer`: レイヤー階層名
- `category`: カテゴリ名

### 3.16. ExecutionRuntimeIdentityData (データ定義)
- `managerType`: `IdentityType`
- `managerScope`: `IdentityScope`
- `identityModels`: 静的主体モデルリスト

### 3.17. ExecutionRuntimeIdentityBlueprint (公開インターフェース)
外部に対して以下の読み取り専用 API のみを提供する。
- `getExecutionRuntimeIdentity()`
- `getMetadata()`
- `getContext()`
- `getData()`
- `getIdentityModels()`
- `getIdentitySequence()`

---

## 4. 設計原則の遵守 (Architecture Principles)

### 4.1. 完全な不変性 (Immutability)
関係するすべてのオブジェクト構造、コンテキスト、データ、および Blueprint Container は、多層的に `Object.freeze()` を適用し、改変を完全に禁止する。

### 4.2. 決定論 (Determinism)
同一のルール入力に対して、常に同一の `ExecutionRuntimeIdentity` 参照を返却する。遅延ロードや動的な状態変化などを完全に排除する。

---

## 5. 将来の拡張性 (Future Extensions)
将来のフェーズにおいて、以下の拡張機能が検討される：
- **Runtime Identity Engine**: 実際の通信時の認証、トークン署名、鍵共有、証明書検証の実行を司るアイデンティティ管理エンジン。
- **Process Execution Engine**: プロセス境界やコンテナ境界で認証情報を安全に共有する伝送エンジン。
- **Plugin Execution Runtime**: 独自のカスタムOAuth連携や、外部IDプロバイダ（IdP）連携を行うプラグイン。
- **AI Execution Runtime**: AIエージェントに一時的な認証認可トークンを発行し、セキュアに操作を実行させる自律エージェント認証エンジン。
- **Task Execution Controller**: 認証の有効期限（TTL）切れに伴うタスクの中断や、認可エラー時のバッファリングを制御するタスクコントローラ。
- **Execution Monitoring**: 認証失敗率、トークン失効数、認証処理レイテンシを監視するセキュリティ監査機能。
- **Sandboxed Execution**: サンドボックス隔離空間を跨いで安全にクレデンシャル情報を検証するサンドボックス境界制御。
