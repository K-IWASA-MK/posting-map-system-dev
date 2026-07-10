# Execution Runtime Message Specification

## 1. 目的 (Purpose)
Execution Runtime Message は、AIOS (Artificial Intelligence Operating System) における論理メッセージ（Message Schema）の静的 Blueprint を定義し、その境界を表現する。ランタイムメッセージ送受信・処理ロジックを持たない Read-Only Blueprint である。

## 2. 役割と責務境界 (Responsibilities & Boundaries)

### 2.1. 責務 (Responsibilities)
- 実行メッセージのメタデータ、コンテキスト、および静的モデルデータを定義する。
- 実行メッセージの静的 Blueprint を公開する。
- メタデータ、コンテキスト、モデルデータ、および Blueprint Container を多層的に `Object.freeze()` して完全な不変性を保証する。

### 2.2. 境界ルール (Boundary Rules) — メッセージ送受信・処理ロジックの完全排除
本 Message はメッセージそのものを保持・生成・ルーティングするクラスではなく、メッセージスキーマの Blueprint（定義情報）のみを表現する。
以下の操作・処理は完全に排除される：
- `createMessage()`, `buildMessage()`, `parseMessage()`, `sendMessage()`, `receiveMessage()`, `replyMessage()`, `forwardMessage()`, `routeMessage()`, `dispatchMessage()`, `broadcastMessage()`, `multicastMessage()`, `acknowledgeMessage()` などの動的実行ロジック。
- メッセージの実データ構造（Header、Payload、Body、Attributes等）の保持。
- Promise, async / await, Timer, EventEmitter, Buffer操作, Stream操作。
- Frame, Packet, Session, Protocol, Connection, Transport, Socket, Stream, Kernel, Thread, Worker 等のインスタンスの保持・管理・生成。

> [!IMPORTANT]
> Message はデータ契約のみを定義し、Runtime Message Instance を生成しない。
> 将来 Execution Runtime Message Runtime が追加されても、本 Blueprint は変更せず参照専用とする。

### 2.3. Context の制約
- `ExecutionRuntimeMessageContext` は `runtimeMessageId` のみ保持し、`messageRef`・`frameRef`・`packetRef`・`payload`・`header`・`body`・`buffer`・`stream` 等の実体参照や状態を示すプロパティを含まない（Context ID Only）。

---

## 3. 構造定義 (Structures)

### 3.1. MessageType (分類定義)
メッセージの分類を示す静的列挙型。
- `FOUNDATION`: 基礎メッセージ
- `RUNTIME`: 実実行メッセージ

> [!IMPORTANT]
> `MessageType` は Foundation における静的分類定義であり、ランタイムによる動的な追加・変更は完全に禁止される。

### 3.2. MessageScope (スコープ定義)
メッセージのスコープを示す静的列挙型。
- `SYSTEM`: システムスコープ

> [!IMPORTANT]
> `MessageScope` は Foundation における静的なスコープの定義であり、ランタイムによる動的な追加・変更は完全に禁止される。

### 3.3. RuntimeMessageType (実行メッセージタイプ定義)
メッセージのデータ用途を示す静的列挙型。
- `SYSTEM_MESSAGE`: システムメッセージ
- `CORE_MESSAGE`: コアメッセージ
- `APPLICATION_MESSAGE`: アプリケーションメッセージ
- `PLUGIN_MESSAGE`: プラグインメッセージ
- `FIELD_MESSAGE`: フィールドメッセージ

### 3.4. MessageLifecycleState (メッセージライフサイクル定義)
メッセージが経るべき静的ライフサイクル定義。
- `CREATED`: 生成状態
- `READY`: 準備完了状態
- `WAITING`: 待機状態
- `SEALED`: 封印状態
- `TERMINATED`: 終了状態

### 3.5. MessageCapability (メッセージケーパビリティ定義)
メッセージがサポートする能力を示す静的列挙型。
- `SYSTEM`, `APPLICATION`, `PLUGIN`, `FIELD`, `LOCAL`, `REMOTE`, `DISTRIBUTED`, `INTER_PROCESS`, `INTER_NODE`, `AI`, `WORKFLOW`, `MONITORING`

### 3.6. MessageCategory (メッセージカテゴリ定義)
メッセージの論理的カテゴリ。
- `CONTROL`, `COMMAND`, `EVENT`, `REQUEST`, `RESPONSE`, `DATA`, `SYSTEM`, `APPLICATION`, `SCHEMA_ONLY`

### 3.7. MessageDirectionPolicy (メッセージ方向ポリシー)
- `INBOUND`, `OUTBOUND`, `INTERNAL`, `BIDIRECTIONAL`, `SCHEMA_ONLY`

### 3.8. MessageFormatPolicy (フォーマットポリシー定義)
メッセージが許可するフォーマット形式の静的定義。
- `JSON`, `BINARY`, `PROTOBUF`, `MSGPACK`, `SCHEMA_ONLY`

### 3.9. MessageValidationPolicy (バリデーションポリシー定義)
メッセージが要求する検証ポリシーの静的定義。
- `NONE`, `HEADER_ONLY`, `SCHEMA`, `FULL`, `SCHEMA_ONLY`

### 3.10. MessagePriorityPolicy (優先度ポリシー定義)
- `LOW`, `NORMAL`, `HIGH`, `CRITICAL`, `SCHEMA_ONLY`

### 3.11. MessageDeliveryPolicy (配信ポリシー定義)
- `UNICAST`, `MULTICAST`, `BROADCAST`, `DIRECT`, `SCHEMA_ONLY`

