# AIOS AI Workforce Execution Contract Specification (Sprint G9-8)

本稿は、AIOS Generation 9 における第8の基礎統合レイヤー「AI Workforce Execution Contract Foundation（実行契約基盤）」の設計仕様書です。本コンポーネントは、AI Workforce Runtime と Generation 8 (Execution Foundation) の間をつなぐ「実行要求の決定論的契約」を定義します。

---

## 1. AI Workforce Architecture

AI Workforce Execution Contract は、AI Workforce Runtime で形成されたコンテキストを Generation 8 Execution Foundation へ引き渡すための表現形式であり、両者の内部ロジックや状態を変更しません。

```
        AI Workforce Execution Contract (G9-8)
                          │
             AI Workforce Runtime (G9-7)
                          │
                AI Assignment (G9-6)
                          │
                  AI Role (G9-5)
                          │
               AI Department (G9-3)
                          │
              AI Organization (G9-4)
                          │
            AI Employee Registry (G9-2)
                          │
                AI Employee (G9-1)
                          │
               Execution Foundation (G8)
```

特定の実行時オブジェクトへ直接依存しないよう、`AIWorkforceExecutionContext` はオブジェクト参照を持たず ID 参照 (`runtimeId`, `assignmentId`, `employeeId`, `roleId`, `organizationId`, `departmentId`) のみを保持します。

---

## 2. Execution Contract (実行契約モデル定義)

すべてのモデルは `readonly` であり不変（Immutable）です。

* **`AIWorkforceExecution`**: 実行要求契約全体を表す集約ルート。
  * `executionId`: 実行要求契約を一意に識別するID。
  * `context`: 静的実行コンテキスト (`AIWorkforceExecutionContext`)。
  * `version`: 実行要求契約のバージョン。
  * `metadata`: （任意）拡張用メタデータ。

* **`AIWorkforceExecutionContext`**: 実行コンテキスト構成要素。
  * `runtimeId`: 関連するランタイムのID。
  * `assignmentId`: 関連する割り当てのID。
  * `employeeId`: 関連する社員のID。
  * `roleId`: 関連する役割のID。
  * `organizationId`: （任意）関連する組織のID。
  * `departmentId`: （任意）関連する部署のID。
  * `metadata`: （任意）拡張用メタデータ。

---

## 3. DTO & Provider Contracts (要求・応答・プロバイダー定義)

* **`AIWorkforceExecutionRequest`**: 実行要求登録 DTO。
  * `execution`: 不変オブジェクト `AIWorkforceExecution`。

* **`AIWorkforceExecutionResponse`**: 実行応答 DTO。
  * `execution`: 対象となる `AIWorkforceExecution`。

* **`AIWorkforceExecutionProvider`**: 実行契約操作プロバイダーインターフェース。
  * `createExecution(request: AIWorkforceExecutionRequest): AIWorkforceExecutionResponse`
  * `getExecution(executionId: string): AIWorkforceExecutionResponse`
  * `listExecutions(): readonly AIWorkforceExecution[]`

---

## 4. 将来的な設計拡張ポイント (Extension Points)

* **Execution Engine Integration**: 将来の Dispatch Engine または Execution Worker において、本 Contract を取得し Generation 8 `ExecutionPipeline` や `WorkerContext` へ変換・ディスパッチする拡張。
* **Remote IPC / Cross-Process Transfer**: ID 専用設計により、プロセス間通信や永続化ストアを経由した分散実行要求のハンドリングが可能。

---

## 5. Testing Strategy (テスト戦略)

1. **Immutability (不変性)**: TypeScript の `readonly` 型安全性の検証。
2. **ID-Only Execution Context Isolation**: `AIWorkforceExecutionContext` が外部オブジェクトに依存せず純粋な識別子のみを保持していることの検証。
3. **Stateless & Deterministic Provider**: モックプロバイダーを用いて決定論的な登録・取得・一覧動作を検証。
