# Execution Runtime Engine Dispatcher Specification

## 1. 目的 (Purpose)
Execution Runtime Engine Dispatcher は、AIOS (Artificial Intelligence Operating System) における Execution Runtime Engine Validator が返却する静的 Engine Blueprint を基に、エンジンのディスパッチ（送出）に関する構造および関係性を静的に定義する。ディスパッチのための関係性を表現する Read-Only Blueprint である。

## 2. 役割と責務境界 (Responsibilities & Boundaries)

### 2.1. 責務 (Responsibilities)
- Engine Validator Blueprint を読み取り、その関係性を Dispatcher Blueprint として表現する。
- 静的検証情報、リゾルバ、レジストリ、エンジン等のIDをコンテキスト情報として一元定義する。
- メタデータ、コンテキスト、ディスパッチャ本体、およびコンテナを多層的に `Object.freeze()` し、完全な不変性を保証する。

### 2.2. 境界ルール (Boundary Rules) — 実行処理の完全排除
本 Dispatcher はディスパッチ構成の静的な定義のみを責務としており、能動的なディスパッチ・送出・開始処理は一切含めない。
以下の操作・処理は完全に排除される：
- `dispatch()`, `enqueue()`, `schedule()`, `execute()`, `invoke()`, `run()`, `start()`, `stop()`, `cancel()`, `retry()`, `resolve()`, `cache()`, `instantiate()` などの動的なディスパッチ実行、キューへの挿入、タスクのスケジューリング、キャッシュ処理、インスタンス化。
- Plugin 実行、AI 推論、Shell 実行、Browser 操作、および MCP ツール呼び出し。

### 2.3. Dispatcher Context の状態管理の排除
- Context 構造は、各コンポーネントのオブジェクトへの直接参照を保持せず、文字列 ID のみを保持する。これにより、メモリ結合（Deep Coupling）を防止し、状態の乖離を防ぐ。

## 3. 構造定義 (Structures)

### 3.1. EngineDispatcherType (分類定義)
ディスパッチャ自体の分類を示す静的列挙型。
- `FOUNDATION`: 基礎ディスパッチャ
- `RUNTIME`: 実実行ディスパッチャ
- `SIMULATION`: シミュレーションディスパッチャ
- `PLUGIN`: プラグインディスパッチャ
- `AI`: AI自律ディスパッチャ

### 3.2. ExecutionRuntimeEngineDispatcherContext (コンテキスト定義)
保持するのは以下の静的 ID のみである：
- `runtimeEngineId`
- `runtimeEngineRegistryId`
- `runtimeEngineResolverId`
- `runtimeEngineValidatorId`
- `runtimeManagerId`
- `runtimeSessionId`
- `runtimeContextId`

### 3.3. RuntimeEngineDispatcherMetadata (メタデータ)
ディスパッチャの作成者、バージョン、および開発フェーズを管理する。

### 3.4. ExecutionRuntimeEngineDispatcher (ディスパッチャ本体)
id, name, description, dispatcherType, context, metadata から構成される不変構造体。

### 3.5. ExecutionRuntimeEngineDispatcherBlueprint (公開インターフェース)
外部に対して `getDispatcher()`, `getContext()`, `getMetadata()` の読み取り専用 API のみを提供する。

## 4. 設計原則の遵守 (Architecture Principles)

### 4.1. 完全な不変性 (Immutability)
ディスパッチャに関係するすべてのオブジェクト構造、コンテキスト、Blueprint Container は、多層的に `Object.freeze()` を適用し、改変を完全に禁止する。

### 4.2. 決定論 (Determinism)
同一のルール入力に対して、常に同一の `ExecutionRuntimeEngineDispatcher` 参照を返却する。遅延ロードや乱数生成などを完全に排除する。

## 5. 将来の拡張性 (Future Extensions)
将来のフェーズにおいて、以下の拡張機能が検討される：
- **Runtime Dispatch Engine**: 実実行環境においてタスクのディスパッチ（送出）処理を行うコアエンジン。
- **Runtime Queue Dispatch**: 送出されたタスクを優先度や負荷状況に応じて実行キューに分配・投入する制御レイヤー。
- **Distributed Dispatch**: 複数ノードまたはコンテキスト間での分散ディスパッチ処理。
- **Priority Dispatch**: タスクの優先度（High, Normal, Low 等）に基づく優先ディスパッチ制御。
- **Policy Dispatch**: 実行可能時間帯や同時実行制限などのポリシーに適合したディスパッチ制御。
- **Dispatch Monitoring**: ディスパッチの完了率、滞留タスク数、および送出遅延等のパフォーマンス計測とモニタリング。
