# Execution Runtime Routing Specification

## 1. 目的 (Purpose)
Execution Runtime Routing は、AIOS (Artificial Intelligence Operating System) における論理ルーティング境界（Routing Schema）の静的 Blueprint を定義し、その境界を表現する。ランタイム経路解決・メッセージ配送・Forward処理・Routing Table更新・Dynamic Routing判定等のロジックを持たない Read-Only Blueprint である。

## 2. 役割と責務境界 (Responsibilities & Boundaries)

### 2.1. 責務 (Responsibilities)
- 実行ルーティングのメタデータ、コンテキスト、および静的モデルデータを定義する。
- 実行ルーティングの静的 Blueprint を公開する。
- メタデータ、コンテキスト、モデルデータ、および Blueprint Container を多層的に `Object.freeze()` して完全な不変性を保証する。

### 2.2. 境界ルール — 経路解決・メッセージ配送等の完全排除
本 Routing はルーティングを直接生成・保留・操作するクラスではなく、ルーティングスキーマの Blueprint（定義情報）のみを表現する。
以下の操作・処理は完全に排除される：
- `createRoute()`, `generateRoute()`, `resolveRoute()`, `selectRoute()`, `calculateRoute()`, `updateRoute()`, `addRoute()`, `removeRoute()`, `route()`, `forward()`, `redirect()`, `dispatch()` などの動的実行ロジック。
- ルーティングの実データ構造（接続状態、内部テーブル、キャッシュ、選択された経路、宛先エンドポイント等）の保持。
- Promise, async / await, Timer, EventEmitter, Buffer操作, Stream操作。
- Routing Table 実体, Routing Runtime Instance, Message Instance, Queue Instance, Port Instance, Endpoint Instance, Socket, Connection, Transport, Network Adapter, Worker, Thread, Event, Scheduler, Task 等のインスタンスの保持・管理・生成。

> [!IMPORTANT]
> Routing はデータ契約のみを定義し、Runtime Routing Instance を生成しない。
> 将来 Execution Runtime Routing Runtime が追加されても、本 Blueprint は変更せず参照専用とする。

### 2.3. Context の制約
- `ExecutionRuntimeRoutingContext` は `runtimeRoutingId` のみ保持し、`routingRef`・`routeTable`・`messageRef`・`queueRef`・`portRef`・`endpointRef`・`connectionRef`・`transportRef`・`state`・`cache` 等の実体参照や状態を示すプロパティを含まない（Context ID Only）。

---

## 3. 構造定義 (Structures)

### 3.1. RoutingType (分類定義)
ルーティングの分類を示す静的列挙型。
- `FOUNDATION`: 基礎ルーティング
- `RUNTIME`: 実実行ルーティング

> [IMPORTANT]
> `RoutingType` は Foundation における静的分類定義であり、ランタイムによる動的な追加・変更は完全に禁止される。

### 3.2. RoutingScope (スコープ定義)
ルーティングのスコープを示す静的列挙型。
- `SYSTEM`: システムスコープ

> [IMPORTANT]
> `RoutingScope` は Foundation における静的なスコープの定義であり、ランタイムによる動的な追加・変更は完全に禁止される。

### 3.3. RuntimeRoutingType (実行ルーティングタイプ定義)
ルーティングの用途を示す静的列挙型。
- `SYSTEM_ROUTING`: システムルーティング
- `CORE_ROUTING`: コアルーティング
- `APPLICATION_ROUTING`: アプリケーションルーティング
- `PLUGIN_ROUTING`: プラグインルーティング
- `FIELD_ROUTING`: フィールドルーティング

### 3.4. RoutingLifecycleState (ライフサイクル定義)
ルーティングが経るべき静的ライフサイクル定義。
- `CREATED`: 生成状態
- `READY`: 準備完了状態
- `WAITING`: 待機状態
- `SEALED`: 封印状態
- `TERMINATED`: 終了状態

### 3.5. RoutingCapability (ケーパビリティ定義)
ルーティングがサポートする能力を示す静的列挙型。
- `SYSTEM`, `APPLICATION`, `PLUGIN`, `FIELD`, `LOCAL`, `REMOTE`, `DISTRIBUTED`, `INTER_PROCESS`, `INTER_NODE`, `AI`, `WORKFLOW`, `MONITORING`

### 3.6. RoutingCategory (カテゴリ定義)
ルーティングの論理的カテゴリ。
- `LOCAL`, `REMOTE`, `SERVICE`, `DEVICE`, `APPLICATION`, `SCHEMA_ONLY`

### 3.7. RoutingValidationPolicy (バリデーションポリシー定義)
ルーティングが要求する検証ポリシーの静的定義。
- `NONE`, `HEADER_ONLY`, `SCHEMA`, `FULL`, `SCHEMA_ONLY`

