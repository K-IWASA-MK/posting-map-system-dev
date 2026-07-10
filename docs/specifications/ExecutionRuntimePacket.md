# Execution Runtime Packet Specification

## 1. 目的 (Purpose)
Execution Runtime Packet は、AIOS (Artificial Intelligence Operating System) における通信データの最小単位（Packet Schema）の静的 Blueprint を定義し、その境界を表現する。ランタイムパケット送受信・処理ロジックを持たない Read-Only Blueprint である。

## 2. 役割と責務境界 (Responsibilities & Boundaries)

### 2.1. 責務 (Responsibilities)
- 実行パケットのメタデータ、コンテキスト、および静的モデルデータを定義する。
- 実行パケットの静的 Blueprint を公開する。
- メタデータ、コンテキスト、モデルデータ、および Blueprint Container を多層的に `Object.freeze()` して完全な不変性を保証する。

### 2.2. 境界ルール (Boundary Rules) — パケット送受信・処理ロジックの完全排除
本 Packet はパケットそのものを保持・生成・シリアライズするクラスではなく、パケットスキーマの Blueprint（定義情報）のみを表現する。
以下の操作・処理は完全に排除される：
- `createPacket()`, `buildPacket()`, `parsePacket()`, `serializePacket()`, `deserializePacket()`, `sendPacket()`, `receivePacket()`, `fragmentPacket()`, `reassemblePacket()`, `ackPacket()`, `retryPacket()`, `compressPacket()`, `decompressPacket()`, `encryptPacket()`, `decryptPacket()` などの動的実行ロジック。
- パケットの内容（Header、Payload、Checksum等）の実データ構造の保持。
- Promise, async / await, Timer, EventEmitter, Buffer操作, Stream操作。
- Session, Connection, Transport, Protocol, Socket, Stream, Kernel, Thread, Worker 等のインスタンスの保持・管理・生成。

> [!IMPORTANT]
> Packet はデータ契約のみを定義し、Runtime Packet Instance を生成しない。
> 将来 Execution Runtime Packet Runtime が追加されても、本 Blueprint は変更せず参照専用とする。

### 2.3. Context の制約
- `ExecutionRuntimePacketContext` は `runtimePacketId` のみ保持し、`packetRef`・`payload`・`header`・`body`・`buffer` 等の実体参照や状態を示すプロパティを含まない（Context ID Only）。

---

## 3. 構造定義 (Structures)

### 3.1. PacketType (分類定義)
パケットの分類を示す静的列挙型。
- `FOUNDATION`: 基礎パケット
- `RUNTIME`: 実実行パケット

> [!IMPORTANT]
> `PacketType` は Foundation における静的分類定義であり、ランタイムによる動的な追加・変更は完全に禁止される。

### 3.2. PacketScope (スコープ定義)
パケットのスコープを示す静的列挙型。
- `SYSTEM`: システムスコープ

> [!IMPORTANT]
> `PacketScope` は Foundation における静的なスコープの定義であり、ランタイムによる動的な追加・変更は完全に禁止される。

### 3.3. RuntimePacketType (実行パケットタイプ定義)
パケットのデータ用途を示す静的列挙型。
- `SYSTEM_PACKET`: システムパケット
- `CORE_PACKET`: コアパケット
- `APPLICATION_PACKET`: アプリケーションパケット
- `PLUGIN_PACKET`: プラグインパケット
- `FIELD_PACKET`: フィールドパケット

### 3.4. PacketLifecycleState (パケットライフサイクル定義)
パケットが経るべき静的ライフサイクル定義。
- `CREATED`: 生成状態
- `READY`: 準備完了状態
- `WAITING`: 待機状態
- `SEALED`: 封印状態
- `TERMINATED`: 終了状態

### 3.5. PacketCapability (パケットケーパビリティ定義)
パケットがサポートする能力を示す静的列挙型。
- `SYSTEM`, `APPLICATION`, `PLUGIN`, `FIELD`, `LOCAL`, `REMOTE`, `DISTRIBUTED`, `INTER_PROCESS`, `INTER_NODE`, `AI`, `WORKFLOW`, `MONITORING`

### 3.6. PacketCategory (パケットカテゴリ定義)
パケットの論理的カテゴリ。
- `CONTROL`: 制御パケット
- `DATA`: データパケット
- `SYSTEM`: システムパケット
- `APPLICATION`: アプリケーションパケット
- `SCHEMA_ONLY`: スキーマ定義専用

### 3.7. PacketFormatPolicy (フォーマットポリシー定義)
パケットが許可するフォーマット形式の静的定義。
- `JSON`, `BINARY`, `PROTOBUF`, `MSGPACK`, `SCHEMA_ONLY`

### 3.8. PacketValidationPolicy (バリデーションポリシー定義)
パケットが要求する検証ポリシーの静的定義。
- `NONE`, `HEADER_ONLY`, `SCHEMA`, `FULL`, `SCHEMA_ONLY`

