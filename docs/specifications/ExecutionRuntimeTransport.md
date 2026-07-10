# Execution Runtime Transport Specification

## 1. 目的 (Purpose)
Execution Runtime Transport は、AIOS (Artificial Intelligence Operating System) における論理接続・データ配送トポロジー境界（Transport Schema）の静的 Blueprint を定義し、その境界を表現する。ランタイム接続・切断・送受信・Listen・Bind・データルーティング等のロジックを持たない Read-Only Blueprint である。

## 2. 役割と責務境界 (Responsibilities & Boundaries)

### 2.1. 責務 (Responsibilities)
- 実行トランスポートのメタデータ、コンテキスト、および静的モデルデータを定義する。
- 実行トランスポートの静的 Blueprint を公開する。
- メタデータ、コンテキスト、モデルデータ、および Blueprint Container を多層的に `Object.freeze()` して完全な不変性を保証する。

### 2.2. 境界ルール (Boundary Rules) — 送受信・Listen等の完全排除
本 Transport はトランスポートを直接生成・接続・操作するクラスではなく、トランスポートスキーマの Blueprint（定義情報）のみを表現する。
以下の操作・処理は完全に排除される：
- `createTransport()`, `openTransport()`, `closeTransport()`, `connect()`, `disconnect()`, `listen()`, `bind()`, `send()`, `receive()`, `transfer()`, `route()`, `dispatch()` などの動的実行ロジック。
- トランスポートの実データ構造（接続状態、TCP/UDPソケット、メモリアドレス、ポート番号等）の保持。
- Promise, async / await, Timer, EventEmitter, Buffer操作, Stream操作。
- TCP Socket, UDP Socket, IPC Channel, Connection Instance, Stream Instance, Transport Runtime Object, Network Adapter 等のインスタンスの保持・管理・生成。

> [!IMPORTANT]
> Transport はデータ契約のみを定義し、Runtime Transport Instance を生成しない。
> 将来 Execution Runtime Transport Runtime が追加されても、本 Blueprint は変更せず参照専用とする。

### 2.3. Context の制約
- `ExecutionRuntimeTransportContext` は `runtimeTransportId` のみ保持し、`transportRef`・`connectionRef`・`socketRef`・`streamRef`・`protocolRef`・`endpoint`・`address`・`port` 等の実体参照や状態を示すプロパティを含まない（Context ID Only）。

---

## 3. 構造定義 (Structures)

### 3.1. TransportType (分類定義)
トランスポートの分類を示す静的列挙型。
- `FOUNDATION`: 基礎トランスポート
- `RUNTIME`: 実実行トランスポート

> [IMPORTANT]
> `TransportType` は Foundation における静的分類定義であり、ランタイムによる動的な追加・変更は完全に禁止される。

### 3.2. TransportScope (スコープ定義)
トランスポートのスコープを示す静的列挙型。
- `SYSTEM`: システムスコープ

> [IMPORTANT]
> `TransportScope` は Foundation における静的なスコープの定義であり、ランタイムによる動的な追加・変更は完全に禁止される。

### 3.3. RuntimeTransportType (実行トランスポートタイプ定義)
トランスポートの用途を示す静的列挙型。
- `SYSTEM_TRANSPORT`: システムトランスポート
- `CORE_TRANSPORT`: コアトランスポート
- `APPLICATION_TRANSPORT`: アプリケーショントランスポート
- `PLUGIN_TRANSPORT`: プラグイントランスポート
- `FIELD_TRANSPORT`: フィールドトランスポート

### 3.4. TransportLifecycleState (ライフサイクル定義)
トランスポートが経るべき静的ライフサイクル定義。
- `CREATED`: 生成状態
- `READY`: 準備完了状態
- `WAITING`: 待機状態
- `SEALED`: 封印状態
- `TERMINATED`: 終了状態

### 3.5. TransportCapability (ケーパビリティ定義)
トランスポートがサポートする能力を示す静的列挙型。
- `SYSTEM`, `APPLICATION`, `PLUGIN`, `FIELD`, `LOCAL`, `REMOTE`, `DISTRIBUTED`, `INTER_PROCESS`, `INTER_NODE`, `AI`, `WORKFLOW`, `MONITORING`

### 3.6. TransportCategory (カテゴリ定義)
トランスポートの論理的カテゴリ。
- `NETWORK`, `IPC`, `LOCAL`, `REMOTE`, `DISTRIBUTED`, `SCHEMA_ONLY`

### 3.7. TransportProtocolPolicy (プロトコルポリシー定義)
- `STATIC_ONLY`, `SCHEMA_ONLY`

### 3.8. TransportConnectionPolicy (コネクションポリシー定義)
- `NO_CONNECTION`, `STATIC_REFERENCE`, `SCHEMA_ONLY`

