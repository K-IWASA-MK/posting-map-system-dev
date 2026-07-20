# AIOS Execution Pipeline Specification (Sprint G8-5)

本稿は、AIOS Generation 8 実行環境における「Execution Pipeline（実行パイプライン）」の設計仕様書です。本コンポーネントは、Execution Flow Layer として動作し、統合的な実行フローおよびステージ構成を定義します。

---

## 1. Execution Pipeline Architecture

Execution Pipeline は、これまでのスプリントで構築した `ExecutionPlan`（G8-2）、`OrchestrationPlan`（G8-3）、および `ExecutionContextState`（G8-4）の成果物を統合し、順序付けされた実行ステージの流れ（Execution Flow）を定義する層です。

```
ExecutionPlan
        │
OrchestrationPlan
        │
ExecutionContext
        │
        ▼
[ ExecutionPipelineRequest ]
        │
        ▼
   ExecutionPipeline (Flow Layer)
        │
        ├── Validate Pipeline Request
        ├── Build Pipeline Context
        ├── Resolve Execution Flow (Pipeline Resolution Contract)
        ├── Generate Pipeline Plan
        └── Produce Pipeline Result
        │
        ▼
[ ExecutionPipelineResult ] ──> Execution Result (Sprint G8-6)
```

---

## 2. Context Resolution Flow

1. **Request Intake & Validation**:
   `ExecutionPipelineRequest` を受け取り、内包される `OrchestrationPlan` と `ExecutionContextState` の整合性を検証します（ID不一致のチェックなど）。
2. **Pipeline Context Resolution**:
   要求パラメータから `pipelineId`, `executionId`, `orchestrationId` を持つ `ExecutionPipelineContext` をバインドします。
3. **Execution Flow Resolution**:
   解決されたワーカー順序リスト配列から、実行順序に対応するパイプラインステージ（`stages`）の配列シーケンスを決定論的に導出します。
4. **Pipeline Plan Generation**:
   `pipelineId`, `executionId`, `stages` を含む不変の `ExecutionPipelinePlan` を生成します。
5. **Result Packaging**:
   作成した計画を `ExecutionPipelineResult` にパッケージし、下流の実行結果層（G8-6）へ引き渡します。

---

## 3. Runtime Contracts (実行時契約)

* **Contract-01: Immutable Models**: 
  `ExecutionPipelineContext`, `ExecutionPipelinePlan`, `ExecutionPipelineRequest`, `ExecutionPipelineResult` のすべてのプロパティは `readonly` とします。
* **Contract-02: Stateless Pipeline**:
  ExecutionPipeline は内部状態、キャッシュ、実行履歴、または一時的なスレッド情報を保持しません。
* **Contract-03: Deterministic Pipeline Resolution**:
  同一の `OrchestrationPlan` および `ExecutionContextState` 入力に対して、常に同一の `ExecutionPipelinePlan` を決定論的に生成して返却します。
* **Contract-04: No Execution**:
  Execution Pipeline は実行プロセスを開始しません。フロー定義（ステージ構成計画）の生成のみを担当します。実際のワーカー駆動やプロセス管理は行いません。
* **Contract-05: No Persistence**:
  履歴・状態・キャッシュの永続化は行いません。
* **Pipeline Resolution Contract (パイプライン解決契約)**:
  `ExecutionPipeline` は Execution Flow の解決責任を負います。ただし、本スプリントでは契約インタフェースの定義のみを行い、具体的な解決アルゴリズム（複雑な動的ルーティングやステージ最適化など）は後続のスプリントで実装します。

---

## 4. 将来的な設計拡張ポイント (Architecture Extensibility)

* **`ExecutionPipelinePlan` のプロパティ拡張**:
  現在は最低限のステージ名リスト配列（`stages`）のみですが、将来的な拡張として以下のような実行時パラメータを追加できるように設計上のスロットを考慮しています。
  - `stageDependencies`: 各ステージ間の依存マップ定義。
  - `stagePolicies`: 特定ステージにのみ適用される制限やリトライポリシー。
  - `executionStrategy`: 直列・並列実行の混合やタイムアウトポリシーなどの戦略記述。
  - `stageMetadata`: 各ステージに対応する付加属性情報。
* **`ExecutionPipelineContext` の将来拡張**:
  将来的に、実行空間や関連コンテキストを識別するためのプロパティ拡張スロットを設けています。
  - `pipelineVersion`: パイプライン仕様のバージョン管理。
  - `pipelineScope`: 有効となるスコープ識別子。
  - `correlationId`: 分散環境におけるトラッキング用の相関ID。
* **Conditional Flow（条件付き分岐フロー）の導入**:
  先行ステージの実行結果（`ExecutionResult`）のステータスや出力データに応じて、後行ステージを動的にスキップ、あるいはバイパスする動的ルーティング規則への発展を想定しています。
* **Stage Routing & Parallel Scheduling**:
  並行処理が可能なステージを自動検出し、Execution Pipeline 内で独立した非同期タスク群としてスレッド/プロセスワーカーへ並列にディスパッチするためのスケジュールトポロジーへの適合化。
