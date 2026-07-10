# Execution Runtime Composer Foundation Specification

## 1. 目的 (Purpose)
Execution Runtime Composer Foundation は、AIOS (Artificial Intelligence Operating System) における実行ランタイムの接続構成を表すためのレイアウト（RuntimeCompositionModel）の静的 Blueprint を定義し、その境界を表現する。ランタイムマウント・接続ロジックを持たない Read-Only Blueprint である。

## 2. 役割と責務境界 (Responsibilities & Boundaries)

### 2.1. 責務 (Responsibility)
- Composer は Runtime 構成を実際に接続・マウント・インスタンス生成する実装ではない。Runtime Layout（Blueprint 間の接続構造）を定義する Blueprint であり、実際の接続・マウント・Runtime生成は Runtime フェーズで実装される。
- 実行ランタイム全体の接続レイアウトモデル、接続先（connections）定義、および静的な接続・組み立て順序（layoutOrder）を公開する。
- メタデータ、コンテキスト、データ、および Blueprint Container を多層的に `Object.freeze()` して完全な不変性を保証する。
- 外部からの静的アクセスに対応するための読み取り専用 Getter API を提供する。

### 2.2. レイヤー境界ルール (Layer Boundary)
本 Composer Specification は、静的トポロジーおよび定義情報のみを扱うレイヤーに属する。
動的な Runtime の接続、マウント、依存注入、実行インスタンス生成などを処理する Runtime エンジン等とは明確に分離され、いかなる動的な処理ロジックも内包してはならない。

### 2.3. コムポーザーマネージャー境界ルール (Composer Boundary)
本 Composer Foundation は実際の接続・マウント・Runtime生成等は処理せず、「接続構造モデル定義」を表現する Blueprint である。
動的な実行制御ロジック、エラーハンドリング、非同期処理、リトライ等の制御ロジックは一切含めない。
以下の操作・処理は完全に排除される：
- `compose()`, `mount()`, `attach()`, `connect()`, `buildRuntime()`, `instantiate()` などの動的な接続処理、マウント、実行、およびインスタンス化制御処理。
- ランタイムコムポーザーハンドラー (Runtime Composer Handler), 動的マウントエンジン (Dynamic Mount Engine), イベント (Event), キュー (Queue), 非同期処理 (Async/Promise), タイマー (Timer), インスタンス接続 (Instance Connection) 等は完全に禁止する。

---

## 3. 設計原則の遵守 (Architecture Principles)

### 3.1. 完全な不変性 (Immutable Rule)
関係するすべてのオブジェクト構造、コンテキスト、データ、および Blueprint Container は、多層的に `Object.freeze()` を適用し、外部および内部からの改変を完全に禁止する。
コンテナ型は `Readonly<ExecutionRuntimeComposerBlueprint>` とする。

### 3.2. 決定論的解決 (Deterministic Rule)
同一のルール入力に対して、常に同一の `ExecutionRuntimeComposer` 参照を返却する。遅延ロードや動的な状態変化などを完全に排除し、参照同一性を保証する。

### 3.3. 読み取り専用制意 (Read-Only Rule)
公開 API は Getter のみに限定され、いかなる Setter や状態変更（Mutation）メソッドも存在してはならない。
`ExecutionRuntimeComposerContext` は識別子 ID の文字列 `runtimeComposerId` のみをつねに保持し、他のランタイムオブジェクトや直接のオブジェクト参照を一切保持しない。

---

## 4. 構造定義 (Structures)

### 4.1. ComposerType (分類)
マネージャーの分類を示す静的列挙型。
- `FOUNDATION`: 基礎マネージャー定義
- `RUNTIME`: 実マネージャー定義
- `SIMULATION`: シミュレーションマネージャー定義
- `PLUGIN`: プラグインマネージャー定義
- `AI`: AI自律コンポーネントマネージャー定義

### 4.2. ComposerScope (適用範囲)
マネージャーの適用スコープを示す静的列挙型。
- `SYSTEM`: システムコムポーザーマネージャー
- `USER`: ユーザー空間コムポーザーマネージャー
- `TENANT`: テナント空間コムポーザーマネージャー

