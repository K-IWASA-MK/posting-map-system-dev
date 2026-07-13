# Execution Runtime Kernel Foundation Specification

## 1. 目的 (Purpose)
Execution Runtime Kernel Foundation は、AIOS (Artificial Intelligence Operating System) における動的実行基盤となるランタイムカーネルモデル（RuntimeKernelModel）の静的 Blueprint を定義し、その境界を表現する。実際のランタイム起動・スケジュール実行・スレッド制御ロジックを持たない Read-Only Blueprint である。

---

## 2. 役割と責務境界 (Responsibilities & Boundaries)

### 2.1. カーネルが行わないこと (Prohibited Action Boundaries)
本 Kernel Foundation および将来の Kernel Runtime は、以下の操作・管理を自身の責務から完全に除外し、所有または直接操作してはならない：
- **Blueprintの生成**: 新しい Blueprint の作成・追加は行わない。
- **Blueprintの編集**: 既存の Blueprint 定義を動的に書き換える編集操作は行わない。
- **Blueprintの保持**: Blueprint 自体の保持・マウントは行わず、他の Manager 等に任せる。
- **Runtime Contextの所有**: 各プロセスの Context 情報は保持・管理しない。
- **Runtime Sessionの所有**: Session 単位のログイン・接続実体情報は所有しない。
- **Runtime Stateの所有**: 実行時状態マシン（State Model）の状態遷移・更新は直接管理しない。

### 2.2. カーネルの行う責務（将来） (Kernel Responsibilities)
動的 Runtime 移行後において、Kernel は以下の統括制御および接続のみを責務とする：
- **Interpreter結果の受領**: Interpreter が解釈を確定した実行スキーマ (Interpretation Schema) を決定論的に受領する。
- **Runtime実行の統括**: 実行環境全体の安全動作、境界制御、スレッディング資源の最適化を監視・統括する。
- **Schedulerとの連携**: スケジューラーと連携し、リソース配分やタスク優先度に応じた実行計画 Tick の同期を行う。
- **Event Dispatcherとの連携**: 外部・内部からのイベント通知をディスパッチャーに中継・連携する。

### 2.3. 静的 Blueprint 境界ルール
本 Kernel Foundation は実際のプロセスの起動・停止・制御等は処理せず、「カーネル構成スキーマ定義」を表現する Blueprint である。
動的な実行制御ロジック、エラーハンドリング、非同期処理、リトライ等の制御ロジックは一切含めない。
以下の操作・処理は完全に排除される：
- `boot()`, `initialize()`, `run()`, `execute()`, `dispatch()`, `schedule()`, `tick()`, `shutdown()` などの動的な起動、初期化、実行、および Tick 遷移制御処理。
- ランタイムカーネルハンドラー (Runtime Kernel Handler), 動的カーネルコア (Dynamic Kernel Core), イベント (Event), キュー (Queue), 非同期処理 (Async/Promise), タイマー (Timer), スレッド (Thread) 等は完全に禁止する。

---

## 3. 設計原則の遵守 (Architecture Principles)

### 3.1. 完全な不変性 (Immutable Rule)
関係するすべてのオブジェクト構造、コンテキスト、データ、および Blueprint Container は、多層的に `Object.freeze()` を適用し、外部および内部からの改変を完全に禁止する。
コンテナ型は `Readonly<ExecutionRuntimeKernelBlueprint>` とする。

### 3.2. 決定論的解決 (Deterministic Rule)
同一のルール入力に対して、常に同一の `ExecutionRuntimeKernel` 参照を返却する。遅延ロードや動的な状態変化などを完全に排除し、参照同一性を保証する。

### 3.3. 読み取り専用制意 (Read-Only Rule)
公開 API は Getter のみに限定され、いかなる Setter や状態変更（Mutation）メソッドも存在してはならない。
`ExecutionRuntimeKernelContext` は識別子 ID の文字列 `runtimeKernelId` のみをつねに保持し、他のランタイムオブジェクトや直接のオブジェクト参照を一切保持しない。

---

## 4. 構造定義 (Structures)

### 4.1. KernelType (分類)
マネージャーの分類を示す静的列挙型。
- `FOUNDATION`: 基礎マネージャー定義
- `RUNTIME`: 実マネージャー定義
- `SIMULATION`: シミュレーションマネージャー定義
- `PLUGIN`: プラグインマネージャー定義
- `AI`: AI自律コンポーネントマネージャー定義

### 4.2. KernelScope (適用範囲)
マネージャーの適用スコープを示す静的列挙型。
- `SYSTEM`: システムエグゼキューターマネージャー
- `USER`: ユーザー空間エグゼキューターマネージャー
- `TENANT`: テナント空間エグゼキューターマネージャー

### 4.3. RuntimeKernelType (カーネルモデル種類)
- `SYSTEM_KERNEL`: システムカーネルモデル
- `CORE_KERNEL`: コアカーネルモデル
- `APPLICATION_KERNEL`: アプリケーション実行カーネルモデル
- `PLUGIN_KERNEL`: プラグイン空間実行カーネルモデル
- `FIELD_KERNEL`: ポスティングマップ配布員現場カーネルモデル

