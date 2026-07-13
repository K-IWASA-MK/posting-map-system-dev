# Execution Runtime Port Specification

## 1. 目的 (Purpose)
Execution Runtime Port は、AIOS (Artificial Intelligence Operating System) における論理ポート境界（Port Schema）の静的 Blueprint を定義し、その境界を表現する。ランタイムポート開閉・バインド・データ送受信・データルーティング等のロジックを持たない Read-Only Blueprint である。

## 2. 役割と責務境界 (Responsibilities & Boundaries)

### 2.1. 責務 (Responsibilities)
- 実行ポートのメタデータ、コンテキスト、および静的モデルデータを定義する。
- 実行ポートの静的 Blueprint を公開する。
- メタデータ、コンテキスト、モデルデータ、および Blueprint Container を多層的に `Object.freeze()` して完全な不変性を保証する。

### 2.2. 境界ルール (Boundary Rules) — ポート開閉・送受信等の完全排除
本 Port はポートを直接生成・接続・操作するクラスではなく、ポートスキーマの Blueprint（定義情報）のみを表現する。
以下の操作・処理は完全に排除される：
- `createPort()`, `generatePort()`, `openPort()`, `closePort()`, `bindPort()`, `unbindPort()`, `connectPort()`, `disconnectPort()`, `listenPort()`, `sendPort()`, `receivePort()`, `routePort()`, `queuePort()` などの動的実行ロジック。
- ポートの実データ構造（接続状態、内部キュー、メモリアドレス、ポート番号、割当チャンネル等）の保持。
- Promise, async / await, Timer, EventEmitter, Buffer操作, Stream操作。
- Socket, Stream, Buffer, Connection, Transport, Endpoint Instance, Message Queue, Worker, Thread 等のインスタンスの保持・管理・生成。

> [!IMPORTANT]
> Port はデータ契約のみを定義し、Runtime Port Instance を生成しない。
> 将来 Execution Runtime Port Runtime が追加されても、本 Blueprint は変更せず参照専用とする。

### 2.3. Context の制約
- `ExecutionRuntimePortContext` は `runtimePortId` のみ保持し、`portRef`・`endpointRef`・`connectionRef`・`socketRef`・`streamRef`・`queue`・`buffer`・`address`・`number`・`channel` 等の実体参照や状態を示すプロパティを含まない（Context ID Only）。

---

## 3. 構造定義 (Structures)

### 3.1. PortType (分類定義)
ポートの分類を示す静的列挙型。
- `FOUNDATION`: 基礎ポート
- `RUNTIME`: 実実行ポート

> [IMPORTANT]
> `PortType` は Foundation における静的分類定義であり、ランタイムによる動的な追加・変更は完全に禁止される。

### 3.2. PortScope (スコープ定義)
ポートのスコープを示す静的列挙型。
- `SYSTEM`: システムスコープ

> [IMPORTANT]
> `PortScope` は Foundation における静的なスコープの定義であり、ランタイムによる動的な追加・変更は完全に禁止される。

### 3.3. RuntimePortType (実行ポートタイプ定義)
ポートの用途を示す静的列挙型。
- `SYSTEM_PORT`: システムポート
- `CORE_PORT`: コアポート
- `APPLICATION_PORT`: アプリケーションポート
- `PLUGIN_PORT`: プラグインポート
- `FIELD_PORT`: フィールドポート

### 3.4. PortLifecycleState (ライフサイクル定義)
ポートが経るべき静的ライフサイクル定義。
- `CREATED`: 生成状態
- `READY`: 準備完了状態
- `WAITING`: 待機状態
- `SEALED`: 封印状態
- `TERMINATED`: 終了状態

### 3.5. PortCapability (ケーパビリティ定義)
ポートがサポートする能力を示す静的列挙型。
- `SYSTEM`, `APPLICATION`, `PLUGIN`, `FIELD`, `LOCAL`, `REMOTE`, `DISTRIBUTED`, `INTER_PROCESS`, `INTER_NODE`, `AI`, `WORKFLOW`, `MONITORING`

### 3.6. PortCategory (カテゴリ定義)
ポートの論理的カテゴリ。
- `LOCAL`, `REMOTE`, `SERVICE`, `DEVICE`, `APPLICATION`, `SCHEMA_ONLY`

### 3.7. PortDirectionPolicy (方向ポリシー定義)
- `INBOUND`, `OUTBOUND`, `BIDIRECTIONAL`, `SCHEMA_ONLY`

### 3.8. PortValidationPolicy (バリデーションポリシー定義)
ポートが要求する検証ポリシーの静的定義。
- `NONE`, `HEADER_ONLY`, `SCHEMA`, `FULL`, `SCHEMA_ONLY`

