# Performance Evaluation Standard v1.0 (Generation 9 Phase 5-2)

## 1. 概要と目的 (Overview & Purpose)

### 1.1 Generation 9 における Performance Evaluation
本仕様書は、AIOS Generation 9（AI Company）において、蓄積された不変エビデンス（Task Evidence, Collaboration Evidence）に基づき、AI社員（AI Employee）および所属部署（Department）の業務貢献度、品質達成度、SLA遵守度を客観的に自動算出・評価する **Performance Evaluation Standard v1.0** の仕様書である。

本仕様は、主観的な評価や不透明な人間・AIの判断を排除し、証跡データ起点（Evidence-Driven）の客観的評価モデルを確立する。

### 1.2 コア設計原則: Performance Is Evidence-Based Principle
本仕様は、AI Company の評価原則 **`Performance Is Evidence-Based Principle`（証跡起点評価原則）** に完全準拠する。

```
 [Task Evidence] ──────────────┐
                               ├─► [Scoring Engine] ──► [Performance Evaluation]
 [Collaboration Evidence] ─────┘
```

- **証跡のみに基づく客観評価**: AI社員および部署の評価は、収集・検証された不可変 Evidence にのみ基づいて実施される。印象や未検証の主張、一時的な判断を排除し、事前に定義された定量評価指標に従って一貫して算出されなければならない。

---

## 2. 評価指標とウェイトモデル (Evaluation Metrics & Weighting)

評価は以下の 4 つの定量メトリクスと定義された重み付け（Weight）に基づいて算出される。

| メトリクス名 | Weight | Description | 算出根拠 |
|---|---|---|---|
| `TaskCompletionRate` | 30% | アサインされた Task の完遂率 | `(Completed Tasks / Total Assigned Tasks) * 100` |
| `SlaAdherenceRate` | 25% | 契約 SLA 時間内の達成率 | `(SLA Met Contracts / Total Contracts) * 100` |
| `ReviewPassRate` | 25% | 部門間レビューでの一発合格率 | `(Pass Reviews / Total Submitted Reviews) * 100` |
| `EvidenceIntegrityScore` | 20% | 証跡記録の非改ざん・整合性スコア | `(Valid Hash Evidences / Total Evidences) * 100` |

---

## 3. 総合スコア定義と評価構造 (Scoring Model & Schema)

### 3.1 総合スコア算出式 (Composite Score Formula)
総合パフォーマンススコア `overallPerformanceScore` (0.0 ～ 100.0) は以下のように重み付け加算される。

$$\text{overallPerformanceScore} = 0.30 \cdot \text{TaskCompletionRate} + 0.25 \cdot \text{SlaAdherenceRate} + 0.25 \cdot \text{ReviewPassRate} + 0.20 \cdot \text{EvidenceIntegrityScore}$$

### 3.2 評価結果構造 (Evaluation Result Schema)

| 項目名 | Data Type | Req/Opt | Description |
|---|---|---|---|
| `evaluationId` | `String` | **Required** | 評価の一意識別子（例: `EVL-2026Q3-001`）。 |
| `targetType` | `String` | **Required** | 評価対象種別（`EMPLOYEE` または `DEPARTMENT`）。 |
| `targetId` | `String` | **Required** | 評価対象ID（AI社員ID または 部署ID）。 |
| `evaluationPeriod` | `String` | **Required** | 評価対象期間（例: `2026-Q3`）。 |
| `metricsDetail` | `Object` | **Required** | 上記 4 メトリクスの個別の計測値。 |
| `overallPerformanceScore` | `Number` | **Required** | 算出された総合スコア（0.0 ～ 100.0）。 |
| `evaluatedAt` | `String` | **Required** | 評価算出日時（ISO 8601 形式）。 |

---

## 4. スコープ境界と範囲外事項 (Scope Boundary & Exclusions)

本スプリント（P5-2）においては、以下の領域を厳格にスコープ外とする。

- **Learning & Promotion**: 評価結果に基づく昇格、スキル獲得、異動ルールは含めない（P5-3の責務）。
- **Company Audit**: 全社セキュリティ・コンプライアンス監査は含めない（P5-4の責務）。
- **AI Company Governance**: 最高ガバナンスルールは含めない（P5-5の責務）。
- **Analytics & Dashboard UI**: ダッシュボードUI、可視化コードは含めない。
