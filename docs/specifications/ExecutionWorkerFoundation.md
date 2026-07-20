# AIOS Execution Worker Foundation Specification (Sprint G8-1)

本稿は、AIOS Generation 8 実行環境における「Execution Worker Foundation（ワーカー契約層）」の設計仕様書です。本コンポーネントは、Execution Layer の最小単位となる抽象契約（Contract）を定義します。

---

## 1. Worker Architecture

Execution Layer は、Runtime Layer から生成されるスケジュール結果（`ScheduleResult`）を受け取り、実際のエージェントプロセスの起動・推論実行を担う層です。本スプリントはその基礎となる Worker のデータ形式及び実行インタフェース（`ExecutionWorker`）のみを規定します。

```
┌──────────────────────────────────────────────┐
│        Execution Worker Foundation           │
│                                              │
│ WorkerContext (Immutable)                    │
│        │                                     │
│ WorkerRequest (Immutable)                    │
│        │                                     │
│ ExecutionWorker (Interface)                  │
│        │                                     │
│ WorkerResult (Immutable)                     │
└──────────────────────────────────────────────┘
```

---

## 2. Runtime Flow

1. **Context Initialization**:
   実行エンジン起動時に `WorkerContext` が初期化され、当該 Worker 一意の `workerId` と、親となる `runtimeId`、実行対象の `sessionId` がバインドされます。
2. **Execution Dispatch**:
   スケジューラ指示または実行ランタイムにより `WorkerRequest` が構築され、対象 Worker の `execute(request)` メソッドが呼び出されます。
3. **Execution Completion**:
   非同期または同期的な処理を経て、Worker は完了メタデータを持つ不変の `WorkerResult` を返却します。

---

## 3. Runtime Contracts (実行時契約)

* **Contract-01: Immutable Models**: 
  `WorkerContext`, `WorkerRequest`, `WorkerResult` のすべてのプロパティは `readonly` とし、実行時における不変性を保証します。
* **Contract-02: Stateless Worker**:
  Worker はメモリ上に自身の過去の実行履歴、キャッシュ、中間処理中のセッション状態を保持しないステートレス設計とします。
* **Contract-03: Deterministic Interface**:
  同一の `WorkerRequest` に対しては、常に同一の判定構造を持つ `WorkerResult` を返却する決定論的挙動を遵守します。
* **Contract-04: No Execution Engine**:
  本スプリントではインタフェース定義のみを行い、OSスレッド、外部プロセス、LLM推論 API、ツール環境、ネットワーク通信などの物理実行系は実装しません。
* **Contract-05: No Persistence**:
  ログ、状態、セッション、キャッシュなどのストレージ/インメモリ永続化は行いません。

---

## 4. 将来的な設計拡張ポイント (Architecture Extensibility)

* **`WorkerResult` の状態拡張**:
  現在は単純な完了フラグ（`completed: boolean`）のみですが、将来的な拡張ポイントとして `status` フィールドを導入し、`SUCCESS` / `FAILED` / `SKIPPED` / `CANCELLED` などのより詳細なライフサイクル状態コードを定義できるように設計されています。
* **`WorkerContext` のメタデータ拡張**:
  将来的に、実行範囲や適用ポリシーを制御するために `workerVersion`、`executionScope`、`executionPolicy` などのコンテキスト情報を動的に埋め込めるよう、プロパティの拡張スロットを設けています。
* **例外処理の契約（Exception Contract）**:
  `ExecutionWorker.execute()` を実装するすべての具現クラスは、未捕捉の内部例外（システムエラー等）を直接上流のランタイムに流してクラッシュさせてはなりません。具現化された Executor は、いかなる場合も例外境界を自身でラップし、契約仕様に適合した失敗ステータスを含む `WorkerResult` を返却、または制御されたエラーハンドリングを通じて安全に終了する責任を負います。
