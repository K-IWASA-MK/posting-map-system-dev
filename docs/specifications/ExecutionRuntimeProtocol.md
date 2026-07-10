# Execution Runtime Protocol Foundation Specification

## 1. 目的 (Purpose)
Execution Runtime Protocol Foundation は、AIOS (Artificial Intelligence Operating System) における動的実行基盤の通信規約（Protocol Schema）を定義する「Runtime Protocol」の静的 Blueprint を定義する。実際のプロトコルネゴシエーション、シリアライズ、デシリアライズ、エンコード、デコード、パケット検証、フレーム構成、通信制御などの動的実行ロジックを一切持たない Read-Only Blueprint である。

---

## 2. 役割と責務境界 (Responsibilities & Boundaries)

### 2.1. プロトコルが行わないこと (Prohibited Action Boundaries)
本 Protocol Foundation および将来の Protocol Runtime は、以下の操作・管理を自身の責務から完全に除外し、所有または直接操作してはならない（**Protocol Ownership Prohibited**）：
- **Connection の所有/管理**: コネクション実体・参照の保持・所有・直接生成しない。
- **Transport の所有/管理**: トランスポート実体・参照の保持・所有・直接生成しない。
- **Event Bus の所有/管理**: イベントバスインスタンス自体を保持・所有しない。
- **Event の所有/管理**: イベントインスタンス自体を保持・所有・直接生成しない。
- **Dispatcher の所有/管理**: ディスパッチャー実体の保持・参照・割り当ては行わない。
- **Worker の所有/管理**: 実行エンジンである `Worker` の保持・管理は行わない。
- **スレッドの所有**: 実行スレッドを所有・作成しない。
- **Queue の所有/管理**: タスクキューやデータキューの直接管理は行わない。
- **Scheduler の所有/管理**: スケジューラの実体を保持・参照しない。
- **Kernel/Event Loop の所有/管理**: カーネル実体やイベントループの保持・参照・駆動を行わない。
- **Message Router の所有/管理**: ルーター実体を保持・所有・直接生成しない。
- **動的プロトコル制御・パケット処理・シリアライズ・デシリアライズ・通信制御**: `negotiate()`, `serialize()`, `deserialize()`, `encode()`, `decode()`, `handshakeProtocol()`, `validatePacket()`, `parseFrame()`, `buildFrame()` などの動的処理を実行しない。
- **実体 (Packet / Frame / Socket / Connection) の保持**: パケット、フレーム、ソケット、コネクションなどを生成・保持しない。

### 2.2. プロトコルの行う責務 (Protocol Responsibilities)
本 Protocol Foundation は以下の静的定義のみを責務とする：
- **Protocol Schema の定義**: プロトコル方式のタイプ、トポロジー、セキュリティ、信頼性、シリアライズポリシー、バージョン互換ポリシー、検証ポリシー、メッセージフォーマットポリシーの静的記述。
- **Protocol Execution Policy の定義**: 不変実行ポリシー（スレッド/キュー非保持、シリアライズの禁止、パケット/フレーム生成の禁止、ネゴシエーションの禁止等）の静的定義。
- **Protocol Metadata の定義**: 各プロトコルのモデルバージョンおよびスキーマバージョンの記述。

### 2.3. 静的 Blueprint 境界ルール
本 Protocol Foundation は実際の実行制御やプロセス管理は処理せず、「プロトコル規約定義」を表現する Blueprint である。
以下の操作・処理は完全に排除される：
- `negotiate()`, `serialize()`, `deserialize()`, `encode()`, `decode()`, `handshakeProtocol()`, `validatePacket()`, `parseFrame()`, `buildFrame()` などの動的処理ロジック。
- Promise, 非同期処理（async/await、Timer）、および Socket/Packet/Frame 等の実体。

---

## 3. 設計原則の遵守 (Architecture Principles)

### 3.1. 完全な不変性 (Immutable Rule)
すべてのオブジェクト構造、コンテキスト、データ、および Blueprint Container は、多層的に `Object.freeze()` を適用し、外部および内部からの改変を完全に禁止する。

### 3.2. 決定論的解決 (Deterministic Rule)
同一のルール入力に対して、常に同一の `ExecutionRuntimeProtocol` 参照を返却する。遅延ロードや動的な状態変化などを排除し、参照同一性を保証する。

### 3.3. 読み取り専用制約 (Read-Only Rule)
公開 API は Getter のみに限定され、いかなる Setter や状態変更（Mutation）メソッドも存在してはならない。
`ExecutionRuntimeProtocolContext` は識別子 ID の文字列 `runtimeProtocolId` のみを保持し、他のランタイムオブジェクトや直接のオブジェクト参照を一切保持しない（Context ID Only）。

---

## 4. 構造定義 (Structures)

### 4.1. ProtocolType (分類)
プロトコルの分類を示す静的列挙型。
- `FOUNDATION`: 基礎プロトコル定義
- `RUNTIME`: 実プロトコル定義

### 4.2. ProtocolScope (適用範囲)
プロトコルの適用スコープを示す静的列挙型。
- `SYSTEM`: システム空間プロトコル

### 4.3. RuntimeProtocolType (プロトコルモデル種類)
- `SYSTEM_PROTOCOL`: システムプロトコルモデル
- `CORE_PROTOCOL`: コアプロトコルモデル
- `APPLICATION_PROTOCOL`: アプリケーションプロトコルモデル
- `PLUGIN_PROTOCOL`: プラグインプロトコルモデル
- `FIELD_PROTOCOL`: 配布現場プロトコルモデル

