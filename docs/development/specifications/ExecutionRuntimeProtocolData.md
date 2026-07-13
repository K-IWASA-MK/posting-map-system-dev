# Execution Runtime Protocol Data Plane Specification

## 1. 目的 (Purpose)
Execution Runtime Protocol Data Plane は、AIOS (Artificial Intelligence Operating System) におけるデータレイアウトおよびデータ表現（Representation Contract）の静的 Blueprint を定義し、その境界を表現する。ランタイムデータ変換、シリアライズ、検証等のロジックを持たない Read-Only Blueprint である。

## 2. 役割と責務境界 (Responsibilities & Boundaries)

### 2.1. 責務 (Responsibilities)
- 実行プロトコルデータのメタデータ、コンテキスト、および静的モデルデータを定義する。
- 実行プロトコルデータの静的 Blueprint を公開する。
- メタデータ、コンテキスト、モデルデータ、および Blueprint Container を多層的に `Object.freeze()` して完全な不変性を保証する。

### 2.2. 境界ルール (Boundary Rules) — シリアライズ・データ検証等の完全排除
本 Protocol Data Plane はシリアライズやエンコード、パース処理を直接実行するクラスではなく、データスキーマの Blueprint（定義情報）のみを表現する。
以下の操作・処理は完全に排除される：
- `serialize()`, `deserialize()`, `encode()`, `decode()`, `parse()`, `build()`, `validate()`, `send()`, `receive()`, `transform()`, `convert()`, `compress()`, `decompress()` などの動的実行ロジック。
- プロトコルデータの実データ（バイト配列、シリアライズドデータ、内部バッファ等）の保持。
- Promise, async / await, Timer, EventEmitter, Buffer操作, Stream操作。
- Decoder, Encoder, Serializer, Deserializer, Stream, Socket, Connection, Protocol, Transport 等のインスタンスの保持・管理・生成。

> [!IMPORTANT]
> Protocol Data Plane はデータ契約のみを定義し、Runtime Protocol Data Instance を生成しない。
> 将来 Execution Runtime Protocol Data Runtime が追加されても、本 Blueprint は変更せず参照専用とする。

### 2.3. Context の制約
- `ExecutionRuntimeProtocolDataContext` は `runtimeProtocolDataId` のみ保持し、`payload`・`buffer`・`stream`・`packet`・`frame`・`message`・`serializer`・`decoder`・`encoder` 等の実体参照や状態を示すプロパティを含まない（Context ID Only）。

---

## 3. 構造定義 (Structures)

### 3.1. ProtocolDataType (分類定義)
データプレーンの分類を示す静的列挙型。
- `FOUNDATION`: 基礎データプレーン
- `RUNTIME`: 実実行データプレーン

> [!IMPORTANT]
> `ProtocolDataType` は Foundation における静的分類定義であり、ランタイムによる動的な追加・変更は完全に禁止される。

### 3.2. ProtocolDataScope (スコープ定義)
データプレーンのスコープを示す静的列挙型。
- `SYSTEM`: システムスコープ

> [!IMPORTANT]
> `ProtocolDataScope` は Foundation における静的なスコープの定義であり、ランタイムによる動的な追加・変更は完全に禁止される。

### 3.3. RuntimeProtocolDataType (実行データタイプ定義)
データプレーンの用途を示す静的列挙型。
- `SYSTEM_DATA`: システムデータ
- `CORE_DATA`: コアデータ
- `APPLICATION_DATA`: アプリケーションデータ
- `PLUGIN_DATA`: プラグインデータ
- `FIELD_DATA`: フィールドデータ

### 3.4. ProtocolDataLifecycleState (ライフサイクル定義)
データプレーンが経るべき静的ライフサイクル定義。
- `CREATED`: 生成状態
- `READY`: 準備完了状態
- `WAITING`: 待機状態
- `SEALED`: 封印状態
- `TERMINATED`: 終了状態

### 3.5. ProtocolDataCapability (ケーパビリティ定義)
データプレーンがサポートする能力を示す静的列挙型。
- `SYSTEM`, `APPLICATION`, `PLUGIN`, `FIELD`, `LOCAL`, `REMOTE`, `DISTRIBUTED`, `INTER_PROCESS`, `INTER_NODE`, `AI`, `WORKFLOW`, `MONITORING`

### 3.6. ProtocolDataCategory (カテゴリ定義)
データプレーンの論理的カテゴリ。
- `BINARY`, `TEXT`, `JSON`, `XML`, `SCHEMA_ONLY`

### 3.7. ProtocolDataValidationPolicy (バリデーションポリシー定義)
データプレーンが要求する検証ポリシーの静的定義。
- `NONE`, `HEADER_ONLY`, `SCHEMA`, `FULL`, `SCHEMA_ONLY`

### 3.8. ProtocolDataLayoutPolicy (レイアウトポリシー定義)
- `STATIC_ONLY`, `SCHEMA_ONLY`

