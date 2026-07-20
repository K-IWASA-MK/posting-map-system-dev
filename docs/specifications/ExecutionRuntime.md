# AIOS Execution Runtime Specification (Sprint G8-2)

本稿は、AIOS Generation 8 実行環境における「Execution Runtime（実行計画調定層）」の設計仕様書です。本コンポーネントは、Execution Planning Layer として動作し、スケジューラ結果をワーカー計画へ変換する責務を規定します。

---

## 1. Execution Runtime Architecture

Execution Runtime は、Runtime Layer の最上位にあたるスケジューラ結果（`ScheduleResult`）を入力として受け取り、実行エンジンである Worker に適合した実行予定指示（`ExecutionPlan`）を調定する層です。

```
ScheduleResult (G7-8)
        │
        ▼
[ RuntimeExecutionRequest ]
        │
        ▼
   ExecutionRuntime (Planning Layer)
        │
        ├── Validate ScheduleResult (Validation Contract)
        ├── Build ExecutionContext
        ├── Generate ExecutionPlan
        └── Produce RuntimeExecutionResult
        │
        ▼
[ RuntimeExecutionResult ] ──> Execution Worker (G8-1)
```

---

## 2. Planning Flow

1. **Request Intake & Validation**:
   `RuntimeExecutionRequest` を受け取り、内包される `ScheduleResult` の整合性を検証します。
2. **Context Resolution**:
   実行コンテキスト `ExecutionContext` を構築し、現在有効な `runtimeId`, `sessionId`, および新規生成する `executionId` を解決します。
3. **Execution Plan Generation**:
   `executionId`, `workerId`, `requestId` をバインドした `ExecutionPlan` を決定論的に作成します。
4. **Result Packaging**:
   作成した計画を `RuntimeExecutionResult` としてラップし、後続の実行エンジンへ引き渡します。

---

## 3. Runtime Contracts (実行時契約)

* **Contract-01: Immutable Models**: 
  `ExecutionContext`, `ExecutionPlan`, `RuntimeExecutionRequest`, `RuntimeExecutionResult` のすべてのプロパティは `readonly` とします。
* **Contract-02: Stateless Runtime**:
  ExecutionRuntime は自身の内部にキュー、バッファ、または実行スレッド状態を保持しません。
* **Contract-03: Deterministic Planning**:
  同一の `ScheduleResult` に対しては、常に全く同一の `ExecutionPlan` を生成することを契約アサーションとします。
* **Contract-04: No Worker Execution**:
  Execution Runtime は計画生成のみを担当し、この段階では Execution Worker の `execute()` メソッドは呼び出しません。
* **Contract-05: No Persistence**:
  履歴・状態・キャッシュの永続化は行いません。
* **Validation Contract (妥当性検証契約)**:
  `ExecutionRuntime` は入力（`ScheduleResult`）の妥当性を確認する責務を持ちます。ただし、本スプリントでは検証契約インタフェースのみを定義し、具体的なスキーマ検証や外部ポリシーに対する詳細検証ロジックは実装しません。

---

## 4. 将来的な設計拡張ポイント (Architecture Extensibility)

* **`ExecutionPlan` のプロパティ拡張**:
  現在は最低限の計画 ID とワーカー・リクエストの紐付けのみですが、将来的に実行優先度（`priority`）、実行戦略（`executionStrategy`）、および実行時制約（`executionPolicy`）を差し込み、高度な実行戦略を実行エンジンに指令できるよう拡張可能な構造になっています。
* **`RuntimeExecutionResult` の出力拡張**:
  将来的に、実行計画の決定過程を示すメタデータ（`planningMetadata`）、入力データの整合性チェック結果（`validationResult`）、および実行トレース診断情報（`diagnostics`）を追加できるように設計上の余地が設けられています。
* **Execution Strategy と Worker Selection**:
  G8-3（Agent Orchestrator）との接続において、メッセージの性質（プロトコルや送信元・先情報）に応じて動的に対象 Worker を選択する Worker Selection アルゴリズムをプラグイン可能にするための拡張ポイントが用意されています。
