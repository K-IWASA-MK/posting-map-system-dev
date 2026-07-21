# AIOS AI Organization Specification (Sprint G9-4)

本稿は、AIOS Generation 9 における4番目の基礎レイヤー「AI Organization Foundation（組織基盤）」の設計仕様書です。本コンポーネントは、複数の AI Department（部署）を集約する最上位の論理組織単位である「AI Organization（組織）」の不変契約（Contract）を定義します。

---

## 1. AI Workforce Architecture

AI Organization は、AI Workforce OS における最上位のコンテナモデルであり、組織全体を論理的に表現します。

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
        AI Employee Registry (G9-2)
                  │
                  ▼
        AI Employee (G9-1)
```

循環依存を防ぐため、`AIOrganizationDepartment` は `AIDepartment` オブジェクトを包含せず、`departmentId` 参照契約のみを保持します。

---

## 2. Organization Contract (組織モデル定義)

すべてのモデルは `readonly` であり不変（Immutable）です。

* **`AIOrganization`**: 組織全体を表す集約ルート。
  * `organizationId`: 組織を一意に識別するID。
  * `profile`: 組織の属性情報。
  * `departments`: 所属する部署の不変参照リスト（`readonly AIOrganizationDepartment[]`）。
  * `version`: 組織構成のバージョン。
  * `metadata`: （任意）拡張用メタデータ。

* **`AIOrganizationProfile`**: 組織属性情報。
  * `organizationName`: 組織名。
  * `organizationType`: 組織種別。
  * `description`: 組織の目的・説明。
  * `metadata`: （任意）拡張用メタデータ。

* **`AIOrganizationDepartment`**: 部署の参照構成要素。
  * `departmentId`: 部署ID（参照用）。
  * `metadata`: （任意）部署の組織内での割り振りに関するメタデータ。

---

## 3. DTO & Provider Contracts (要求・応答・プロバイダー定義)

* **`AIOrganizationRequest`**: 組織登録・要求 DTO。
  * `organization`: 不変オブジェクト `AIOrganization`。

* **`AIOrganizationResponse`**: 組織応答 DTO。
  * `organization`: 対象となる `AIOrganization`。

* **`AIOrganizationProvider`**: 組織操作プロバイダーインターフェース。
  * `registerOrganization(request: AIOrganizationRequest): AIOrganizationResponse`
  * `getOrganization(organizationId: string): AIOrganizationResponse`
  * `listOrganizations(): readonly AIOrganization[]`

---

## 4. 将来的な設計拡張ポイント (Extension Points)

* **Multi-Organization / Tenant**: 組織間連携、マルチテナントアイソレーション。
* **Organization Hierarchy**: 親組織・子組織階層構造への拡張（将来の Runtime 拡張）。
* **Governance Policy**: 組織単位の実行制限ポリシーやアクセス制御バインディング。

---

## 5. Testing Strategy (テスト戦略)

1. **Immutability (不変性)**: TypeScript の `readonly` 型安全性の検証。
2. **Reference Integrity**: 部署参照が `departmentId` 形式を維持していることの検証。
3. **Stateless & Deterministic Provider**: モックプロバイダーを用いて決定論的な登録・取得・一覧動作を検証。
