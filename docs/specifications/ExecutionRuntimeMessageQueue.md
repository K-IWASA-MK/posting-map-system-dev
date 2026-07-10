# Execution Runtime Message Queue Specification

## 1. 目的 (Purpose)
Execution Runtime Message Queue は、AIOS (Artificial Intelligence Operating System) における論理メッセージ保留境界（Message Queue Schema）の静的 Blueprint を定義し、その境界を表現する。ランタイムメッセージのプッシュ・ポップ、エンキュー・デキュー、プロセスキュー処理、スケジューリング、ディスパッチ、クリア・削除等のロジックを持たない Read-Only Blueprint である。

## 2. 役割と責務境界 (Responsibilities & Boundaries)

### 2.1. 責務 (Responsibilities)
- 実行メッセージキューのメタデータ、コンテキスト、および静的モデルデータを定義する。
- 実行メッセージキューの静的 Blueprint を公開する。
- メタデータ、コンテキスト、モデルデータ、および Blueprint Container を多層的に `Object.freeze()` して完全な不変性を保証する。

### 2.2. 境界ルール — メッセージプッシュ・エンキュー等の完全排除
本 Message Queue はメッセージキューを直接生成・保留・操作するクラスではなく、メッセージキュースキーマの Blueprint（定義情報）のみを表現する。
以下の操作・処理は完全に排除される：
- `createQueue()`, `generateQueue()`, `openQueue()`, `closeQueue()`, `enqueue()`, `dequeue()`, `push()`, `pop()`, `peek()`, `clearQueue()`, `removeQueue()`, `processQueue()`, `scheduleQueue()`, `dispatchQueue()`, `consumeQueue()`, `produceQueue()` などの動的実行ロジック。
- メッセージキューの実データ構造（接続状態、内部配列、内部バッファ、キューサイズ、格納メッセージ等）の保持。
- Promise, async / await, Timer, EventEmitter, Buffer操作, Stream操作。
- Message Instance, Queue Instance, Array, Buffer, Stream, Socket, Connection, Worker, Thread, Event, Scheduler, Task 等のインスタンスの保持・管理・生成。

> [!IMPORTANT]
> Message Queue はデータ契約のみを定義し、Runtime Message Queue Instance を生成しない。
> 将来 Execution Runtime Message Queue Runtime が追加されても、本 Blueprint は変更せず参照専用とする。

### 2.3. Context の制約
- `ExecutionRuntimeMessageQueueContext` は `runtimeMessageQueueId` のみ保持し、`queueRef`・`messageRef`・`portRef`・`channelRef`・`bufferRef`・`streamRef`・`connectionRef`・`items`・`messages`・`state`・`size` 等の実体参照や状態を示すプロパティを含まない（Context ID Only）。

---

## 3. 構造定義 (Structures)

### 3.1. MessageQueueType (分類定義)
メッセージキューの分類を示す静的列挙型。
- `FOUNDATION`: 基礎メッセージキュー
- `RUNTIME`: 実実行メッセージキュー

> [IMPORTANT]
> `MessageQueueType` は Foundation における静的分類定義であり、ランタイムによる動的な追加・変更は完全に禁止される。

### 3.2. MessageQueueScope (スコープ定義)
メッセージキューのスコープを示す静的列挙型。
- `SYSTEM`: システムスコープ

> [IMPORTANT]
> `MessageQueueScope` は Foundation における静的なスコープの定義であり、ランタイムによる動的な追加・変更は完全に禁止される。

### 3.3. RuntimeMessageQueueType (実行メッセージキュータイプ定義)
メッセージキューの用途を示す静的列挙型。
- `SYSTEM_QUEUE`: システムキュー
- `CORE_QUEUE`: コアキュー
- `APPLICATION_QUEUE`: アプリケーションキュー
- `PLUGIN_QUEUE`: プラグインキュー
- `FIELD_QUEUE`: フィールドキュー

### 3.4. MessageQueueLifecycleState (ライフサイクル定義)
メッセージキューが経るべき静的ライフサイクル定義。
- `CREATED`: 生成状態
- `READY`: 準備完了状態
- `WAITING`: 待機状態
- `SEALED`: 封印状態
- `TERMINATED`: 終了状態

### 3.5. MessageQueueCapability (ケーパビリティ定義)
メッセージキューがサポートする能力を示す静的列挙型。
- `SYSTEM`, `APPLICATION`, `PLUGIN`, `FIELD`, `LOCAL`, `REMOTE`, `DISTRIBUTED`, `INTER_PROCESS`, `INTER_NODE`, `AI`, `WORKFLOW`, `MONITORING`

### 3.6. MessageQueueCategory (カテゴリ定義)
メッセージキューの論理的カテゴリ。
- `LOCAL`, `REMOTE`, `SERVICE`, `DEVICE`, `APPLICATION`, `SCHEMA_ONLY`

### 3.7. MessageQueueOrderingPolicy (順序ポリシー定義)
- `FIFO`, `LIFO`, `PRIORITY`, `SCHEMA_ONLY`

### 3.8. MessageQueueValidationPolicy (バリデーションポリシー定義)
メッセージキューが要求する検証ポリシーの静的定義。
- `NONE`, `HEADER_ONLY`, `SCHEMA`, `FULL`, `SCHEMA_ONLY`

