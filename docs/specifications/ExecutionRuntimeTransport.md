# Execution Runtime Transport Foundation Specification

## 1. 目的 (Purpose)
Execution Runtime Transport Foundation は、AIOS (Artificial Intelligence Operating System) における動的実行基盤のメッセージ伝送方式（Transport Schema）を定義する「Runtime Transport」の静的 Blueprint を定義する。実際の接続、送受信、通信、暗号化、圧縮、およびストリーム同期などの動的実行ロジックを一切持たない Read-Only Blueprint である。

---

## 2. 役割と責務境界 (Responsibilities & Boundaries)

### 2.1. トランスポートが行わないこと (Prohibited Action Boundaries)
本 Transport Foundation および将来の Transport Runtime は、以下の操作・管理を自身の責務から完全に除外し、所有または直接操作してはならない（**Transport Ownership Prohibited**）：
- **Event Bus の所有/管理**: イベントバスインスタンス自体を保持・所有しない。
- **Event の所有/管理**: イベントインスタンス自体を保持・所有・直接生成しない。
- **Dispatcher の所有/管理**: ディスパッチャー実体の保持・参照・割り当ては行わない。
- **Worker の所有/管理**: 実行エンジンである `Worker` の保持・管理は行わない。
- **スレッドの所有**: 実行スレッドを所有・作成しない。
- **Queue の所有/管理**: タスクキューやデータキューの直接管理は行わない。
- **Scheduler の所有/管理**: スケジューラの実体を保持・参照しない。
- **Kernel/Event Loop の所有/管理**: カーネル実体やイベントループの保持・参照・駆動を行わない。
- **Message Router の所有/管理**: ルーター実体を保持・所有・直接生成しない。
- **動的送受信・接続・通信・暗号化・圧縮・再送・ストリーム生成**: `connect()`, `disconnect()`, `send()`, `receive()`, `transmit()`, `stream()`, `reconnect()`, `retry()`, `encrypt()`, `decrypt()`, `compress()`, `decompress()` などの動的処理を実行しない。

### 2.2. トランスポートの行う責務 (Transport Responsibilities)
本 Transport Foundation は以下の静的定義のみを責務とする：
- **Transport Schema の定義**: メッセージ伝送方式のタイプ、トポロジー、セキュリティ、信頼性、プロトコルポリシー、接続ポリシーの静的記述。
- **Transport Execution Policy の定義**: 不変実行ポリシー（スレッド/キュー非保持、送受信の禁止、暗号化/圧縮/ソケット生成の禁止等）の静的定義。
- **Transport Metadata の定義**: 各トランスポートのモデルバージョンおよびスキーマバージョンの記述。

### 2.3. 静的 Blueprint 境界ルール
本 Transport Foundation は実際の実行制御やプロセス管理は処理せず、「メッセージ伝送方式スキーマ定義」を表現する Blueprint である。
以下の操作・処理は完全に排除される：
- `connect()`, `disconnect()`, `send()`, `receive()`, `transmit()`, `stream()`, `reconnect()`, `retry()`, `encrypt()`, `decrypt()`, `compress()`, `decompress()` などの動的処理ロジック。
- Promise, 非同期処理（async/await、Timer）、および Socket/Connection 等の実体。

---

## 3. 設計原則の遵守 (Architecture Principles)

### 3.1. 完全な不変性 (Immutable Rule)
すべてのオブジェクト構造、コンテキスト、データ、および Blueprint Container は、多層的に `Object.freeze()` を適用し、外部および内部からの改変を完全に禁止する。

### 3.2. 決定論的解決 (Deterministic Rule)
同一のルール入力に対して、常に同一の `ExecutionRuntimeTransport` 参照を返却する。遅延ロードや動的な状態変化などを排除し、参照同一性を保証する。

### 3.3. 読み取り専用制約 (Read-Only Rule)
公開 API は Getter のみに限定され、いかなる Setter や状態変更（Mutation）メソッドも存在してはならない。
`ExecutionRuntimeTransportContext` は識別子 ID の文字列 `runtimeTransportId` のみを保持し、他のランタイムオブジェクトや直接のオブジェクト参照を一切保持しない（Context ID Only）。

---

## 4. 構造定義 (Structures)

### 4.1. TransportType (分類)
トランスポートの分類を示す静的列挙型。
- `FOUNDATION`: 基礎トランスポート定義
- `RUNTIME`: 実トランスポート定義

### 4.2. TransportScope (適用範囲)
トランスポートの適用スコープを示す静的列挙型。
- `SYSTEM`: システム空間トランスポート

### 4.3. RuntimeTransportType (トランスポートモデル種類)
- `SYSTEM_TRANSPORT`: システムトランスポートモデル
- `CORE_TRANSPORT`: コアトランスポートモデル
- `APPLICATION_TRANSPORT`: アプリケーショントランスポートモデル
- `PLUGIN_TRANSPORT`: プラグイントランスポートモデル
- `FIELD_TRANSPORT`: 配布現場トランスポートモデル

