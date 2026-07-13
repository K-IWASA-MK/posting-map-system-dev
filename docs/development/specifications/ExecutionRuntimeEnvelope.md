# Execution Runtime Envelope Specification

## 1. 目的 (Purpose)
Execution Runtime Envelope は、AIOS (Artificial Intelligence Operating System) における通信エンベロープ（Envelope Schema）の静的 Blueprint を定義し、その境界を表現する。ランタイムエンベロープ封入・展開・処理ロジックを持たない Read-Only Blueprint である。

## 2. 役割と責務境界 (Responsibilities & Boundaries)

### 2.1. 責務 (Responsibilities)
- 実行エンベロープのメタデータ、コンテキスト、および静的モデルデータを定義する。
- 実行エンベロープの静的 Blueprint を公開する。
- メタデータ、コンテキスト、モデルデータ、および Blueprint Container を多層的に `Object.freeze()` して完全な不変性を保証する。

### 2.2. 境界ルール (Boundary Rules) — エンベロープ封入・処理ロジックの完全排除
本 Envelope はエンベロープそのものを保持・生成・ラッピングするクラスではなく、エンベロープスキーマの Blueprint（定義情報）のみを表現する。
以下の操作・処理は完全に排除される：
- `createEnvelope()`, `buildEnvelope()`, `parseEnvelope()`, `wrapEnvelope()`, `unwrapEnvelope()`, `sendEnvelope()`, `receiveEnvelope()`, `validateEnvelope()`, `signEnvelope()`, `verifyEnvelope()`, `encryptEnvelope()`, `decryptEnvelope()` などの動的実行ロジック。
- エンベロープの実データ構造（Header、Payload、Body、Attributes等）の保持。
- Promise, async / await, Timer, EventEmitter, Buffer操作, Stream操作。
- Message, Frame, Packet, Session, Protocol, Connection, Transport, Socket, Stream, Kernel, Thread, Worker 等のインスタンスの保持・管理・生成。

> [!IMPORTANT]
> Envelope はデータ契約のみを定義し、Runtime Envelope Instance を生成しない。
> 将来 Execution Runtime Envelope Runtime が追加されても、本 Blueprint は変更せず参照専用とする。

### 2.3. Context の制約
- `ExecutionRuntimeEnvelopeContext` は `runtimeEnvelopeId` のみ保持し、`envelopeRef`・`messageRef`・`frameRef`・`packetRef`・`payload`・`header`・`body`・`buffer`・`stream` 等の実体参照や状態を示すプロパティを含まない（Context ID Only）。

---

## 3. 構造定義 (Structures)

### 3.1. EnvelopeType (分類定義)
エンベロープの分類を示す静的列挙型。
- `FOUNDATION`: 基礎エンベロープ
- `RUNTIME`: 実実行エンベロープ

> [!IMPORTANT]
> `EnvelopeType` は Foundation における静的分類定義であり、ランタイムによる動的な追加・変更は完全に禁止される。

### 3.2. EnvelopeScope (スコープ定義)
エンベロープのスコープを示す静的列挙型。
- `SYSTEM`: システムスコープ

> [!IMPORTANT]
> `EnvelopeScope` は Foundation における静的なスコープの定義であり、ランタイムによる動的な追加・変更は完全に禁止される。

### 3.3. RuntimeEnvelopeType (実行エンベロープタイプ定義)
エンベロープのデータ用途を示す静的列挙型。
- `SYSTEM_ENVELOPE`: システムエンベロープ
- `CORE_ENVELOPE`: コアエンベロープ
- `APPLICATION_ENVELOPE`: アプリケーションエンベロープ
- `PLUGIN_ENVELOPE`: プラグインエンベロープ
- `FIELD_ENVELOPE`: フィールドエンベロープ

### 3.4. EnvelopeLifecycleState (エンベロープライフサイクル定義)
エンベロープが経るべき静的ライフサイクル定義。
- `CREATED`: 生成状態
- `READY`: 準備完了状態
- `WAITING`: 待機状態
- `SEALED`: 封印状態
- `TERMINATED`: 終了状態

### 3.5. EnvelopeCapability (エンベロープケーパビリティ定義)
エンベロープがサポートする能力を示す静的列挙型。
- `SYSTEM`, `APPLICATION`, `PLUGIN`, `FIELD`, `LOCAL`, `REMOTE`, `DISTRIBUTED`, `INTER_PROCESS`, `INTER_NODE`, `AI`, `WORKFLOW`, `MONITORING`

### 3.6. EnvelopeCategory (エンベロープカテゴリ定義)
エンベロープの論理的カテゴリ。
- `CONTROL`, `DATA`, `SYSTEM`, `APPLICATION`, `SCHEMA_ONLY`

### 3.7. EnvelopeHeaderPolicy (ヘッダーポリシー定義)
- `NONE`, `STATIC_HEADER`, `DYNAMIC_HEADER`, `SCHEMA_ONLY`

### 3.8. EnvelopePayloadPolicy (ペイロードポリシー定義)
- `NONE`, `PLAINTEXT`, `ENCRYPTED`, `SIGNED`, `COMPRESSED`, `SCHEMA_ONLY`

