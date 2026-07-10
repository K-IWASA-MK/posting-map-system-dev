# Execution Runtime Event Bus Foundation Specification

## 1. 目的 (Purpose)
Execution Runtime Event Bus Foundation は、AIOS (Artificial Intelligence Operating System) における動的実行基盤のイベント配送構造（Event Bus Schema）を定義する「Runtime Event Bus」の静的 Blueprint を定義する。実際のイベント配送、購読、通知、チャネル管理、メッセージ転送、および非同期ルーティングなどの動的実行ロジックを一切持たない Read-Only Blueprint である。

---

## 2. 役割と責務境界 (Responsibilities & Boundaries)

### 2.1. イベントバスが行わないこと (Prohibited Action Boundaries)
本 Event Bus Foundation および将来の Event Bus Runtime は、以下の操作・管理を自身の責務から完全に除外し、所有または直接操作してはならない（**Event Bus Ownership Prohibited**）：
- **Event の所有/管理**: イベントインスタンス自体を保持・所有・直接生成しない。
- **Dispatcher の所有/管理**: ディスパッチャー実体の保持・参照・割り当ては行わない。
- **Worker の所有/管理**: 実行エンジンである `Worker` の保持・管理は行わない。
- **スレッドの所有**: 実行スレッドを所有・作成しない。
- **Queue の所有/管理**: タスクキューやデータキューの直接管理は行わない。
- **Scheduler の所有/管理**: スケジューラの実体を保持・参照しない。
- **Kernel/Event Loop の所有/管理**: カーネル実体やイベントループの保持・参照・駆動を行わない。
- **動的配送・購読・通知・チャネル管理・ルーティング**: `publish()`, `subscribe()`, `unsubscribe()`, `broadcast()`, `multicast()`, `notify()`, `route()`, `dispatch()`, `registerChannel()`, `unregisterChannel()` などの動的処理を実行しない。

### 2.2. イベントバスの行う責務 (Event Bus Responsibilities)
本 Event Bus Foundation は以下の静的定義のみを責務とする：
- **Event Bus Schema の定義**: イベントバス配送のタイプ、チャネルポリシー、トポロジー、優先配送、信頼性ポリシーの静的記述。
- **Event Bus Execution Policy の定義**: 不変実行ポリシー（スレッド/キュー非保持、発行/購読の禁止、チャネル操作の禁止等）の静的定義。
- **Event Bus Metadata の定義**: 各イベントバスのモデルバージョンおよびスキーマバージョンの記述。

### 2.3. 静的 Blueprint 境界ルール
本 Event Bus Foundation は実際の実行制御やプロセス管理は処理せず、「イベントバス配送スキーマ定義」を表現する Blueprint である。
以下の操作・処理は完全に排除される：
- `publish()`, `subscribe()`, `unsubscribe()`, `broadcast()`, `multicast()`, `notify()`, `route()`, `dispatch()`, `registerChannel()`, `unregisterChannel()` などの動的処理ロジック。
- Promise, 非同期処理（async/await、Timer）、および Event Loop 等の実体。

---

## 3. 設計原則の遵守 (Architecture Principles)

### 3.1. 完全な不変性 (Immutable Rule)
すべてのオブジェクト構造、コンテキスト、データ、および Blueprint Container は、多層的に `Object.freeze()` を適用し、外部および内部からの改変を完全に禁止する。

### 3.2. 決定論的解決 (Deterministic Rule)
同一のルール入力に対して、常に同一の `ExecutionRuntimeEventBus` 参照を返却する。遅延ロードや動的な状態変化などを排除し、参照同一性を保証する。

### 3.3. 読み取り専用制約 (Read-Only Rule)
公開 API は Getter のみに限定され、いかなる Setter や状態変更（Mutation）メソッドも存在してはならない。
`ExecutionRuntimeEventBusContext` は識別子 ID の文字列 `runtimeEventBusId` のみを保持し、他のランタイムオブジェクトや直接のオブジェクト参照を一切保持しない（Context ID Only）。

---

## 4. 構造定義 (Structures)

### 4.1. EventBusType (分類)
イベントバスの分類を示す静的列挙型。
- `FOUNDATION`: 基礎イベントバス定義
- `RUNTIME`: 実イベントバス定義

### 4.2. EventBusScope (適用範囲)
イベントバスの適用スコープを示す静的列挙型。
- `SYSTEM`: システム空間イベントバス