### 4.4. KernelStep (静的カーネルステップ)
決定論的に接続されたレイアウトおよび実行計画から Kernel 構成を表現するための手順。
- `REGISTER_INTERPRETATION`: 解釈済みスキーマの登録
- `VALIDATE_INTERPRETATION`: スキーマ検証
- `BUILD_KERNEL_SCHEMA`: カーネルスキーマ作成
- `READY_FOR_RUNTIME`: 起動準備完了
- `KERNEL_SCHEMA_READY`: カーネルスキーマ確定 (このフェーズでは起動・実行は行わない)

### 4.5. KernelLifecycleState (カーネルライフサイクル定義)
カーネル自体の状態スキーマを静的に定義。
- `CREATED`: 作成
- `READY`: 準備完了
- `RUNNING`: 実行中
- `STOPPED`: 停止
- `TERMINATED`: 終了

### 4.6. KernelCapability (カーネル対応機能能力定義)
カーネルが将来どの機能を扱えるかを静的に宣言。
- `INTERPRETATION`: 解釈能力
- `EXECUTION`: 実行能力
- `SCHEDULING`: スケジューリング能力
- `MONITORING`: 監視能力
- `GOVERNANCE`: ガバナンス統制能力

### 4.7. KernelExecutionPolicy (カーネル実行ポリシー定義)
カーネルの実行基準。
- `READ_ONLY`: 読み取り専用ポリシー
- `DETERMINISTIC`: 決定論的ポリシー
- `IMMUTABLE_BLUEPRINT`: Blueprint の不変保証ポリシー
- `STATE_ISOLATION`: 状態の空間隔離ポリシー
- `NO_DYNAMIC_SCHEMA_CHANGE`: スキーマの動的変更禁止ポリシー

### 4.8. RuntimeKernelModelMetadata (カーネルモデルメタデータ)
- `id`: カーネルモデルID
- `name`: カーネルモデル名称
- `kernelModelVersion`: カーネルモデルの静的 Schema バージョン (例: `"1.0"`)
- `description`: 詳細説明

### 4.9. RuntimeKernelModel (カーネルモデル構造定義)
RuntimeKernelModel は Kernel Schema を定義する Blueprint であり、実際の動作は将来のフェーズで実装され、本 Blueprint では一切行わない。
- `kernelType`: カーネルモデル種類 (`RuntimeKernelType`)
- `modelId`: 静的モデル識別ID
- `metadata`: カーネルモデルメタデータ (`RuntimeKernelModelMetadata`)
- `kernelOrder`: 静的なカーネル構成順序 (数値型, 例: `1` 〜 `5` であり、決定論的構成順序の定義に使用される)
- `targetInterpretations`: 構成元となる Interpretation Model ID の静的リスト (文字列の配列, 例: `['interpretation-model-boot-01']`)
- `supportedExecutionModels`: 対応可能な実行モデル名のリスト (文字列の配列, 例: `['SYSTEM_EXECUTION']`)
- `kernelExecutionPolicy`: 適用される実行ポリシーのリスト (`readonly KernelExecutionPolicy[]`)
- `supportedCapabilities`: 対応する機能能力のリスト (`readonly KernelCapability[]`)
- `allowedSteps`: 許容されるカーネル手順 (`readonly KernelStep[]`)

### 4.10. KernelMetadata (メタデータ定義)
- `id`: 定義ID
- `name`: 定義名称
- `version`: バージョン
- `description`: 詳細説明
- `layer`: レイヤー階層名
- `category`: カテゴリ名

### 4.11. ExecutionRuntimeKernelContext (コンテキスト定義)
保持するのは以下の識別子 ID のみである：
- `runtimeKernelId`: カーネルマネージャー識別子 ID (文字列型)

### 4.12. ExecutionRuntimeKernelData (データ定義)
- `managerType`: 静的分類 (`KernelType`)
- `managerScope`: 静的適用範囲 (`KernelScope`)
- `kernelModels`: 保持対象となる静的カーネルモデルのリスト (`readonly RuntimeKernelModel[]`)

### 4.13. ExecutionRuntimeKernel (本体)
- `id`: マネージャー定義ID
- `name`: マネージャー定義名称
- `description`: 詳細説明
- `context`: `ExecutionRuntimeKernelContext`
- `metadata`: `KernelMetadata`
- `data`: `ExecutionRuntimeKernelData`

### 4.14. ExecutionRuntimeKernelBlueprint (公開インターフェース)
- `getExecutionRuntimeKernel()`
- `getMetadata()`
- `getContext()`
- `getData()`
- `getKernelModels()`
- `getKernelSequence()`

---

## 5. 将来の拡張性 (Future Extensions)
将来のフェーズにおいて、以下の拡張機能が検討される：
- **Runtime Kernel Core Engine & State Machine**: `RuntimeKernelModel` および `KernelLifecycleState` に基づき、実際のプロセスやスレッディングを制御し、スケジューラーやイベント通知の中継を行う自律カーネル実行コア。
- **PLUGIN_KERNEL / WORKFLOW_KERNEL / APPLICATION_KERNEL / FIELD_KERNEL**: アドオン用プラグインの隔離実行空間、ワークフローのノード制御、POSTING MAP (Hアプリ) のオフライン同期/ローカル永続化制御を含む現場カーネルなど。
