# Execution Runtime Dispatcher Foundation Specification

## 1. 目的 (Purpose)
Execution Runtime Dispatcher Foundation は、AIOS (Artificial Intelligence Operating System) における動的実行基盤の Task と Worker の割当ポリシー（Dispatch Schema）を定義する「Runtime Dispatcher」の静的 Blueprint を定義する。実際の割当実行、ワーカー選択、負荷分散、優先度計算、および非同期スケジューリングなどの動的実行ロジックを一切持たない Read-Only Blueprint である。

---

## 2. 役割と責務境界 (Responsibilities & Boundaries)

### 2.1. ディスパッチャーが行わないこと (Prohibited Action Boundaries)
本 Dispatcher Foundation および将来の Dispatcher Runtime は、以下の操作・管理を自身の責務から完全に除外し、所有または直接操作してはならない（**Dispatcher Ownership Prohibited**）：
- **Thread の所有/管理**: ディスパッチャー自体は実行スレッドを所有・作成しない。
- **Scheduler の所有/管理**: スケジューラの実体を保持・参照しない。
- **Queue の所有/管理**: タスク待ち行列やバッファキューの直接管理は行わない。
- **Task の所有/管理**: タスク実体の生成やライフサイクル状態の更新は行わない。
- **Worker の所有/管理**: 実際の実行エンジンである `Worker` の起動・保持・割当は行わない。
- **Kernel/Event Loop の所有/管理**: カーネル実体やイベントループの保持・参照・駆動を行わない。
- **動的割当・ワーカー選択・負荷分散・再試行・ルーティング**: `dispatchTask()`, `selectWorker()`, `assignWorker()`, `releaseWorker()`, `retryDispatch()`, `balanceLoad()`, `routeTask()`, `executeDispatch()` などの動的処理を実行しない。

### 2.2. ディスパッチャーの行う責務 (Dispatcher Responsibilities)
本 Dispatcher Foundation は以下の静的定義のみを責務とする：
- **Dispatch Schema の定義**: ディスパッチ方式、対応ディスパッチポリシーの静的記述。
- **Dispatch Execution Policy の定義**: 不変実行ポリシー（スレッド/キュー/タスク非保持、割当/ルーティング/負荷分散の禁止等）の静的定義。
- **Dispatch Metadata の定義**: 各ディスパッチャーのモデルバージョンおよびスキーマバージョンの記述。

### 2.3. 静的 Blueprint 境界ルール
本 Dispatcher Foundation は実際の実行制御やプロセス管理は処理せず、「ディスパッチャー構成スキーマ定義」を表現する Blueprint である。
以下の操作・処理は完全に排除される：
- `dispatchTask()`, `assignWorker()`, `selectWorker()`, `retryDispatch()`, `balanceLoad()`, `routeTask()`, `executeDispatch()` などの動的処理ロジック。
- Promise, 非同期処理（async/await、Timer）、および Worker 等の実体。

---

## 3. 設計原則の遵守 (Architecture Principles)

### 3.1. 完全な不変性 (Immutable Rule)
すべてのオブジェクト構造、コンテキスト、データ、および Blueprint Container は、多層的に `Object.freeze()` を適用し、外部および内部からの改変を完全に禁止する。

### 3.2. 決定論的解決 (Deterministic Rule)
同一のルール入力に対して、常に同一の `ExecutionRuntimeDispatcher` 参照を返却する。遅延ロードや動的な状態変化などを排除し、参照同一性を保証する。

### 3.3. 読み取り専用制約 (Read-Only Rule)
公開 API は Getter のみに限定され、いかなる Setter や状態変更（Mutation）メソッドも存在してはならない。
`ExecutionRuntimeDispatcherContext` は識別子 ID の文字列 `runtimeDispatcherId` のみを保持し、他のランタイムオブジェクトや直接のオブジェクト参照を一切保持しない（Context ID Only）。

---

## 4. 構造定義 (Structures)

### 4.1. DispatcherType (分類)
ディスパッチャーの分類を示す静的列挙型。
- `FOUNDATION`: 基礎ディスパッチャー定義
- `RUNTIME`: 実ディスパッチャー定義

### 4.2. DispatcherScope (適用範囲)
ディスパッチャーの適用スコープを示す静的列挙型。
- `SYSTEM`: システム空間ディスパッチャー

### 4.3. RuntimeDispatcherType (ディスパッチャーモデル種類)
- `SYSTEM_DISPATCHER`: システムディスパッチャーモデル
- `CORE_DISPATCHER`: コアディスパッチャーモデル
- `APPLICATION_DISPATCHER`: アプリケーションディスパッチャーモデル
- `PLUGIN_DISPATCHER`: プラグインディスパッチャーモデル
- `FIELD_DISPATCHER`: 配布現場ディスパッチャーモデル

### 4.4. DispatcherLifecycleState (ディスパッチャーライフサイクル定義)
ディスパッチャー自体の状態スキーマを静的に定義。
- `CREATED`: 作成
- `READY`: 準備完了
- `WAITING`: 待機中
- `SEALED`: 封印 (変更を制限する静的境界状態)
- `TERMINATED`: 終了

### 4.5. DispatcherCapability (ディスパッチャー能力要件の静的宣言 - 推奨拡張項目)
ディスパッチャーが必要とする実行環境・方式を表現する静的列挙型 (宣言のみ、実装は禁止)。
- `SYSTEM`: システム能力要件
- `APPLICATION`: アプリケーション能力要件
- `PLUGIN`: プラグイン能力要件
- `FIELD`: 配布現場能力要件
- `AI`: AI 分配能力要件
- `WORKFLOW`: ワークフロー分配能力要件
- `MONITORING`: 監視分配能力要件
- `REMOTE`: リモートノード能力要件 (将来の予約値)
- `DISTRIBUTED`: 分散割当能力要件 (将来の予約値)

### 4.6. DispatcherExecutionPolicy (ディスパッチャー実行ポリシー定義 - 推奨拡張項目)
- `READ_ONLY`: 読み取り専用ポリシー
- `DETERMINISTIC`: 決定論的ポリシー
- `IMMUTABLE_SCHEMA`: 不変スキーマポリシー
- `NO_THREAD`: スレッド非生成ポリシー
- `NO_QUEUE`: キュー非保持ポリシー
- `NO_SCHEDULER`: スケジューラー非保持ポリシー
- `NO_TASK`: タスク非保持ポリシー
- `NO_WORKER`: ワーカー非保持ポリシー
- `NO_EVENT_LOOP`: イベントループ非保持ポリシー
- `NO_DISPATCH`: ディスパッチ非実行ポリシー
- `NO_ROUTING`: ルーティング非実行ポリシー
- `NO_LOAD_BALANCING`: 負荷分散非実行ポリシー
- `NO_PRIORITY_SELECTION`: 優先度割当非実行ポリシー
- `NO_FAILOVER`: フェイルオーバー非実行ポリシー (将来の予約値)
- `NO_REMOTE_ROUTING`: リモートルート非実行ポリシー (将来の予約値)
- `NO_DYNAMIC_POLICY`: 動的ポリシー適用禁止ポリシー (将来の予約値)

### 4.7. DispatcherDependencyPolicy (ディスパッチャー依存トポロジーポリシー - 推奨追加項目)
ディスパッチャー間の依存トポロジーを制限するポリシーの静的列挙型。
- `NO_DEPENDENCY`: 依存なし
- `STATIC_DEPENDENCY`: 静的依存定義
- `SCHEMA_ONLY`: スキーマ限定依存
