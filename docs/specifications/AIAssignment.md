# AIOS AI Assignment Specification (Sprint G9-6)

本稿は、AIOS Generation 9 における6番目の基礎レイヤー「AI Assignment Foundation（割り当て基盤）」の設計仕様書です。本コンポーネントは、AI Employee・AI Role・Assignment Target を結び付ける「仕事の割り当て契約」を表す静的不変契約（Contract）を定義します。

---

## 1. AI Workforce Architecture

AI Assignment は、AI Workforce OS において仕事の割り当て関係を表す契約モデルであり、Employee、Role、Target を ID 参照によって結合します。

```
                 AIOS
                  │
        Execution Foundation (G8)
                  │
        Agent Orchestrator (G8-3)
                  │
                  ▼
        AI Organization (G9-4)
                  │
                  ▼
        AI Department (G9-3)
                  │
                  ▼
        AI Role (G9-5)
                  │
                  ▼
        AI Assignment (G9-6)
                  │
                  ▼
        AI Employee Registry (G9-2)
                  │
                  ▼
        AI Employee (G9-1)
```

特定の業務ドメインへの密結合を避けるため、`AIAssignmentTarget` は `targetId` および `targetType` による一般的な参照契約モデルとして設計されます。

---

## 2. Assignment Contract (割り当てモデル定義)

すべてのモデルは `readonly` であり不変（Immutable）です。

* **`AIAssignment`**: 割り当て全体を表す集約ルート。
  * `assignmentId`: 割り当てを一意に識別するID。
  * `profile`: 割り当ての属性情報。
  * `target`: 割り当て対象の参照情報 (`AIAssignmentTarget`)。
  * `employeeId`: 割り当てる社員のID（参照用）。
  * `roleId`: 割り当てる役割のID（参照用）。
  * `version`: 割り当て構成のバージョン。
  * `metadata`: （任意）拡張用メタデータ。

* **`AIAssignmentProfile`**: 割り当て属性情報。
  * `assignmentName`: 割り当て名（例: `'Daily Code Audit'`）。
  * `assignmentType`: 割り当て種別（例: `'SCHEDULED'`, `'ON_DEMAND'`）。
  * `description`: 割り当ての詳細説明。
  * `metadata`: （任意）拡張用メタデータ。

* **`AIAssignmentTarget`**: 割り当て対象の参照構成要素。
  * `targetId`: 対象物を一意に識別するID。
  * `targetType`: 対象物の種別（例: `'DOCUMENT'`, `'TASK'`, `'PROJECT'`）。
  * `metadata`: （任意）拡張用メタデータ。

---

## 3. DTO & Provider Contracts (要求・応答・プロバイダー定義)

* **`AIAssignmentRequest`**: 割り当て登録要求 DTO。
  * `assignment`: 不変オブジェクト `AIAssignment`。

* **`AIAssignmentResponse`**: 割り当て応答 DTO。
  * `assignment`: 対象となる `AIAssignment`。

* **`AIAssignmentProvider`**: 割り当て操作プロバイダーインターフェース。
  * `registerAssignment(request: AIAssignmentRequest): AIAssignmentResponse`
  * `getAssignment(assignmentId: string): AIAssignmentResponse`
  * `listAssignments(): readonly AIAssignment[]`

---

## 4. 将来的な設計拡張ポイント (Extension Points)

* **Scheduler / Dispatch Integration**: 将来の Workforce Runtime または Scheduler レイヤーにおいて、本 Assignment を入力として実行計画・キューを組み立てる拡張。
* **Target Domains**: `'TASK'`, `'WORKFLOW'`, `'PROJECT'`, `'EXTERNAL_RESOURCE'` 等、任意の業務ドメイン対象をカバー可能。

---

## 5. Testing Strategy (テスト戦略)

1. **Immutability (不変性)**: TypeScript の `readonly` 型安全性の検証。
2. **Domain Decoupling & ID Reference**: Employee/Role/Target が直接の型依存を持たず参照契約となっていることの検証。
3. **Stateless & Deterministic Provider**: モックプロバイダーを用いて決定論的な登録・取得・一覧動作を検証。
