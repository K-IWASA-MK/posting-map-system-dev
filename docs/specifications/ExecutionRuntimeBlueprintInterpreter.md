# Execution Runtime Blueprint Interpreter Foundation Specification

## 1. 目的 (Purpose)
Execution Runtime Blueprint Interpreter Foundation は、AIOS (Artificial Intelligence Operating System) における実行ランタイムの Blueprint を解釈するための仕様定義である解釈モデル（RuntimeInterpretationModel）の静的 Blueprint を定義し、その境界を表現する。実際の解釈・検証・更新・メモリ展開ロジックを持たない Read-Only Blueprint である。

## 2. 役割と責務境界 (Responsibilities & Boundaries)

### 2.1. 責務 (Responsibility)
- Interpreter は Blueprint の実際の解釈、解析、検証、更新、保持、インスタンス生成などを行う実装ではない。Blueprint の解釈仕様（メタデータ定義、読み込み・判定ルール）のみを記述するものであり、実際の解釈処理は Runtime フェーズで実装される。
- ランタイム全体の解釈計画モデル、解釈ポリシー、対応可能な Blueprint 構造の種別、および静的な解釈ステップ（InterpretationStep）を公開する。
- メタデータ、コンテキスト、データ、および Blueprint Container を多層的に `Object.freeze()` して完全な不変性を保証する。
- 外部からの静的アクセスに対応するための読み取り専用 Getter API を提供する。
- **解釈仕様外データの非保持ルール**: Interpreter は解釈仕様のみを責務とするため、Runtime Context、Runtime State、Runtime Session、Runtime Instance 等への参照・生成・更新・保持は一切行わない。

### 2.2. レイヤー境界ルール (Layer Boundary)
本 Interpreter Specification は、静的トポロジーおよび定義情報のみを扱うレイヤーに属する。
動的な Runtime の状態更新、インスタンス生成、スレッド起動などを処理する Runtime エンジン・カーネル等とは明確に分離され、いかなる動的な処理ロジックも内包してはならない。

### 2.3. インタプリタマネージャー境界ルール (Interpreter Boundary)
本 Interpreter Foundation は実際の解釈・パース等は処理せず、「解釈計画モデル定義」を表現する Blueprint である。
動的な実行制御ロジック、エラーハンドリング、非同期処理、リトライ等の制御ロジックは一切含めない。
以下の操作・処理は完全に排除される：
- `interpret()`, `parse()`, `analyze()`, `compile()`, `resolve()`, `execute()` などの動的な解釈処理、パース、分析、コンパイル、実行、およびインスタンス化制御処理。
- ランタイムインタプリタハンドラー (Runtime Interpreter Handler), 動的パースエンジン (Dynamic Parse Engine), イベント (Event), キュー (Queue), 非同期処理 (Async/Promise), タイマー (Timer), インスタンス生成 (Instance Generation) 等は完全に禁止する。

---

## 3. 設計原則の遵守 (Architecture Principles)

### 3.1. 完全な不変性 (Immutable Rule)
関係するすべてのオブジェクト構造、コンテキスト、データ、および Blueprint Container は、多層的に `Object.freeze()` を適用し、外部および内部からの改変を完全に禁止する。
コンテナ型は `Readonly<ExecutionRuntimeBlueprintInterpreterBlueprint>` とする。

### 3.2. 決定論的解決 (Deterministic Rule)
同一のルール入力に対して、常に同一の `ExecutionRuntimeBlueprintInterpreter` 参照を返却する。遅延ロードや動的な状態変化などを完全に排除し、参照同一性を保証する。

### 3.3. 読み取り専用制意 (Read-Only Rule)
公開 API は Getter のみに限定され、いかなる Setter や状態変更（Mutation）メソッドも存在してはならない。
`ExecutionRuntimeBlueprintInterpreterContext` は識別子 ID の文字列 `runtimeBlueprintInterpreterId` のみをつねに保持し、他のランタイムオブジェクトや直接のオブジェクト参照を一切保持しない。

---

## 4. 構造定義 (Structures)

### 4.1. BlueprintInterpreterType (分類)
マネージャーの分類を示す静的列挙型。
- `FOUNDATION`: 基礎マネージャー定義
- `RUNTIME`: 実マネージャー定義
- `SIMULATION`: シミュレーションマネージャー定義
- `PLUGIN`: プラグインマネージャー定義
- `AI`: AI自律コンポーネントマネージャー定義

### 4.2. BlueprintInterpreterScope (適用範囲)
マネージャーの適用スコープを示す静的列挙型。
- `SYSTEM`: システムエグゼキューターマネージャー
- `USER`: ユーザー空間エグゼキューターマネージャー
- `TENANT`: テナント空間エグゼキューターマネージャー

### 4.3. RuntimeInterpretationType (解釈モデル種類)
- `BOOT_BLUEPRINT`: 起動 Blueprint 解釈モデル
- `ENGINE_BLUEPRINT`: エンジン Blueprint 解釈モデル
- `SERVICE_BLUEPRINT`: サービス Blueprint 解釈モデル
- `COMPONENT_BLUEPRINT`: コンポーネント Blueprint 解釈モデル
- `APPLICATION_BLUEPRINT`: アプリケーション Blueprint 解釈モデル