### 3.9. EnvelopeFormatPolicy (フォーマットポリシー定義)
エンベロープが許可するフォーマット形式の静的定義。
- `JSON`, `BINARY`, `PROTOBUF`, `MSGPACK`, `SCHEMA_ONLY`

### 3.10. EnvelopeValidationPolicy (バリデーションポリシー定義)
エンベロープが要求する検証ポリシーの静的定義。
- `NONE`, `HEADER_ONLY`, `SCHEMA`, `FULL`, `SCHEMA_ONLY`

### 3.11. EnvelopeExecutionPolicy (実行ポリシー定義)
不変性・決定論の保証、および一切の実行時処理を禁止するポリシーリスト。
- `READ_ONLY`, `DETERMINISTIC`, `IMMUTABLE_SCHEMA`
- `NO_THREAD`, `NO_QUEUE`, `NO_TASK`, `NO_WORKER`, `NO_DISPATCHER`, `NO_EVENT`, `NO_EVENT_BUS`, `NO_ROUTER`, `NO_TRANSPORT`, `NO_CONNECTION`, `NO_PROTOCOL`, `NO_SESSION`, `NO_PACKET`, `NO_FRAME`, `NO_MESSAGE`
- `NO_ENVELOPE_BUILD`, `NO_ENVELOPE_PARSE`, `NO_ENVELOPE_SEND`, `NO_ENVELOPE_RECEIVE`
- `NO_SIGN`, `NO_VERIFY`, `NO_ENCRYPT`, `NO_DECRYPT`

### 3.12. EnvelopeDependencyPolicy (依存関係ポリシー定義)
- `NO_DEPENDENCY`, `STATIC_DEPENDENCY`, `SCHEMA_ONLY`

### 3.13. EnvelopeTopology (トポロジー定義)
- `LOCAL`, `PROCESS`, `NODE`, `CLUSTER`, `DISTRIBUTED`

### 3.14. RuntimeEnvelopeMetadata (モデルメタデータ)
- `envelopeModelVersion`: エンベロープモデルバージョン
- `envelopeSchemaVersion`: エンベロープスキーマバージョン

### 3.15. RuntimeEnvelopeModel (静的モデル定義)
- `envelopeOrder`: 解決順序
- `supportedCapabilities`: ケーパビリティリスト
- `supportedEnvelopePolicies`: ポリシー名リスト
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
- `supportedFramePolicies`: フレームポリシー
- `supportedMessagePolicies`: メッセージポリシー
- `supportedHeaderPolicies`: ヘッダーポリシーリスト
- `supportedPayloadPolicies`: ペイロードポリシーリスト

### 3.16. ExecutionRuntimeEnvelopeContext (コンテキスト定義)
保持するのは以下の識別子 ID のみである：
- `runtimeEnvelopeId` (オブジェクト参照等は一切含まない)

### 3.17. EnvelopeMetadata (エンベロープメタデータ)
- `id`: エンベロープID
- `name`: エンベロープ名称
- `version`: バージョン
- `description`: 詳細説明
- `layer`: レイヤー階層名
- `category`: カテゴリ名

### 3.18. ExecutionRuntimeEnvelopeData (データ定義)
- `managerType`: `EnvelopeType`
- `managerScope`: `EnvelopeScope`
- `envelopeModels`: 静的エンベロープモデルリスト

### 3.19. ExecutionRuntimeEnvelopeBlueprint (公開インターフェース)
外部に対して以下の読み取り専用 API のみを提供する。
- `getExecutionRuntimeEnvelope()`
- `getMetadata()`
- `getContext()`
- `getData()`
- `getEnvelopeModels()`
- `getEnvelopeSequence()`

---

## 4. 設計原則の遵守 (Architecture Principles)

### 4.1. 完全な不変性 (Immutability)
関係するすべてのオブジェクト構造、コンテキスト、データ、および Blueprint Container は、多層的に `Object.freeze()` を適用し、改変を完全に禁止する。

### 4.2. 決定論 (Determinism)
同一のルール入力に対して、常に同一の `ExecutionRuntimeEnvelope` 参照を返却する。遅延ロードや動的な状態変化などを完全に排除する。

---

## 5. 将来の拡張性 (Future Extensions)
将来のフェーズにおいて、以下の拡張機能が検討される：
- **Runtime Envelope Engine**: 実際の論理メッセージのシリアライズ、ヘッダー追加、パッキング、署名・暗号化などのエンベロープ処理を行うメイン処理エンジン。
- **Process Execution Engine**: プロセス境界や隔離されたセキュアコンテナに安全にエンベロープデータを送り出す伝送エンジン。
- **Plugin Execution Runtime**: 動的な暗号化アルゴリズム追加や、署名検証局との連携を行うプラグイン。
- **AI Execution Runtime**: AIエージェントとの間で構造化パラメータをセキュアにエンベロープ化して伝送する自律メッセージエンジン。
- **Task Execution Controller**: エンベロープ内のコマンドメッセージ実行、ディスパッチ、バッファリングを制御するタスクコントローラ。
- **Execution Monitoring**: 署名検証エラー数、暗号化処理レイテンシ、配信スループットを計測する監視機能。
- **Sandboxed Execution**: サンドボックス化された実行隔離空間に対して安全にシリアライズされたエンベロープを入出力する伝送境界。
