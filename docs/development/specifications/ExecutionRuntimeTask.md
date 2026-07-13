# Execution Runtime Task Foundation Specification

## 1. 目的 (Purpose)
Execution Runtime Task Foundation は、AIOS (Artificial Intelligence Operating System) における動的実行基盤の最小実行単位の論理モデルを定義する「Runtime Task」の静的 Blueprint を定義する。実際のタスク生成、実行、キャンセル、再試行、およびスレッド割当などの動的実行ロジックを一切持たない Read-Only Blueprint である。

---

## 2. 役割と責務境界 (Responsibilities & Boundaries)

### 2.1. タスクが行わないこと (Prohibited Action Boundaries)
本 Task Foundation および将来の Task Runtime は、以下の操作・管理を自身の責務から完全に除外し、所有または直接操作してはならない（**Task Ownership Prohibited**）：
- **Thread の所有**: タスク自体は実行スレッドを所有しない。
- **Scheduler の所有/管理**: スケジューラの実体を保持・参照しない。
- **Queue の所有/管理**: タスク待ち行列やバッファキューの直接管理・格納を行わない。
- **Worker の所有/管理**: 実際の実行エンジンである `Worker` の起動・保持・割当は行わない。
- **Kernel の所有/管理**: カーネル実体の保持・参照しない。
- **Event Loop の所有/管理**: イベントループやタイマー・メッセージポーリングの駆動を行わない。
- **動的実行・キャンセル・再試行**: `execute()`, `cancel()`, `retry()` 等の動的なライフサイクル制御を実行しない。

### 2.2. タスクの行う責務 (Task Responsibilities)
本 Task Foundation は以下の静的定義のみを責務とする：
- **Task Schema の定義**: タスクの型、実行要件、依存性、ケイパビリティの静的記述。
- **Task Execution Policy の定義**: 不変実行ポリシー（スレッド/キュー非保持、実行/キャンセル/再試行の禁止等）の静的定義。
- **Task Metadata の定義**: 各タスクのモデルバージョンおよびスキーマバージョンの記述。

### 2.3. 静的 Blueprint 境界ルール
本 Task Foundation は実際の実行制御やプロセス管理は処理せず、「タスク構成スキーマ定義」を表現する Blueprint である。
以下の操作・処理は完全に排除される：
- `createTask()`, `executeTask()`, `cancelTask()`, `retryTask()`, `dispatchTask()`, `assignThread()`, `assignWorker()`, `completeTask()`, `failTask()` などの動的処理ロジック。
- Promise, 非同期処理（async/await、Timer）、および Queue 等の実体。

---

## 3. 設計原則の遵守 (Architecture Principles)

### 3.1. 完全な不変性 (Immutable Rule)
すべてのオブジェクト構造、コンテキスト、データ、および Blueprint Container は、多層的に `Object.freeze()` を適用し、外部および内部からの改変を完全に禁止する。

### 3.2. 決定論的解決 (Deterministic Rule)
同一のルール入力に対して、常に同一の `ExecutionRuntimeTask` 参照を返却する。遅延ロードや動的な状態変化などを排除し、参照同一性を保証する。

### 3.3. 読み取り専用制約 (Read-Only Rule)
公開 API は Getter のみに限定され、いかなる Setter や状態変更（Mutation）メソッドも存在してはならない。
`ExecutionRuntimeTaskContext` は識別子 ID の文字列 `runtimeTaskId` のみを保持し、他のランタイムオブジェクトや直接のオブジェクト参照を一切保持しない（Context ID Only）。

---

## 4. 構造定義 (Structures)

### 4.1. TaskType (分類)
タスクの分類を示す静的列挙型。
- `FOUNDATION`: 基礎タスク定義
- `RUNTIME`: 実タスク定義

### 4.2. TaskScope (適用範囲)
タスクの適用スコープを示す静的列挙型。
- `SYSTEM`: システム空間タスク

### 4.3. RuntimeTaskType (タスクモデル種類)
- `SYSTEM_TASK`: システムタスクモデル
- `CORE_TASK`: コアタスクモデル
- `APPLICATION_TASK`: アプリケーションタスクモデル
- `PLUGIN_TASK`: プラグインタスクモデル
- `FIELD_TASK`: 配布員現場タスクモデル

### 4.4. TaskLifecycleState (タスクライフサイクル定義)
タスク自体の状態スキーマを静的に定義。
- `CREATED`: 作成
- `READY`: 準備完了
- `WAITING`: 待機中
- `SEALED`: 封印 (一時的に状態遷移を禁止する静的境界状態)
- `TERMINATED`: 終了

### 4.5. TaskExecutionPolicy (タスク実行ポリシー定義)
- `READ_ONLY`: 読み取り専用ポリシー
- `DETERMINISTIC`: 決定論的ポリシー
- `IMMUTABLE_SCHEMA`: 不変スキーマポリシー
- `NO_THREAD`: スレッド非生成ポリシー
- `NO_SCHEDULER`: スケジューラー非保持ポリシー
- `NO_QUEUE`: キュー非保持ポリシー
- `NO_WORKER`: ワーカー非保持ポリシー
- `NO_EVENT_LOOP`: イベントループ非保持ポリシー
- `NO_EXECUTION`: 実行非同期禁止ポリシー
- `NO_DISPATCH`: ディスパッチ非実行ポリシー
- `NO_RETRY`: 再試行非実行ポリシー
- `NO_CANCEL`: キャンセル非実行ポリシー

### 4.6. TaskCapability (タスク実行能力要件の静的宣言 - 推奨追加項目)
タスクが必要とするリソース・実行形態を表現する静的列挙型 (宣言のみ、実装は禁止)。
- `SYNC`: 同期処理能力要件
- `ASYNC`: 非同期処理能力要件
- `CPU_BOUND`: CPU 負荷能力要件
- `IO_BOUND`: IO 負荷能力要件
- `SYSTEM`: システム資源能力要件
- `APPLICATION`: アプリ空間能力要件

### 4.7. TaskDependencyPolicy (タスク依存関係ポリシー - 推奨追加項目)
タスク間の依存トポロジーを制限するポリシーの静的列挙型。
- `NO_DEPENDENCY`: 依存なし
- `STATIC_DEPENDENCY`: 静的依存定義
- `SCHEMA_ONLY`: スキーマ限定依存
