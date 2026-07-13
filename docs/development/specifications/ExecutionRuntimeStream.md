# Execution Runtime Stream Specification

## 1. 目的 (Purpose)
Execution Runtime Stream は、AIOS (Artificial Intelligence Operating System) におけるデータの入出力およびパイプ伝送処理（Stream Schema）の静的 Blueprint を定義し、その境界を表現する。ランタイムストリーム処理・生成・パイプ処理・バッファ処理等のロジックを持たない Read-Only Blueprint である。

## 2. 役割と責務境界 (Responsibilities & Boundaries)

### 2.1. 責務 (Responsibilities)
- 実行ストリームのメタデータ、コンテキスト、および静的モデルデータを定義する。
- 実行ストリームの静的 Blueprint を公開する。
- メタデータ、コンテキスト、モデルデータ、および Blueprint Container を多層的に `Object.freeze()` して完全な不変性を保証する。

### 2.2. 境界ルール (Boundary Rules) — ストリーム処理・バッファ管理の完全排除
本 Stream はストリームそのものを生成・読み書き・監視・パイプ連結するクラスではなく、ストリームスキーマの Blueprint（定義情報）のみを表現する。
以下の操作・処理は完全に排除される：
- `read()`, `write()`, `pipe()`, `unpipe()`, `push()`, `shift()`, `flush()`, `clear()`, `destroy()`, `pause()`, `resume()` などの動的実行ロジック。
- ストリームの実データ構造（内部キュー、バッファ、fd、実データ等）の保持。
- Promise, async / await, Timer, EventEmitter, Buffer操作, Stream操作。
- Readable, Writable, Duplex, Transform ストリーム, Socket インスタンス, Buffer オブジェクト 等のインスタンスの保持・管理・生成。

> [!IMPORTANT]
> Stream はデータ契約のみを定義し、Runtime Stream Instance を生成しない。
> 将来 Execution Runtime Stream Runtime が追加されても、本 Blueprint は変更せず参照専用とする。

### 2.3. Context の制約
- `ExecutionRuntimeStreamContext` は `runtimeStreamId` のみ保持し、`streamRef`・`buffer`・`socketRef`・`fd`・`queue` 等の実体参照や状態を示すプロパティを含まない（Context ID Only）。

---

## 3. 構造定義 (Structures)

### 3.1. StreamType (分類定義)
ストリームの分類を示す静的列挙型。
- `FOUNDATION`: 基礎ストリーム
- `RUNTIME`: 実実行ストリーム

> [!IMPORTANT]
> `StreamType` は Foundation における静的分類定義であり、ランタイムによる動的な追加・変更は完全に禁止される。

### 3.2. StreamScope (スコープ定義)
ストリームのスコープを示す静的列挙型。
- `SYSTEM`: システムスコープ

> [!IMPORTANT]
> `StreamScope` は Foundation における静的なスコープの定義であり、ランタイムによる動的な追加・変更は完全に禁止される。

### 3.3. RuntimeStreamType (実行ストリームタイプ定義)
ストリームの用途を示す静的列挙型。
- `SYSTEM_STREAM`: システムストリーム
- `CORE_STREAM`: コアストリーム
- `APPLICATION_STREAM`: アプリケーションストリーム
- `PLUGIN_STREAM`: プラグインストリーム
- `FIELD_STREAM`: フィールドストリーム

### 3.4. StreamLifecycleState (ストリームライフサイクル定義)
ストリームが経るべき静的ライフサイクル定義。
- `CREATED`: 生成状態
- `READY`: 準備完了状態
- `WAITING`: 待機状態
- `SEALED`: 封印状態
- `TERMINATED`: 終了状態

### 3.5. StreamCapability (ストリームケーパビリティ定義)
ストリームがサポートする能力を示す静的列挙型。
- `SYSTEM`, `APPLICATION`, `PLUGIN`, `FIELD`, `LOCAL`, `REMOTE`, `DISTRIBUTED`, `INTER_PROCESS`, `INTER_NODE`, `AI`, `WORKFLOW`, `MONITORING`

### 3.6. StreamCategory (ストリームカテゴリ定義)
ストリームの論理的カテゴリ。
- `READABLE`, `WRITABLE`, `DUPLEX`, `TRANSFORM`, `SCHEMA_ONLY`

### 3.7. StreamValidationPolicy (バリデーションポリシー定義)
ストリームが要求する検証ポリシーの静的定義。
- `NONE`, `HEADER_ONLY`, `SCHEMA`, `FULL`, `SCHEMA_ONLY`

