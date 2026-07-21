# AIOS AI Workforce Runtime Specification (Sprint G9-7)

本稿は、AIOS Generation 9 における7番目の基盤レイヤー「AI Workforce Runtime Foundation（ランタイム基盤）」の設計仕様書です。本コンポーネントは、これまで構築した Workforce Foundation (Organization, Department, Employee Registry, Employee, Role, Assignment) を実行時に関連付けるための静的不変契約（Contract）を定義します。

---

## 1. AI Workforce Architecture

AI Workforce Runtime は、各 Workforce Foundation オブジェクトを入力として実行時コンテキストを形成する上位レイヤーであり、Foundation オブジェクトの変更は行いません。

```
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

オブジェクト間の循環依存を排除し、分散シリアライズおよび将来の State Machine / Scheduler 連携を容易にするため、`AIWorkforceContext` はオブジェクト参照を持たず ID 参照 (`employeeId`, `roleId`, `assignmentId`, `organizationId`, `departmentId`) のみを保持します。

---

## 2. Runtime Contract (ランタイムモデル定義)

すべてのモデルは `readonly` であり不変（Immutable）です。

* **`AIWorkforceRuntime`**: ランタイム全体を表す集約ルート。
  * `runtimeId`: ランタイムを一意に識別するID。
  * `context`: 静的実行コンテキスト (`AIWorkforceContext`)。
  * `version`: ランタイム構成のバージョン。
  * `metadata`: （任意）拡張用メタデータ。

* **`AIWorkforceContext`**: 静的実行コンテキスト構成要素。
  * `employeeId`: 対象社員のID。
  * `roleId`: 対象役割のID。
  * `assignmentId`: 対象割り当てのID。
  * `organizationId`: （任意）対象組織のID。
  * `departmentId`: （任意）対象部署のID。
  * `metadata`: （任意）拡張用メタデータ。

---

## 3. DTO & Provider Contracts (要求・応答・プロバイダー定義)

* **`AIWorkforceRequest`**: ランタイム登録・作成要求 DTO。
  * `runtime`: 不変オブジェクト `AIWorkforceRuntime`。

* **`AIWorkforceResponse`**: ランタイム応答 DTO。
  * `runtime`: 対象となる `AIWorkforceRuntime`。

* **`AIWorkforceRuntimeProvider`**: ランタイム操作プロバイダーインターフェース。
  * `createRuntime(request: AIWorkforceRequest): AIWorkforceResponse`
  * `getRuntime(runtimeId: string): AIWorkforceResponse`
  * `listRuntimes(): readonly AIWorkforceRuntime[]`

---

## 4. 将来的な設計拡張ポイント (Extension Points)

* **Runtime State Machine**: 将来の Workforce Runtime Engine において、本 Runtime Blueprint を基にした状態遷移 (`INITIALIZING`, `RUNNING`, `PAUSED`, `TERMINATED`) の管理拡張。
* **Dispatch & Scheduler Integration**: 本 Context をディスパッチユニットとして Scheduler や Task Worker への割り当てに展開。

---

## 5. Testing Strategy (テスト戦略)

1. **Immutability (不変性)**: TypeScript の `readonly` 型安全性の検証。
2. **ID-Only Context Isolation**: `AIWorkforceContext` が各 Foundation オブジェクト本体を保持せず、文字列 ID のみを保持していることの検証。
3. **Stateless & Deterministic Provider**: モックプロバイダーを用いて決定論的な登録・取得・一覧動作を検証。
