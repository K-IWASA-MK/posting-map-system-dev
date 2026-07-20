# AIOS Agent Orchestrator Specification (Sprint G8-3)

本稿は、AIOS Generation 8 実行環境における「Agent Orchestrator（実行順序調定層）」の設計仕様書です。本コンポーネントは、Execution Coordination Layer として動作し、複数のワーカーの実行順序・依存関係を計画する責務を規定します。

---

## 1. Agent Orchestrator Architecture

Agent Orchestrator は、Planning Layer が生成した実行計画（`ExecutionPlan`）を入力として受け取り、複数のワーカー間の依存関係を解決して適切な順序で並べ替えた調定計画（`OrchestrationPlan`）を生成するレイヤーです。

```
ExecutionPlan (G8-2)
        │
        ▼
[ OrchestrationRequest ]
        │
        ▼
   AgentOrchestrator (Coordination Layer)
        │
        ├── Validate ExecutionPlan
        ├── Build OrchestrationContext
        ├── Resolve Dependencies (Dependency Resolution Contract)
        ├── Generate OrchestrationPlan
        └── Produce OrchestrationResult
        │
        ▼
[ OrchestrationResult ] ──> Execution Pipeline (G8-5)
```

---

## 2. Execution Coordination Flow

1. **Request Intake & Validation**:
   `OrchestrationRequest` を受け取り、内包される `ExecutionPlan` の整合性を検証します。
2. **Context Resolution**:
   オーケストレーション実行コンテキスト `OrchestrationContext` を構築し、現在有効な `runtimeId`, `executionId`, および新規生成する `orchestrationId` を解決します。
3. **Dependency Resolution**:
   依存関係解決規則に従い、複数の Worker 間の先行・後行関係を決定して実行シーケンスを並べ替えます。
4. **Orchestration Plan Generation**:
   `orchestrationId`, `executionId`, `workerIds`（順序付きワーカーID配列）をバインドした `OrchestrationPlan` を決定論的に作成します。
5. **Result Packaging**:
   作成した計画を `OrchestrationResult` としてラップし、後続の実行パイプライン（G8-5）へ引き渡します。

---

## 3. Runtime Contracts (実行時契約)

* **Contract-01: Immutable Models**: 
  `OrchestrationContext`, `OrchestrationPlan`, `OrchestrationRequest`, `OrchestrationResult` のすべてのプロパティは `readonly` とします。
* **Contract-02: Stateless Orchestrator**:
  AgentOrchestrator は内部状態、実行待ちタスクプール、キャッシュ、またはスレッド状態を保持しません。
* **Contract-03: Deterministic Orchestration**:
  同一の `ExecutionPlan` に対しては、常に全く同一の `OrchestrationPlan`（実行順序を含む）を生成することを契約アサーションとします。
* **Contract-04: No Worker Execution**:
  Agent Orchestrator は調停計画生成のみを担当し、この段階では Execution Worker の `execute()` メソッドは呼び出しません。
* **Contract-05: No Persistence**:
  履歴・状態・キャッシュの永続化は行いません。
* **Dependency Resolution Contract (依存関係解決契約)**:
  `AgentOrchestrator` は依存関係を解決する責務を持ちます。ただし、本スプリントでは契約仕様のみを定義し、具体的な解決アルゴリズム（DAG構造の解析やトポロジカルソートなど）は後続のスプリントで実装します。

---

## 4. 将来的な設計拡張ポイント (Architecture Extensibility)

* **`OrchestrationPlan` のプロパティ拡張**:
  現在は最低限のワーカー順序リスト配列（`workerIds`）のみですが、将来的に並列実行や条件分岐を表す依存関係グラフ構造（`dependencyGraph`）、実行段階グループ（`executionGroups`）、および適用する調停戦略（`orchestrationStrategy`）を追加できる設計上の余地が設けられています。
* **`OrchestrationContext` の将来拡張**:
  将来的に、実行範囲や適用ポリシーを制御するために `orchestrationVersion`、`orchestrationScope`、`orchestrationPolicy` などのコンテキスト情報を動的に埋め込めるよう、プロパティの拡張スロットを設けています。
* **Parallel Execution（並列実行制御）の導入**:
  Execution Pipeline（G8-5）において、依存関係のないワーカー同士を非同期かつ安全に並行起動するための実行順序マップ（並列スケジュールトポロジー）への移行を想定しています。
* **Policy Integration（ポリシー統合）**:
  ガバナンスポリシーや信頼スコアをベースに、特定の要件を満たしたワーカーのみをシーケンスに挿入、または検証をスキップする動的変更のための接続ポイントを確保しています。
