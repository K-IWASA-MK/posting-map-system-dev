# Execution Runtime Scheduler Foundation Specification

## 1. 目的 (Purpose)
Execution Runtime Scheduler Foundation は、AIOS (Artificial Intelligence Operating System) における動的実行基盤の実行順序（Scheduling Schema）を定義する「Runtime Scheduler」の静的 Blueprint を定義する。実際のキュー操作（enqueue/dequeue）、スレッドスケジューリング、タイムスライス制御、イベントループ同期、およびタイマーハンドリングなどの動的実行ロジックを一切持たない Read-Only Blueprint である。

---

## 2. 役割と責務境界 (Responsibilities & Boundaries)

### 2.1. スケジューラが行わないこと (Prohibited Action Boundaries)
本 Scheduler Foundation および将来の Scheduler Runtime は、以下の操作・管理を自身の責務から完全に除外し、所有または直接操作してはならない（**Scheduler Ownership Prohibited**）：
- **Thread の生成/所有**: 実行スレッドを自身で生成・破棄しない。
- **Queue の所有/管理**: タスク待ち行列やバッファキューを直接保持・同期しない。
- **Task の所有/管理**: `Task` のインスタンス自体の作成や状態変更は行わない。
- **Event Loop の所有/管理**: イベントループやタイマー・メッセージポーリングの直接の駆動・管理は行わない。
- **動的実行・ディスパッチ**: スケジューリング処理の Tick 同期、スレッドへのタスク割当、およびディスパッチ処理を実行しない。

### 2.2. スケジューラの行う責務 (Scheduler Responsibilities)
本 Scheduler Foundation は以下の静的定義のみを責務とする：
- **Scheduling Schema の定義**: 実行順序モデル、スケジューリング手順の静的記述。
- **Scheduling Policy の定義**: 不変実行ポリシー（優先度計算禁止ポリシー、負荷分散禁止ポリシー等）の静的定義。
- **Scheduling Metadata の定義**: 各スケジューラのメタデータ記述。

### 2.3. 静的 Blueprint 境界ルール
本 Scheduler Foundation は実際の実行制御やプロセス管理は処理せず、「スケジューラ構成スキーマ定義」を表現する Blueprint である。
以下の操作・処理は完全に排除される：
- `schedule()`, `dispatch()`, `enqueue()`, `dequeue()`, `wakeup()`, `sleep()`, `tick()`, `startScheduler()`, `stopScheduler()` などの動的実行ロジック。
- Promise, 非同期処理（async/await、Timer）、および Queue 等の実体。

---

## 3. 設計原則の遵守 (Architecture Principles)

### 3.1. 完全な不変性 (Immutable Rule)
すべてのオブジェクト構造、コンテキスト、データ、および Blueprint Container は、多層的に `Object.freeze()` を適用し、外部および内部からの改変を完全に禁止する。

### 3.2. 決定論的解決 (Deterministic Rule)
同一のルール入力に対して、常に同一の `ExecutionRuntimeScheduler` 参照を返却する。遅延ロードや動的な状態変化などを排除し、参照同一性を保証する。

### 3.3. 読み取り専用制約 (Read-Only Rule)
公開 API は Getter のみに限定され、いかなる Setter や状態変更（Mutation）メソッドも存在してはならない。
`ExecutionRuntimeSchedulerContext` は識別子 ID の文字列 `runtimeSchedulerId` のみを保持し、他のランタイムオブジェクトや直接のオブジェクト参照を一切保持しない（Context ID Only）。

---

## 4. 構造定義 (Structures)

### 4.1. SchedulerType (分類)
スケジューラの分類を示す静的列挙型。
- `FOUNDATION`: 基礎スケジューラ定義
- `RUNTIME`: 実スケジューラ定義

### 4.2. SchedulerScope (適用範囲)
スケジューラの適用スコープを示す静的列挙型。
- `SYSTEM`: システム空間スケジューラ

### 4.3. RuntimeSchedulerType (スケジューラモデル種類)
- `SYSTEM_SCHEDULER`: システムスケジューラモデル
- `CORE_SCHEDULER`: コアスケジューラモデル
- `APPLICATION_SCHEDULER`: アプリケーションスケジューラモデル
- `PLUGIN_SCHEDULER`: プラグインスケジューラモデル
- `FIELD_SCHEDULER`: 配布員現場スケジューラモデル

### 4.4. SchedulerLifecycleState (スケジューラライフサイクル定義)
スケジューラ自体の状態スキーマを静的に定義。
- `CREATED`: 作成
- `READY`: 準備完了
- `WAITING`: 待機中
- `ACTIVE`: 活性
- `STOPPED`: 停止
- `TERMINATED`: 終了

### 4.5. SchedulerExecutionPolicy (スケジューラ実行ポリシー定義)
- `READ_ONLY`: 読み取り専用ポリシー
- `DETERMINISTIC`: 決定論的ポリシー
- `IMMUTABLE_SCHEMA`: 不変スキーマポリシー
- `NO_THREAD`: スレッド非生成ポリシー
- `NO_TASK`: タスク非保持ポリシー
- `NO_QUEUE`: キュー非保持ポリシー
- `NO_WORKER`: ワーカー非保持ポリシー
- `NO_EVENT_LOOP`: イベントループ非保持ポリシー
- `NO_TIMER`: タイマー非保持ポリシー
- `NO_DISPATCH`: ディスパッチ非実行ポリシー
- `NO_PRIORITY_CALCULATION`: 優先順位計算非実行ポリシー (Phase 232 推奨ポリシー)
- `NO_LOAD_BALANCING`: 負荷分散非実行ポリシー (Phase 232 推奨ポリシー)
