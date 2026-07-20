# AIOS Agent Runtime Foundation Specification (Sprint G7-5)

本稿は、AIOS Generation 7 ランタイムレイヤーにおける「エージェント実行基盤（Agent Runtime Foundation）」の設計仕様書です。

---

## 1. 役割と責務 (Role & Responsibility)
1. **ランタイムとカーネルの分離 (Kernel/Runtime Separation)**:
   事実を記録・検証するカーネル（`aios/kernel/`）から、エージェントの実行制御を行うランタイム（`aios/runtime/`）を物理ディレクトリレベルで分離し、OSレイヤーとしての責務を明確にします。
2. **実行要求（ExecutionRequest）の生成**:
   台帳（`LedgerEntry`）の内容から、エージェントが実行可能な標準要求仕様（`ExecutionRequest`）および不変な実行メタデータ（`AgentContext`）を構築します。
3. **ライフサイクル管理とセッション情報の提供**:
   各実行単位のライフサイクル（CREATED ──> READY ──> COMPLETED / FAILED）とセッション情報を不変かつ決定論的に管理します。
4. **知能・実行コードの非内包 (No LLM / No Action Execution)**:
   本ランタイムは、LLM（AI推論）の呼び出しやツール実行などの具現化コードを内包せず、後続の `Agent Registry` (G7-6) や `Communication Bus` (G7-7) に処理要求を受け渡すための「入出力の標準器」に徹します。

---

## 2. 処理フロー (Runtime Flow)

```
        Micro Ledger (LedgerEntry)
                  │
                  ▼
         [ AgentRuntime.ts ]
                  │
        [ Validate Ledger Invariant ] (Contract-01)
                  │
                  ▼
       [ Deterministic ID Resolve ] ──> sessionId, requestId の導出
                  │
                  ▼
      [ Build AgentContext.ts ]    ──> エージェント固有の不変コンテキスト
                  │
                  ▼
   [ Build ExecutionRequest.ts ]   ──> 標準実行要求オブジェクトの生成
                  │
                  ▼
          ExecutionRequest
                  │
                  ▼
         Agent Registry (G7-6)
```

---

## 3. ID 決定論と一意性の両立 (ID Determinism Policy)

実行コンテキストおよび要求の一意性と、決定論的アサーション（Contract-04）を完全に両立させるため、各種IDは実行時刻（timestamp）やランダム文字列に依存せず、入力値のみから一意かつ一貫して導出されます。

* **Session ID (`sessionId`)**:
  `session-${ledgerEntry.ledgerId}-${targetAgent}`
* **Request ID (`requestId`)**:
  `req-${sessionId}`

これにより、同一の台帳ブロックと対象エージェントに対して `createSession()` を複数回呼び出した場合でも、完全に同一のハッシュ・ID属性を有する不変オブジェクトが再現され、ハッシュ衝突や競合が防止されます。

---

## 4. セッション状態遷移設計 (Session Lifecycle State)

将来的な非同期タスクキャンセルやタイムアウト処理に対応するため、`RuntimeSession` の状態遷移（`RuntimeState`）は拡張可能な状態で規定されます。

* **`CREATED`**: セッションおよび要求オブジェクトが生成された初期状態（デフォルト）。
* **`READY`**: エージェントが必要な能力（Capability）とコンテキスト情報をバインドし、実行可能になった状態。
* **`COMPLETED`**: 後続のエージェント実行ランタイムが処理を完遂した状態。
* **`FAILED`**: 実行中にエラーや例外が検知され、セッションが終了した状態。
* **将来拡張スロット**: キャンセル（`CANCELLED`）、タイムアウト（`TIMEOUT`）、一時停止（`SUSPENDED`）等のステータス追加を許容する設計とします。
