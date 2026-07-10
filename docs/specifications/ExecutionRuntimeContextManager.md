# Execution Runtime Context Manager Foundation Specification

## 1. 目的 (Purpose)
Execution Runtime Context Manager Foundation は、AIOS (Artificial Intelligence Operating System) における実行ランタイム全体の実行コンテキストと状態を表現するための状態構造（Schema / Snapshot）の静的 Blueprint を定義し、その境界を表現する。ランタイムコンテキスト管理ロジックを持たない Read-Only Blueprint である。

## 2. 役割と責務境界 (Responsibilities & Boundaries)

### 2.1. 責務 (Responsibility)
- 実行ランタイム全体のコンテキスト構造、メタデータ、および静的な状態スナップショット定義を公開する。
- メタデータ、コンテキスト、データ、および Blueprint Container を多層的に `Object.freeze()` して完全な不変性を保証する。
- 外部からの静的アクセスに対応するための読み取り専用 Getter API を提供する。

### 2.2. レイヤー境界ルール (Layer Boundary)
本 Context Manager Specification は、静的トポロジーおよび定義情報のみを扱うレイヤーに属する。
動的なコンテキストの作成、破棄、同期、スナップショット保存などを処理する Runtime エンジン等とは明確に分離され、いかなる動的な処理ロジックも内包してはならない。

### 2.3. コンテキストマネージャー境界ルール (Context Boundary)
本 Context Manager Foundation は実際の状態取得、動的なスナップショット保存、コンテキストの動的更新や復旧、状態遷移等は処理せず、「状態構造定義」を表現する Blueprint である。
動的な実行制御ロジック、エラーハンドリング、非同期処理、リトライ等の制御ロジックは一切含めない。
以下の操作・処理は完全に排除される：
- `createContext()`, `updateContext()`, `restoreContext()`, `destroyContext()`, `snapshot()`, `resume()`, `sync()`, `restore()` などの動的な状態管理、コンテキスト生成、破棄、同期、復旧処理、および遷移制御処理。
- ランタイムコンテキストハンドラー (Runtime Context Handler), 状態レポジトリ (State Repository), 進捗マネージャー (Progress Manager), イベント (Event), キュー (Queue), 非同期処理 (Async/Promise), タイマー (Timer) 等は完全に禁止する。

---

## 3. 設計原則の遵守 (Architecture Principles)

### 3.1. 完全な不変性 (Immutable Rule)
関係するすべてのオブジェクト構造、コンテキスト、データ、および Blueprint Container は、多層的に `Object.freeze()` を適用し、外部および内部からの改変を完全に禁止する。
コンテナ型は `Readonly<ExecutionRuntimeContextManagerBlueprint>` とする。

### 3.2. 決定論的解決 (Deterministic Rule)
同一のルール入力に対して、常に同一の `ExecutionRuntimeContextManager` 参照を返却する。遅延ロードや動的な状態変化などを完全に排除し、参照同一性を保証する。

### 3.3. 読み取り専用制意 (Read-Only Rule)
公開 API は Getter のみに限定され、いかなる Setter や状態変更（Mutation）メソッドも存在してはならない。
`ExecutionRuntimeContextManagerContext` は識別子 ID の文字列 `runtimeContextManagerId` のみをつねに保持し、他のランタイムオブジェクトや直接のオブジェクト参照を一切保持しない。

---

## 4. 構造定義 (Structures)

### 4.1. ContextManagerType (分類)
マネージャーの分類を示す静的列挙型。
- `FOUNDATION`: 基礎マネージャー定義
- `RUNTIME`: 実マネージャー定義
- `SIMULATION`: シミュレーションマネージャー定義
- `PLUGIN`: プラグインマネージャー定義
- `AI`: AI自律コンポーネントマネージャー定義

### 4.2. ContextManagerScope (適用範囲)
マネージャーの適用スコープを示す静的列挙型。
- `SYSTEM`: システムコンテキストマネージャー
- `USER`: ユーザー空間コンテキストマネージャー
- `TENANT`: テナント空間コンテキストマネージャー

### 4.3. RuntimeSnapshotType (スナップショット種類)
- `BOOT`: 起動シーケンススナップショット
- `PIPELINE`: パイプラインデータフロースナップショット
- `RUNTIME`: ランタイム実動作スナップショット

### 4.4. RuntimeSnapshotMetadata (スナップショットメタデータ)
- `id`: スナップショット定義ID
- `name`: スナップショット定義名称
- `version`: バージョン
- `description`: 詳細説明

### 4.5. RuntimeSnapshot (スナップショット構造定義)
RuntimeSnapshot は Runtime の実際の状態を保持するものではなく、Runtime が保持すべき状態構造（Schema）を定義する Blueprint である。各 Snapshot の実際の取得・生成・保存・同期・状態更新・復元は Runtime フェーズで実装され、本 Blueprint では一切行わない。
- `snapshotType`: スナップショット種類 (`RuntimeSnapshotType`)
- `snapshotId`: 静的スナップショット識別ID
- `snapshotVersion`: スナップショットの静的 Schema バージョン (例: `1.0`)
- `timestamp`: 静的生成想定日時 (または空文字列)
- `stateHash`: 状態整合性を検証するための静的ハッシュ (または空文字列)

### 4.6. ContextManagerMetadata (メタデータ定義)
- `id`: 定義ID
- `name`: 定義名称
- `version`: バージョン
- `description`: 詳細説明
- `layer`: レイヤー階層名
- `category`: カテゴリ名

### 4.7. ExecutionRuntimeContextManagerContext (コンテキスト定義)
保持するのは以下の識別子 ID のみである：
- `runtimeContextManagerId`: コンテキストマネージャー識別子 ID (文字列型)

### 4.8. ExecutionRuntimeContextManagerData (データ定義)
- `managerType`: 静的分類 (`ContextManagerType`)
- `managerScope`: 静的適用範囲 (`ContextManagerScope`)
- `snapshots`: 保持対象となる静的スナップショット構造のリスト (`readonly RuntimeSnapshot[]`)

### 4.9. ExecutionRuntimeContextManager (本体)
- `id`: マネージャー定義ID
- `name`: マネージャー定義名称
- `description`: 詳細説明
- `context`: `ExecutionRuntimeContextManagerContext`
- `metadata`: `ContextManagerMetadata`
- `data`: `ExecutionRuntimeContextManagerData`

### 4.10. ExecutionRuntimeContextManagerBlueprint (公開インターフェース)
- `getExecutionRuntimeContextManager()`
- `getMetadata()`
- `getContext()`
- `getData()`
- `getSnapshots()`

---

## 5. 将来の拡張性 (Future Extensions)
将来のフェーズにおいて、以下の拡張機能が検討される：
- **Runtime Context Manager Engine**: 動的に `RuntimeSnapshot` 構造に沿って現在のランタイム状態（変数、メモリ、ポート状態、モジュール参照、ロード済みコンポーネント一覧）を取得し、ディスクやセグメントに保存・ハイドレーション・復旧する実状態管理エンジン。
- **Checkpoint / Resume System**: パニック発生時やクラッシュ時に自動的に最新のスナップショット（`stateHash` を検証済み）からプロセスをホット再起動（Resume）する自律復旧システム。
- **Recovery Ledger**: すべての状態遷移（スナップショット更新履歴）をタイムスタンプ順の分散台帳（Ledger）に記録し、トレース監査を可能にする履歴管理システム。
