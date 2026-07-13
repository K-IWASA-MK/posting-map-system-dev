# Execution Runtime State Manager Foundation Specification

## 1. 目的 (Purpose)
Execution Runtime State Manager Foundation は、AIOS (Artificial Intelligence Operating System) における実行ランタイムの各ライフサイクルフェーズ・実行状態を表すための状態モデル（RuntimeStateModel）の静的 Blueprint を定義し、その境界を表現する。状態変更および状態遷移ロジックを持たない Read-Only Blueprint である。

## 2. 役割と責務境界 (Responsibilities & Boundaries)

### 2.1. 責務 (Responsibility)
- 実行ランタイム全体の状態構造モデル、メタデータ、および静的な許容遷移定義を公開する。
- メタデータ、コンテキスト、データ、および Blueprint Container を多層的に `Object.freeze()` して完全な不変性を保証する。
- 外部からの静的アクセスに対応するための読み取り専用 Getter API を提供する。

### 2.2. レイヤー境界ルール (Layer Boundary)
本 State Manager Specification は、静的トポロジーおよび定義情報のみを扱うレイヤーに属する。
動的な状態の更新、状態遷移の判定・処理、イベント通知などを処理する Runtime エンジン等とは明確に分離され、いかなる動的な処理ロジックも内包してはならない。

### 2.3. ステートマネージャー境界ルール (State Boundary)
本 State Manager Foundation は実際の状態取得、動的な状態遷移処理、同期や復旧、状態通知等は処理せず、「状態構造モデル定義」を表現する Blueprint である。
動的な実行制御ロジック、エラーハンドリング、非同期処理、リトライ等の制御ロジックは一切含めない。
以下の操作・処理は完全に排除される：
- `updateState()`, `transitionState()`, `restoreState()`, `syncState()`, `notifyState()` などの動的な状態管理、状態遷移制御、同期、通知処理、および遷移制御処理。
- ランタイムステートハンドラー (Runtime State Handler), 状態遷移エンジン (State Transition Engine), イベント (Event), キュー (Queue), 非同期処理 (Async/Promise), タイマー (Timer) 等は完全に禁止する。

---

## 3. 設計原則の遵守 (Architecture Principles)

### 3.1. 完全な不変性 (Immutable Rule)
関係するすべてのオブジェクト構造、コンテキスト、データ、および Blueprint Container は、多層的に `Object.freeze()` を適用し、外部および内部からの改変を完全に禁止する。
コンテナ型は `Readonly<ExecutionRuntimeStateManagerBlueprint>` とする。

### 3.2. 決定論的解決 (Deterministic Rule)
同一のルール入力に対して、常に同一の `ExecutionRuntimeStateManager` 参照を返却する。遅延ロードや動的な状態変化などを完全に排除し、参照同一性を保証する。

### 3.3. 読み取り専用制意 (Read-Only Rule)
公開 API は Getter のみに限定され、いかなる Setter や状態変更（Mutation）メソッドも存在してはならない。
`ExecutionRuntimeStateManagerContext` は識別子 ID の文字列 `runtimeStateManagerId` のみをつねに保持し、他のランタイムオブジェクトや直接のオブジェクト参照を一切保持しない。

---

## 4. 構造定義 (Structures)

### 4.1. StateManagerType (分類)
マネージャーの分類を示す静的列挙型。
- `FOUNDATION`: 基礎マネージャー定義
- `RUNTIME`: 実マネージャー定義
- `SIMULATION`: シミュレーションマネージャー定義
- `PLUGIN`: プラグインマネージャー定義
- `AI`: AI自律コンポーネントマネージャー定義

### 4.2. StateManagerScope (適用範囲)
マネージャーの適用スコープを示す静的列挙型。
- `SYSTEM`: システム状態マネージャー
- `USER`: ユーザー空間状態マネージャー
- `TENANT`: テナント空間状態マネージャー

### 4.3. RuntimeStateType (状態モデル種類)
- `BOOT_STATE`: 起動状態モデル
- `PIPELINE_STATE`: パイプライン状態モデル
- `CONTEXT_STATE`: コンテキスト状態モデル
- `RUNTIME_STATE`: ランタイム実動作状態モデル

### 4.4. RuntimeStateModelMetadata (状態モデルメタデータ)
- `id`: 状態モデルID
- `name`: 状態モデル名称
- `stateModelVersion`: 状態モデルの静的 Schema バージョン (例: `"1.0"`)
- `description`: 詳細説明

### 4.5. RuntimeStateModel (状態モデル構造定義)
RuntimeStateModel は Runtime の現在状態を保持するものではなく、状態構造（Schema）を定義する Blueprint である。実際の状態遷移・更新・判定・制御・同期・復元は Runtime フェーズで実装され、本 Blueprint では一切行わない。
- `stateType`: 状態モデル種類 (`RuntimeStateType`)
- `modelId`: 静的モデル識別ID
- `metadata`: 状態モデルメタデータ (`RuntimeStateModelMetadata`)
- `allowedTransitions`: 静的な状態遷移先名のリスト (文字列の配列, 例: `['STARTING', 'RUNNING', 'STOPPED']`)

### 4.6. StateManagerMetadata (メタデータ定義)
- `id`: 定義ID
- `name`: 定義名称
- `version`: バージョン
- `description`: 詳細説明
- `layer`: レイヤー階層名
- `category`: カテゴリ名

### 4.7. ExecutionRuntimeStateManagerContext (コンテキスト定義)
保持するのは以下の識別子 ID のみである：
- `runtimeStateManagerId`: 状態マネージャー識別子 ID (文字列型)

### 4.8. ExecutionRuntimeStateManagerData (データ定義)
- `managerType`: 静的分類 (`StateManagerType`)
- `managerScope`: 静的適用範囲 (`StateManagerScope`)
- `stateModels`: 保持対象となる静的状態モデルのリスト (`readonly RuntimeStateModel[]`)

### 4.9. ExecutionRuntimeStateManager (本体)
- `id`: マネージャー定義ID
- `name`: マネージャー定義名称
- `description`: 詳細説明
- `context`: `ExecutionRuntimeStateManagerContext`
- `metadata`: `StateManagerMetadata`
- `data`: `ExecutionRuntimeStateManagerData`

### 4.10. ExecutionRuntimeStateManagerBlueprint (公開インターフェース)
- `getExecutionRuntimeStateManager()`
- `getMetadata()`
- `getContext()`
- `getData()`
- `getStateModels()`

---

## 5. 将来の拡張性 (Future Extensions)
将来のフェーズにおいて、以下の拡張機能が検討される：
- **Runtime State Transition Engine**: `RuntimeStateModel` および `allowedTransitions` 構造に沿って、実際の遷移トリガーの検証・実行状態判定・遷移イベントのルーティングを管理する状態遷移実行基盤。
- **Session / Agent State Expansion**: 将来的に、Session、Agent、Plugin、Execution 等の State Model を追加し、OS 全体の自律分散協調プロセスに対する詳細な状態ポリシー判定を可能にする。
- **State Machine Sync Log**: 状態変更とタイムスタンプのログを Execution Ledger に監査可能にシリアライズ・保存する連携システム。
