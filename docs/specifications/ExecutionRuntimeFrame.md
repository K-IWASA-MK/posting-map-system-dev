# Execution Runtime Frame Specification

## 1. 目的 (Purpose)
Execution Runtime Frame は、AIOS (Artificial Intelligence Operating System) における通信フレーム（Frame Schema）の静的 Blueprint を定義し、その境界を表現する。ランタイムフレーム送受信・処理ロジックを持たない Read-Only Blueprint である。

## 2. 役割と責務境界 (Responsibilities & Boundaries)

### 2.1. 責務 (Responsibilities)
- 実行フレームのメタデータ、コンテキスト、および静的モデルデータを定義する。
- 実行フレームの静的 Blueprint を公開する。
- メタデータ、コンテキスト、モデルデータ、および Blueprint Container を多層的に `Object.freeze()` して完全な不変性を保証する。

### 2.2. 境界ルール (Boundary Rules) — フレーム送受信・処理ロジックの完全排除
本 Frame はフレームそのものを保持・生成・エンコード・デコードするクラスではなく、フレームスキーマの Blueprint（定義情報）のみを表現する。
以下の操作・処理は完全に排除される：
- `createFrame()`, `buildFrame()`, `parseFrame()`, `encodeFrame()`, `decodeFrame()`, `fragmentFrame()`, `reassembleFrame()`, `sendFrame()`, `receiveFrame()`, `synchronizeFrame()`, `validateFrame()` などの動的実行ロジック。
- フレームの実データ構造（Header、Payload、Checksum、Sequence、Flags等）の保持。
- Promise, async / await, Timer, EventEmitter, Buffer操作, Stream操作。
- Packet, Session, Protocol, Connection, Transport, Socket, Stream, Kernel, Thread, Worker 等のインスタンスの保持・管理・生成。

> [!IMPORTANT]
> Frame はデータ契約のみを定義し、Runtime Frame Instance を生成しない。
> 将来 Execution Runtime Frame Runtime が追加されても、本 Blueprint は変更せず参照専用とする。

### 2.3. Context の制約
- `ExecutionRuntimeFrameContext` は `runtimeFrameId` のみ保持し、`frameRef`・`packetRef`・`payload`・`header`・`body`・`buffer`・`stream` 等の実体参照や状態を示すプロパティを含まない（Context ID Only）。

---

## 3. 構造定義 (Structures)

### 3.1. FrameType (分類定義)
フレームの分類を示す静的列挙型。
- `FOUNDATION`: 基礎フレーム
- `RUNTIME`: 実実行フレーム

> [!IMPORTANT]
> `FrameType` は Foundation における静的分類定義であり、ランタイムによる動的な追加・変更は完全に禁止される。

### 3.2. FrameScope (スコープ定義)
フレームのスコープを示す静的列挙型。
- `SYSTEM`: システムスコープ

> [!IMPORTANT]
> `FrameScope` は Foundation における静的なスコープの定義であり、ランタイムによる動的な追加・変更は完全に禁止される。

### 3.3. RuntimeFrameType (実行フレームタイプ定義)
フレームのデータ用途を示す静的列挙型。
- `SYSTEM_FRAME`: システムフレーム
- `CORE_FRAME`: コアフレーム
- `APPLICATION_FRAME`: アプリケーションフレーム
- `PLUGIN_FRAME`: プラグインフレーム
- `FIELD_FRAME`: フィールドフレーム

### 3.4. FrameLifecycleState (フレームライフサイクル定義)
フレームが経るべき静的ライフサイクル定義。
- `CREATED`: 生成状態
- `READY`: 準備完了状態
- `WAITING`: 待機状態
- `SEALED`: 封印状態
- `TERMINATED`: 終了状態

### 3.5. FrameCapability (フレームケーパビリティ定義)
フレームがサポートする能力を示す静的列挙型。
- `SYSTEM`, `APPLICATION`, `PLUGIN`, `FIELD`, `LOCAL`, `REMOTE`, `DISTRIBUTED`, `INTER_PROCESS`, `INTER_NODE`, `AI`, `WORKFLOW`, `MONITORING`

### 3.6. FrameCategory (フレームカテゴリ定義)
フレームの論理的カテゴリ。
- `CONTROL`: 制御フレーム
- `DATA`: データフレーム
- `SYSTEM`: システムフレーム
- `APPLICATION`: アプリケーションフレーム
- `SCHEMA_ONLY`: スキーマ定義専用

### 3.7. FrameFormatPolicy (フォーマットポリシー定義)
フレームが許可するフォーマット形式の静的定義。
- `JSON`, `BINARY`, `PROTOBUF`, `MSGPACK`, `SCHEMA_ONLY`

