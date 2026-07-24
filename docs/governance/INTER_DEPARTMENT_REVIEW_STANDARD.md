# Inter-Department Review Standard v1.0 (Generation 9 Phase 4-3)

## 1. 概要と目的 (Overview & Purpose)

### 1.1 Generation 9 における Inter-Department Review
本仕様書は、AIOS Generation 9（AI Company）において、受諾またはバトンリレーされた成果物に対し、担当部署（例: QA品質管理部、セキュリティ部）が客観的・独立した立場から品質審査・レビューを実施するプロトコルを規定する **Inter-Department Review Standard v1.0** の仕様書である。

本仕様は、部門間相互契約（P4-1）およびハンドオフ（P4-2）に基づき提出された Deliverables が、全社基準を満たしているかを検証する独立した品質関門を定義する。

### 1.2 コア設計原則: Independent Review Principle
本仕様は、AI Company の新たなレビュー原則 **`Independent Review Principle`（独立審査原則）** に完全準拠する。

```
 [Author Department (作成部署)] ───► [Deliverables (成果物)] ───► [Reviewing Department (審査部署)]
                                                                               │
                                                                               ▼
                                                                     [PASS / FAIL Decision]
```

- **独立した立場での審査**: レビュー評価を担当する部署（Reviewing Department）は、成果物を客観的・独立した立場で評価しなければならない。作成部署の内部都合、推測、または未提示の内部状態に依存してはならず、レビュー判定は提出された成果物（Deliverable）および事前定義された検証基準のみに基づいて決定されなければならない。

---

## 2. 部門間レビュープロトコルと構造 (Review Protocol & Schema)

部門間レビュー結果は、以下の構造を満たす独立した Review Record を介して出力・記録されなければならない。

| 項目名 | Data Type | Req/Opt | Description |
|---|---|---|---|
| `reviewId` | `String` | **Required** | レビューの一意識別子（例: `REV-QA-20260724-001`）。 |
| `contractId` | `String` | **Required** | 根拠となる部門間相互契約ID。 |
| `handoffId` | `String` | **Required** | 対象ハンドオフID（任意または直近のハンドオフ）。 |
| `reviewingDepartmentId` | `String` | **Required** | レビューを担当した部署ID（例: `DEPT_QA_QUALITY`）。 |
| `targetDeliverableRef` | `String` | **Required** | 審査対象となった成果物参照（リポジトリパス・ハッシュ）。 |
| `reviewOutcome` | `String` | **Required** | 審査結果（`PASS`, `FAIL_RETRY`, `FAIL_BLOCKED` の 3 状態）。 |
| `feedbackSummary` | `String` | **Required** | 判定理由および不適合箇所のフィードバック要約。 |
| `reviewedAt` | `String` | **Required** | レビュー実施日時（ISO 8601 形式）。 |

---

## 3. レビュー判定基準とフィードバック規律 (Decision Criteria & Feedback)

### 3.1 3 段階の判定結果 (Review Outcomes)

1. **`PASS` (合格)**:
   提出成果物が事前定義された品質基準、テストカバレッジ、または仕様を満たし、無条件で承認された状態。
2. **`FAIL_RETRY` (要修正・再試行)**:
   軽微な不具合やスキーマ不一致が検出されたが、作成部署において修正・再提出が可能な状態。
3. **`FAIL_BLOCKED` (致命的差戻し)**:
   設計違反、セキュリティ問題、または回復不能な仕様欠陥が検出され、タスク進行がブロックされた状態。

### 3.2 フィードバックプロトコル
- 判定結果が `FAIL_RETRY` または `FAIL_BLOCKED` の場合、レビュー部署は具体的な非適合項目および修正アドバイスを `feedbackSummary` に構造化して提示しなければならない。

---

## 4. スコープ境界と範囲外事項 (Scope Boundary & Exclusions)

本スプリント（P4-3）においては、以下の領域を厳格にスコープ外とする。

- **Collaboration Evidence Model**: レビュー検証証跡のメタデータ保存・改ざん防止モデルは含めない（P4-4の責務）。
- **Department Governance**: 部門間競合解消・エスカレーション統制は含めない（P4-5の責務）。
- **SLA Monitoring & Analytics**: SLA 監視システムや部門別KPI測定コードは含めない。
