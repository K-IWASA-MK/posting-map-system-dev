# AIOS Decision Coordination Runtime Specification (Sprint G7-3)

本稿は、AIOS Generation 7 マイクロカーネルにおける「調停レイヤー（Decision Coordination Runtime）」の設計仕様書です。

---

## 1. 役割と責務 (Role & Responsibility)
1. **検証済メッセージの交通整理 (Message Coordination)**:
   `SchemaValidator` による検証をパスしたメッセージ（`ValidationResult.valid === true`）を受け取り、実行対象となる宛先エージェント（`targetAgents`）の解決と遷移状態（`nextStage`）の決定を行います。
2. **ルーティングポリシーの完全分離 (Separated Routing Policy)**:
   プロトコル個別の配信ルールや意味解析に依存せず、すべてのルーティングポリシーを `ProtocolRouteRegistry` に分離してカプセル化します。
3. **決定論の維持 (Deterministic Orchestration)**:
   非同期処理、実行環境の生成、Stripe課金、Staging/Git操作などの副作用を持たず、純粋なステートレス・決定論的関数として動作します。

---

## 2. 調整フロー (Coordination Flow)

```
        Incoming Message (JSON)
                  │
                  ▼
         [ SchemaValidator ]
                  │
             (valid: true)
                  │
                  ▼
       [ DecisionCoordinator ] ───> [ Validation Boundary Check ] (Contract-01)
                  │
                  ▼
     [ ProtocolRouteRegistry ] ───> 静的/動的な宛先エージェントの解決
                  │
                  ▼
       [ Stage Resolution ]    ───> SIGNING, LEDGER_COMMIT 等の遷移状態決定
                  │
                  ▼
     CoordinationResult (Immutable)
```

---

## 3. 状態遷移設計 (Runtime Stage)

`nextStage` は将来のランタイム層（例: 監査 `AUDIT` や自己改善 `LEARNING`）の追加に柔軟に適応できるよう、特定の固定列挙型ではなく文字列（エイリアス `RuntimeStage`）として抽象定義されます。

* **`SIGNING`**: 意思決定（`decision-v1`）メッセージに対し、宛先エージェントによるレビュー・署名を要求するステージ。
* **`LEDGER_COMMIT`**: 合議結果（`consensus-v1`）や確定トランザクションの永続化を要求するステージ（G7-4 Micro Ledger Runtime へ受け渡し）。
* **`REJECTED`**: スキーマ不適合、または宛先エージェント解決不可による却下ステージ。

---

## 4. G7-4 (Micro Ledger Runtime) への接続点

* `DecisionCoordinator` が `accepted: true` かつ `nextStage: 'LEDGER_COMMIT'` を返却した場合、そのメッセージは改ざん不能な監査ログおよびトランザクションブロックとして、後続の `MicroLedger` に安全にコミット（Commit）できる状態を満たします。
* コーディネータの出力する不変な `coordinationId` は、台帳（Ledger）上のトランザクションの追跡キー（Lineage Key）として機能します。
