# Task Handoff Standard v1.0 (Generation 9 Phase 4-2)

## 1. 概要と目的 (Overview & Purpose)

### 1.1 Generation 9 における Task Handoff
本仕様書は、AIOS Generation 9（AI Company）において、部門間相互契約（Inter-Department Contract）に基づき作成された成果物、タスク責任、および所有権（Ownership）を他部署へ安全に移転・バトンリレーする規則を規定する **Task Handoff Standard v1.0** の仕様書である。

本仕様は、契約（P4-1）が定義した「約束」を受け、実際に成果物と責任のバトンを渡す「受渡しプロトコル」を決定論的に標準化する。

### 1.2 コア設計原則: Ownership Transfers Only Through Handoff Principle
本仕様は、AI Company の新たな責任移転原則 **`Ownership Transfers Only Through Handoff Principle`（ハンドオフ限定所有権移転原則）** に完全準拠する。

```
 [Source Department] ─── (Formal Handoff Record) ───► [Target Department]
```

- **所有権移転の明示**: Task・成果物・責任の所有権は、本仕様で定義された正規の Handoff レコードを通じてのみ移転できる。いかなる部署も、正式な Handoff 手続きを経ずに他部署の成果物や責任を暗黙的に引き継いだり操作したりしてはならない。

---

## 2. ハンドオフ構造とプロトコル (Handoff Schema & Protocol)

部門間ハンドオフは、以下のデータ構造を満たす独立した Handoff レコードを介して実行されなければならない。

| 項目名 | Data Type | Req/Opt | Description |
|---|---|---|---|
| `handoffId` | `String` | **Required** | ハンドオフの一意識別子（例: `HDF-20260724-001`）。 |
| `contractId` | `String` | **Required** | 根拠となる部門間相互契約ID（例: `CNT-DEV-QA-20260724-01`）。 |
| `sourceDepartmentId` | `String` | **Required** | 移転元（ハンドオフ発行）部署ID。 |
| `targetDepartmentId` | `String` | **Required** | 移転先（成果物受領）部署ID。 |
| `outputDeliverableRefs` | `Array<String>` | **Required** | 引き渡却される成果物参照（ファイルパス・リポジトリハッシュ等）。 |
| `transferredOwnershipAt` | `String` | **Required** | 所有権移転確定日時（ISO 8601 形式）。 |
| `status` | `String` | **Required** | `PENDING_ACCEPTANCE`, `ACCEPTED`, `REJECTED_INVALID_DELIVERABLE` の 3 状態。 |

---

## 3. ハンドオフ検証と差戻し規律 (Validation & Rejection Rules)

1. **受領受諾 (Accepted)**:
   移転先部署（Target Department）が提出成果物と SLA 条件を検証し、適合している場合にステータスを `ACCEPTED` へ更新する。この時点で所有権が正式に移転する。
2. **成果物不適合による差戻し (Rejected Invalid Deliverable)**:
   成果物のスキーマ不一致、不足、または検証不合格が判明した場合、移転先部署は `REJECTED_INVALID_DELIVERABLE` を返し、所有権の受領を拒否する。
3. **契約義務の継続**:
   差戻しが発生した場合、所有権は移転元部署（Source Department）に留まり、再作成または修正の責任を負う。

---

## 4. スコープ境界と範囲外事項 (Scope Boundary & Exclusions)

本スプリント（P4-2）においては、以下の領域を厳格にスコープ外とする。

- **Inter-Department Review**: 部門間レビューの手順・詳細ロジックは含めない（P4-3の責務）。
- **Collaboration Evidence**: ハンドオフ検証のエビデンス収集モデルは含めない（P4-4の責務）。
- **Department Governance**: 競合解消・紛争調停は含めない（P4-5の責務）。
- **SLA Monitoring & KPI**: SLA 自動監視コードや組織KPIは含めない。
