# Execution Runtime Loader Foundation Specification

## 1. 目的 (Purpose)
Execution Runtime Loader Foundation は、AIOS (Artificial Intelligence Operating System) における実行ランタイムの読み込みモデルを表すためのロードモデル（RuntimeLoadingModel）の静的 Blueprint を定義し、その境界を表現する。モジュール読込・初期化ロジックを持たない Read-Only Blueprint である。

## 2. 役割と責務境界 (Responsibilities & Boundaries)

### 2.1. 責務 (Responsibility)
- Loader はモジュールを実際にロードする実装ではない。Runtime が将来参照する Loading Blueprint を定義する責務のみを持つ。ロード処理は Runtime フェーズでのみ実装する。
- 実行ランタイム全体のロード構造モデル、メタデータ、および静的なロード順序定義を公開する。
- メタデータ、コンテキスト、データ、および Blueprint Container を多層的に `Object.freeze()` して完全な不変性を保証する。
- 外部からの静的アクセスに対応するための読み取り専用 Getter API を提供する。

### 2.2. レイヤー境界ルール (Layer Boundary)
本 Loader Specification は、静的トポロジーおよび定義情報のみを扱うレイヤーに属する。
動的なモジュールのロード、初期化、依存解決、メモリ確保、マウント処理などを処理する Runtime エンジン等とは明確に分離され、いかなる動的な処理ロジックも内包してはならない。

### 2.3. ローダーマネージャー境界ルール (Loader Boundary)
本 Loader Foundation は実際のモジュールのロード・初期化・依存解決・メモリ配置等は処理せず、「ロード構造モデル定義」を表現する Blueprint である。
動的な実行制御ロジック、エラーハンドリング、非同期処理、リトライ等の制御ロジックは一切含めない。
以下の操作・処理は完全に排除される：
- `load()`, `preload()`, `initialize()`, `mount()`, `resolve()` などの動的なロード処理、初期化、依存解決、マウント、およびメモリ配置制御処理。
- ランタイムローダーハンドラー (Runtime Loader Handler), 動的ロードエンジン (Dynamic Load Engine), イベント (Event), キュー (Queue), 非同期処理 (Async/Promise), タイマー (Timer), メモリ確保 (Memory Allocation) 等は完全に禁止する。

---

## 3. 設計原則の遵守 (Architecture Principles)

### 3.1. 完全な不変性 (Immutable Rule)
関係するすべてのオブジェクト構造、コンテキスト、データ、および Blueprint Container は、多層的に `Object.freeze()` を適用し、外部および内部からの改変を完全に禁止する。
コンテナ型は `Readonly<ExecutionRuntimeLoaderBlueprint>` とする。

### 3.2. 決定論的解決 (Deterministic Rule)
同一のルール入力に対して、常に同一の `ExecutionRuntimeLoader` 参照を返却する。遅延ロードや動的な状態変化などを完全に排除し、参照同一性を保証する。

### 3.3. 読み取り専用制意 (Read-Only Rule)
公開 API は Getter のみに限定され、いかなる Setter や状態変更（Mutation）メソッドも存在してはならない。
`ExecutionRuntimeLoaderContext` は識別子 ID の文字列 `runtimeLoaderId` のみをつねに保持し、他のランタイムオブジェクトや直接のオブジェクト参照を一切保持しない。

---

## 4. 構造定義 (Structures)

### 4.1. LoaderManagerType (分類)
マネージャーの分類を示す静的列挙型。
- `FOUNDATION`: 基礎マネージャー定義
- `RUNTIME`: 実マネージャー定義
- `SIMULATION`: シミュレーションマネージャー定義
- `PLUGIN`: プラグインマネージャー定義
- `AI`: AI自律コンポーネントマネージャー定義

### 4.2. LoaderManagerScope (適用範囲)
マネージャーの適用スコープを示す静的列挙型。
- `SYSTEM`: システムローダーマネージャー
- `USER`: ユーザー空間ローダーマネージャー
- `TENANT`: テナント空間ローダーマネージャー

