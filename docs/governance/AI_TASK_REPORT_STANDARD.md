# AI Task Report Standard v1.0 (Generation 9 Phase 2-5)

## 1. 概要と目的 (Overview & Purpose)

### 1.1 Generation 9 における Task Report の定義
本仕様書は、AIOS Generation 9（AI Company）において、AI社員が遂行したタスク（Task）および収集された品質証跡（Evidence）に基づき、成果と検証結果を人間（CEO）や上詞AIへ伝達するための要約報告モデルを規定する **AI Task Report Standard v1.0** の仕様書である。

Generation 9 において、Report（報告）とは**「確定した事実（Evidence）を参照・要約し、人間（CEO）の最終承認（Proceed）または後続工程への共有を行うコミュニケーション成果物」**である。

### 1.2 コア設計原則: Report References Evidence Principle
本仕様は、AI Company の新たな品質原則 **`Report References Evidence Principle`（報告参照証跡原則）** に完全準拠する。

```
 [Evidence (Fact)] ─── (Referenced / 事実の参照) ───► [Report (Summary)]
```

- **事実と報告の分離**: Evidence が「客観的事実（Fact）」であり、Report は「事実に基づく報告（Summary）」である。
- **証跡非代行原則**: Report は Evidence を要約・参照する層であり、Evidence そのものを置き換えたり、Evidence が存在しない状態で報告のみを捏造・作成したりしてはならない。

---

## 2. Report 属性構造とスキーマ (Schema Specification)

Task Report を表現するデータ構造は、以下の標準属性を満たさなければならない。

| 項目名 | Data Type | Req/Opt | Purpose | Description |
|---|---|---|---|---|
| `specificationVersion` | `String` | **Required** | 仕様バージョン | 本仕様書の準拠バージョン（例: `"1.0"`）。 |
| `reportId` | `String` | **Required** | 報告の一意識別子 | 全社内でユニークなレポートID（例: `RPT-20260724-001`）。 |
| `taskId` | `String` | **Required** | 対象タスクID | 報告対象となる Task の `taskId` 参照。 |
| `assignmentId` | `String` | **Required** | 対象アサインメントID | 報告に関連する `assignmentId` 参照。 |
| `summary` | `String` | **Required** | 成果および報告の要約 | タスクの達成成果、主要変更点、結果の定性要約。 |
| `completionStatus` | `String` | **Required** | 業務完了ステータス | `SUCCESS`（成功）, `FAILED`（失敗・中断）, `PARTIAL`（一部達成） の 3 状態。 |
| `approvalStatus` | `String` | **Required** | CEO承認ステータス | `PENDING_HUMAN_APPROVAL`, `APPROVED_BY_HUMAN`, `REJECTED_BY_HUMAN` の 3 状態。 |
| `referencedEvidenceIds` | `Array<String>` | **Required** | 参照エビデンスIDリスト | 本報告の裏付けとなる Evidence の `evidenceId` リスト。 |
| `completedAt` | `String` | **Required** | 報告作成・完了日時 | ISO 8601 形式のタイムスタンプ（例: `"2026-07-24T17:00:00Z"`）。 |

---

## 3. ステータスと人間承認規律 (Status & Human Approval Standards)

### 3.1 完了ステータス (Completion Status)
- **`SUCCESS`**: 定められた Objective および Deliverables が全件達成され、Verification に合格した場合。
- **`FAILED`**: 制約違反、検証不合格、または中断により目的を達成できなかった場合。
- **`PARTIAL`**: 一部成果物が提出されたが、未達成項目が残存する場合。

### 3.2 人間承認ステータス (Approval Status)
- **`PENDING_HUMAN_APPROVAL`**: 報告書が作成され、CEO（人間）による最終レビュー待ちの状態。
- **`APPROVED_BY_HUMAN`**: CEO（人間）が `Proceed` または `APPROVED` 判定を下した状態。
- **`REJECTED_BY_HUMAN`**: CEO（人間）が差戻しまたは修正を命じた状態。

---

## 4. スコープ境界と範囲外事項 (Scope Boundary & Exclusions)

本スプリント（P2-5）においては、以下の領域を厳格にスコープ外とする。

- **Performance Evaluation / HR**: 社員個人の能力評価、評価点、人事データモデルは含めない（Phase 5等で対応）。
- **Learning Record**: 学習履歴、ノウハウナレッジ蓄積モデルは含めない。
- **Promotion / Transfer**: 昇格・異動モデルは含めない。
- **Analytics / Audit Ledger**: 全社KPI集計ダッシュボードや監査台帳（Ledger）コードは含めない。