### 3.8. StreamExecutionPolicy (実行ポリシー定義)
不変性・決定論の保証、および一切の実行時処理を禁止するポリシーリスト。
- `READ_ONLY`, `DETERMINISTIC`, `IMMUTABLE_SCHEMA`
- `NO_THREAD`, `NO_QUEUE`, `NO_TASK`, `NO_WORKER`
- `NO_EVENT`, `NO_EVENT_BUS`, `NO_ROUTER`
- `NO_TRANSPORT`, `NO_CONNECTION`, `NO_PROTOCOL`, `NO_SESSION`, `NO_SOCKET`
- `NO_STREAM_CREATE`, `NO_STREAM_OPEN`, `NO_STREAM_CLOSE`
- `NO_STREAM_READ`, `NO_STREAM_WRITE`, `NO_STREAM_PIPE`, `NO_STREAM_UNPIPE`
- `NO_STREAM_PUSH`, `NO_STREAM_FLUSH`, `NO_STREAM_PAUSE`, `NO_STREAM_RESUME`

### 3.9. StreamDependencyPolicy (依存関係ポリシー定義)
- `NO_DEPENDENCY`, `STATIC_DEPENDENCY`, `SCHEMA_ONLY`

### 3.10. StreamTopology (トポロジー定義)
- `LOCAL`, `PROCESS`, `NODE`, `CLUSTER`, `DISTRIBUTED`

### 3.11. RuntimeStreamMetadata (モデルメタデータ)
- `streamModelVersion`: ストリームモデルバージョン
- `streamSchemaVersion`: ストリームスキーマバージョン

### 3.12. RuntimeStreamModel (静的モデル定義)
- `streamOrder`: 解決順序
- `supportedCapabilities`: ケーパビリティリスト
- `supportedStreamPolicies`: ポリシー名リスト
- `supportedValidationPolicies`: バリデーションポリシーリスト
- `dependencyPolicy`: 依存ポリシー
- `topology`: ネットワークトポロジー
- `lifecycleStates`: ライフサイクル状態リスト
- `executionPolicies`: 実行ポリシーリスト
- `allowedSteps`: 許容ステップリスト
- `supportedIdentityPolicies`: 主体ポリシーリスト
- `supportedSecureChannelPolicies`: セキュアチャネルポリシーリスト
- `supportedConnectionPolicies`: コネクションポリシーリスト
- `supportedSocketPolicies`: ソケットポリシーリスト

### 3.13. StreamMetadata (ストリームメタデータ)
- `id`: ストリームID
- `name`: ストリーム名称
- `version`: バージョン
- `description`: 詳細説明
- `layer`: レイヤー階層名
- `category`: カテゴリ名

### 3.14. ExecutionRuntimeStreamData (データ定義)
- `managerType`: `StreamType`
- `managerScope`: `StreamScope`
- `streamModels`: 静的ストリームモデルリスト

### 3.15. ExecutionRuntimeStreamBlueprint (公開インターフェース)
外部に対して以下の読み取り専用 API のみを提供する。
- `getExecutionRuntimeStream()`
- `getMetadata()`
- `getContext()`
- `getData()`
- `getStreamModels()`
- `getStreamSequence()`

---

## 4. 設計原則の遵守 (Architecture Principles)

### 4.1. 完全な不変性 (Immutability)
関係するすべてのオブジェクト構造、コンテキスト、データ、および Blueprint Container は、多層的に `Object.freeze()` を適用し、改変を完全に禁止する。

### 4.2. 決定論 (Determinism)
同一のルール入力に対して、常に同一の `ExecutionRuntimeStream` 参照を返却する。遅延ロードや動的な状態変化などを完全に排除する。

---

## 5. 将来の拡張性 (Future Extensions)
将来のフェーズにおいて、以下の拡張機能が検討される：
- **Runtime Stream Engine**: 実際の通信時の Stream データのバッファリング、chunk分割、pipe伝送、Transform変換の実行を司るストリーム処理エンジン。
- **Process Execution Engine**: プロセス境界やコンテナ境界でデータストリームを安全にパイプ接続する伝送エンジン。
- **Plugin Execution Runtime**: 独自のカスタム暗号化フィルターや、圧縮変換フィルター（gzip等）のストリームパイプへの組み込みを行うプラグイン。
- **AI Execution Runtime**: AIエージェントにリアルタイムで会話の音声ストリームや画像フレームを低遅延で双方向パイプ伝送するストリーム制御ランタイム。
- **Task Execution Controller**: ストリームの背圧制御（Backpressure）、バーストデータ平滑化（流量制限）を制御するタスクコントローラ。
- **Execution Monitoring**: 伝送速度、バッファ蓄積サイズ、背圧発生状況、タイムアウトエラー数を監視するパフォーマンス監査機能。
- **Sandboxed Execution**: サンドボックス隔離空間のファイルシステムI/OやネットワークI/Oを安全なデータストリームにカプセル化して伝送するサンドボックス境界制御。
