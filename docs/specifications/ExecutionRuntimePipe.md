# Execution Runtime Pipe Specification

## 1. 目的 (Purpose)
Execution Runtime Pipe は、AIOS (Artificial Intelligence Operating System) における複数のデータストリームを連結・伝送するパイプ接続（Pipe Schema）の静的 Blueprint を定義し、その境界を表現する。ランタイムパイプ接続・切断・データ転送・フロー制御等のロジックを持たない Read-Only Blueprint である。

## 2. 役割と責務境界 (Responsibilities & Boundaries)

### 2.1. 責務 (Responsibilities)
- 実行パイプのメタデータ、コンテキスト、および静的モデルデータを定義する。
- 実行パイプの静的 Blueprint を公開する。
- メタデータ、コンテキスト、モデルデータ、および Blueprint Container を多層的に `Object.freeze()` して完全な不変性を保証する。

### 2.2. 境界ルール (Boundary Rules) — パイプ連結・データ転送の完全排除
本 Pipe はパイプそのものを生成・接続・切断・転送操作するクラスではなく、パイプスキーマの Blueprint（定義情報）のみを表現する。
以下の操作・処理は完全に排除される：
- `createPipe()`, `connectPipe()`, `disconnectPipe()`, `pipe()`, `unpipe()`, `transfer()`, `forward()`, `flush()`, `closePipe()`, `destroyPipe()` などの動的実行ロジック。
- パイプの実データ構造（接続相手ストリーム参照、転送バッファ参照、内部キュー、背圧状態等）の保持。
- Promise, async / await, Timer, EventEmitter, Buffer操作, Stream操作。
- Pipe, Stream, Buffer, Socket, Connection, Protocol, Transport 等のインスタンスの保持・管理・生成。

> [!IMPORTANT]
> Pipe はデータ契約のみを定義し、Runtime Pipe Instance を生成しない。
> 将来 Execution Runtime Pipe Runtime が追加されても、本 Blueprint は変更せず参照専用とする。

### 2.3. Context の制約
- `ExecutionRuntimePipeContext` は `runtimePipeId` のみ保持し、`pipeRef`・`streamRef`・`bufferRef`・`socketRef`・`connectionRef` 等の実体参照や状態を示すプロパティを含まない（Context ID Only）。

---

## 3. 構造定義 (Structures)

### 3.1. PipeType (分類定義)
パイプの分類を示す静的列挙型。
- `FOUNDATION`: 基礎パイプ
- `RUNTIME`: 実実行パイプ

> [!IMPORTANT]
> `PipeType` は Foundation における静的分類定義であり、ランタイムによる動的な追加・変更は完全に禁止される。

### 3.2. PipeScope (スコープ定義)
パイプのスコープを示す静的列挙型。
- `SYSTEM`: システムスコープ

> [!IMPORTANT]
> `PipeScope` は Foundation における静的なスコープの定義であり、ランタイムによる動的な追加・変更は完全に禁止される。

### 3.3. RuntimePipeType (実行パイプタイプ定義)
パイプの用途を示す静的列挙型。
- `SYSTEM_PIPE`: システムパイプ
- `CORE_PIPE`: コアパイプ
- `APPLICATION_PIPE`: アプリケーションパイプ
- `PLUGIN_PIPE`: プラグインパイプ
- `FIELD_PIPE`: フィールドパイプ

### 3.4. PipeLifecycleState (パイプライフサイクル定義)
パイプが経るべき静的ライフサイクル定義。
- `CREATED`: 生成状態
- `READY`: 準備完了状態
- `WAITING`: 待機状態
- `SEALED`: 封印状態
- `TERMINATED`: 終了状態

### 3.5. PipeCapability (パイプケーパビリティ定義)
パイプがサポートする能力を示す静的列挙型。
- `SYSTEM`, `APPLICATION`, `PLUGIN`, `FIELD`, `LOCAL`, `REMOTE`, `DISTRIBUTED`, `INTER_PROCESS`, `INTER_NODE`, `AI`, `WORKFLOW`, `MONITORING`

### 3.6. PipeCategory (パイプカテゴリ定義)
パイプの論理的カテゴリ。
- `UNIDIRECTIONAL`, `BIDIRECTIONAL`, `SCHEMA_ONLY`

### 3.7. PipeValidationPolicy (バリデーションポリシー定義)
パイプが要求する検証ポリシーの静的定義。
- `NONE`, `HEADER_ONLY`, `SCHEMA`, `FULL`, `SCHEMA_ONLY`

