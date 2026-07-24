# Company Audit Standard v1.0 (Generation 9 Phase 5-1〜5-4)

## 1. 概要と目的 (Overview & Purpose)

### 1.1 Generation 9 における Company Audit
本仕様書は、AIOS Generation 9（AI Company）において、全社レベルのセキュリティ・ガバナンス遵守状況、AI社員・部署・タスク・契約・レビューの整合性、および不変エビデンス（Evidence Chain）の完全性を独立して検証・監査する **Company Audit Standard v1.0** の仕様書である。

本仕様は、部分的な誤りや不正なデータ改ざんを全社規模で検知し、AI Company の透明性と健全性を確定的に担保する。

### 1.2 コア設計原則: Company Audit Verifies Organizational Integrity Principle
本仕様は、AI Company の監査原則 **`Company Audit Verifies Organizational Integrity Principle`（全社組織健全性監査原則）** に完全準拠する。

```
 [Employee / Dept / Task / Contract / Review]
                     │
                     ▼
             [Evidence Chain] ───► [Company Audit] ───► [Compliance Report]
```

- **全社組織健全性の独立検証**: 全社監査は、社員・部署・タスク・契約・レビュー・Evidence の相互整合性およびガバナンス遵守状況を独立して検証する。監査結果は組織全体の健全性と透明性を評価するための不変の客観的根拠として保持されなければならない。

---

## 2. 監査範囲と検証項目 (Audit Scope & Verification Items)

全社監査においては、以下の 4 大領域の整合性を全網羅的に検証する。

1. **Employee & Department Integrity**:
   全 AI社員の `EMPLOYEE.json` および全部署の `departments.json` に対する Identity v2.0 規律違反、権限逸脱の有無。
2. **Task & Assignment Traceability**:
   すべての Task に対する Manifest、Assignment、および Report の相互参照完全性。
3. **Contract & Handoff Compliance**:
   全 `Department Contract` および `Handoff` における承認権限、SLA遵守、および不適合差戻し履歴。
4. **Evidence Chain Non-tampering (最重要)**:
   全 Evidence の SHA-256 チェックサムの照合、および Append-Only 追記専用ルールの遵守検証。

---

## 3. 監査トリガーと報告構造 (Audit Triggers & Report Schema)

### 3.1 監査トリガー (Audit Triggers)
1. `PERIODIC_QUARTERLY_AUDIT`: 四半期ごとの全社定期監査。
2. `SECURITY_BREACH_ALERT`: セキュリティ警告または隔離境界違反検知による緊急監査。
3. `GOVERNANCE_OVERRIDE_TRIGGER`: 人間（CEO）または最高ガバナンス命令による個別監査。

### 3.2 監査結果構造 (Company Audit Schema)

| 項目名 | Data Type | Req/Opt | Description |
|---|---|---|---|
| `companyAuditId` | `String` | **Required** | 監査の一意識別子（例: `AUD-2026Q3-001`）。 |
| `auditTrigger` | `String` | **Required** | 監査起動トリガー（例: `PERIODIC_QUARTERLY_AUDIT`）。 |
| `evidenceChainVerified` | `Boolean` | **Required** | 全 Evidence チェインの改ざん非検出フラグ (`true`/`false`)。 |
| `complianceStatus` | `String` | **Required** | 監査適合ステータス（`COMPLIANT`, `NON_COMPLIANT_WARNING`, `CRITICAL_VIOLATION`）。 |
| `violationDetails` | `Array<Object>`| Optional | 検出された非適合項目・非整合性の詳細要約。 |
| `auditedAt` | `String` | **Required** | 監査実施確定日時（ISO 8601 形式）。 |
| `auditorRef` | `String` | **Required** | 監査担当部/監査AI参照（例: `DEPT_COMPANY_AUDIT`）。 |

---

## 4. スコープ境界と範囲外事項 (Scope Boundary & Exclusions)

本スプリント（P5-4）においては、以下の領域を厳格にスコープ外とする。

- **AI Company Governance**: 全社統合最高ガバナンスおよび完成裁定は含めない（P5-5の最終責務）。
- **KPI Dashboards & Analytics**: ダッシュボード表現、採点エンジンの追加変更は含めない。
- **Optimization Algorithms**: 自動最適化アルゴリズムは含めない。
