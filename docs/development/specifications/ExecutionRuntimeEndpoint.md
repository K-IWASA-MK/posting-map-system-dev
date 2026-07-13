# Execution Runtime Endpoint Specification

## 1. 目的 (Purpose)
Execution Runtime Endpoint は、AIOS (Artificial Intelligence Operating System) における論理通信終端境界（Endpoint Schema）の静的 Blueprint を定義し、その境界を表現する。ランタイムアドレス解決・開閉・ Endpoint 登録等のロジックを持たない Read-Only Blueprint である。

## 2. 役割と責務境界 (Responsibilities & Boundaries)

### 2.1. 責務 (Responsibilities)
- 実行エンドポイントのメタデータ、コンテキスト、および静的モデルデータを定義する。
- 実行エンドポイントの静的 Blueprint を公開する。
- メタデータ、コンテキスト、モデルデータ、および Blueprint Container を多層的に `Object.freeze()` して完全な不変性を保証する。

### 2.2. 境界ルール (Boundary Rules) — アドレス解決・Endpoint登録等の完全排除
本 Endpoint はエンドポイントを直接解決・生成・開閉・操作するクラスではなく、エンドポイントスキーマの Blueprint（定義情報）のみを表現する。
以下の操作・処理は完全に排除される：
- `createEndpoint()`, `generateEndpoint()`, `resolveEndpoint()`, `registerEndpoint()`, `openEndpoint()`, `closeEndpoint()`, `bindEndpoint()`, `lookupEndpoint()`, `discoverEndpoint()`, `connectEndpoint()` などの動的実行ロジック。
- エンドポイントの実データ構造（IPアドレス実体、DNSリゾルバ、接続先URL、ホスト名、ポート番号等）の保持。
- Promise, async / await, Timer, EventEmitter, Buffer操作, Stream操作。
- IP Address 実体, Port情報, DNS Resolver, Socket Instance, Connection Instance, Transport Instance, Network Adapter, Endpoint Runtime Object 等のインスタンスの保持・管理・生成。

> [!IMPORTANT]
> Endpoint はデータ契約のみを定義し、Runtime Endpoint Instance を生成しない。
> 将来 Execution Runtime Endpoint Runtime が追加されても、本 Blueprint は変更せず参照専用とする。

### 2.3. Context の制約
- `ExecutionRuntimeEndpointContext` は `runtimeEndpointId` のみ保持し、`endpointRef`・`transportRef`・`connectionRef`・`socketRef`・`address`・`host`・`port`・`hostname`・`url`・`path`・`target` 等の実体参照や状態を示すプロパティを含まない（Context ID Only）。

---

## 3. 構造定義 (Structures)

### 3.1. EndpointType (分類定義)
エンドポイントの分類を示す静的列挙型。
- `FOUNDATION`: 基礎エンドポイント
- `RUNTIME`: 実実行エンドポイント

> [IMPORTANT]
> `EndpointType` は Foundation における静的分類定義であり、ランタイムによる動的な追加・変更は完全に禁止される。

### 3.2. EndpointScope (スコープ定義)
エンドポイントのスコープを示す静的列挙型。
- `SYSTEM`: システムスコープ

> [IMPORTANT]
> `EndpointScope` は Foundation における静的なスコープの定義であり、ランタイムによる動的な追加・変更は完全に禁止される。

### 3.3. RuntimeEndpointType (実行エンドポイントタイプ定義)
エンドポイントの用途を示す静的列挙型。
- `SYSTEM_ENDPOINT`: システムエンドポイント
- `CORE_ENDPOINT`: コアエンドポイント
- `APPLICATION_ENDPOINT`: アプリケーションエンドポイント
- `PLUGIN_ENDPOINT`: プラグインエンドポイント
- `FIELD_ENDPOINT`: フィールドエンドポイント

### 3.4. EndpointLifecycleState (ライフサイクル定義)
エンドポイントが経るべき静的ライフサイクル定義。
- `CREATED`: 生成状態
- `READY`: 準備完了状態
- `WAITING`: 待機状態
- `SEALED`: 封印状態
- `TERMINATED`: 終了状態

### 3.5. EndpointCapability (ケーパビリティ定義)
エンドポイントがサポートする能力を示す静的列挙型。
- `SYSTEM`, `APPLICATION`, `PLUGIN`, `FIELD`, `LOCAL`, `REMOTE`, `DISTRIBUTED`, `INTER_PROCESS`, `INTER_NODE`, `AI`, `WORKFLOW`, `MONITORING`

### 3.6. EndpointCategory (カテゴリ定義)
エンドポイントの論理的カテゴリ。
- `LOCAL`, `REMOTE`, `SERVICE`, `DEVICE`, `APPLICATION`, `SCHEMA_ONLY`

### 3.7. EndpointAddressPolicy (アドレスポリシー定義)
- `STATIC_REFERENCE`, `SCHEMA_ONLY`

### 3.8. EndpointResolutionPolicy (解決ポリシー定義)
- `NONE`, `STATIC_ONLY`, `SCHEMA_ONLY`

