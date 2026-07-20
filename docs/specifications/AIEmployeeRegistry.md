# AIOS AI Employee Registry Specification (Sprint G9-2)

本稿は、AIOS Generation 9 における2番目の基礎レイヤー「AI Employee Registry Foundation（社員名簿基盤）」の設計仕様書です。本コンポーネントは、AI Employee の管理・登録・検索を定義する不変（Immutable）契約層として機能します。

---

## 1. AI Workforce Architecture

AI Employee Registry は、Workforce（社員組織）内の「社員名簿」の役割を果たします。Workforce Runtime やスケジューラが AI Employee の実態を特定・解決するための共通カタログ仕様を提供します。

```
                 AIOS
                  │
        Execution Foundation (G8)
                  │
        Agent Orchestrator (G8-3)
                  │
                  ▼
        AI Employee Registry (G9-2)
                  │
      ┌───────────┴───────────┐
      ▼                       ▼
 AI Employee (G9-1)     Workforce Policy (Future)
```

本スプリントでは、Registry のデータ表現モデル、Lookup 要求・応答仕様、および名簿を操作するステートレスなプロバイダーインターフェースのみを定義し、永続データストアへの保存、アクティブキャッシュ、トランザクションロックなどは実装しません。

---

## 2. Registry Contract (名簿契約定義)

登録される名簿および各登録レコードは、すべて `readonly` として定義され不変（Immutable）です。

* **`AIEmployeeRegistry`**: 名簿全体を表す集約モデル。
  * `registryId`: 名簿を識別する一意のID。
  * `employees`: 登録されている社員の不変リスト（`readonly AIEmployee[]`）。
  * `version`: 名簿のバージョン（スキーマまたは状態バージョン）。
  * `metadata`: 任意のキー・バリュー形式の拡張メタデータ。

* **`AIEmployeeRegistration`**: 社員登録時の契約レコード。
  * `registrationId`: 一意な登録処理識別ID。
  * `employee`: 登録された `AIEmployee` の情報。
  * `timestamp`: 登録された日時のISO文字列。
  * `metadata`: 任意の登録付加メタデータ。

---

## 3. Lookup Contract (検索要求・応答定義)

条件検索を緩やかに結合するためのモデルです。

* **`AIEmployeeLookupRequest`**:
  * `employeeId`: （任意）社員一意ID。
  * `capability`: （任意）要求されるスキルや能力名。
  * `roleId`: （任意）要求される役割ID。
  * `departmentId`: （任意）要求される部署ID。
  * `metadata`: （任意）将来の属性・タグベース検索用メタデータ（`Readonly<Record<string, unknown>>`）。

* **`AIEmployeeLookupResponse`**:
  * `employees`: 検索条件にマッチした社員リスト（`readonly AIEmployee[]`）。
  * `totalCount`: マッチした総件数。
  * `metadata`: 検索結果に付随する任意のメタデータ。
  * ※ ページングやカーソル情報（`cursor`, `page`, `offset`）は、本 Foundation の責務外（Runtime 責務）とし、含めません。

* **`AIEmployeeRegistryProvider`**: 名簿操作プロバイダーインターフェース。
  * `register(registration: AIEmployeeRegistration): AIEmployeeRegistry`
    社員の新規登録を行い、新たな名簿状態を決定論的に返却する契約。
  * `lookup(request: AIEmployeeLookupRequest): AIEmployeeLookupResponse`
    条件に合致する社員情報を検索する契約。
  * `list(): AIEmployeeRegistry`
    現在登録されているすべての名簿リストを取得する契約。

---

## 4. 将来的な設計拡張ポイント (Extension Points)

* **`AIEmployeeRegistry` メタデータ**:
  * `organizationId`: マルチテナント時の組織識別ID。
  * `lastUpdatedBy`: 名簿を最後に更新したアクターID。
* **`AIEmployeeRegistration` メタデータ**:
  * `registeredBy`: 登録を実施したシステムアクター（管理者、親エージェント）。
  * `auditSignature`: 登録内容の整合性を保証する暗号署名。
* **`AIEmployeeLookupRequest` の拡張**:
  * `tags`: `locale`, `tenant` 等の特定タグによる詳細フィルタリング。
  * `policyHint`: 割り当て制限等のポリシー。

---

## 5. Testing Strategy (テスト戦略)

以下の項目を検証するために十分なユニットテストを作成します：
1. **Immutability (不変性)**: 全モデルプロパティが `readonly` として保護されていること。
2. **Deterministic Lookup/Register**: モックプロバイダーを実装し、登録（`register`）や検索（`lookup`）が同じ入力値に対して決定論的な結果を返すこと。
3. **Stateless Interface Verification**: `AIEmployeeRegistryProvider` インターフェースを実装したクラスが、明示的な状態変数を保持せずに定義されていること。
4. **Structural Validity**: 各モデルが要求されたプロパティを正確に保持していること。
