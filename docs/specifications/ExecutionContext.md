# AIOS Execution Context Specification (Sprint G8-4)

本稿は、AIOS Generation 8 実行環境における「Execution Context（実行状態コンテキスト）」の設計仕様書です。本コンポーネントは、Execution State Layer として動作し、各種 Runtime レイヤー間で共有される実行状態の基礎定義を規定します。

---

## 1. Execution Context Architecture

Execution Context は、オーケストレーション計画（`OrchestrationPlan`）から得られる情報をベースに、実行単位ごとのセッション情報やランタイム境界を一貫した形で下流レイヤー（Execution Pipeline、Execution Result、Execution Lifecycle など）に伝播（propagation）させるための層です。

```
OrchestrationPlan (G8-3)
        │
        ▼
[ ExecutionContextRequest ]
        │
        ▼
   ExecutionContextProvider (State Layer)
        │
        ├── Validate Context Request
        ├── Resolve Execution Context (Context Resolution Contract)
        ├── Build ExecutionContextState
        └── Produce ExecutionContextResult
        │
        ▼
[ ExecutionContextResult ] ──> Execution Pipeline (G8-5)
```

---

## 2. Context Resolution Flow

1. **Request Intake & Validation**:
   `ExecutionContextRequest` を受け取り、内包される `OrchestrationPlan` が正しく存在するかを検証します。
2. **Context Resolution**:
   要求パラメータから `executionId`, `orchestrationId`, 現在稼働する `runtimeId`、および一意な実行空間を表す `sessionId` を解決します。
3. **ExecutionContextState Build**:
   解決された不変の `ExecutionContextState` オブジェクトを組み立てます。
4. **Result Packaging**:
   作成した状態オブジェクトを `ExecutionContextResult` としてラップし、下流の Pipeline 層へ伝播します。

---

## 3. Runtime Contracts (実行時契約)

* **Contract-01: Immutable Models**: 
  `ExecutionContextState`, `ExecutionContextScope`, `ExecutionContextRequest`, `ExecutionContextResult` のすべてのプロパティは `readonly` とします。
* **Contract-02: Stateless Provider**:
  ExecutionContextProvider は内部状態、キャッシュ、履歴、または接続情報などを保持しない純粋関数的な振る舞いを行います。
* **Contract-03: Deterministic Context Resolution**:
  同一の `OrchestrationPlan` に対しては、常に全く同一の `ExecutionContextState` が決定論的に生成されることをアサーション契約とします。
* **Contract-04: No Runtime Mutation**:
  本スプリントでは不変コンテキストの定義と生成インタフェースの作成のみに注力し、実行の進行に伴うコンテキストの動的更新（Mutation）は行いません。
* **Contract-05: No Persistence**:
  コンテキストのストレージやキャッシュへの永続化は行いません。
* **Context Resolution Contract (コンテキスト解決契約)**:
  `ExecutionContextProvider` は Execution Context の解決責任を負います。ただし、本スプリントでは契約インタフェースの定義のみを行い、具体的な解決アルゴリズム（複雑なセッション管理や階層マッピングなど）は後続のスプリントで実装します。

---

## 4. 将来的な設計拡張ポイント (Architecture Extensibility)

* **`ExecutionContextState` のプロパティ拡張**:
  現在は最低限の識別IDのみですが、将来的な拡張として以下のような実行時メタデータを格納可能にするため、あらかじめ拡張用プロパティのスロットが確保されています。
  - `executionLabels`: 実行処理にバインドする静的・動的ラベル（タグ）。
  - `runtimeMetadata`: ランタイム実行時の環境メタデータ。
  - `securityContext`: セキュリティトークンや権限セット。
  - `traceContext`: 分散トレース用のシリアライズされたスパンID等。
* **`ExecutionContextScope` の階層構造化**:
  現在は `scopeId` と `scopeName` のみですが、ネストされたサブスコープや並列コルーチンスコープを表現するために、将来的に `scopeType` や親スコープへの参照 `parentScopeId` を追加できるよう考慮して定義されています。
* **Context Propagation Contract（コンテキスト伝播ルール）**:
  Execution Pipeline（G8-5）以降において、非同期タスクが異なるスレッドやワーカー境界を越える際、本コンテキスト情報が脱落せず確実に引き継がれるためのシリアライズ/デシリアライズ契約への拡張を想定しています。