### 3.9. TransportValidationPolicy (バリデーションポリシー定義)
トランスポートが要求する検証ポリシーの静的定義。
- `NONE`, `HEADER_ONLY`, `SCHEMA`, `FULL`, `SCHEMA_ONLY`

### 3.10. TransportExecutionPolicy (実行ポリシー定義)
不変性・決定論の保証、および一切の実行時処理を禁止するポリシーリスト。
- `READ_ONLY`, `DETERMINISTIC`, `IMMUTABLE_SCHEMA`
- `NO_THREAD`, `NO_QUEUE`, `NO_TASK`, `NO_WORKER`
- `NO_EVENT`, `NO_EVENT_BUS`, `NO_ROUTER`
- `NO_TRANSPORT_CREATE`, `NO_TRANSPORT_OPEN`, `NO_TRANSPORT_CLOSE`
- `NO_CONNECT`, `NO_DISCONNECT`, `NO_LISTEN`, `NO_BIND`
- `NO_SEND`, `NO_RECEIVE`, `NO_ROUTE`, `NO_DISPATCH`

### 3.11. TransportDependencyPolicy (依存関係ポリシー定義)
- `NO_DEPENDENCY`, `STATIC_DEPENDENCY`, `SCHEMA_ONLY`

### 3.12. TransportTopology (トポロジー定義)
- `LOCAL`, `PROCESS`, `NODE`, `CLUSTER`, `DISTRIBUTED`

### 3.13. RuntimeTransportMetadata (モデルメタデータ)
- `transportModelVersion`: バージョン
- `transportSchemaVersion`: スキーマバージョン

### 3.14. RuntimeTransportModel (静的モデル定義)
- `transportOrder`: 解決順序
- `supportedCapabilities`: ケーパビリティリスト
- `supportedTransportPolicies`: ポリシー名リスト
- `supportedValidationPolicies`: バリデーションポリシーリスト
- `supportedConnectionPolicies`: コネクションポリシーリスト
- `supportedProtocolPolicies`: プロトコルポリシーリスト
- `dependencyPolicy`: 依存ポリシー
- `topology`: ネットワークトポロジー
- `lifecycleStates`: ライフサイクル状態リスト
- `executionPolicies`: 実行ポリシーリスト
- `allowedSteps`: 許容ステップリスト

### 3.15. TransportMetadata (データメタデータ)
- `id`: ID
- `name`: 名称
- `version`: バージョン
- `description`: 詳細説明
- `layer`: レイヤー階層名
- `category`: カテゴリ名

### 3.16. ExecutionRuntimeTransportData (トランスポートデータ定義)
- `managerType`: `TransportType`
- `managerScope`: `TransportScope`
- `transportModels`: 静的トランスポートモデルリスト

### 3.17. ExecutionRuntimeTransportBlueprint (公開インターフェース)
外部に対して以下の読み取り専用 API のみを提供する。
- `getExecutionRuntimeTransport()`
- `getMetadata()`
- `getContext()`
- `getData()`
- `getTransportModels()`
- `getTransportSequence()`

---

## 4. 設計原則の遵守 (Architecture Principles)

### 4.1. 完全な不変性 (Immutability)
関係するすべてのオブジェクト構造、コンテキスト、データ、および Blueprint Container は、多層的に `Object.freeze()` を適用し、改変を完全に禁止する。

### 4.2. 決定論 (Determinism)
同一のルール入力に対して、常に同一の `ExecutionRuntimeTransport` 参照を返却する。遅延ロードや動的な状態変化などを完全に排除する。

---

## 5. 将来の拡張性 (Future Extensions)
将来のフェーズにおいて、以下の拡張機能が検討される：
- **Runtime Transport Engine**: 実際の通信時のトランスポート生成、Listen、Bind、データ送受信、コネクションプール管理を実行するトランスポート処理エンジン。
- **Process Communication Bridge**: プロセス境界やコンテナ境界で IPC トランスポートを介してデータパケットを高速伝送するトランスポートブリッジ。
- **Plugin Protocol Controller**: 独自のカスタム暗号化フィルター（TLSハンドシェイク等）や、圧縮トランスポート層（HTTP/2, HTTP/3 QUIC等）のコーデックの組み込みを行うプラグイン。
- **AI Routing Runtime**: AIエージェントにトランスポート接続ポートを割り当てて低遅延で双方向通信を実行するトランスポート制御ランタイム。
- **Task Transport Controller**: トランスポート接続の再接続、バックオフ、キープアライブ制御、および背圧フロー制御を制御するタスクコントローラ。
- **Execution Performance Monitoring**: トランスポート遅延、コネクション数、再送パケット数、メモリ割当量を監視する監査機能。
- **Sandboxed Transport**: サンドボックス隔離空間のネットワークアクセス範囲（ホワイトリストドメイン等）を安全なトランスポート層にカプセル化して制限するサンドボックス境界制御。
