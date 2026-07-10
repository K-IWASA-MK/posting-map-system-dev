# Execution Runtime Engine Foundation Specification

## 1. 目的 (Purpose)
Execution Runtime Engine Foundation は、AIOS (Artificial Intelligence Operating System) における実行ランタイムの実行基盤を表すためのエンジンモデル（RuntimeEngineModel）の静的 Blueprint を定義し、その境界を表現する。ランタイム起動・解釈・実行・ディスパッチ・スレッディング・スケジューリングロジックを持たない Read-Only Blueprint である。

## 2. リファクタリング方針と責務境界 (Refactoring Policy & Boundaries)

### 2.1. リファクタリング方針 (Refactoring Policy)
> [!IMPORTANT]
> 本フェーズは Runtime Engine を Blueprint アーキテクチャへ統一するためのリファクタリングである。既存 API の互換性は可能な限り維持し、Blueprint 構造へ段階的に移行する。
> これまで作成した Boot から Executor までのすべての Blueprint 群を統合的に解決可能にするため、不要なコンテキスト構造を整理し、決定論的な静的トポロジーへ再定義する。

### 2.2. 責務の明確な分離 (Responsibilities Separation)
Runtime Engine Layer における責務境界を以下のように明確化する：
- **Runtime Engine**: Blueprint を保持・管理する責責のみを持つ。本フェーズの定義対象。
- **Blueprint Interpreter**: Blueprint の解釈および検証・モジュール初期化を担当する（将来のフェーズにて定義・実装）。
- **Runtime Kernel**: 実際の Runtime 実行・起動・停止・スケジューリング制御（スレッド/タスク）を担当する（将来のフェーズにて定義・実装）。

### 2.3. エンジンマネージャー境界ルール (Engine Boundary)
本 Engine Foundation は実際のプロセスの起動・停止・制御等は処理せず、「エンジン構成モデル定義」を表現する Blueprint である。
動的な実行制御ロジック、エラーハンドリング、非同期処理、リトライ等の制御ロジックは一切含めない。
以下の操作・処理は完全に排除される：
- `boot()`, `initialize()`, `interpret()`, `execute()`, `dispatch()`, `shutdown()`, `tick()` などの動的な起動、初期化、解釈、実行、停止、および Tick 遷移制御処理。
- ランタイムエンジンハンドラー (Runtime Engine Handler), 動的エンジンコア (Dynamic Engine Core), イベント (Event), キュー (Queue), 非同期処理 (Async/Promise), タイマー (Timer), スレッド (Thread) 等は完全に禁止する。

---

## 3. 設計原則の遵守 (Architecture Principles)

### 3.1. 完全な不変性 (Immutable Rule)
関係するすべてのオブジェクト構造、コンテキスト、データ、および Blueprint Container は、多層的に `Object.freeze()` を適用し、外部および内部からの改変を完全に禁止する。
コンテナ型は `Readonly<ExecutionRuntimeEngineBlueprint>` とする。

### 3.2. 決定論的解決 (Deterministic Rule)
同一のルール入力に対して、常に同一の `ExecutionRuntimeEngine` 参照を返却する。遅延ロードや動的な状態変化などを完全に排除し、参照同一性を保証する。

### 3.3. 読み取り専用制意 (Read-Only Rule)
公開 API は Getter のみに限定され、いかなる Setter や状態変更（Mutation）メソッドも存在してはならない。
`ExecutionRuntimeEngineContext` は識別子 ID の文字列 `runtimeEngineId` のみをつねに保持し、他のランタイムオブジェクトや直接のオブジェクト参照を一切保持しない。

---

## 4. 構造定義 (Structures)

### 4.1. EngineManagerType (分類)
マネージャーの分類を示す静的列挙型。
- `FOUNDATION`: 基礎マネージャー定義
- `RUNTIME`: 実マネージャー定義
- `SIMULATION`: シミュレーションマネージャー定義
- `PLUGIN`: プラグインマネージャー定義
- `AI`: AI自律コンポーネントマネージャー定義

### 4.2. EngineManagerScope (適用範囲)
マネージャーの適用スコープを示す静的列挙型。
- `SYSTEM`: システムエグゼキューターマネージャー
- `USER`: ユーザー空間エグゼキューターマネージャー
- `TENANT`: テナント空間エグゼキューターマネージャー

