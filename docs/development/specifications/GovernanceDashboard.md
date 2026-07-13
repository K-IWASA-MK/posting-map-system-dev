# ガバナンスダッシュボード仕様書 (Governance Dashboard Specification)

## 目的
AIOS（品質保証オペレーティングシステム）において、ポリシーの遵守状況、承認待ち要求（Pending Approval）、不変の意思決定記録（Decision）、および不変の監査ログ（Audit Log）をダッシュボード上で可視化・監視するための表示モデルを定義する。

---

## 観測原則 (Observer Boundaries)
- **統制判定の禁止**: ガバナンスダッシュボードは、承認・却下のアクション処理、および監査のルール適合計算は一切行わない。
- **データソースの固定**: 
  - 後続の `Governance Engine` が出力する `Governance Decision` および `Governance Audit` のJSONレコードをそのまま入力ソースとして表示する。

---

## 表示対象およびデータマッピング (Display Targets)
ダッシュボードは、以下の項目とガバナンス出力データをマッピングして描画する。

### 1. 承認待ち要求リスト (Pending Approvals)
- **マッピングデータ**: `Approval Gate` から出力される状態が `Pending` である要求リスト。
- **表示項目**: 承認待ちアクション（例: ナレッジ公式昇格、ポリシー改定等）、要求日時、および承認判定画面へのリンク。**（※AI自動承認は厳禁であり、手動承認画面への導線のみを表示する）**

### 2. 承認・却下実績 (Approved & Rejected Decisions)
- **マッピングデータ**: 過去の `Governance Decision Record` 群。
- **表示項目**: 過去の承認/却下判定の円グラフ、Decision ID、判定結果、承認した管理者名、および決定理由（Reason）。

### 3. ポリシーおよびルールステータス (Policy & Rule Status)
- **マッピングデータ**: 各種ポリシーの `status` (Active / Deprecated)。
- **表示項目**: 稼働中のガバナンスルール一覧、適用中のポリシー名、および最終発効日。

### 4. 監査サマリー (Audit Summary)
- **マッピングデータ**: `Governance Audit Record` の直近ログ。
- **表示項目**: ルール変更、ポリシー更新、例外処理（Exception）がいつ誰によって実行されたかの不変時系列ログ。

---

## ガバナンス表示データ構造 (Governance Display Model Schema)
ダッシュボードが描画時に使用する内部統合データ構造。

```json
{
  "pendingApprovals": [
    { "approvalId": "APP-2026-0099", "target": "ナレッジ KNW-015 の Official 昇格", "requestedTime": "2026-07-07T21:30:00Z" }
  ],
  "decisionHistory": {
    "approvedCount": 45,
    "rejectedCount": 2,
    "lastDecision": { "decisionId": "DEC-0042", "result": "Approved", "approver": "岩佐CEO", "reason": "実証Deltaが十分なため" }
  },
  "policyStatus": {
    "activePolicies": ["KnowledgePolicy_v1.2", "QualityPolicy_v1.0"],
    "ruleCount": 12
  },
  "auditSummary": [
    { "timestamp": "2026-07-07T21:30:59Z", "eventType": "RuleModified", "operator": "岩佐CEO", "detail": "GOV-CHANGE-003 を Active 化" }
  ]
}
```