### 3.9. ProtocolDataExecutionPolicy (実行ポリシー定義)
不変性・決定論の保証、および一切の実行時処理を禁止するポリシーリスト。
- `READ_ONLY`, `DETERMINISTIC`, `IMMUTABLE_SCHEMA`
- `NO_THREAD`, `NO_QUEUE`, `NO_TASK`, `NO_WORKER`
- `NO_EVENT`, `NO_EVENT_BUS`, `NO_ROUTER`
- `NO_TRANSPORT`, `NO_CONNECTION`, `NO_PROTOCOL`, `NO_SESSION`, `NO_SOCKET`, `NO_STREAM`, `NO_BUFFER`
- `NO_PROTOCOL_SERIALIZE`, `NO_PROTOCOL_DESERIALIZE`, `NO_PROTOCOL_ENCODE`, `NO_PROTOCOL_DECODE`, `NO_PROTOCOL_PARSE`, `NO_PROTOCOL_BUILD`, `NO_PROTOCOL_VALIDATE`, `NO_PROTOCOL_SEND`, `NO_PROTOCOL_RECEIVE`, `NO_PROTOCOL_TRANSFORM`, `NO_PROTOCOL_CONVERT`, `NO_PROTOCOL_COMPRESS`, `NO_PROTOCOL_DECOMPRESS`

### 3.10. ProtocolDataDependencyPolicy (依存関係ポリシー定義)
- `NO_DEPENDENCY`, `STATIC_DEPENDENCY`, `SCHEMA_ONLY`

### 3.11. ProtocolDataTopology (トポロジー定義)
- `LOCAL`, `PROCESS`, `NODE`, `CLUSTER`, `DISTRIBUTED`

### 3.12. RuntimeProtocolDataMetadata (モデルメタデータ)
- `protocolDataModelVersion`: バージョン
- `protocolDataSchemaVersion`: スキーマバージョン

### 3.13. RuntimeProtocolDataModel (静的モデル定義)
- `protocolDataOrder`: 解決順序
- `supportedCapabilities`: ケーパビリティリスト
- `supportedProtocolDataPolicies`: ポリシー名リスト
- `supportedValidationPolicies`: バリデーションポリシーリスト
- `supportedLayoutPolicies`: レイアウトポリシーリスト
- `dependencyPolicy`: 依存ポリシー
- `topology`: ネットワークトポロジー
- `lifecycleStates`: ライフサイクル状態リスト
- `executionPolicies`: 実行ポリシーリスト
- `allowedSteps`: 許容ステップリスト
- `supportedIdentityPolicies`: 主体ポリシーリスト
- `supportedSecureChannelPolicies`: セキュアチャネルポリシーリスト
- `supportedConnectionPolicies`: コネクションポリシーリスト
- `supportedSocketPolicies`: ソケットポリシーリスト
- `supportedStreamPolicies`: ストリームポリシーリスト
- `supportedBufferPolicies`: バッファポリシーリスト
- `supportedPipePolicies`: パイプポリシーリスト

### 3.14. ProtocolDataMetadata (データメタデータ)
- `id`: ID
- `name`: 名称
- `version`: バージョン
- `description`: 詳細説明
- `layer`: レイヤー階層名
- `category`: カテゴリ名

### 3.15. ExecutionRuntimeProtocolDataContent (コンテンツデータ定義)
- `managerType`: `ProtocolDataType`
- `managerScope`: `ProtocolDataScope`
- `protocolDataModels`: 静的プロトコルデータモデルリスト

### 3.16. ExecutionRuntimeProtocolDataBlueprint (公開インターフェース)
外部に対して以下の読み取り専用 API のみを提供する。
- `getExecutionRuntimeProtocolData()`
- `getMetadata()`
- `getContext()`
- `getData()`
- `getProtocolDataModels()`
- `getProtocolDataSequence()`

---

## 4. 設計原則の遵守 (Architecture Principles)

### 4.1. 完全な不変性 (Immutability)
関係するすべてのオブジェクト構造、コンテキスト、データ、および Blueprint Container は、多層的に `Object.freeze()` を適用し、改変を完全に禁止する。

### 4.2. 決定論 (Determinism)
同一のルール入力に対して、常に同一の `ExecutionRuntimeProtocolData` 参照を返却する。遅延ロードや動的な状態変化などを完全に排除する。

---

## 5. 将来の拡張性 (Future Extensions)
将来のフェーズにおいて、以下の拡張機能が検討される：
- **Runtime Serialization Engine**: 実際のメッセージ、フレーム、パケット構造の高速バイナリシリアライズ、構造パーサー、およびヘッダーCRC検証を実行するデータプレーン処理エンジン。
- **Process Communication Bridge**: プロセス境界でデータを高速に構造化エンコード・デコードするシリアライザーブリッジ。
- **Plugin Encoding Controller**: 独自のカスタム圧縮アルゴリズム（zlib等）や、シリアライズプロトコル（Protobuf等）のコーデックの組み込みを行うプラグイン。
- **AI Serialization Runtime**: AIエージェントにテンソル構造データやJSONデータをシリアライズして低遅延で受け渡すデータプレーンランタイム。
- **Task Serialization Controller**: シリアライズ後のバッファサイズ制限や背圧フロー制御を制御するタスクコントローラ。
- **Execution Performance Monitoring**: シリアライズ遅延、エンコーディングスループット、メモリ割当量を監視する監査機能。
- **Sandboxed Serialization**: サンドボックス隔離空間内外のデータ受け渡しを安全な構造化シリアルフォーマットに制限するサンドボックス境界制御。