### 4.3. RuntimeEngineType (エンジンモデル種類)
- `SYSTEM_ENGINE`: システム実行エンジンモデル
- `CORE_ENGINE`: コアカーネル実行エンジンモデル
- `APPLICATION_ENGINE`: アプリケーション実行エンジンモデル
- `PLUGIN_ENGINE`: プラグイン空間実行エンジンモデル
- `FIELD_ENGINE`: ポスティングマップ配布員現場エンジンモデル

### 4.4. EngineStep (静的エンジンステップ)
決定論的に接続されたレイアウトおよび実行スキーマから実行基盤の構成準備を行うためのステップ。
- `REGISTER_BLUEPRINTS`: Blueprint 群の登録
- `VALIDATE_BLUEPRINTS`: 登録された Blueprint 検証
- `BUILD_ENGINE_SCHEMA`: エンジンスキーマ作成
- `READY_FOR_INTERPRETER`: 解釈処理準備完了
- `ENGINE_SCHEMA_READY`: 実行エンジン計画確定 (このフェーズでは実行は行わない)

### 4.5. RuntimeEngineModelMetadata (エンジンモデルメタデータ)
- `id`: エンジンモデルID
- `name`: エンジンモデル名称
- `engineModelVersion`: エンジンモデルの静的 Schema バージョン (例: `"1.0"`)
- `description`: 詳細説明

### 4.6. RuntimeEngineModel (エンジンモデル構造定義)
RuntimeEngineModel は Runtime Engine（実行基盤）の構造定義を行う Blueprint であり、実際の解釈・ロード・生成・実行は Runtime フェーズで実装され、本 Blueprint では一切行わない。
- `engineType`: エンジンモデル種類 (`RuntimeEngineType`)
- `modelId`: 静的モデル識別ID
- `metadata`: エンジンモデルメタデータ (`RuntimeEngineModelMetadata`)
- `engineOrder`: 静的なエンジン構成順序 (数値型, 例: `1` 〜 `5` であり、決定論的エンジン構成順序の定義に使用される)
- `targetBlueprints`: 構成元となる Executor / Composer / Builder などの Blueprint ID の静的リスト (文字列の配列, 例: `['executor-01']`)
- `allowedSteps`: 許容されるエンジンステップ (`readonly EngineStep[]`)

### 4.7. EngineManagerMetadata (メタデータ定義)
- `id`: 定義ID
- `name`: 定義名称
- `version`: バージョン
- `description`: 詳細説明
- `layer`: レイヤー階層名
- `category`: カテゴリ名

### 4.8. ExecutionRuntimeEngineContext (コンテキスト定義)
保持するのは以下の識別子 ID のみである：
- `runtimeEngineId`: エンジンマネージャー識別子 ID (文字列型)

### 4.9. ExecutionRuntimeEngineData (データ定義)
- `managerType`: 静的分類 (`EngineManagerType`)
- `managerScope`: 静的適用範囲 (`EngineManagerScope`)
- `engineModels`: 保持対象となる静的構成モデルのリスト (`readonly RuntimeEngineModel[]`)

### 4.10. ExecutionRuntimeEngine (本体)
- `id`: マネージャー定義ID
- `name`: マネージャー定義名称
- `description`: 詳細説明
- `context`: `ExecutionRuntimeEngineContext`
- `metadata`: `EngineManagerMetadata`
- `data`: `ExecutionRuntimeEngineData`

### 4.11. ExecutionRuntimeEngineBlueprint (公開インターフェース)
- `getExecutionRuntimeEngine()`
- `getMetadata()`
- `getContext()`
- `getData()`
- `getEngineModels()`
- `getEngineSequence()`

---

## 5. 将来の拡張性 (Future Extensions)
将来のフェーズにおいて、以下の拡張機能が検討される：
- **Blueprint Interpreter & Runtime Kernel**: `RuntimeEngineModel` を読み込んで解釈し、実際のプロセスやスレッドとしてマウント・起動・スケジュール制御する動的なランタイム実行コア。
- **AI_ENGINE / WORKFLOW_ENGINE / PLUGIN_ENGINE / FIELD_ENGINE / MONITORING_ENGINE**: AI自律最適化エンジン、ワークフローのシーケンス駆動エンジン、アドオン用プラグインサンドボックス実行基盤、ポスティング現場配布員アプリ (Hアプリ) のオフラインキャッシュ/動的同期実行基盤、および状態/パフォーマンスを監視するリアルタイム監視エンジン。
