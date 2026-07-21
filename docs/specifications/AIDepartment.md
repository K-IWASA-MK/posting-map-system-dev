# AIOS AI Department Specification (Sprint G9-3)

本稿は、AIOS Generation 9 における3番目の基礎レイヤー「AI Department Foundation（部署基盤）」の設計仕様書です。本コンポーネントは、AI Employee の集約単位であり、組織構造の要素となる「AI Department（部署）」の静的不変契約（Contract）を定義します。

---

## 1. AI Workforce Architecture

AI Department は、AI Workforce における部署単位を表す構造的モデルです。AI Employee を一括して管理・参照するための静的バインディング仕様を提供します。

```
                 AIOS
                  │
        Execution Foundation (G8)
                  │
        Agent Orchestrator (G8-3)
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

循環参照を防ぐため、`AIDepartmentMember` は `AIEmployee` オブジェクト本体を直接抱え込まず、`employeeId` による参照ID保持のみを行ないます。

---

## 2. Department Contract (部署モデル定義)

すべてのプロパティは `readonly` であり、一度定義されたモデルは不変（Immutable）として扱われます。

* **`AIDepartment`**: 部署全体を表す集約ルート。
  * `departmentId`: 部署を一意に識別するID。
  * `profile`: 部署の属性・定義情報。
  * `members`: 所属メンバーの不変リスト（`readonly AIDepartmentMember[]`）。
  * `version`: 部署構造のバージョン。
  * `metadata`: （任意）拡張用メタデータ。

* **`AIDepartmentProfile`**: 部署属性情報。
  * `departmentName`: 部署名。
  * `departmentType`: 部署種別。
  * `description`: 部署概要。
  * `metadata`: （任意）表示用カラーやラベル等の付加メタデータ。

* **`AIDepartmentMember`**: 部署メンバー構成要素。
  * `employeeId`: メンバーの社員ID（参照用）。
  * `roleId`: 部署内での役職・ロールID。
  * `metadata`: （任意）メンバー固有付加情報。

---

## 3. DTO & Provider Contracts (要求・応答・プロバイダー定義)

* **`AIDepartmentRequest`**: 部署登録・更新等のリクエスト DTO。
  * `department`: 不変オブジェクト `AIDepartment`。

* **`AIDepartmentResponse`**: 部署情報レスポンス DTO。
  * `department`: 対象となる `AIDepartment`。

* **`AIDepartmentProvider`**: 部署操作プロバイダーインターフェース。
  * `registerDepartment(request: AIDepartmentRequest): AIDepartmentResponse`
  * `getDepartment(departmentId: string): AIDepartmentResponse`
  * `listDepartments(): readonly AIDepartment[]`

---

## 4. 将来的な設計拡張ポイント (Extension Points)

* **`AIDepartmentProfile` 拡張**: `color`, `icon`, `labels`, `locale` 等のメタデータ拡張。
* **`AIDepartmentMember` 拡張**: 参加日時、権限レベルスコア等。
* **上位構造（Organization）接続**: 将来の Sprint G9-4 において、上位組織モデル (`AIOrganization`) の子要素として参照可能。

---

## 5. Testing Strategy (テスト戦略)

1. **Immutability (不変性)**: TypeScript の `readonly` 型安全性の検証。
2. **Reference Integrity**: メンバーが `employeeId` による参照形式を保持し循環参照がないことの検証。
3. **Stateless & Deterministic Provider**: モックプロバイダーを用いて決定論的な登録・取得・一覧動作を検証。
