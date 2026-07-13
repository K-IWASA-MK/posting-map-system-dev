# Execution Runtime Executor Foundation Specification

## 1. 目的 (Purpose)
Execution Runtime Executor Foundation は、AIOS (Artificial Intelligence Operating System) における実行ランタイムの実行計画を表すための実行モデル（RuntimeExecutionModel）の静的 Blueprint を定義し、その境界を表現する。実行スレッディング・スケジューリングロジックを持たない Read-Only Blueprint である。

## 2. 役割と責務境界 (Responsibilities & Boundaries)

### 2.1. 責務 (Responsibility)
- Executor は Runtime の実行、起動、停止、制御、スケジュールなどを処理する実装ではない。Runtime 全体の実行計画（Execution Schema）を表現する静的 Blueprint であり、実際の実行処理は Runtime フェーズで実装される。
- 実行ランタイム全体の実行計画モデル、実行順序（executionOrder）、実行ポリシー、および静的な実行ステップ（ExecutionStep）を公開する。
- メタデータ、コンテキスト、データ、および Blueprint Container を多層的に `Object.freeze()` して完全な不変性を保証する。
- 外部からの静的アクセスに対応するための読み取り専用 Getter API を提供する。

### 2.2. レイヤー境界ルール (Layer Boundary)
本 Executor Specification は、静的トポロジーおよび定義情報のみを扱うレイヤーに属する。
動的な Runtime の実行、イベントループ、Tick スケジューリング、スレッド生成などを処理する Runtime エンジン等とは明確に分離され、いかなる動的な処理ロジックも内包してはならない。

### 2.3. エグゼキューターマネージャー境界ルール (Executor Boundary)
本 Executor Foundation は実際のプロセスの起動・停止・制御等は処理せず、「実行計画モデル定義」を表現する Blueprint である。
動的な実行制御ロジック、エラーハンドリング、非同期処理、リトライ等の制御ロジックは一切含めない。
以下の操作・処理は完全に排除される：
- `execute()`, `run()`, `start()`, `stop()`, `shutdown()`, `restart()`, `tick()` などの動的な実行制御、プロセス制御、スケジューリング、および Tick 遷移制御処理。
- ランタイムエグゼキューターハンドラー (Runtime Executor Handler), 動的実行エンジン (Dynamic Execution Engine), イベント (Event), キュー (Queue), 非同期処理 (Async/Promise), タイマー (Timer), プロセス (Process) 等は完全に禁止する。

---

## 3. 設計原則の遵守 (Architecture Principles)

### 3.1. 完全な不変性 (Immutable Rule)
関係するすべてのオブジェクト構造、コンテキスト、データ、および Blueprint Container は、多層的に `Object.freeze()` を適用し、外部および内部からの改変を完全に禁止する。
コンテナ型は `Readonly<ExecutionRuntimeExecutorBlueprint>` とする。

### 3.2. 決定論的解決 (Deterministic Rule)
同一のルール入力に対して、常に同一の `ExecutionRuntimeExecutor` 参照を返却する。遅延ロードや動的な状態変化などを完全に排除し、参照同一性を保証する。

### 3.3. 読み取り専用制意 (Read-Only Rule)
公開 API は Getter のみに限定され、いかなる Setter や状態変更（Mutation）メソッドも存在してはならない。
`ExecutionRuntimeExecutorContext` は識別子 ID の文字列 `runtimeExecutorId` のみをつねに保持し、他のランタイムオブジェクトや直接のオブジェクト参照を一切保持しない。

---

## 4. 構造定義 (Structures)

### 4.1. ExecutorType (分類)
マネージャーの分類を示す静的列挙型。
- `FOUNDATION`: 基礎マネージャー定義
- `RUNTIME`: 実マネージャー定義
- `SIMULATION`: シミュレーションマネージャー定義
- `PLUGIN`: プラグインマネージャー定義
- `AI`: AI自律コンポーネントマネージャー定義

### 4.2. ExecutorScope (適用範囲)
マネージャーの適用スコープを示す静的列挙型。
- `SYSTEM`: システムエグゼキューターマネージャー
- `USER`: ユーザー空間エグゼキューターマネージャー
- `TENANT`: テナント空間エグゼキューターマネージャー