### 3.8. PipeFlowPolicy (フロー制御ポリシー定義)
- `STATIC_ONLY`, `SCHEMA_ONLY`

### 3.9. PipeExecutionPolicy (実行ポリシー定義)
不変性・決定論の保証、および一切の実行時処理を禁止するポリシーリスト。
- `READ_ONLY`, `DETERMINISTIC`, `IMMUTABLE_SCHEMA`
- `NO_THREAD`, `NO_QUEUE`, `NO_TASK`, `NO_WORKER`
- `NO_EVENT`, `NO_EVENT_BUS`, `NO_ROUTER`
- `NO_TRANSPORT`, `NO_CONNECTION`, `NO_PROTOCOL`, `NO_SESSION`, `NO_SOCKET`, `NO_STREAM`, `NO_BUFFER`
- `NO_PIPE_CREATE`, `NO_PIPE_CONNECT`, `NO_PIPE_TRANSFER`, `NO_PIPE_FLUSH`, `NO_PIPE_CLOSE`

### 3.10. PipeDependencyPolicy (依存関係ポリシー定義)
- `NO_DEPENDENCY`, `STATIC_DEPENDENCY`, `SCHEMA_ONLY`

### 3.11. PipeTopology (トポロジー定義)
- `LOCAL`, `PROCESS`, `NODE`, `CLUSTER`, `DISTRIBUTED`

### 3.12. RuntimePipeMetadata (モデルメタデータ)
- `pipeModelVersion`: パイプモデルバージョン
- `pipeSchemaVersion`: パイプスキーマバージョン

### 3.13. RuntimePipeModel (静的モデル定義)
- `pipeOrder`: 解決順序
- `supportedCapabilities`: ケーパビリティリスト
- `supportedPipePolicies`: ポリシー名リスト
- `supportedValidationPolicies`: バリデーションポリシーリスト
- `supportedFlowPolicies`: フロー制御ポリシーリスト
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

### 3.14. PipeMetadata (パイプメタデータ)
- `id`: パイプID
- `name`: パイプ名称
- `version`: バージョン
- `description`: 詳細説明
- `layer`: レイヤー階層名
- `category`: カテゴリ名

### 3.15. ExecutionRuntimePipeData (データ定義)
- `managerType`: `PipeType`
- `managerScope`: `PipeScope`
- `pipeModels`: 静的パイプモデルリスト

### 3.16. ExecutionRuntimePipeBlueprint (公開インターフェース)
外部に対して以下の読み取り専用 API のみを提供する。
- `getExecutionRuntimePipe()`
- `getMetadata()`
- `getContext()`
- `getData()`
- `getPipeModels()`
- `getPipeSequence()`

---

## 4. 設計原則の遵守 (Architecture Principles)

### 4.1. 完全な不変性 (Immutability)
関係するすべてのオブジェクト構造、コンテキスト、データ、および Blueprint Container は、多層的に `Object.freeze()` を適用し、改変を完全に禁止する。

### 4.2. 決定論 (Determinism)
同一のルール入力に対して、常に同一 of `ExecutionRuntimePipe` 参照を返却する。遅延ロードや動的な状態変化などを完全に排除する。

---

## 5. 将来の拡張性 (Future Extensions)
将来のフェーズにおいて、以下の拡張機能が検討される：
- **Runtime Pipe Engine**: 実際の通信時のパイプ生成、ストリーム連結、unpipe解除、バックプレッシャー制御、スループット制御の実行を司るパイプ伝送エンジン。
- **Process Execution Engine**: プロセス境界やコンテナ境界で IPC Pipe を介してデータを伝送するパイプ制御エンジン。
- **Plugin Execution Runtime**: 独自のカスタムストリームトランスフォーマーや、パイプライン監視フィルタ（データのタッピング等）の組み込みを行うプラグイン。
- **AI Execution Runtime**: AIエージェントに自律ステップパイプを介して順次処理パイプラインデータを低遅延で双方向伝送するパイプ制御ランタイム。
- **Task Execution Controller**: パイプ内のデータ滞留を検知し、一時ディスクバッファへの退避や背圧通知を制御するタスクコントローラ。
- **Execution Monitoring**: 伝送帯域幅、パイプ滞留量（Queueサイズ）、背圧発生時間、エラーレートを監視するパフォーマンス監査機能。
- **Sandboxed Execution**: サンドボックス隔離空間の標準入出力パイプ（stdio）を安全なホストストリームにカプセル化してパイプ連結するサンドボックス境界制御。