### 4.4. InterpretationStep (静的解釈手順)
決定論的に接続されたレイアウトおよび実行計画から Blueprint 解釈スキーマを作成するための手順。
- `REGISTER_BLUEPRINT`: Blueprint の登録
- `VALIDATE_SCHEMA`: スキーマ検証
- `BUILD_INTERPRETATION_SCHEMA`: 解釈用スキーマ作成
- `READY_FOR_KERNEL`: カーネル処理準備完了
- `INTERPRETATION_SCHEMA_READY`: 解釈スキーマ確定 (このフェーズでは解釈・実行は行わない)

### 4.5. InterpretationPolicy (解釈ポリシー定義)
今後 Kernel が Blueprint をどう扱うかの基準を表現するポリシー定義。
- `READ_ONLY`: 読み取り専用ポリシー
- `DETERMINISTIC`: 決定論的ポリシー
- `IMMUTABLE`: 不変ポリシー
- `SCHEMA_ONLY`: スキーマのみ検証ポリシー
- `NO_RUNTIME_STATE`: 実行時状態非保持ポリシー

### 4.6. RuntimeInterpretationModelMetadata (解釈モデルメタデータ)
- `id`: 解釈モデルID
- `name`: 解釈モデル名称
- `interpretationModelVersion`: 解釈モデルの静的 Schema バージョン (例: `"1.0"`)
- `blueprintSchemaVersion`: 解釈対象となる Blueprint 仕様の Schema バージョン (例: `"1.0"`)
- `description`: 詳細説明

### 4.7. RuntimeInterpretationModel (解釈モデル構造定義)
RuntimeInterpretationModel は解釈の仕様（Schema）のみを定義する Blueprint であり、実際の解釈・ロード・生成・更新は Runtime フェーズで実装され、本 Blueprint では一切行わない。
- `interpretationType`: 解釈モデル種類 (`RuntimeInterpretationType`)
- `modelId`: 静的モデル識別ID
- `metadata`: 解釈モデルメタデータ (`RuntimeInterpretationModelMetadata`)
- `interpretationOrder`: 静的な解釈順序 (数値型, 例: `1` 〜 `5` であり、決定論的解釈順序の定義に使用される)
- `targetBlueprints`: 解釈対象となる Blueprint ID の静的リスト (文字列の配列, 例: `['boot-blueprint-id']`)
- `supportedBlueprintTypes`: 解釈対応可能な Blueprint 種別のリスト (文字列の配列, 例: `['BOOT', 'ENGINE', 'SERVICE', 'COMPONENT', 'APPLICATION']`)
- `interpretationPolicy`: 適用される解釈ポリシーのリスト (`readonly InterpretationPolicy[]`)
- `allowedSteps`: 許容される解釈手順 (`readonly InterpretationStep[]`)

### 4.8. BlueprintInterpreterMetadata (メタデータ定義)
- `id`: 定義ID
- `name`: 定義名称
- `version`: バージョン
- `description`: 詳細説明
- `layer`: レイヤー階層名
- `category`: カテゴリ名

### 4.9. ExecutionRuntimeBlueprintInterpreterContext (コンテキスト定義)
保持するのは以下の識別子 ID のみである：
- `runtimeBlueprintInterpreterId`: インタプリタマネージャー識別子 ID (文字列型)

### 4.10. ExecutionRuntimeBlueprintInterpreterData (データ定義)
- `managerType`: 静的分類 (`BlueprintInterpreterType`)
- `managerScope`: 静的適用範囲 (`BlueprintInterpreterScope`)
- `interpretationModels`: 保持対象となる静的解釈モデルのリスト (`readonly RuntimeInterpretationModel[]`)

### 4.11. ExecutionRuntimeBlueprintInterpreter (本体)
- `id`: マネージャー定義ID
- `name`: マネージャー定義名称
- `description`: 詳細説明
- `context`: `ExecutionRuntimeBlueprintInterpreterContext`
- `metadata`: `BlueprintInterpreterMetadata`
- `data`: `ExecutionRuntimeBlueprintInterpreterData`

### 4.12. ExecutionRuntimeBlueprintInterpreterBlueprint (公開インターフェース)
- `getExecutionRuntimeBlueprintInterpreter()`
- `getMetadata()`
- `getContext()`
- `getData()`
- `getInterpretationModels()`
- `getInterpretationSequence()`

---

## 5. 将来の拡張性 (Future Extensions)
将来のフェーズにおいて、以下の拡張機能が検討される：
- **Blueprint Interpreter Engine**: `RuntimeInterpretationModel` および `supportedBlueprintTypes` に基づき、指定された Blueprint 構造を実際にパース・検証し、カーネル実行可能なメモリオブジェクトへ変換する解釈エンジン。
- **PLUGIN_BLUEPRINT / WORKFLOW_BLUEPRINT / AGENT_BLUEPRINT / FIELD_BLUEPRINT / RESOURCE_BLUEPRINT**: プラグインアドオンの Blueprint、自動実行ワークフロー Blueprint、自律型 AI エージェントの動作仕様、現場ポスティングアプリケーションの各種設定 Blueprint、およびサーバーデータベース/ファイルリソースへのアクセス Blueprint を解釈する拡張。
