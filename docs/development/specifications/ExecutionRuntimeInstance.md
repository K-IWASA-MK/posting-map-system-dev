# Execution Runtime Instance Foundation Specification

## 1. 目的 (Purpose)
Execution Runtime Instance Foundation は、AIOS (Artificial Intelligence Operating System) における実行ランタイムの実行実体を表すためのインスタンスモデル（RuntimeInstanceModel）の静的 Blueprint を定義し、その境界を表現する。インスタンス作成・管理ロジックを持たない Read-Only Blueprint である。

## 2. 役割と責務境界 (Responsibilities & Boundaries)

### 2.1. 責務 (Responsibility)
- 実行ランタイム全体のインスタンス構造モデル、メタデータ、および静的な依存定義を公開する。
- メタデータ、コンテキスト、データ、および Blueprint Container を多層的に `Object.freeze()` して完全な不変性を保証する。
- 外部からの静的アクセスに対応するための読み取り専用 Getter API を提供する。

### 2.2. レイヤー境界ルール (Layer Boundary)
本 Instance Specification は、静的トポロジーおよび定義情報のみを扱うレイヤーに属する。
動的なインスタンスの作成、終了、実行、依存解決処理などを処理する Runtime エンジン等とは明確に分離され、いかなる動的な処理ロジックも内包してはならない。

### 2.3. インスタンスマネージャー境界ルール (Instance Boundary)
本 Instance Foundation は実際のインスタンスの作成・保持・終了・実行・依存解決等は処理せず、「インスタンス構造モデル定義」を表現する Blueprint である。
動的な実行制御ロジック、エラーハンドリング、非同期処理、リトライ等の制御ロジックは一切含めない。
以下の操作・処理は完全に排除される：
- `createInstance()`, `destroyInstance()`, `startInstance()`, `stopInstance()`, `loadInstance()`, `resolveDependencies()` などの動的なインスタンス管理、インスタンス生成、破棄、実行、終了、および依存解決制御処理。
- ランタイムインスタンスハンドラー (Runtime Instance Handler), 依存解決エンジン (Dependency Resolver), プロセスマネージャー (Process Manager), イベント (Event), キュー (Queue), 非同期処理 (Async/Promise), タイマー (Timer) 等は完全に禁止する。

---

## 3. 設計原則の遵守 (Architecture Principles)

### 3.1. 完全な不変性 (Immutable Rule)
関係するすべてのオブジェクト構造、コンテキスト、データ、および Blueprint Container は、多層的に `Object.freeze()` を適用し、外部および内部からの改変を完全に禁止する。
コンテナ型は `Readonly<ExecutionRuntimeInstanceBlueprint>` とする。

### 3.2. 決定論的解決 (Deterministic Rule)
同一のルール入力に対して、常に同一の `ExecutionRuntimeInstance` 参照を返却する。遅延ロードや動的な状態変化などを完全に排除し、参照同一性を保証する。

### 3.3. 読み取り専用制意 (Read-Only Rule)
公開 API は Getter のみに限定され、いかなる Setter や状態変更（Mutation）メソッドも存在してはならない。
`ExecutionRuntimeInstanceContext` は識別子 ID の文字列 `runtimeInstanceId` のみをつねに保持し、他のランタイムオブジェクトや直接のオブジェクト参照を一切保持しない。

---

## 4. 構造定義 (Structures)

### 4.1. InstanceManagerType (分類)
マネージャーの分類を示す静的列挙型。
- `FOUNDATION`: 基礎マネージャー定義
- `RUNTIME`: 実マネージャー定義
- `SIMULATION`: シミュレーションマネージャー定義
- `PLUGIN`: プラグインマネージャー定義
- `AI`: AI自律コンポーネントマネージャー定義

### 4.2. InstanceManagerScope (適用範囲)
マネージャーの適用スコープを示す静的列挙型。
- `SYSTEM`: システムインスタンスマネージャー
- `USER`: ユーザー空間インスタンスマネージャー
- `TENANT`: テナント空間インスタンスマネージャー

### 4.3. RuntimeInstanceType (インスタンスモデル種類)
- `SYSTEM_INSTANCE`: システムインスタンス
- `ENGINE_INSTANCE`: 実行エンジンインスタンス
- `SERVICE_INSTANCE`: サービスインスタンス
- `COMPONENT_INSTANCE`: コンポーネントインスタンス
- `APPLICATION_INSTANCE`: アプリケーション実実行インスタンス

### 4.4. RuntimeInstanceModelMetadata (インスタンスモデルメタデータ)
- `id`: インスタンスモデルID
- `name`: インスタンスモデル名称
- `instanceModelVersion`: インスタンスモデルの静的 Schema バージョン (例: `"1.0"`)
- `description`: 詳細説明

### 4.5. RuntimeInstanceModel (インスタンスモデル構造定義)
RuntimeInstanceModel は Runtime Instance の構造（Schema）を定義する Blueprint であり、実際の Instance の生成・管理・実行・終了・依存解決は Runtime フェーズで実装され、本 Blueprint では一切行わない。
- `instanceType`: インスタンスモデル種類 (`RuntimeInstanceType`)
- `modelId`: 静的モデル識別ID
- `metadata`: インスタンスモデルメタデータ (`RuntimeInstanceModelMetadata`)
- `dependencies`: 静的な依存コンポーネント名のリスト (文字列の配列, 例: `['BOOT', 'STATE_MANAGER']`)

### 4.7. SessionManagerMetadata (メタデータ定義)
- `id`: 定義ID
- `name`: 定義名称
- `version`: バージョン
- `description`: 詳細説明
- `layer`: レイヤー階層名
- `category`: カテゴリ名

### 4.8. ExecutionRuntimeInstanceContext (コンテキスト定義)
保持するのは以下の識別子 ID のみである：
- `runtimeInstanceId`: インスタンスマネージャー識別子 ID (文字列型)

### 4.9. ExecutionRuntimeInstanceData (データ定義)
- `managerType`: 静的分類 (`InstanceManagerType`)
- `managerScope`: 静的適用範囲 (`InstanceManagerScope`)
- `instanceModels`: 保持対象となる静的インスタンスモデルのリスト (`readonly RuntimeInstanceModel[]`)

### 4.10. ExecutionRuntimeInstance (本体)
- `id`: マネージャー定義ID
- `name`: マネージャー定義名称
- `description`: 詳細説明
- `context`: `ExecutionRuntimeInstanceContext`
- `metadata`: `InstanceManagerMetadata`
- `data`: `ExecutionRuntimeInstanceData`

### 4.11. ExecutionRuntimeInstanceBlueprint (公開インターフェース)
- `getExecutionRuntimeInstance()`
- `getMetadata()`
- `getContext()`
- `getData()`
- `getInstanceModels()`

---

## 5. 将来の拡張性 (Future Extensions)
将来のフェーズにおいて、以下の拡張機能が検討される：
- **Runtime Instance Loader & Builder**: `RuntimeInstanceModel` 構造に基づき、実際のバイナリやソースを動的ロード（Loader）し、依存関係の順にインスタンスを組み立て（Builder）実メモリ上に展開するエンジン。
- **PLUGIN_INSTANCE / WORKFLOW_INSTANCE / AGENT_INSTANCE**: 外部プラグイン実行実体、一連のワークフロー実行スレッド、AIエージェントの自律実行プロセスに対応するためのインスタンスモデル拡張。
- **Instance State Machine**: 実行インスタンスの開始・一時停止・終了などの状態遷移を制御する状態管理システム。
