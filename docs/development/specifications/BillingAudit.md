# 課金監査仕様書 (Billing Audit Specification)

## 目的
AIOS（品質保証オペレーティングシステム）において、ライセンスの付与、プラン変更、サブスクリプションの状態遷移、および外部決済イベントの受信履歴を「課金監査ログ（Billing Audit Log）」として保存し、請求の不一致や不正利用アクセスを決定論的に検証・追跡可能にするための監査モデルを規定する。

---

## 監査ログ不変原則 (Append-Only Principles)
- **改ざんおよび削除の完全禁止**:
  - 課金監査ログは、データベースへの**新規追記（Append-Only）のみを許可**し、レコードの更新（Update）および削除（Delete）の操作はデータベースレベルで完全に遮断されなければならない。

---

## 監査記録対象 (Audit Targets)

### 1. 契約変更履歴 (Contract Changes)
- **対象**: プランのアップグレード、ダウングレード、および支払いサイクルの変更履歴。
- **記録項目**: 契約変更日時、顧客ID、変更前プラン、変更後プラン。

### 2. ライセンス状態変更 (License Changes)
- **対象**: ライセンスのアクティブ化、一時停止（Suspended）、期限切れ（Expired）などの状態遷移。
- **記録項目**: ライセンスID、遷移前ステータス、遷移後ステータス、遷移理由。

### 3. 決済イベント履歴 (Payment Events)
- **対象**: 外部決済プロバイダーから通知されたすべての決済結果。
- **記録項目**: イベントID、決済ステータス（Success / Failed）、金額、決済メッセージ。

### 4. システム状態変化 (Status Changes)
- **対象**: ライセンス状態変化に伴うアクセス制御の変更や強制停止アクション。
- **記録項目**: テナントID、アクション実行日時、実行内容。

---

## 課金監査ログデータ構造 (Billing Audit Schema)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "BillingAuditRecord",
  "type": "object",
  "properties": {
    "auditId": { "type": "string" },
    "timestamp": { "type": "string", "format": "date-time" },
    "customerId": { "type": "string" },
    "category": {
      "type": "string",
      "enum": ["ContractChange", "LicenseChange", "PaymentEvent", "StatusChange"]
    },
    "details": {
      "type": "object",
      "properties": {
        "targetId": { "type": "string" },
        "action": { "type": "string" },
        "beforeState": { "type": "string" },
        "afterState": { "type": "string" }
      },
      "required": ["targetId", "action"]
    }
  },
  "required": ["auditId", "timestamp", "customerId", "category", "details"]
}
```
