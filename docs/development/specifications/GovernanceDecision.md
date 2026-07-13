# 意思決定記録仕様書 (Governance Decision Specification)

## 目的
AIOS（品質保証オペレーティングシステム）において、ガバナンスルール審査や承認ゲートを通じて下されたすべての重要判断の履歴を「意思決定記録（Decision Record）」として保存し、「なぜこの承認/却下判定になったか」を後から決定論的に追跡・監査可能にするためのデータモデルを定義する。

---

## 記録の不変性原則 (Immutability Principle)
- **Decision レコードは Immutable（変更不可）**:
  - 生成された意思決定記録（Decision Record）は、データベースに登録された後は**一切の変更・上書き・削除が不可能**でなければならない。
  - 後から判断を訂正する必要が生じた場合は、既存レコードを修正するのではなく、取り消しまたは上書き用の「新規判定レコード」を別途起案・発行し、時系列で履歴を追跡しなければならない。

---

## 保存項目 (Decision Fields)
各意思決定記録は、以下のメタデータで構成される。

- **Decision ID**: 不変の一意な識別子（例: `DEC-2026-0707-0042`）。
- **Input Reference**: 判断の入力となったナレッジ最適化レポート（Optimization Report）のハッシュ値、または起案されたポリシー改定要求のメタデータ。
- **Applied Rules**: 審査時に適合判定されたガバナンスルールのIDリスト（例: `["GOV-KNOWLEDGE-001", "GOV-CHANGE-003"]`）。
- **Result (判定結果)**:
  - `Approved` (人間による承認完了)
  - `Rejected` (人間による却下)
  - `Bypassed` (ルール適用による自動許可・低リスク変更のみ)
- **Timestamp**: 判定が確定した日時（ISO 8601 形式）。
- **Approver**: 承認者のIDまたは署名（例: `岩佐CEO`。自動許可の場合は `AIOS Kernel`）。
- **Reason**: 承認に至った妥当性評価、または却下時の具体的な理由（テキスト記述）。

---

## 意思決定記録データ構造 (Decision Schema)
保存用オブジェクトの JSON 構造。

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "GovernanceDecisionRecord",
  "type": "object",
  "properties": {
    "decisionId": { "type": "string" },
    "inputReference": { "type": "string" },
    "appliedRules": {
      "type": "array",
      "items": { "type": "string" }
    },
    "result": {
      "type": "string",
      "enum": ["Approved", "Rejected", "Bypassed"]
    },
    "timestamp": { "type": "string", "format": "date-time" },
    "approver": { "type": "string" },
    "reason": { "type": "string" }
  },
  "required": ["decisionId", "inputReference", "appliedRules", "result", "timestamp", "approver", "reason"]
}
```