### 4.4. ProtocolLifecycleState (プロトコルライフサイクル定義)
プロトコル自体の状態スキーマを静的に定義。
- `CREATED`: 作成
- `READY`: 準備完了
- `WAITING`: 待機中
- `SEALED`: 封印 (変更を制限する静的境界状態)
- `TERMINATED`: 終了

### 4.5. ProtocolCapability (プロトコル処理能力要件の静的宣言)
プロトコルが必要とするリソース・接続環境を表現する静的列挙型 (宣言のみ、実装は禁止)。
- `SYSTEM`: システム能力要件
- `APPLICATION`: アプリケーション能力要件
- `PLUGIN`: プラグイン能力要件
- `FIELD`: 配布現場能力要件
- `LOCAL`: ローカル接続能力要件
- `REMOTE`: リモート接続能力要件
- `DISTRIBUTED`: 分散接続能力要件
- `INTER_PROCESS`: プロセス間接続能力要件
- `INTER_NODE`: ノード間接続能力要件
- `AI`: AI処理能力要件
- `WORKFLOW`: ワークフロー処理能力要件
- `MONITORING`: 監視プロトコル能力要件

### 4.6. ProtocolCategory (プロトコル意味的カテゴリ定義)
プロトコルの動作カテゴリを表す静的列挙型。
- `IPC`: プロセス間パイププロトコル
- `TCP`: TCPソケットプロトコル
- `UDP`: UDPソケットプロトコル
- `HTTP`: HTTP通信プロトコル
- `HTTPS`: 暗号化HTTPS通信プロトコル
- `WEBSOCKET`: 双方向WebSocketプロトコル
- `GRPC`: gRPC通信プロトコル
- `CUSTOM`: カスタム通信プロトコル

### 4.7. ProtocolVersionPolicy (プロトコルバージョン管理ポリシー)
プロトコルのバージョン適用制限を表す静的列挙型。
- `STATIC`: 固定バージョン
- `VERSIONED`: 動的バージョン対応
- `SCHEMA_ONLY`: スキーマ限定

### 4.8. ProtocolSerializationPolicy (シリアライズポリシー)
データの変換方式を規定する静的列挙型。
- `JSON`: JSON表現
- `BINARY`: バイナリ表現
- `PROTOBUF`: Protocol Buffers表現
- `MSGPACK`: MessagePack表現
- `SCHEMA_ONLY`: スキーマ限定

### 4.9. ProtocolMessageFormatPolicy (メッセージフォーマットポリシー)
メッセージの形式を定義する静的列挙型。
- `TEXT`: テキスト表現
- `BINARY`: バイナリ表現
- `SCHEMA_ONLY`: スキーマ限定

### 4.10. ProtocolCompatibilityPolicy (プロトコルバージョン互換ポリシー)
長期的なバージョン進化の互換ルールを記述する静的列挙型。
- `STRICT`: 完全一致のみ許容
- `BACKWARD_COMPATIBLE`: 後方互換性許容
- `FORWARD_COMPATIBLE`: 前方互換性許容
- `SCHEMA_ONLY`: スキーマ限定

### 4.11. ProtocolValidationPolicy (スキーマ検証ポリシー)
データパケットの適合検証規約を定義する静的列挙型。
- `NONE`: 検証なし
- `SCHEMA_ONLY`: スキーマ記述のみ検証
- `STRICT_SCHEMA`: 厳密スキーマ適合検証

### 4.12. ProtocolExecutionPolicy (プロトコル実行ポリシー定義)
- `READ_ONLY`: 読み取り専用ポリシー
- `DETERMINISTIC`: 決定論的ポリシー
- `IMMUTABLE_SCHEMA`: 不変スキーマポリシー
- `NO_THREAD`: スレッド非生成ポリシー
- `NO_QUEUE`: キュー非保持ポリシー
- `NO_TASK`: タスク非保持ポリシー
- `NO_WORKER`: ワーカー非保持ポリシー
- `NO_DISPATCHER`: ディスパッチャー非保持ポリシー
- `NO_EVENT`: イベント非保持ポリシー
- `NO_EVENT_BUS`: イベントバス非保持ポリシー
- `NO_ROUTER`: メッセージルーター非保持ポリシー
- `NO_TRANSPORT`: トランスポート非保持ポリシー
- `NO_CONNECTION`: コネクション非保持ポリシー
- `NO_SOCKET`: ソケット非保持ポリシー
- `NO_PACKET`: パケット非生成ポリシー
- `NO_FRAME`: フレーム非生成ポリシー
- `NO_SERIALIZATION`: シリアライズ非実行ポリシー
- `NO_DESERIALIZATION`: デシリアライズ非実行ポリシー
- `NO_NEGOTIATION`: ネゴシエーション非実行ポリシー

### 4.13. ProtocolDependencyPolicy (プロトコル依存トポロジーポリシー)
プロトコル間の依存関係を制限するポリシーの静的列挙型。
- `NO_DEPENDENCY`: 依存なし
- `STATIC_DEPENDENCY`: 静的依存定義
- `SCHEMA_ONLY`: スキーマ限定依存

### 4.14. ProtocolTopology (プロトコルトポロジー定義)
プロトコルのトポロジー構成を表す静的列挙型。
- `LOCAL`: 単一プロセスローカル
- `PROCESS`: 同一ホストプロセス間
- `NODE`: ノード内
- `CLUSTER`: クラスタ構成
- `DISTRIBUTED`: 広域分散