### 3.9. EndpointValidationPolicy (バリデーションポリシー定義)
エンドポイントが要求する検証ポリシーの静的定義。
- `NONE`, `HEADER_ONLY`, `SCHEMA`, `FULL`, `SCHEMA_ONLY`

### 3.10. EndpointExecutionPolicy (実行ポリシー定義)
不変性・決定論の保証、および一切の実行時処理を禁止するポリシーリスト。
- `READ_ONLY`, `DETERMINISTIC`, `IMMUTABLE_SCHEMA`
- `NO_THREAD`, `NO_QUEUE`, `NO_TASK`, `NO_WORKER`
- `NO_EVENT`, `NO_EVENT_BUS`, `NO_ROUTER`
- `NO_ENDPOINT_CREATE`, `NO_ENDPOINT_RESOLVE`, `NO_ENDPOINT_REGISTER`
- `NO_ADDRESS_LOOKUP`, `NO_PORT_BIND`
- `NO_CONNECT`, `NO_DISCOVER`

### 3.11. EndpointDependencyPolicy (依存関係ポリシー定義)
- `NO_DEPENDENCY`, `STATIC_DEPENDENCY`, `SCHEMA_ONLY`

### 3.12. EndpointTopology (トポロジー定義)
- `LOCAL`, `PROCESS`, `NODE`, `CLUSTER`, `DISTRIBUTED`

### 3.13. RuntimeEndpointMetadata (モデルメタデータ)
- `endpointModelVersion`: バージョン
- `endpointSchemaVersion`: スキーマバージョン

### 3.14. RuntimeEndpointModel (静的モデル定義)
- `endpointOrder`: 解決順序
- `supportedCapabilities`: ケーパビリティリスト
- `supportedEndpointPolicies`: ポリシー名リスト
- `supportedAddressPolicies`: アドレスポリシーリスト
- `supportedResolutionPolicies`: 解決ポリシーリスト
- `supportedValidationPolicies`: バリデーションポリシーリスト
- `dependencyPolicy`: 依存ポリシー
- `topology`: ネットワークトポロジー
- `lifecycleStates`: ライフサイクル状態リスト
- `executionPolicies`: 実行ポリシーリスト
- `allowedSteps`: 許容ステップリスト
- `supportedTransportPolicies`: トランスポートポリシーリスト
- `supportedConnectionPolicies`: コネクションポリシーリスト
- `supportedIdentityPolicies`: 主体ポリシーリスト

### 3.15. EndpointMetadata (データメタデータ)
- `id`: ID
- `name`: 名称
- `version`: バージョン
- `description`: 詳細説明
- `layer`: レイヤー階層名
- `category`: カテゴリ名

### 3.16. ExecutionRuntimeEndpointData (エンドポイントデータ定義)
- `managerType`: `EndpointType`
- `managerScope`: `EndpointScope`
- `endpointModels`: 静的エンドポイントモデルリスト

### 3.17. ExecutionRuntimeEndpointBlueprint (公開インターフェース)
外部に対して以下の読み取り専用 API のみを提供する。
- `getExecutionRuntimeEndpoint()`
- `getMetadata()`
- `getContext()`
- `getData()`
- `getEndpointModels()`
- `getEndpointSequence()`

---

## 4. 設計原則の遵守 (Architecture Principles)

### 4.1. 完全な不変性 (Immutability)
関係するすべてのオブジェクト構造、コンテキスト、データ、および Blueprint Container は、多層的に `Object.freeze()` を適用し、改変を完全に禁止する。

### 4.2. 決定論 (Determinism)
同一のルール入力に対して、常に同一の `ExecutionRuntimeEndpoint` 参照を返却する。遅延ロードや動的な状態変化などを完全に排除する。

---

## 5. 将来の拡張性 (Future Extensions)
将来のフェーズにおいて、以下の拡張機能が検討される：
- **Runtime Endpoint Engine**: 実際の通信時のホストアドレス解決、DNS lookup、ポートバインディング、および通信開始・Endpoint開閉を制御するエンドポイント処理エンジン。
- **Process Communication Bridge**: プロセス境界やコンテナ境界で IPC エンドポイントを解決して接続ターゲットを生成するブリッジ。
- **Plugin Resolution Controller**: 独自のサービスディスカバリ（Consul, mdns等）や、動的アドレス名前解決の仕組みを組み込むプラグイン。
- **AI Targeting Runtime**: AIエージェントに自律通信のエンドポイントを動的解決して接続するターゲット制御ランタイム。
- **Task Transport Controller**: アドレス解決失敗時のリトライ、フェイルオーバー先エンドポイントの動的切り替えを制御するタスクコントローラ。
- **Execution Performance Monitoring**: 名前解決時間、バインディング成功レート、エンドポイント到達可能性（Ping遅延等）を監視する監査機能。
- **Sandboxed Endpoint**: サンドボックス隔離空間のアクセス先ポートやホストを検証し、許可されたエンドポイントのみ接続をバインドするサンドボックス境界制御。