### 4.3. RuntimeEventBusType (イベントバスモデル種類)
- `SYSTEM_EVENT_BUS`: システムイベントバスモデル
- `CORE_EVENT_BUS`: コアイベントバスモデル
- `APPLICATION_EVENT_BUS`: アプリケーションイベントバスモデル
- `PLUGIN_EVENT_BUS`: プラグインイベントバスモデル
- `FIELD_EVENT_BUS`: 配布現場イベントバスモデル

### 4.4. EventBusLifecycleState (イベントバスライフサイクル定義)
イベントバス自体の状態スキーマを静的に定義。
- `CREATED`: 作成
- `READY`: 準備完了
- `WAITING`: 待機中
- `SEALED`: 封印 (変更を制限する静的境界状態)
- `TERMINATED`: 終了

### 4.5. EventBusCapability (イベントバス処理能力要件の静的宣言)
イベントバスが必要とするリソース・分配環境を表現する静的列挙型 (宣言のみ、実装は禁止)。
- `SYSTEM`: システム能力要件
- `APPLICATION`: アプリケーション能力要件
- `PLUGIN`: プラグイン能力要件
- `FIELD`: 配布現場能力要件
- `AI`: AI 処理能力要件
- `WORKFLOW`: ワークフロー処理能力要件
- `MONITORING`: 監視能力要件
- `REMOTE`: リモート能力要件
- `DISTRIBUTED`: 分散処理能力要件
- `LOCAL`: ローカルノード能力要件 (推奨の予約値)
- `INTER_PROCESS`: プロセス間通信能力要件 (推奨の予約値)
- `INTER_NODE`: ノード間通信能力要件 (推奨の予約値)

### 4.6. EventBusExecutionPolicy (イベントバス実行ポリシー定義)
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
- `NO_EVENT_LOOP`: イベントループ非保持ポリシー
- `NO_EVENT_BUS`: イベントバス実体非保持ポリシー
- `NO_PUBLISH`: イベント発行・配送禁止ポリシー
- `NO_SUBSCRIBE`: イベント購読・登録禁止ポリシー
- `NO_NOTIFICATION`: イベント通知禁止ポリシー
- `NO_ROUTING`: イベントルーティング禁止ポリシー
- `NO_CHANNEL_OPERATION`: チャネル追加・削除操作禁止ポリシー

### 4.7. EventBusDependencyPolicy (イベントバス依存トポロジーポリシー)
イベントバス間の依存関係を制限するポリシーの静的列挙型。
- `NO_DEPENDENCY`: 依存なし
- `STATIC_DEPENDENCY`: 静的依存定義
- `SCHEMA_ONLY`: スキーマ限定依存

### 4.8. EventBusChannelPolicy (イベントバスチャネルポリシー)
- `NO_CHANNEL`: チャネルなし
- `STATIC_CHANNEL`: 静的チャネル定義
- `SCHEMA_ONLY`: スキーマ限定チャネル

### 4.9. EventBusTopology (イベントバストポロジー定義 - 推奨追加項目)
イベントバスのトポロジー形態を定義する静的列挙型。
- `LOCAL`: 単一プロセスローカル接続
- `PROCESS`: 同一ホストプロセス間接続
- `NODE`: ノード内接続
- `CLUSTER`: クラスタ構成接続
- `DISTRIBUTED`: 広域分散接続

### 4.10. EventBusDeliveryPolicy (イベントバス配送ポリシー定義 - 推奨追加項目)
イベントバスの配送制御に関する静的列挙型。
- `DIRECT`: 直接配送
- `BROADCAST`: 全体ブロードキャスト
- `MULTICAST`: 特定グループマルチキャスト
- `UNICAST`: 単一送信ユニキャスト
- `SCHEMA_ONLY`: スキーマ優先配送

### 4.11. EventBusReliabilityPolicy (イベントバス信頼性ポリシー定義 - 推奨追加項目)
イベント配送の信頼性を制限する静的列挙型。
- `BEST_EFFORT`: ベストエフォート配送
- `AT_MOST_ONCE`: 最大1回配送
- `AT_LEAST_ONCE`: 最低1回配送
- `EXACTLY_ONCE`: 正確に1回配送
- `SCHEMA_ONLY`: スキーマ限定信頼性

### 4.12. EventBusCategory (イベントバス意味的カテゴリ定義 - 推奨追加項目)
イベントバスが属する意味的カテゴリの静的列挙型。
- `SYSTEM`: システムカテゴリ
- `RUNTIME`: ランタイムカテゴリ
- `PLUGIN`: プラグインカテゴリ
- `FIELD`: 現場配布カテゴリ
- `AI`: AI機能カテゴリ
- `WORKFLOW`: ワークフロー機能カテゴリ
- `MONITORING`: 監視機能カテゴリ
- `GOVERNANCE`: 統制機能カテゴリ
