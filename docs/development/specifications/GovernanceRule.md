# ガバナンスルール仕様書 (Governance Rule Specification)

## 目的
AIOS（品質保証オペレーティングシステム）において、ガバナンスポリシーを具体的な適用論理へとブレイクダウンしたガバナンスルール（Governance Rule）のデータモデル、条件判定、および適合失敗時のアクションタイプ（Action Type）を定義する。

---

## 管理原則 (Management Principle)
- **管理対象としてのルール (Read-Only Policy Rule)**:
  - ガバナンスルールは、開発AIエージェントの自動改善によって勝手に変更される対象ではない。
  - ルールは不変の「管理・審査対象」であり、改変は人間（管理者）の直接操作またはポリシー更新の承認プロセス（Approval Gate）を経てのみ実行される。

---

## ルール定義項目 (Rule Definition Fields)
個別ガバナンスルールは、以下の項目に基づいてデータ化され、管理される。

- **Rule ID**: ユニークな識別子（例: `GOV-KNOWLEDGE-001`, `GOV-QUALITY-002`）。
- **Category**: ポリシーに連動するカテゴリ（Knowledge / Quality / Development / Security / Change）。
- **Severity (重大度)**:
  - `Blocker` (リリースの完全停止・人間承認必須)
  - `Warning` (警告表示・確認の推奨)
  - `Info` (データ記録・統計用)
- **Condition (評価条件)**: ルールが発動する具体的な論理式（またはメタデータ判定要件）。
- **Action Type (アクションタイプ)**:
  - `Require Approval` (承認ゲートを保留(Pending)にして人間へエスカレート)
  - `Block` (処理を強制アボート)
  - `Log Exception` (例外ログを監査モデルに記録)
- **Version**: ルール構成のバージョン追跡番号。

---

## 代表的なガバナンスルールの例 (Rule Examples)

### ルール 01: ナレッジ公式昇格ルール (GOV-KNOWLEDGE-001)
- **Condition**: `promotionState == "Official" AND NOT hasProvenDelta`
- **Severity**: `Blocker`
- **Action Type**: `Require Approval` (人間による Validation 承認が得られるまで保留)

### ルール 02: 品質健康度警告ルール (GOV-KNOWLEDGE-002)
- **Condition**: `healthScore < 60`
- **Severity**: `Warning`
- **Action Type**: `Log Exception` (健康度低下を監査モデルに記録し、最適化決定に Monitor を付与)

### ルール 03: 高リスク変更の制限ルール (GOV-CHANGE-003)
- **Condition**: `appliedChangeRisk == "High"`
- **Severity**: `Blocker`
- **Action Type**: `Require Approval` (自動コミットを抑止し、人間承認を必須化)

---

## ルール管理スキーマ (Rule Schema)
ルールオブジェクトの JSON スキーム。

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "GovernanceRuleDefinition",
  "type": "object",
  "properties": {
    "ruleId": { "type": "string" },
    "category": {
      "type": "string",
      "enum": ["Knowledge", "Quality", "Development", "Security", "Change"]
    },
    "severity": {
      "type": "string",
      "enum": ["Blocker", "Warning", "Info"]
    },
    "condition": { "type": "string" },
    "actionType": {
      "type": "string",
      "enum": ["Require Approval", "Block", "Log Exception"]
    },
    "version": { "type": "string" }
  },
  "required": ["ruleId", "category", "severity", "condition", "actionType", "version"]
}
```