### 3.9. PortExecutionPolicy (実行ポリシー定義)
不変性・決定論の保証、および一切の実行時処理を禁止するポリシーリスト。
- `READ_ONLY`, `DETERMINISTIC`, `IMMUTABLE_SCHEMA`
- `NO_THREAD`, `NO_QUEUE`, `NO_TASK`, `NO_WORKER`
- `NO_EVENT`, `NO_EVENT_BUS`, `NO_ROUTER`
- `NO_PORT_CREATE`, `NO_PORT_RESOLVE`, `NO_PORT_REGISTER`
- `NO_PORT_OPEN`, `NO_PORT_CLOSE`, `NO_PORT_BIND`, `NO_PORT_UNBIND`
- `NO_CONNECT`, `NO_DISCONNECT`, `NO_LISTEN`, `NO_SEND`, `NO_RECEIVE`, `NO_ROUTE`, `NO_QUEUE_PROCESS`

### 3.10. PortDependencyPolicy (依存関係ポリシー定義)
- `NO_DEPENDENCY`, `STATIC_DEPENDENCY`, `SCHEMA_ONLY`

### 3.11. PortTopology (トポロジー定義)
- `LOCAL`, `PROCESS`, `NODE`, `CLUSTER`, `DISTRIBUTED`

### 3.12. RuntimePortMetadata (モデルメタデータ)
- `portModelVersion`: バージョン
- `portSchemaVersion`: スキーマバージョン

### 3.13. RuntimePortModel (静的モデル定義)
- `portOrder`: 解決順序
- `supportedCapabilities`: ケーパビリティリスト
- `supportedPortPolicies`: ポリシー名リスト
- `supportedDirectionPolicies`: 方向ポリシーリスト
- `supportedValidationPolicies`: バリデーションポリシーリスト
- `dependencyPolicy`: 依存ポリシー
- `topology`: ネットワークトポロジー
- `lifecycleStates`: ライフサイクル状態リスト
- `executionPolicies`: 実行ポリシーリスト
- `allowedSteps`: 許容ステップリスト
- `supportedTransportPolicies`: トランスポートポリシーリスト
- `supportedConnectionPolicies`: コネクションポリシーリスト
- `supportedIdentityPolicies`: 主体ポリシーリスト

### 3.14. PortMetadata (データメタデータ)
- `id`: ID
- `name`: 名称
- `version`: バージョン
- `description`: 詳細説明
- `layer`: レイヤー階層名
- `category`: カテゴリ名

### 3.15. ExecutionRuntimePortData (ポートデータ定義)
- `managerType`: `PortType`
- `managerScope`: `PortScope`
- `portModels`: 静的ポートモデルリスト

### 3.16. ExecutionRuntimePortBlueprint (公開インターフェース)
外部に対して以下の読み取り専用 API のみを提供する。
- `getExecutionRuntimePort()`
- `getMetadata()`
- `getContext()`
- `getData()`
- `getPortModels()`
- `getPortSequence()`

---

## 4. 設計原則の遵守 (Architecture Principles)

### 4.1. 完全な不変性 (Immutability)
関係するすべてのオブジェクト構造、コンテキスト、データ、および Blueprint Container は、多層的に `Object.freeze()` を適用し、改変を完全に禁止する。

### 4.2. 決定論 (Determinism)
同一のルール入力に対して、常に同一の `ExecutionRuntimePort` 参照を返却する。遅延ロードや動的な状態変化などを完全に排除する。

---

## 5. 将来の拡張性 (Future Extensions)
将来のフェーズにおいて、以下の拡張機能が検討される：
- **Runtime Port Engine**: 実際の通信時のポートの開閉、データバインド、接続ポート確立、データルーティング、メッセージキュー分配を実行するポート処理エンジン。
- **Process Communication Bridge**: プロセス境界やコンテナ境界で IPC ポートを介してメッセージフレームを分配伝送するブリッジ。
- **Plugin Resolution Controller**: 独自のデータフィルタや、マルチチャンネルポート多重化の仕組みを組み込むプラグイン。
- **AI Routing Runtime**: AIエージェントに自律通信のポートを動的割り当てしてルーティング制御するポート制御ランタイム。
- **Task Transport Controller**: ポート転送バッファ溢れ時のバックプレッシャ、フロー制御、パケット再送制御を制御するタスクコントローラ。
- **Execution Performance Monitoring**: ポート間パケットスループット、キュー滞留時間、ポート接続エラーレートを監視する監査機能。
- **Sandboxed Port**: サンドボックス隔離空間のネットワークアクセス範囲（ポート制限等）を安全なポート層にカプセル化して制限するサンドボックス境界制御。
