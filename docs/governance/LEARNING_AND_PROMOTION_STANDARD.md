# Learning & Promotion Standard v1.0 (Generation 9 Phase 5-3)

## 1. 概要と目的 (Overview & Purpose)

### 1.1 Generation 9 における Learning & Promotion
本仕様書は、AIOS Generation 9（AI Company）において、検証済みのパフォーマンス評価結果（Performance Evaluation）に基づき、AI社員（AI Employee）のスキル獲得、熟練度レベルの昇格、ナレッジの組織蓄積、および部署間異動を規定する **Learning & Promotion Standard v1.0** の仕様書である。

本仕様は、根拠なき能力拡張や未検証の権限付与を防止し、事実（Evidence）起点の人材成長と配属決定を標準化する。

### 1.2 コア設計原則: Learning Follows Verified Performance Principle
本仕様は、AI Company の人材育成原則 **`Learning Follows Verified Performance Principle`（検証実績起点成長原則）** に完全準拠する。

```
 [Performance Evaluation (検証結果)] ──► [Learning & Skill Acquisition] ──► [Promotion / Department Transfer]
```

- **実績無き昇格・変更の禁止**: AI社員の学習、スキル獲得、昇格、および部署異動は、事前に検証された Performance Evaluation に基づいてのみ実施される。未評価または未検証の成果を根拠として、組織上の権限、職級、または役割を変更してはならない。

---

## 2. 職級定義と昇格基準 (Skill Progression & Promotion Criteria)

AI社員は、評価スコアに応じて以下の 4 つの職級（Rank）を遷移する。

| 職級 (Rank) | 昇格必要条件 (Required Threshold) | 獲得権限・役割 |
|---|---|---|
| `JUNIOR` | 初期オンボーディング完了 (`CANDIDATE` → `ACTIVE`) | 単一タスクの基本実行。上位指示に従う |
| `MID` | `overallPerformanceScore` ≥ 75.0 (直近1期間) | 標準タスクの自律実行。ツール選択の自由度拡張 |
| `SENIOR` | `overallPerformanceScore` ≥ 85.0 (直近2期間連続) | 複合タスク実行。部門間契約 (Contract) 提案権限 |
| `LEAD` | `overallPerformanceScore` ≥ 92.0 (直近3期間連続) | 部門間レビュー (Review) 承認権限。後輩AIの育成 |

---

## 3. ナレッジ蓄積と部署異動規律 (Knowledge Promotion & Department Transfer)

1. **ナレッジ昇格 (Knowledge Promotion)**:
   `SENIOR` 以上の AI社員が成功させた複雑タスクのエビデンスは、全社共通ナレッジ（`Skill Asset`）として昇格保存され、同部署内の他 AI社員に共有・再利用可能となる。
2. **部署異動規律 (Department Transfer Rules)**:
   AI社員の所属部署（Department）変更は、受入先部署からの部門間相互契約（Contract）に基づき、過去 2 期間の評価スコアが 80.0 以上である場合にのみ実行できる。

---

## 4. 昇格・異動結果構造 (Promotion Result Schema)

昇格および部署異動は、以下の構造を満たす独立した Promotion Record を介して記録されなければならない。

| 項目名 | Data Type | Req/Opt | Description |
|---|---|---|---|
| `promotionId` | `String` | **Required** | 昇格・異動レコードの一意識別子（例: `PRM-2026Q3-001`）。 |
| `employeeId` | `String` | **Required** | 対象 AI社員ID。 |
| `previousRank` | `String` | **Required** | 変更前の職級（例: `JUNIOR`）。 |
| `newRank` | `String` | **Required** | 変更後の職級（例: `SENIOR`）。 |
| `previousDepartmentId` | `String` | **Required** | 異動前の所属部署ID。 |
| `newDepartmentId` | `String` | **Required** | 異動後の所属部署ID（変更なしの場合同値）。 |
| `evaluationIdRef` | `String` | **Required** | 昇格の根拠となった Performance Evaluation ID。 |
| `promotedAt` | `String` | **Required** | 昇格・異動確定日時（ISO 8601 形式）。 |
| `authorizedBy` | `String` | **Required** | 承認主体（`HUMAN_CEO` または `GOVERNANCE_BOARD`）。 |

---

## 5. スコープ境界と範囲外事項 (Scope Boundary & Exclusions)

本スプリント（P5-3）においては、以下の領域を厳格にスコープ外とする。

- **Company Audit**: 全社セキュリティ・コンプライアンス監査仕様は含めない（P5-4の責務）。
- **AI Company Governance**: 最高ガバナンスルールは含めない（P5-5の責務）。
- **KPI Analysis & Analytics**: 全社集計アナリティクスエンジン実装は含めない。