### 3.12. MessageReliabilityPolicy (信頼性ポリシー定義)
- `BEST_EFFORT`, `AT_MOST_ONCE`, `AT_LEAST_ONCE`, `EXACTLY_ONCE`, `SCHEMA_ONLY`

### 3.13. MessageExecutionPolicy (実行ポリシー定義)
不変性・決定論の保証、および一切の実行時処理を禁止するポリシーリスト。
- `READ_ONLY`, `DETERMINISTIC`, `IMMUTABLE_SCHEMA`
- `NO_THREAD`, `NO_QUEUE`, `NO_TASK`, `NO_WORKER`, `NO_DISPATCHER`, `NO_EVENT`, `NO_EVENT_BUS`, `NO_ROUTER`, `NO_TRANSPORT`, `NO_CONNECTION`, `NO_PROTOCOL`, `NO_SESSION`, `NO_PACKET`, `NO_FRAME`
- `NO_MESSAGE_BUILD`, `NO_MESSAGE_PARSE`, `NO_MESSAGE_SEND`, `NO_MESSAGE_RECEIVE`
- `NO_REPLY`, `NO_FORWARD`, `NO_ROUTE`, `NO_DISPATCH`

### 3.14. MessageDependencyPolicy (依存関係ポリシー定義)
- `NO_DEPENDENCY`, `STATIC_DEPENDENCY`, `SCHEMA_ONLY`

### 3.15. MessageTopology (トポロジー定義)
- `LOCAL`, `PROCESS`, `NODE`, `CLUSTER`, `DISTRIBUTED`

### 3.16. RuntimeMessageMetadata (モデルメタデータ)
- `messageModelVersion`: メッセージモデルバージョン
- `messageSchemaVersion`: メッセージスキーマバージョン

### 3.17. RuntimeMessageModel (静的モデル定義)
- `messageOrder`: 解決順序
- `supportedCapabilities`: ケーパビリティリスト
- `supportedMessagePolicies`: ポリシー名リスト
- `supportedFormatPolicies`: フォーマットポリシーリスト
- `supportedValidationPolicies`: バリデーションポリシーリスト
- `supportedDirectionPolicies`: 配信方向ポリシーリスト
- `dependencyPolicy`: 依存ポリシー
- `topology`: ネットワークトポロジー
- `lifecycleStates`: ライフサイクル状態リスト
- `executionPolicies`: 実行ポリシーリスト
- `allowedSteps`: 許容ステップリスト
- `supportedConnectionPolicies`: コネクションポリシー
- `supportedTransportPolicies`: トランスポートポリシー
- `supportedProtocolPolicies`: プロトコルポリシー
- `supportedSessionPolicies`: セッションポリシー
- `supportedPacketPolicies`: パケットポリシー
- `supportedFramePolicies`: フレームポリシー
- `supportedPriorityPolicies`: 優先度ポリシーリスト
- `supportedDeliveryPolicies`: 配信ポリシーリスト
- `supportedReliabilityPolicies`: 信頼性ポリシーリスト

### 3.18. ExecutionRuntimeMessageContext (コンテキスト定義)
保持するのは以下の識別子 ID のみである：
- `runtimeMessageId` (オブジェクト参照等は一切含まない)

### 3.19. MessageMetadata (メッセージメタデータ)
- `id`: メッセージID
- `name`: メッセージ名称
- `version`: バージョン
- `description`: 詳細説明
- `layer`: レイヤー階層名
- `category`: カテゴリ名

### 3.20. ExecutionRuntimeMessageData (データ定義)
- `managerType`: `MessageType`
- `managerScope`: `MessageScope`
- `messageModels`: 静的メッセージモデルリスト

### 3.21. ExecutionRuntimeMessageBlueprint (公開インターフェース)
外部に対して以下の読み取り専用 API のみを提供する。
- `getExecutionRuntimeMessage()`
- `getMetadata()`
- `getContext()`
- `getData()`
- `getMessageModels()`
- `getMessageSequence()`

---

## 4. 設計原則の遵守 (Architecture Principles)

### 4.1. 完全な不変性 (Immutability)
関係するすべてのオブジェクト構造、コンテキスト、データ、および Blueprint Container は、多層的に `Object.freeze()` を適用し、改変を完全に禁止する。

### 4.2. 決定論 (Determinism)
同一のルール入力に対して、常に同一の `ExecutionRuntimeMessage` 参照を返却する。遅延ロードや動的な状態変化などを完全に排除する。

---

## 5. 将来の拡張性 (Future Extensions)
将来のフェーズにおいて、以下の拡張機能が検討される：
- **Runtime Message Engine**: 実際のメッセージルーティング、キューイング、ディスパッチ、ACK応答、再送制御を司るメッセージングプラットフォームエンジン。
- **Process Execution Engine**: プロセス境界やノード境界を跨いでメッセージを安全に運ぶ伝送エンジン。
- **Plugin Execution Runtime**: 動的なメッセージフィルター、インターセプター、ペイロードバリデーションを評価するプラグイン。
- **AI Execution Runtime**: AIモデルとの対話やツール呼び出しコマンドを送受信する自律エージェントメッセージエンジン。
- **Task Execution Controller**: メッセージ優先度（Priority）に基づいてタスクの処理順序、流量を制御するタスクコントローラ。
- **Execution Monitoring**: メッセージ配信時間（Latency）、Throughput、配信エラー率をトラッキングする監視機能。
- **Sandboxed Execution**: V8やWebAssemblyの隔離空間に対して安全にメッセージを入出力するサンドボックス伝送境界。
