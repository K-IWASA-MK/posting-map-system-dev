# Department Collaboration Standard v1.0 (Generation 9 Phase 4-1)

## 1. 概要と目的 (Overview & Purpose)

### 1.1 Generation 9 における Department Collaboration
本仕様書は、AIOS Generation 9（AI Company）において、AI社員が所属する部署（Department）間で業務連携を行う際の契約構造および責任境界モデルを規定する **Department Collaboration Standard v1.0** の仕様書である。

Phase 1〜3 で確立された「個人の自律業務実行」の基盤の上に、部署間の疎結合かつ厳格な「相互契約（Contract）」による組織的協調モデルを構築する。

### 1.2 コア設計原則: Collaboration & Responsibility Principles
本仕様は、AI Company 第10および第11基本原則に完全準拠する。

1. **`Collaboration Through Contracts Principle`（契約協調原則）**:
   - 部署間の協力は、明示された契約（Contract）によって行われる。部署は他部署の内部状態やリソースを直接書き換えたり侵襲操作してはならない。
2. **`Explicit Responsibility Principle`（明示的責任原則）**:
   - すべての部門間連携において、責任を持つ主責任部署（Owner Department）および依頼先部署（Executing/Collaborating Department）が明示されなければならない。責任が曖昧な協調は認めない。

```
 [Requesting Department] ─── (Inter-Department Contract) ───► [Executing Department]
```

---

## 2. 部門間相互契約モデル (Inter-Department Contract Model)

部署間の業務依頼および協調は、以下の契約スキーマ（Contract Schema）を満たす独立オブジェクトを介して締結されなければならない。

| 項目名 | Data Type | Req/Opt | Description |
|---|---|---|---|
| `contractId` | `String` | **Required** | 契約の一意識別子（例: `CNT-DEV-QA-20260724-01`）。 |
| `requestingDepartmentId` | `String` | **Required** | 依頼元部署ID（例: `DEPT_SOFTWARE_DEV`）。 |
| `executingDepartmentId` | `String` | **Required** | 依頼先/受託部署ID（例: `DEPT_QA_QUALITY`）。 |
| `contractType` | `String` | **Required** | 契約種別（例: `CODE_REVIEW`, `SECURITY_AUDIT`, `DATA_EXTRACTION`）。 |
| `serviceLevelAgreement` | `Object` | **Required** | 履行条件・期限・品質基準要件。 |
| `deliverablesDefinition` | `Array<String>` | **Required** | 契約履行時に提出すべき成果物の要件定義。 |
| `status` | `String` | **Required** | 契約状態（`PROPOSED`, `ACCEPTED`, `IN_PROGRESS`, `FULFILLED`, `REJECTED`）。 |

---

## 3. 責任境界モデル (Responsibility Boundary Rules)

1. **主責任部署 (Owner Department)**:
   タスク全体の目的達成および最終責任を負う部署。受諾した成果物が要件を満たしているか確認する権利を持つ。
2. **受託部署 (Executing Department)**:
   契約（Contract）に基づき特定のサブタスク（レビュー、検証、抽出等）を自律実行する責任を負う部署。
3. **カプセル化保護 (Encapsulation Protection)**:
   受託部署は自身の内部ロジックや作業セッション（Work Session）を隠蔽し、契約で定義された `Deliverables` のみを返却する。

---

## 4. スコープ境界と範囲外事項 (Scope Boundary & Exclusions)

本スプリント（P4-1）においては、以下の領域を厳格にスコープ外とする。

- **Task Handoff Specification**: 成果物の具体的バトンリレー・ハンドオフフローは含めない（P4-2の責務）。
- **Inter-Department Review**: 部門間レビューの手順・判定ロジックは含めない（P4-3の責務）。
- **Collaboration Evidence**: 部門間連携のエビデンス収集モデルは含めない（P4-4の責務）。
- **Department Governance**: 部門間競合解消・ルール統制は含めない（P4-5の責務）。
