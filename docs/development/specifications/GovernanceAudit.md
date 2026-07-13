# 監査モデル仕様書 (Governance Audit Specification)

## 目的
AIOS（品質保証オペレーティングシステム）において、ポリシー変更、ルール改定、承認判定、および発生した例外処理のすべての履歴を改ざん不可能な時系列データとして記録し、システム全体のガバナンス準拠状況を証明するための「監査モデル（Governance Audit）」を定義する。

---

## 監査ログ保護原則 (Audit Log Protection Principles)
- **追記のみ可能なログ構造 (Append-Only Log)**:
  - 監査ログ（Audit Log）データベースは、データの追加（Insert）のみを許可し、変更（Update）および削除（Delete）のAPI/操作を一切禁止する。
  - いかなる特権権限（AIOS Kernel自体を含む）であっても、過去に記録された監査ログを書き換え、または消去することはできない。

---

## 監査対象 (Audit Targets)

### 1. ルール変更履歴 (Rule Change History)
- **対象**: ガバナンスルールの新規追加、閾値の改定、およびルールの非アクティブ化アクション。
- **記録項目**: ルールID、変更前後の定義、変更の契機となった Decision ID。

### 2. ポリシー変更履歴 (Policy Change History)
- **対象**: 各ポリシー（Quality, Knowledge 等）のドラフト起案、発効（Active化）、およびアーカイブ。
- **記録項目**: ポリシーID、改定バージョン、適用スコープ。

### 3. 承認履歴 (Approval History)
- **対象**: 承認ゲート（Approval Gate）で保留となった項目と、それに対する人間の判断結果（承認/却下）および有効期限切れ（Expired）。
- **記録項目**: 承認要求ID、要求項目、処理時間、承認結果、承認者ID。

### 4. 例外履歴 (Exception History)
- **対象**: 緊急対応等で通常ポリシーの条件を満たさないままコードが適用された事例、または手動での強制バイパス事例。
- **記録項目**: 例外発生日時、対象モジュール、例外適用理由、適用した管理者の署名。

---

## 監査ログデータ構造 (Audit Log Schema)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "GovernanceAuditRecord",
  "type": "object",
  "properties": {
    "auditLogId": { "type": "string" },
    "timestamp": { "type": "string", "format": "date-time" },
    "eventType": {
      "type": "string",
      "enum": ["RuleModified", "PolicyUpdated", "ApprovalResolved", "ExceptionLogged"]
    },
    "operatorId": { "type": "string" },
    "details": {
      "type": "object",
      "properties": {
        "targetId": { "type": "string" },
        "action": { "type": "string" },
        "beforeState": { "type": "string" },
        "afterState": { "type": "string" },
        "associatedDecisionId": { "type": "string" }
      }
    }
  },
  "required": ["auditLogId", "timestamp", "eventType", "operatorId", "details"]
}
```
