# Execution Runtime Message Router Foundation Specification

## 1. 目的 (Purpose)
Execution Runtime Message Router Foundation は、AIOS (Artificial Intelligence Operating System) における動的実行基盤のメッセージ配送経路（Message Routing Schema）を定義する「Runtime Message Router」の静的 Blueprint を定義する。実際のメッセージ転送、配送、ルーティング、フォワーディング、リダイレクト、ロードバランシングなどの動的実行ロジックを一切持たない Read-Only Blueprint である。

---

## 2. 役割と責務境界 (Responsibilities & Boundaries)

### 2.1. ルーターが行わないこと (Prohibited Action Boundaries)
本 Message Router Foundation および将来の Message Router Runtime は、以下の操作・管理を自身の責務から完全に除外し、所有または直接操作してはならない（**Router Ownership Prohibited**）：
- **Event Bus の所有/管理**: イベントバスインスタンス自体を保持・所有しない。
- **Event の所有/管理**: イベントインスタンス自体を保持・所有・直接生成しない。
- **Dispatcher の所有/管理**: ディスパッチャー実体の保持・参照・割り当ては行わない。
- **Worker の所有/管理**: 実行エンジンである `Worker` の保持・管理は行わない。
- **スレッドの所有**: 実行スレッドを所有・作成しない。
- **Queue の所有/管理**: タスクキューやデータキューの直接管理は行わない。
- **Scheduler の所有/管理**: スケジューラの実体を保持・参照しない。
- **Kernel/Event Loop の所有/管理**: カーネル実体やイベントループの保持・参照・駆動を行わない。
- **動的ルーティング・フォワーディング・リダイレクト・配送・解決・リトライ・フェイルオーバー・ロードバランシング**: `route()`, `forward()`, `redirect()`, `deliver()`, `resolve()`, `multicast()`, `broadcast()`, `retry()`, `failover()` などの動的処理を実行しない。

### 2.2. ルーターの行う責務 (Message Router Responsibilities)
本 Message Router Foundation は以下の静的定義のみを責務とする：
- **Routing Schema の定義**: メッセージ配送経路のタイプ、戦略、優先経路、トポロジー、信頼性、およびセキュリティの静的記述。
- **Routing Execution Policy の定義**: 不変実行ポリシー（スレッド/キュー非保持、転送/リダイレクトの禁止、ルーティング実行の禁止等）の静的定義。
- **Routing Metadata の定義**: 各ルーターのモデルバージョンおよびスキーマバージョンの記述。

### 2.3. 静的 Blueprint 境界ルール
本 Message Router Foundation は実際の実行制御やプロセス管理は処理せず、「メッセージ配送経路スキーマ定義」を表現する Blueprint である。
以下の操作・処理は完全に排除される：
- `route()`, `forward()`, `redirect()`, `deliver()`, `resolve()`, `multicast()`, `broadcast()`, `retry()`, `failover()` などの動的処理ロジック。
- Promise, 非同期処理（async/await、Timer）、および Event Loop 等の実体。

---

## 3. 設計原則の遵守 (Architecture Principles)

### 3.1. 完全な不変性 (Immutable Rule)
すべてのオブジェクト構造、コンテキスト、データ、および Blueprint Container は、多層的に `Object.freeze()` を適用し、外部および内部からの改変を完全に禁止する。

### 3.2. 決定論的解決 (Deterministic Rule)
同一のルール入力に対して、常に同一の `ExecutionRuntimeMessageRouter` 参照を返却する。遅延ロードや動的な状態変化などを排除し、参照同一性を保証する。

### 3.3. 読み取り専用制約 (Read-Only Rule)
公開 API は Getter のみに限定され、いかなる Setter や状態変更（Mutation）メソッドも存在してはならない。
`ExecutionRuntimeMessageRouterContext` は識別子 ID の文字列 `runtimeMessageRouterId` のみを保持し、他のランタイムオブジェクトや直接のオブジェクト参照を一切保持しない（Context ID Only）。

---

## 4. 構造定義 (Structures)

### 4.1. RouterType (分類)
ルーターの分類を示す静的列挙型。
- `FOUNDATION`: 基礎ルーター定義
- `RUNTIME`: 実ルーター定義

### 4.2. RouterScope (適用範囲)
ルーターの適用スコープを示す静的列挙型。
- `SYSTEM`: システム空間ルーター

### 4.3. RuntimeMessageRouterType (ルーターモデル種類)
- `SYSTEM_ROUTER`: システムルーターモデル
- `CORE_ROUTER`: コアルーターモデル
- `APPLICATION_ROUTER`: アプリケーションルーターモデル
- `PLUGIN_ROUTER`: プラグインルーターモデル
- `FIELD_ROUTER`: 配布現場ルーターモデル

### 4.4. RouterLifecycleState (ルーターライフサイクル定義)
ルーター自体の状態スキーマを静的に定義。
- `CREATED`: 作成
- `READY`: 準備完了
- `WAITING`: 待機中
- `SEALED`: 封印 (変更を制限する静的境界状態)
- `TERMINATED`: 終了