### 3.8. RoutingExecutionPolicy (実行ポリシー定義)
不変性・決定論の保証、および一切の実行時処理を禁止するポリシーリスト。
- `READ_ONLY`, `DETERMINISTIC`, `IMMUTABLE_SCHEMA`
- `NO_THREAD`, `NO_QUEUE`, `NO_TASK`, `NO_WORKER`
- `NO_EVENT`, `NO_EVENT_BUS`, `NO_ROUTER`
- `NO_ROUTE_CREATE`, `NO_ROUTE_RESOLVE`, `NO_ROUTE_REGISTER`
- `NO_ROUTE_OPEN`, `NO_ROUTE_CLOSE`
- `NO_ROUTE_SELECT`, `NO_ROUTE_FORWARD`, `NO_ROUTE_REDIRECT`, `NO_ROUTE_DISPATCH`

### 3.9. RoutingDependencyPolicy (依存関係ポリシー定義)
- `NO_DEPENDENCY`, `STATIC_DEPENDENCY`, `SCHEMA_ONLY`

### 3.10. RoutingTopology (トポロジー定義)
- `LOCAL`, `PROCESS`, `NODE`, `CLUSTER`, `DISTRIBUTED`

### 3.11. RuntimeRoutingMetadata (モデルメタデータ)
- `routingModelVersion`: バージョン
- `routingSchemaVersion`: スキーマバージョン

### 3.12. RuntimeRoutingModel (静的モデル定義)
- `routingOrder`: 解決順序
- `supportedCapabilities`: ケーパビリティリスト
- `supportedRoutingPolicies`: ポリシー名リスト
- `supportedValidationPolicies`: バリデーションポリシーリスト
- `dependencyPolicy`: 依存ポリシー
- `topology`: ネットワークトポロジー
- `lifecycleStates`: ライフサイクル状態リスト
- `executionPolicies`: 実行ポリシーリスト
- `allowedSteps`: 許容ステップリスト
- `supportedTransportPolicies`: トランスポートポリシーリスト
- `supportedConnectionPolicies`: コネクションポリシーリスト
- `supportedIdentityPolicies`: 主体ポリシーリスト

### 3.13. RoutingMetadata (データメタデータ)
- `id`: ID
- `name`: 名称
- `version`: バージョン
- `description`: 詳細説明
- `layer`: レイヤー階層名
- `category`: カテゴリ名

### 3.14. ExecutionRuntimeRoutingData (データ定義)
- `managerType`: `RoutingType`
- `managerScope`: `RoutingScope`
- `routingModels`: 静的ルーティングモデルリスト

### 3.15. ExecutionRuntimeRoutingBlueprint (公開インターフェース)
外部に対して以下の読み取り専用 API のみを提供する。
- `getExecutionRuntimeRouting()`
- `getMetadata()`
- `getContext()`
- `getData()`
- `getRoutingModels()`
- `getRoutingSequence()`

---

## 4. 設計原則の遵守 (Architecture Principles)

### 4.1. 完全な不変性 (Immutability)
関係するすべてのオブジェクト構造、コンテキスト、データ、および Blueprint Container は、多層的に `Object.freeze()` を適用し、改変を完全に禁止する。

### 4.2. 決定論 (Determinism)
同一のルール入力に対して、常に同一 of `ExecutionRuntimeRouting` 参照を返却する。遅延ロードや動的な状態変化などを完全に排除する。

---

## 5. 将来の拡張性 (Future Extensions)
将来のフェーズにおいて、以下の拡張機能が検討される：
- **Runtime Routing Engine**: 実際の通信時のメッセージ転送、経路選択、ディスパッチ、ルーティングテーブルの動的更新などの動的ルーティング制御を実行するルーティング処理エンジン。
- **Process Communication Bridge**: プロセス境界やコンテナ境界で IPC メッセージパケットを中継ルーティングするブリッジ。
- **Plugin Resolution Controller**: 独自のトポロジカル・ルーティングアルゴリズムや、優先度に基づく動的配送ルール（Priority Routing等）の仕組みを組み込むプラグイン。
- **AI Targeting Runtime**: AIエージェントにパケット配送トポロジーを動的解決してルーティング中継を制御するランタイム。
- **Task Transport Controller**: ルーティング切替失敗時の再送、フォールバック経路への迂回、デッドロック回避のスケジューリング制御。
- **Execution Performance Monitoring**: ルーティング遅延、ホップ数、パケットドロップ率、ルーティング処理スループットを監視する監査機能。
- **Sandboxed Routing**: サンドボックス隔離空間のネットワークアクセス範囲（ホワイトリストURL等）を安全なルーティング層にカプセル化して制限するサンドボックス境界制御。
