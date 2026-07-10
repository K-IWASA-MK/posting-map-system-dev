# Execution Runtime Worker Foundation Specification

## 1. 目的 (Purpose)
Execution Runtime Worker Foundation は、AIOS (Artificial Intelligence Operating System) における動的実行基盤の実行主体を定義する「Runtime Worker」の静的 Blueprint を定義する。実際のワーカー生成、起動、停止、タスク割当・実行、およびスレッド割当などの動的実行ロジックを一切持たない Read-Only Blueprint である。

---

## 2. 役割と責務境界 (Responsibilities & Boundaries)

### 2.1. ワーカーが行わないこと (Prohibited Action Boundaries)
本 Worker Foundation および将来の Worker Runtime は、以下の操作・管理を自身の責務から完全に除外し、所有または直接操作してはならない（**Worker Ownership Prohibited**）：
- **Thread の直接所有**: ワーカー自体は実行スレッドを自身で生成・破棄しない。
- **Scheduler の所有/管理**: 親となる `Scheduler` やスケジューリングキューの直接管理・格納を行わない。
- **Queue の所有/管理**: タスク待ち行列やバッファキューの直接管理は行わない。
- **Task の所有/管理**: `Task` 自体の生成やライフサイクル状態の更新は行わない。
- **Kernel の所有/管理**: カーネル実体の保持・参照しない。
- **Event Loop の所有/管理**: イベントループやタイマー・メッセージポーリングの駆動を行わない。
- **動的実行・起動・停止・割当**: `createWorker()`, `startWorker()`, `stopWorker()`, `executeTask()`, `assignTask()`, `releaseTask()`, `attachThread()`, `detachThread()`, `dispatchWorker()` などの動的ライフサイクル制御を実行しない。

### 2.2. ワーカーの行う責務 (Worker Responsibilities)
本 Worker Foundation は以下の静的定義のみを責務とする：
- **Worker Schema の定義**: ワーカーの型、実行主体としてのケイパビリティ、依存制限ポリシーの静的記述。
- **Worker Execution Policy の定義**: 不変実行ポリシー（スレッド/キュー/タスク非保持、実行/ディスパッチ/スレッド紐付けの禁止等）の静的定義。
- **Worker Metadata の定義**: 各ワーカーのモデルバージョンおよびスキーマバージョンの記述。

### 2.3. 静的 Blueprint 境界ルール
本 Worker Foundation は実際の実行制御やプロセス管理は処理せず、「ワーカー構成スキーマ定義」を表現する Blueprint である。
以下の操作・処理は完全に排除される：
- `createWorker()`, `startWorker()`, `stopWorker()`, `executeTask()`, `assignTask()`, `releaseTask()`, `attachThread()`, `detachThread()`, `dispatchWorker()` などの動的処理ロジック。
- Promise, 非同期処理（async/await、Timer）、および Worker Thread 等の実体。

---

## 3. 設計原則の遵守 (Architecture Principles)

### 3.1. 完全な不変性 (Immutable Rule)
すべてのオブジェクト構造、コンテキスト、データ、および Blueprint Container は、多層的に `Object.freeze()` を適用し、外部および内部からの改変を完全に禁止する。

### 3.2. 決定論的解決 (Deterministic Rule)
同一のルール入力に対して、常に同一の `ExecutionRuntimeWorker` 参照を返却する。遅延ロードや動的な状態変化などを排除し、参照同一性を保証する。

### 3.3. 読み取り専用制約 (Read-Only Rule)
公開 API は Getter のみに限定され、いかなる Setter や状態変更（Mutation）メソッドも存在してはならない。
`ExecutionRuntimeWorkerContext` は識別子 ID の文字列 `runtimeWorkerId` のみを保持し、他のランタイムオブジェクトや直接のオブジェクト参照を一切保持しない（Context ID Only）。

---

## 4. 構造定義 (Structures)

### 4.1. WorkerType (分類)
ワーカーの分類を示す静的列挙型。
- `FOUNDATION`: 基礎ワーカー定義
- `RUNTIME`: 実ワーカー定義

### 4.2. WorkerScope (適用範囲)
ワーカーの適用スコープを示す静的列挙型。
- `SYSTEM`: システム空間ワーカー

### 4.3. RuntimeWorkerType (ワーカーモデル種類)
- `SYSTEM_WORKER`: システムワーカーモデル
- `CORE_WORKER`: コアワーカーモデル
- `APPLICATION_WORKER`: アプリケーションワーカーモデル
- `PLUGIN_WORKER`: プラグインワーカーモデル
- `FIELD_WORKER`: 配布員現場ワーカーモデル

### 4.4. WorkerLifecycleState (ワーカーライフサイクル定義)
ワーカー自体の状態スキーマを静的に定義。
- `CREATED`: 作成
- `READY`: 準備完了
- `WAITING`: 待機中
- `SEALED`: 封印 (一時的に変更を制限する静的境界状態)
- `TERMINATED`: 終了

### 4.5. WorkerCapability (ワーカー能力宣言 - 推奨拡張項目)
ワーカーが処理可能な実行タイプを表現する静的列挙型 (宣言のみ、実装は禁止)。
- `CPU_EXECUTION`: CPU 演算実行能力
- `IO_EXECUTION`: IO 処理実行能力
- `SYSTEM`: システム資源処理能力
- `APPLICATION`: アプリ空間処理能力
- `PLUGIN`: プラグイン処理能力
- `FIELD`: 配布現場処理能力
- `AI`: AI/LLM 処理能力要件 (将来の予約値)
- `WORKFLOW`: ワークフロー処理能力要件 (将来の予約値)
- `MONITORING`: 監視・テレメトリ処理能力要件 (将来의 予約値)

### 4.6. WorkerExecutionPolicy (ワーカー実行ポリシー定義)
- `READ_ONLY`: 読み取り専用ポリシー
- `DETERMINISTIC`: 決定論的ポリシー
- `IMMUTABLE_SCHEMA`: 不変スキーマポリシー
- `NO_THREAD`: スレッド非生成ポリシー
- `NO_SCHEDULER`: スケジューラー非保持ポリシー
- `NO_QUEUE`: キュー非保持ポリシー
- `NO_TASK`: タスク非保持ポリシー
- `NO_EVENT_LOOP`: イベントループ非保持ポリシー
- `NO_EXECUTION`: 実行非同期禁止ポリシー
- `NO_DISPATCH`: ディスパッチ非実行ポリシー
- `NO_THREAD_BINDING`: スレッド静的バインド禁止ポリシー

### 4.7. WorkerDependencyPolicy (ワーカー依存関係ポリシー - 推奨追加項目)
ワーカー間の依存トポロジーを制限するポリシーの静的列挙型。
- `NO_DEPENDENCY`: 依存なし
- `STATIC_DEPENDENCY`: 静的依存定義
- `SCHEMA_ONLY`: スキーマ限定依存
