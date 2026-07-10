# Execution Runtime Thread Foundation Specification

## 1. 目的 (Purpose)
Execution Runtime Thread Foundation は、AIOS (Artificial Intelligence Operating System) における動的実行基盤の最小実行単位となる「Runtime Thread」の静的 Blueprint を定義する。実際の実行スレッド起動、コンテキストスイッチ、非同期処理、リトライ処理、およびスケジューリングなどの動的実行ロジックを一切持たない Read-Only Blueprint である。

---

## 2. 役割と責務境界 (Responsibilities & Boundaries)

### 2.1. スレッドが行わないこと (Prohibited Action Boundaries)
本 Thread Foundation および将来の Thread Runtime は、以下の操作・管理を自身の責務から完全に除外し、所有または直接操作してはならない（**Thread Ownership Prohibited**）：
- **Task の所有/管理**: `Task` のインスタンスやスケジュールキューを保持しない。
- **Scheduler の所有/管理**: 親となる `Scheduler` やスケジューリングループの管理は直接行わない。
- **Queue の所有/管理**: スレッド内にタスク待ち行列やバッファキューを保持しない。
- **Event Loop の所有/管理**: スレッド自体がイベントループやメッセージポーリングを駆動しない。
- **スレッドの実行/コンテキストスイッチ**: 自発的な実行処理、実行スレッド起動、およびコンテキスト切替ロジックを実行しない。

### 2.2. スレッドの行う責務 (Thread Responsibilities)
本 Thread Foundation は以下の静的定義のみを責務とする：
- **Thread Schema の定義**: スレッド全体のモデル構成、手順シーケンスの静的記述。
- **Thread Execution Policy の定義**: 不変実行ポリシー（タスク禁止ポリシー等）の静的定義。
- **Thread Metadata の定義**: 各スレッドのメタデータ記述。

### 2.3. 静的 Blueprint 境界ルール
本 Thread Foundation は実際の実行制御やプロセス管理は処理せず、「スレッド構成スキーマ定義」を表現する Blueprint である。
以下の操作・処理は完全に排除される：
- `createThread()`, `startThread()`, `stopThread()`, `suspendThread()`, `resumeThread()`, `executeThread()`, `dispatchThread()`, `switchContext()` などの動的実行ロジック。
- Promise, 非同期処理（async/await、Timer）、および Worker 等の実体起動ロジック。

---

## 3. 設計原則の遵守 (Architecture Principles)

### 3.1. 完全な不変性 (Immutable Rule)
すべてのオブジェクト構造、コンテキスト、データ、および Blueprint Container は、多層的に `Object.freeze()` を適用し、外部および内部からの改変を完全に禁止する。

### 3.2. 決定論的解決 (Deterministic Rule)
同一のルール入力に対して、常に同一の `ExecutionRuntimeThread` 参照を返却する。遅延ロードや動的な状態変化などを排除し、参照同一性を保証する。

### 3.3. 読み取り専用制約 (Read-Only Rule)
公開 API は Getter のみに限定され、いかなる Setter や状態変更（Mutation）メソッドも存在してはならない。
`ExecutionRuntimeThreadContext` は識別子 ID の文字列 `runtimeThreadId` のみを保持し、他のランタイムオブジェクトや直接のオブジェクト参照を一切保持しない（Context ID Only）。

---

## 4. 構造定義 (Structures)

### 4.1. ThreadType (分類)
スレッドの分類を示す静的列挙型。
- `FOUNDATION`: 基礎スレッド定義
- `RUNTIME`: 実スレッド定義

### 4.2. ThreadScope (適用範囲)
スレッドの適用スコープを示す静的列挙型。
- `SYSTEM`: システム空間スレッド

### 4.3. RuntimeThreadType (スレッドモデル種類)
- `SYSTEM_THREAD`: システムスレッドモデル
- `CORE_THREAD`: コアスレッドモデル
- `APPLICATION_THREAD`: アプリケーションスレッドモデル
- `PLUGIN_THREAD`: プラグインスレッドモデル
- `FIELD_THREAD`: 配布員現場スレッドモデル

### 4.4. ThreadLifecycleState (スレッドライフサイクル定義)
スレッド自体の状態スキーマを静的に定義。
- `CREATED`: 作成
- `READY`: 準備完了
- `WAITING`: 待機中
- `RUNNING`: 実行中
- `STOPPED`: 停止
- `TERMINATED`: 終了

### 4.5. ThreadExecutionPolicy (スレッド実行ポリシー定義)
- `READ_ONLY`: 読み取り専用ポリシー
- `DETERMINISTIC`: 決定論的ポリシー
- `IMMUTABLE_SCHEMA`: 不変スキーマポリシー
- `NO_TASK`: タスク非保持ポリシー
- `NO_QUEUE`: キュー非保持ポリシー
- `NO_EVENT_LOOP`: イベントループ非保持ポリシー
- `NO_SCHEDULER`: スケジューラ非保持ポリシー
- `NO_CONTEXT_SWITCH`: コンテキストスイッチ非実行ポリシー