### 4.3. RuntimeLoadingType (ロードモデル種類)
- `SYSTEM_LOAD`: システムロード
- `ENGINE_LOAD`: 実行エンジンロード
- `SERVICE_LOAD`: サービスロード
- `COMPONENT_LOAD`: コンポーネントロード
- `APPLICATION_LOAD`: アプリケーション実ロード

### 4.4. RuntimeLoadingModelMetadata (ロードモデルメタデータ)
- `id`: ロードモデルID
- `name`: ロードモデル名称
- `loadingModelVersion`: ロードモデルの静的 Schema バージョン (例: `"1.0"`)
- `description`: 詳細説明

### 4.5. RuntimeLoadingModel (ロードモデル構造定義)
RuntimeLoadingModel は Runtime Loader の構造（Schema）を定義する Blueprint であり、実際のロード・初期化・依存解決・メモリ配置は Runtime フェーズで実装され、本 Blueprint では一切行わない。
- `loadingType`: ロードモデル種類 (`RuntimeLoadingType`)
- `modelId`: 静的モデル識別ID
- `metadata`: ロードモデルメタデータ (`RuntimeLoadingModelMetadata`)
- `loadOrder`: 静的なロード順序 (数値型, 例: `1` 〜 `5` であり、決定論的実行順序の定義に使用される)
- `allowedPolicies`: 静的なロード時セキュリティ・ポリシー定義 (文字列の配列, 例: `['LAZY', 'EAGER', 'ISOLATED']`)

### 4.7. LoaderManagerMetadata (メタデータ定義)
- `id`: 定義ID
- `name`: 定義名称
- `version`: バージョン
- `description`: 詳細説明
- `layer`: レイヤー階層名
- `category`: カテゴリ名

### 4.8. ExecutionRuntimeLoaderContext (コンテキスト定義)
保持するのは以下の識別子 ID のみである：
- `runtimeLoaderId`: ローダーマネージャー識別子 ID (文字列型)

### 4.9. ExecutionRuntimeLoaderData (データ定義)
- `managerType`: 静的分類 (`LoaderManagerType`)
- `managerScope`: 静的適用範囲 (`LoaderManagerScope`)
- `loadingModels`: 保持対象となる静的ロードモデルのリスト (`readonly RuntimeLoadingModel[]`)

### 4.10. ExecutionRuntimeLoader (本体)
- `id`: マネージャー定義ID
- `name`: マネージャー定義名称
- `description`: 詳細説明
- `context`: `ExecutionRuntimeLoaderContext`
- `metadata`: `LoaderManagerMetadata`
- `data`: `ExecutionRuntimeLoaderData`

### 4.11. ExecutionRuntimeLoaderBlueprint (公開インターフェース)
- `getExecutionRuntimeLoader()`
- `getMetadata()`
- `getContext()`
- `getData()`
- `getLoadingModels()`

---

## 5. 将来の拡張性 (Future Extensions)
将来のフェーズにおいて、以下の拡張機能が検討される：
- **Runtime Dependency Injection & Module Mounting Engine**: `RuntimeLoadingModel` および `loadOrder` に基づき、実際のスクリプト・バイナリの遅延インポート、モジュール初期化、依存コンポーネントのDI注入、メモリ空間確保・マウントを処理する実ローダーエンジン。
- **PLUGIN_LOAD / WORKFLOW_LOAD / AGENT_LOAD / RESOURCE_LOAD**: プラグインバイナリ、オーケストレーションワークフロー、AIエージェントの動的ソース、アセット画像や定義ファイル等のリソースといった、より多様な実行資源をロードするための拡張モデル。
- **Eager vs Lazy Verification**: 起動時の高速性を最適化するため、`allowedPolicies` に沿ってロード判定を実行時に最適化・並列化する機能。