### 3.9. PacketExecutionPolicy (実行ポリシー定義)
不変性・決定論の保証、および一切の実行時処理を禁止するポリシーリスト。
- `READ_ONLY`, `DETERMINISTIC`, `IMMUTABLE_SCHEMA`
- `NO_THREAD`, `NO_QUEUE`, `NO_TASK`, `NO_WORKER`, `NO_DISPATCHER`, `NO_EVENT`, `NO_EVENT_BUS`, `NO_ROUTER`, `NO_TRANSPORT`, `NO_CONNECTION`, `NO_PROTOCOL`, `NO_SESSION`, `NO_SOCKET`, `NO_STREAM`
- `NO_PACKET_BUILD`, `NO_PACKET_PARSE`, `NO_PACKET_SEND`, `NO_PACKET_RECEIVE`
- `NO_FRAGMENT`, `NO_REASSEMBLY`, `NO_ACK`, `NO_RETRY`

### 3.10. PacketDependencyPolicy (依存関係ポリシー定義)
- `NO_DEPENDENCY`, `STATIC_DEPENDENCY`, `SCHEMA_ONLY`

### 3.11. PacketTopology (トポロジー定義)
- `LOCAL`, `PROCESS`, `NODE`, `CLUSTER`, `DISTRIBUTED`

### 3.12. RuntimePacketMetadata (モデルメタデータ)
- `packetModelVersion`: パケットモデルバージョン
- `packetSchemaVersion`: パケットスキーマバージョン

### 3.13. RuntimePacketModel (静的モデル定義)
- `packetType`: 実行パケットタイプ (`RuntimePacketType`)
- `modelId`: モデルID
- `metadata`: `RuntimePacketMetadata`
- `packetOrder`: 解決順序
- `supportedCapabilities`: ケーパビリティリスト
- `supportedPacketPolicies`: ポリシー名リスト
- `supportedFormatPolicies`: フォーマットポリシーリスト
- `supportedValidationPolicies`: バリデーションポリシーリスト
- `dependencyPolicy`: 依存ポリシー
- `topology`: ネットワークトポロジー
- `lifecycleStates`: ライフサイクル状態リスト
- `executionPolicies`: 実行ポリシーリスト
- `allowedSteps`: 許容ステップリスト
- `supportedConnectionPolicies`: コネクションポリシー
- `supportedTransportPolicies`: トランスポートポリシー
- `supportedProtocolPolicies`: プロトコルポリシー
- `supportedSessionPolicies`: セッションポリシー

### 3.14. ExecutionRuntimePacketContext (コンテキスト定義)
保持するのは以下の識別子 ID のみである：
- `runtimePacketId` (オブジェクト参照等は一切含まない)

### 3.15. PacketMetadata (パケットメタデータ)
- `id`: パケットID
- `name`: パケット名称
- `version`: バージョン
- `description`: 詳細説明
- `layer`: レイヤー階層名
- `category`: カテゴリ名

### 3.16. ExecutionRuntimePacketData (データ定義)
- `managerType`: `PacketType`
- `managerScope`: `PacketScope`
- `packetModels`: 静的パケットモデルリスト

### 3.17. ExecutionRuntimePacketBlueprint (公開インターフェース)
外部に対して以下の読み取り専用 API のみを提供する。
- `getExecutionRuntimePacket()`
- `getMetadata()`
- `getContext()`
- `getData()`
- `getPacketModels()`
- `getPacketSequence()`

---

## 4. 設計原則の遵守 (Architecture Principles)

### 4.1. 完全な不変性 (Immutability)
関係するすべてのオブジェクト構造、コンテキスト、データ、および Blueprint Container は、多層的に `Object.freeze()` を適用し、改変を完全に禁止する。

### 4.2. 決定論 (Determinism)
同一のルール入力に対して、常に同一の `ExecutionRuntimePacket` 参照を返却する。遅延ロードや動的な状態変化などを完全に排除する。

---

## 5. 将来の拡張性 (Future Extensions)
将来のフェーズにおいて、以下の拡張機能が検討される：
- **Runtime Packet Engine**: 実際のパケットのエンコード・デコード・組み立てを司る低レベルランタイムエンジン。
- **Process Execution Engine**: OSネイティブのプロセス境界で安全にパケットを受け渡す実行エンジン。
- **Plugin Execution Runtime**: 動的なパケット構造拡張や拡張ヘッダを検証するプラグインランタイム。
- **AI Execution Runtime**: AI推論タスク結果を格納するための柔軟な自律パケット実行ランタイム。
- **Task Execution Controller**: パケット化されたタスクメッセージの流量、順序を制御するタスクコントローラ。
- **Execution Monitoring**: パケット流量 (Throughput)、パケットロス率、レイテンシを計測するパフォーマンス可視化機能。
- **Sandboxed Execution**: 隔離されたサンドボックス環境間でシリアライズされたパケットを送受信するセキュア伝送機構。