### 3.9. MessageQueueExecutionPolicy (実行ポリシー定義)
不変性・決定論の保証、および一切の実行時処理を禁止するポリシーリスト。
- `READ_ONLY`, `DETERMINISTIC`, `IMMUTABLE_SCHEMA`
- `NO_THREAD`, `NO_QUEUE`, `NO_TASK`, `NO_WORKER`
- `NO_EVENT`, `NO_EVENT_BUS`, `NO_ROUTER`
- `NO_QUEUE_CREATE`, `NO_QUEUE_RESOLVE`, `NO_QUEUE_REGISTER`
- `NO_QUEUE_OPEN`, `NO_QUEUE_CLOSE`
- `NO_ENQUEUE`, `NO_DEQUEUE`, `NO_PUSH`, `NO_POP`, `NO_PEEK`
- `NO_QUEUE_CLEAR`, `NO_QUEUE_REMOVE`, `NO_QUEUE_PROCESS`, `NO_QUEUE_SCHEDULE`, `NO_QUEUE_DISPATCH`, `NO_QUEUE_CONSUME`, `NO_QUEUE_PRODUCE`

### 3.10. MessageQueueDependencyPolicy (依存関係ポリシー定義)
- `NO_DEPENDENCY`, `STATIC_DEPENDENCY`, `SCHEMA_ONLY`

### 3.11. MessageQueueTopology (トポロジー定義)
- `LOCAL`, `PROCESS`, `NODE`, `CLUSTER`, `DISTRIBUTED`

### 3.12. RuntimeMessageQueueMetadata (モデルメタデータ)
- `queueModelVersion`: バージョン
- `queueSchemaVersion`: スキーマバージョン

### 3.13. RuntimeMessageQueueModel (静的モデル定義)
- `queueOrder`: 解決順序
- `supportedCapabilities`: ケーパビリティリスト
- `supportedQueuePolicies`: ポリシー名リスト
- `supportedOrderingPolicies`: 順序ポリシーリスト
- `supportedValidationPolicies`: バリデーションポリシーリスト
- `dependencyPolicy`: 依存ポリシー
- `topology`: ネットワークトポロジー
- `lifecycleStates`: ライフサイクル状態リスト
- `executionPolicies`: 実行ポリシーリスト
- `allowedSteps`: 許容ステップリスト
- `supportedTransportPolicies`: トランスポートポリシーリスト
- `supportedConnectionPolicies`: コネクションポリシーリスト
- `supportedIdentityPolicies`: 主体ポリシーリスト

### 3.14. MessageQueueMetadata (データメタデータ)
- `id`: ID
- `name`: 名称
- `version`: バージョン
- `description`: 詳細説明
- `layer`: レイヤー階層名
- `category`: カテゴリ名

### 3.15. ExecutionRuntimeMessageQueueData (ポートデータ定義)
- `managerType`: `MessageQueueType`
- `managerScope`: `MessageQueueScope`
- `queueModels`: 静的キューモデルリスト

### 3.16. ExecutionRuntimeMessageQueueBlueprint (公開インターフェース)
外部に対して以下の読み取り専用 API のみを提供する。
- `getExecutionRuntimeMessageQueue()`
- `getMetadata()`
- `getContext()`
- `getData()`
- `getQueueModels()`
- `getQueueSequence()`

---

## 4. 設計原則の遵守 (Architecture Principles)

### 4.1. 完全な不変性 (Immutability)
関係するすべてのオブジェクト構造、コンテキスト、データ、および Blueprint Container は、多層的に `Object.freeze()` を適用し、改変を完全に禁止する。

### 4.2. 決定論 (Determinism)
同一のルール入力に対して、常に同一 of `ExecutionRuntimeMessageQueue` 参照を返却する。遅延ロードや動的な状態変化などを完全に排除する。

---

## 5. 将来の拡張性 (Future Extensions)
将来のフェーズにおいて、以下の拡張機能が検討される：
- **Runtime Message Queue Engine**: 実際の通信時のメッセージのプッシュ・ポップ、エンキュー・デキュー、キュー処理、スケジューリング、ディスパッチ、およびコンシューム・プロデュースを制御するメッセージキュー処理エンジン。
- **Process Communication Bridge**: プロセス境界やコンテナ境界で IPC メッセージキューを介してメッセージフレームを安全にバッファリングするブリッジ。
- **Plugin Resolution Controller**: 独自のメッセージ優先度算出フィルタや、デッドレターキュー（DLQ）の転送メカニズムを組み込むプラグイン。
- **AI Queue Routing Runtime**: AIエージェントへの非同期タスクメッセージ配信をキューバッファで保護して順序制御するランタイム。
- **Task Transport Controller**: キュー溢れ時の背圧制御（バックプレッシャ）、ディスクへのページング、リトライ制御を制御するタスクコントローラ。
- **Execution Performance Monitoring**: キュー長、滞留時間、メッセージ廃棄レート、キューメモリ確保量を監視する監査機能。
- **Sandboxed Queue**: サンドボックス隔離空間ごとにメッセージキューを独立させ、他のサンドボックスからの不正メッセージ覗き見や割り込みを防ぐ境界制御。
