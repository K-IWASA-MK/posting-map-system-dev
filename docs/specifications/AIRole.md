# AIOS AI Role Specification (Sprint G9-5)

本稿は、AIOS Generation 9 における5番目の基礎レイヤー「AI Role Foundation（役割基盤）」の設計仕様書です。本コンポーネントは、AI Employee が組織内で担う「役割（Responsibility）」を表す静的不変契約（Contract）を定義します。

---

## 1. AI Workforce Architecture

AI Role は、組織（Organization/Department）と AI Employee の間に位置し、「誰が何を担うか」を定義する契約モデルです。Capability（実行能力）や Permission（権限）とは明確に分離されています。

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
        AI Employee Registry (G9-2)
                  │
                  ▼
        AI Employee (G9-1)
```

---

## 2. Role Contract (役割モデル定義)

すべてのモデルは `readonly` であり不変（Immutable）です。

* **`AIRole`**: 役割全体を表す集約ルート。
  * `roleId`: 役割を一意に識別するID。
  * `profile`: 役割の属性情報。
  * `responsibilities`: 役割が持つ担当責務の不変リスト（`readonly AIRoleResponsibility[]`）。
  * `version`: 役割構成のバージョン。
  * `metadata`: （任意）拡張用メタデータ。

* **`AIRoleProfile`**: 役割属性情報。
  * `roleName`: 役割名（例: `'QA Engineer'`, `'Security Officer'`）。
  * `roleType`: 役割種別（例: `'LEAD'`, `'MEMBER'`, `'SPECIALIST'`）。
  * `description`: 役割の詳細説明。
  * `metadata`: （任意）拡張用メタデータ。

* **`AIRoleResponsibility`**: 役割が担当する責務。
  * `responsibilityId`: 責務を一意に識別するID。
  * `responsibilityName`: 責務名（例: `'Integration Test Execution'`, `'Code Review'`）。
  * `description`: （任意）責務の概要説明。
  * `metadata`: （任意）拡張用メタデータ。

---

## 3. DTO & Provider Contracts (要求・応答・プロバイダー定義)

* **`AIRoleRequest`**: 役割登録要求 DTO。
  * `role`: 不変オブジェクト `AIRole`。

* **`AIRoleResponse`**: 役割応答 DTO。
  * `role`: 対象となる `AIRole`。

* **`AIRoleProvider`**: 役割操作プロバイダーインターフェース。
  * `registerRole(request: AIRoleRequest): AIRoleResponse`
  * `getRole(roleId: string): AIRoleResponse`
  * `listRoles(): readonly AIRole[]`

---

## 4. 将来的な設計拡張ポイント (Extension Points)

* **Capability / Permission のバインディング**: 将来の Assignment や Policy レイヤーにおいて、Role に対して Capability 要求や Permission ポリシーを紐付ける拡張。
* **Role Hierarchy**: ロールの継承や包括関係（将来の拡張）。

---

## 5. Testing Strategy (テスト戦略)

1. **Immutability (不変性)**: TypeScript の `readonly` 型安全性の検証。
2. **Structural Integrity & Decoupling**: Capability/Permission と混同せず、純粋な責務 (`AIRoleResponsibility`) を保持していることの検証。
3. **Stateless & Deterministic Provider**: モックプロバイダーを用いて決定論的な登録・取得・一覧動作を検証。