### 3.8. FrameValidationPolicy (バリデーションポリシー定義)
フレームが要求する検証ポリシーの静的定義。
- `NONE`, `HEADER_ONLY`, `SCHEMA`, `FULL`, `SCHEMA_ONLY`

### 3.9. FrameExecutionPolicy (実行ポリシー定義)
不変性・決定論の保証、および一切の実行時処理を禁止するポリシーリスト。
- `READ_ONLY`, `DETERMINISTIC`, `IMMUTABLE_SCHEMA`
- `NO_THREAD`, `NO_QUEUE`, `NO_TASK`, `NO_WORKER`, `NO_DISPATCHER`, `NO_EVENT`, `NO_EVENT_BUS`, `NO_ROUTER`, `NO_TRANSPORT`, `NO_CONNECTION`, `NO_PROTOCOL`, `NO_SESSION`, `NO_PACKET`, `NO_SOCKET`, `NO_STREAM`
- `NO_FRAME_BUILD`, `NO_FRAME_PARSE`, `NO_FRAME_SEND`, `NO_FRAME_RECEIVE`
- `NO_FRAGMENT`, `NO_REASSEMBLY`, `NO_SYNCHRONIZATION`

### 3.10. FrameDependencyPolicy (依存関係ポリシー定義)
- `NO_DEPENDENCY`, `STATIC_DEPENDENCY`, `SCHEMA_ONLY`

### 3.11. FrameTopology (トポロジー定義)
- `LOCAL`, `PROCESS`, `NODE`, `CLUSTER`, `DISTRIBUTED`

### 3.12. RuntimeFrameMetadata (モデルメタデータ)
- `frameModelVersion`: フレームモデルバージョン
- `frameSchemaVersion`: フレームスキーマバージョン

### 3.13. RuntimeFrameModel (静的モデル定義)
- `frameOrder`: 解決順序
- `supportedCapabilities`: ケーパビリティリスト
- `supportedFramePolicies`: ポリシー名リスト
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
- `supportedPacketPolicies`: パケットポリシー

### 3.14. ExecutionRuntimeFrameContext (コンテキスト定義)
保持するのは以下の識別子 ID のみである：
- `runtimeFrameId` (オブジェクト参照等は一切含まない)

### 3.15. FrameMetadata (フレームメタデータ)
- `id`: フレームID
- `name`: フレーム名称
- `version`: バージョン
- `description`: 詳細説明
- `layer`: レイヤー階層名
- `category`: カテゴリ名

### 3.16. ExecutionRuntimeFrameData (データ定義)
- `managerType`: `FrameType`
- `managerScope`: `FrameScope`
- `frameModels`: 静的フレームモデルリスト

### 3.17. ExecutionRuntimeFrameBlueprint (公開インターフェース)
外部に対して以下の読み取り専用 API のみを提供する。
- `getExecutionRuntimeFrame()`
- `getMetadata()`
- `getContext()`
- `getData()`
- `getFrameModels()`
- `getFrameSequence()`

---

## 4. 設計原則の遵守 (Architecture Principles)

### 4.1. 完全な不変性 (Immutability)
関係するすべてのオブジェクト構造、コンテキスト、データ、および Blueprint Container は、多層的に `Object.freeze()` を適用し、改変を完全に禁止する。

### 4.2. 決定論 (Determinism)
同一のルール入力に対して、常に同一の `ExecutionRuntimeFrame` 参照を返却する。遅延ロードや動的な状態変化などを完全に排除する。

---

## 5. 将来の拡張性 (Future Extensions)
将来のフェーズにおいて、以下の拡張機能が検討される：
- **Runtime Frame Engine**: 実際のフレームのパッキング・アンパッキング・同期を司る低レベルランタイムエンジン。
- **Process Execution Engine**: OSネイティブのプロセス境界で安全にフレームを受け渡す実行エンジン。
- **Plugin Execution Runtime**: 動的なフレーム構造拡張や拡張ヘッダを検証するプラグインランタイム。
- **AI Execution Runtime**: AI推論結果のフレーム構造へのマッピング・配信を行う自律フレーム実行ランタイム。
- **Task Execution Controller**: フレーム単位の実行・再送優先度・スロットリングを制御するタスクコントローラ。
- **Execution Monitoring**: フレーム伝送エラー率、フレーム抜け、同期ズレ、再送回数を計測する監視・パフォーマンス可視化機能。
- **Sandboxed Execution**: サンドボックス化された隔離空間（WebAssembly, V8 Sandbox等）の間でセキュアにフレームデータを同期する隔離制御機構。