### 4.3. RuntimeExecutionType (実行モデル種類)
- `SYSTEM_EXECUTION`: システム実行モデル
- `ENGINE_EXECUTION`: 実行エンジン実行モデル
- `SERVICE_EXECUTION`: サービス実行モデル
- `COMPONENT_EXECUTION`: コンポーネント実行モデル
- `APPLICATION_EXECUTION`: アプリケーション実実行モデル

### 4.4. ExecutionStep (静的実行手順)
決定論的に接続されたレイアウトから実行計画を作成するための実行ステップ。
- `VALIDATE_LAYOUT`: 接続レイアウト検証
- `PREPARE_EXECUTION`: 実行準備
- `BUILD_EXECUTION_SCHEMA`: 実行スキーマ作成
- `READY_FOR_EXECUTION`: 実行準備完了
- `EXECUTION_SCHEMA_READY`: 実行計画スキーマ生成確定 (このフェーズでは実行は行わない)

### 4.5. RuntimeExecutionModelMetadata (実行モデルメタデータ)
- `id`: 実行モデルID
- `name`: 実行モデル名称
- `executionModelVersion`: 実行モデルの静的 Schema バージョン (例: `"1.0"`)
- `description`: 詳細説明

### 4.6. RuntimeExecutionModel (実行モデル構造定義)
RuntimeExecutionModel は 実行計画（Execution Schema）を定義する Blueprint であり、実際の実行・起動・制御・スケジュールは Runtime フェーズで実装され、本 Blueprint では一切行わない。
- `executionType`: 実行モデル種類 (`RuntimeExecutionType`)
- `modelId`: 静的モデル識別ID
- `metadata`: 実行モデルメタデータ (`RuntimeExecutionModelMetadata`)
- `executionOrder`: 静的な実行順序 (数値型, 例: `1` 〜 `5` であり、決定論的実行順序の定義に使用される)
- `targetLayouts`: 実行計画の構成元となる Layout ID の静的リスト (文字列の配列, 例: `['engine-layout-01']`)
- `allowedSteps`: 許容される実行ステップ (`readonly ExecutionStep[]`)

### 4.7. ExecutorMetadata (メタデータ定義)
- `id`: 定義ID
- `name`: 定義名称
- `version`: バージョン
- `description`: 詳細説明
- `layer`: レイヤー階層名
- `category`: カテゴリ名

### 4.8. ExecutionRuntimeExecutorContext (コンテキスト定義)
保持するのは以下の識別子 ID のみである：
- `runtimeExecutorId`: エグゼキューターマネージャー識別子 ID (文字列型)

### 4.9. ExecutionRuntimeExecutorData (データ定義)
- `managerType`: 静的分類 (`ExecutorType`)
- `managerScope`: 静的適用範囲 (`ExecutorScope`)
- `executionModels`: 保持対象となる静的実行モデルのリスト (`readonly RuntimeExecutionModel[]`)

### 4.10. ExecutionRuntimeExecutor (本体)
- `id`: マネージャー定義ID
- `name`: マネージャー定義名称
- `description`: 詳細説明
- `context`: `ExecutionRuntimeExecutorContext`
- `metadata`: `ExecutorMetadata`
- `data`: `ExecutionRuntimeExecutorData`

### 4.11. ExecutionRuntimeExecutorBlueprint (公開インターフェース)
- `getExecutionRuntimeExecutor()`
- `getMetadata()`
- `getContext()`
- `getData()`
- `getExecutionModels()`
- `getExecutionSequence()`

---

## 5. 将来の拡張性 (Future Extensions)
将来のフェーズにおいて、以下の拡張機能が検討される：
- **Runtime Executor Engine & Thread Dispatcher**: `RuntimeExecutionModel` および `executionOrder` に基づき、ロードおよび接続された実プロセス・実サービスを実行、スケジュール、プロセス境界分離の割り当てを行う実行ディスパッチャー。
- **PLUGIN_EXECUTION / WORKFLOW_EXECUTION / JOB_EXECUTION / AGENT_EXECUTION / FIELD_EXECUTION**: 各種プラグイン実行スレッド、自動連携ワークフローエンジン、AIエージェント実行 Tick スケジューラー、POSTING MAP Dashboard/Field App 実実行の制御に対応する拡張。
- **Execution Watchdog & Fault-Tolerance**: 実行中の例外や無応答を監視し、`ExecutionStep` を逆行または Snapshot/Ledger からホットリロードで復旧する自己治癒システム。
