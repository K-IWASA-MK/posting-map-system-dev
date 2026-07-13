# Execution Runtime Service Dispatcher Specification

## 1. 目的 (Purpose)
Execution Runtime Service Dispatcher は、AIOS (Artificial Intelligence Operating System) における Execution Runtime Service Validator が返却する静的な Service Blueprint を基に、サービス層におけるディスパッチ（送出）に関する構造および関係性を静的に定義する。ディスパッチのための関係性を表現する Read-Only Blueprint である。

## 2. 役割と責務境界 (Responsibilities & Boundaries)

### 2.1. 責務 (Responsibilities)
- Service Validator Blueprint を読み取り、その関係性を Dispatcher Blueprint として表現する。
- サービス、レジストリ、リゾルバ、バリデータ、およびエンジンの各レイヤーのID情報をコンテキスト情報として一元定義する。
- メタデータ、コンテキスト、ディスパッチャ本体、およびコンテナを多層的に `Object.freeze()` し、完全な不変性を保証する。

### 2.2. 境界ルール (Boundary Rules) — 実行・送出処理の完全排除
本 Dispatcher はディスパッチ構成の静的な定義のみを責務としており、能動的なディスパッチ・キュー投入・実行制御・プロセス制御などは一切含めない。
以下の操作・処理は完全に排除される：
- `dispatch()`, `enqueue()`, `execute()`, `run()`, `start()`, `stop()`, `cancel()`, `schedule()`, `resolve()`, `instantiate()`, `cache()` などの動的なディスパッチ、キュー投入、実行開始、タスクスケジューリング、解決、インスタンス化、キャッシュ、および実行処理。
- Plugin 実行、AI 推論、Shell 実行、Browser 操作、および MCP ツール呼び出し。

### 2.3. Dispatcher Context の状態管理・実体参照の排除
- Dispatcher Context 構造は、Service、Registry、Engine などのコンポーネントオブジェクトへの直接参照を保持せず、文字列 ID のみを保持する。これにより、メモリ結合（Deep Coupling）を防止し、状態の乖離を防ぐ。

## 3. 構造定義 (Structures)

### 3.1. ServiceDispatcherType (分類定義)
ディスパッチャ自体の分類を示す静的列挙型。
- `FOUNDATION`: 基礎ディスパッチャ
- `RUNTIME`: 実実行ディスパッチャ
- `SIMULATION`: シミュレーションディスパッチャ
- `PLUGIN`: プラグインディスパッチャ
- `AI`: AI自律ディスパッチャ

### 3.2. ExecutionRuntimeServiceDispatcherContext (コンテキスト定義)
保持するのは以下の静的 ID のみである：
- `runtimeServiceId`
- `runtimeServiceRegistryId`
- `runtimeServiceResolverId`
- `runtimeServiceValidatorId`
- `runtimeEngineId`
- `runtimeEngineRegistryId`
- `runtimeEngineResolverId`
- `runtimeEngineValidatorId`
- `runtimeEngineDispatcherId`
- `runtimeEngineSchedulerId`
- `runtimeEngineExecutorId`

### 3.3. RuntimeServiceDispatcherMetadata (メタデータ)
ディスパッチャの作成者、バージョン、および開発フェーズを管理する。

### 3.4. ExecutionRuntimeServiceDispatcher (ディスパッチャ本体)
id, name, description, dispatcherType, context, metadata から構成される不変構造体。

### 3.5. ExecutionRuntimeServiceDispatcherBlueprint (公開インターフェース)
外部に対して `getDispatcher()`, `getContext()`, `getMetadata()` の読み取り専用 API のみを提供する。

## 4. 設計原則の遵守 (Architecture Principles)

### 4.1. 完全な不変性 (Immutability)
ディスパッチャに関係するすべてのオブジェクト構造、コンテキスト、Blueprint Container は、多層的に `Object.freeze()` を適用し、改変を完全に禁止する。

### 4.2. 決定論 (Determinism)
同一のルール入力に対して、常に同一の `ExecutionRuntimeServiceDispatcher` 参照を返却する。遅延ロードや動的な状態変化などを完全に排除する。

## 5. 将来の拡張性 (Future Extensions)
将来のフェーズにおいて、以下の拡張機能が検討される：
- **Runtime Service Dispatch Engine**: 実実行環境においてサービスレベルのリクエストを送出（ディスパッチ）するエンジン。
- **Runtime Queue Dispatch**: リクエストをサービス単位の実行キューへ安全に配分・投入するレイヤー。
- **Distributed Dispatch**: ネットワーク越しまたはマルチノード環境における分散サービスディスパッチ制御。
- **Priority Dispatch**: サービスレベルの優先度（High / Normal / Low 等）に応じた優先ディスパッチ制御。
- **Policy Dispatch**: サービスの同時実行制限や権限制御に応じたポリシーディスパッチ制御。
- **Dispatch Monitoring**: サービスのディスパッチ数、詰まり、応答速度等のパフォーマンス計測とモニタリング。