### 4.5. RouterCapability (ルーター処理能力要件の静的宣言)
ルーターが必要とするリソース・分配環境を表現する静的列挙型 (宣言のみ、実装は禁止)。
- `SYSTEM`: システム能力要件
- `APPLICATION`: アプリケーション能力要件
- `PLUGIN`: プラグイン能力要件
- `FIELD`: 配布現場能力要件
- `AI`: AI 処理能力要件
- `WORKFLOW`: ワークフロー処理能力要件
- `MONITORING`: 監視能力要件
- `REMOTE`: リモート能力要件
- `DISTRIBUTED`: 分散処理能力要件
- `LOCAL`: ローカルノード能力要件
- `INTER_PROCESS`: プロセス間通信能力要件
- `INTER_NODE`: ノード間通信能力要件

### 4.6. RoutingStrategy (ルーティング戦略の静的宣言)
- `DIRECT`: 直接配送戦略
- `STATIC`: 静的経路決定戦略
- `BROADCAST`: ブロードキャスト配送戦略
- `MULTICAST`: マルチキャスト配送戦略
- `UNICAST`: ユニキャスト配送戦略
- `SCHEMA_ONLY`: スキーマ優先戦略

### 4.7. RoutingPolicy (ルーター実行ポリシー定義)
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
- `NO_TRANSPORT`: トランスポート非生成ポリシー
- `NO_ROUTE`: ルーティング実行禁止ポリシー
- `NO_FORWARD`: メッセージフォワード禁止ポリシー
- `NO_REDIRECT`: メッセージリダイレクト禁止ポリシー
- `NO_FAILOVER`: フェイルオーバー実行禁止ポリシー
- `NO_LOAD_BALANCING`: 負荷分散実行禁止ポリシー

### 4.8. RouterDependencyPolicy (ルーター依存トポロジーポリシー)
ルーター間の依存関係を制限するポリシーの静的列挙型。
- `NO_DEPENDENCY`: 依存なし
- `STATIC_DEPENDENCY`: 静的依存定義
- `SCHEMA_ONLY`: スキーマ限定依存

### 4.9. RouterTopology (ルータートポロジー定義)
ルーターのトポロジー形態を定義する静的列挙型。
- `LOCAL`: 単一プロセスローカル接続
- `PROCESS`: 同一ホストプロセス間接続
- `NODE`: ノード内接続
- `CLUSTER`: クラスタ構成接続
- `DISTRIBUTED`: 広域分散接続

### 4.10. RouterReliabilityPolicy (ルーター信頼性ポリシー定義)
メッセージ配送の信頼性を制限する静的列挙型。
- `BEST_EFFORT`: ベストエフォート配送
- `AT_MOST_ONCE`: 最大1回配送
- `AT_LEAST_ONCE`: 最低1回配送
- `EXACTLY_ONCE`: 正確に1回配送
- `SCHEMA_ONLY`: スキーマ限定信頼性

### 4.11. RouterCategory (ルーター意味的カテゴリ定義)
ルーターが属する意味的カテゴリの静的列挙型。
- `SYSTEM`: システムカテゴリ
- `RUNTIME`: ランタイムカテゴリ
- `PLUGIN`: プラグインカテゴリ
- `FIELD`: 現場配布カテゴリ
- `AI`: AI機能カテゴリ
- `WORKFLOW`: ワークフロー機能カテゴリ
- `MONITORING`: 監視機能カテゴリ
- `GOVERNANCE`: 統制機能カテゴリ

### 4.12. RouterSelectionPolicy (ルーター選択ポリシー定義 - 推奨追加項目)
複数ルート・ノードの中から適切な配送先を選択するアルゴリズムを宣言する静的列挙型。
- `STATIC`: 静的固定選択
- `HASH`: ハッシュ値に基づく選択
- `ROUND_ROBIN`: ラウンドロビン選択
- `CONSISTENT_HASH`: コンシスタントハッシュ選択
- `SCHEMA_ONLY`: スキーマ限定選択

### 4.13. RouterTransportPolicy (ルータートランスポートポリシー定義 - 推奨追加項目)
ルーターが通信に利用するプロトコル・メディアを静的に規定する列挙型。
- `LOCAL`: ローカルメモリ転送
- `IPC`: プロセス間パイプ通信
- `TCP`: TCPソケット通信
- `UDP`: UDPソケット通信
- `HTTP`: HTTP/REST通信
- `HTTPS`: 暗号化HTTPS通信
- `WEBSOCKET`: 双方向WebSocket通信
- `SCHEMA_ONLY`: スキーマ限定規定

### 4.14. RouterSecurityPolicy (ルーターセキュリティポリシー定義 - 推奨追加項目)
ルーター経路の保護方式を静的に定義する列挙型。
- `NONE`: セキュリティなし
- `SIGNATURE`: 電子署名検証
- `ENCRYPTION`: 通信経路の暗号化
- `AUTHENTICATION`: 接続ノードの認証
- `SCHEMA_ONLY`: スキーマ限定保護