### 4.4. TransportLifecycleState (トランスポートライフサイクル定義)
トランスポート自体の状態スキーマを静的に定義。
- `CREATED`: 作成
- `READY`: 準備完了
- `WAITING`: 待機中
- `SEALED`: 封印 (変更を制限する静的境界状態)
- `TERMINATED`: 終了

### 4.5. TransportCapability (トランスポート処理能力要件の静的宣言)
トランスポートが必要とするリソース・伝送環境を表現する静的列挙型 (宣言のみ、実装は禁止)。
- `SYSTEM`: システム能力要件
- `APPLICATION`: アプリケーション能力要件
- `PLUGIN`: プラグイン能力要件
- `FIELD`: 配布現場能力要件
- `AI`: AI 処理能力要件
- `WORKFLOW`: ワークフロー処理能力要件
- `MONITORING`: 監視能力要件
- `LOCAL`: ローカル伝送能力要件
- `REMOTE`: リモート伝送能力要件
- `DISTRIBUTED`: 分散伝送能力要件
- `INTER_PROCESS`: プロセス間通信能力要件
- `INTER_NODE`: ノード間通信能力要件

### 4.6. TransportCategory (トランスポート意味的カテゴリ定義)
トランスポートの意味的な区分を表す静的列挙型。
- `LOCAL`: ローカルメモリ転送カテゴリ
- `IPC`: プロセス間パイプ通信カテゴリ
- `NETWORK`: ネットワーク通信カテゴリ
- `REMOTE`: リモートホスト通信カテゴリ
- `DISTRIBUTED`: 分散広域通信カテゴリ

### 4.7. TransportProtocolPolicy (利用プロトコル制限)
トランスポートで許容されるプロトコルの静的列挙型。
- `LOCAL`: ローカル転送
- `IPC`: プロセス間通信
- `TCP`: TCPソケットプロトコル
- `UDP`: UDPソケットプロトコル
- `HTTP`: HTTP通信プロトコル
- `HTTPS`: 暗号化HTTPS通信プロトコル
- `WEBSOCKET`: 双方向WebSocket通信
- `GRPC`: gRPC通信プロトコル
- `SCHEMA_ONLY`: スキーマ限定

### 4.8. TransportReliabilityPolicy (トランスポート伝送信頼性ポリシー)
伝送の信頼性を制限する静的列挙型。
- `BEST_EFFORT`: ベストエフォート
- `AT_MOST_ONCE`: 最大1回
- `AT_LEAST_ONCE`: 最低1回
- `EXACTLY_ONCE`: 正確に1回
- `SCHEMA_ONLY`: スキーマ限定信頼性

### 4.9. TransportSecurityPolicy (トランスポートセキュリティポリシー)
伝送の暗号保護を制限する静的列挙型。
- `NONE`: セキュリティなし
- `SIGNATURE`: 電子署名
- `ENCRYPTION`: 伝送暗号化
- `AUTHENTICATION`: 接続ノード認証
- `SCHEMA_ONLY`: スキーマ限定

### 4.10. TransportExecutionPolicy (トランスポート実行ポリシー定義)
- `READ_ONLY`: 読み取り専用ポリシー
- `DETERMINISTIC`: 決定論的ポリシー
- `IMMUTABLE_SCHEMA`: 不変スキーマポリシー
- `NO_THREAD`: スレッド非生成ポリシー
- `NO_QUEUE`: キュー非保持ポリシー
- `NO_SCHEDULER`: スケジューラー非保持ポリシー
- `NO_TASK`: タスク非保持ポリシー
- `NO_WORKER`: ワーカー非保持ポリシー
- `NO_DISPATCHER`: ディスパッチャー非保持ポリシー
- `NO_EVENT`: イベント非保持ポリシー
- `NO_EVENT_BUS`: イベントバス非保持ポリシー
- `NO_ROUTER`: メッセージルーター非保持ポリシー
- `NO_CONNECTION`: コネクション非保持ポリシー
- `NO_SOCKET`: ソケット非生成ポリシー
- `NO_STREAM`: ストリーム非生成ポリシー
- `NO_TRANSMISSION`: 伝送処理非実行ポリシー
- `NO_SEND`: 送信処理非実行ポリシー
- `NO_RECEIVE`: 受信処理非実行ポリシー
- `NO_RETRY`: 再送処理非実行ポリシー
- `NO_ENCRYPTION`: 暗号・圧縮処理非実行ポリシー

### 4.11. TransportDependencyPolicy (トランスポート依存トポロジーポリシー)
トランスポート間の依存関係を制限するポリシーの静的列挙型。
- `NO_DEPENDENCY`: 依存なし
- `STATIC_DEPENDENCY`: 静的依存定義
- `SCHEMA_ONLY`: スキーマ限定依存

### 4.12. TransportTopology (トランスポートトポロジー定義)
トランスポートのトポロジー形態を定義する静的列挙型。
- `LOCAL`: 単一プロセスローカル接続
- `PROCESS`: 同一ホストプロセス間接続
- `NODE`: ノード内接続
- `CLUSTER`: クラスタ構成接続
- `DISTRIBUTED`: 広域分散接続