### 4.3. RuntimeCompositionType (接続レイアウト種類)
- `SYSTEM_LAYOUT`: システム構成レイアウト
- `ENGINE_LAYOUT`: 実行エンジン構成レイアウト
- `SERVICE_LAYOUT`: サービス構成レイアウト
- `COMPONENT_LAYOUT`: コンポーネント構成レイアウト
- `APPLICATION_LAYOUT`: アプリケーション構成レイアウト

### 4.4. CompositionStep (静的構成手順)
決定論的に接続状態を作るための構成手順定義。
- `PREPARE_LAYOUT`: レイアウト準備
- `VALIDATE_LAYOUT`: レイアウト検証
- `COMPOSE_LAYOUT`: レイアウト接続構成
- `FINALIZE_LAYOUT`: 接続確定
- `READY_FOR_RUNTIME`: 起動準備完了

### 4.5. RuntimeCompositionModelMetadata (構成モデルメタデータ)
- `id`: 構成モデルID
- `name`: 構成モデル名称
- `compositionModelVersion`: 構成モデルの静的 Schema バージョン (例: `"1.0"`)
- `description`: 詳細説明

### 4.6. RuntimeCompositionModel (接続構造モデル定義)
RuntimeCompositionModel は Runtime Layout（Blueprint の接続構造）を定義する Blueprint であり、実際の接続・マウント・Runtime生成は Runtime フェーズで実装され、本 Blueprint では一切行わない。
- `compositionType`: 接続レイアウト種類 (`RuntimeCompositionType`)
- `modelId`: 静的モデル識別ID
- `metadata`: 構成モデルメタデータ (`RuntimeCompositionModelMetadata`)
- `layoutOrder`: 静的な組み立て・接続順序 (数値型, 例: `1` 〜 `5` であり、決定論的接続順序の定義に使用される)
- `connections`: 接続対象となる Blueprint ID の静的リスト (文字列の配列, 例: `['engine-layout-01']`)
- `allowedSteps`: 許容される接続手順 (`readonly CompositionStep[]`)

### 4.7. ComposerMetadata (メタデータ定義)
- `id`: 定義ID
- `name`: 定義名称
- `version`: バージョン
- `description`: 詳細説明
- `layer`: レイヤー階層名
- `category`: カテゴリ名

### 4.8. ExecutionRuntimeComposerContext (コンテキスト定義)
保持するのは以下の識別子 ID のみである：
- `runtimeComposerId`: コムポーザーマネージャー識別子 ID (文字列型)

### 4.9. ExecutionRuntimeComposerData (データ定義)
- `managerType`: 静的分類 (`ComposerType`)
- `managerScope`: 静的適用範囲 (`ComposerScope`)
- `compositionModels`: 保持対象となる静的構成モデルのリスト (`readonly RuntimeCompositionModel[]`)

### 4.10. ExecutionRuntimeComposer (本体)
- `id`: マネージャー定義ID
- `name`: マネージャー定義名称
- `description`: 詳細説明
- `context`: `ExecutionRuntimeComposerContext`
- `metadata`: `ComposerMetadata`
- `data`: `ExecutionRuntimeComposerData`

### 4.11. ExecutionRuntimeComposerBlueprint (公開インターフェース)
- `getExecutionRuntimeComposer()`
- `getMetadata()`
- `getContext()`
- `getData()`
- `getCompositionModels()`
- `getCompositionSequence()`

---

## 5. 将来の拡張性 (Future Extensions)
将来のフェーズにおいて、以下の拡張機能が検討される：
- **Runtime Mount & Connector Engine**: `RuntimeCompositionModel` の `connections` および `layoutOrder` に基づき、ロードされた実行実体を実メモリ空間で接続マウントし、相互通信ポートを確立・検証する実行エンジン。
- **PLUGIN_COMPOSITION / WORKFLOW_COMPOSITION / AGENT_COMPOSITION / RESOURCE_COMPOSITION**: 各種プラグイン空間、ワークフローのノード結合、AIエージェントのメッセージハンドラー接続などを定義する動的レイアウト拡張。
