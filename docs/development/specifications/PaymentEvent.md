# 決済イベント仕様書 (Payment Event Specification)

## 目的
AIOS（品質保証オペレーティングシステム）において、外部決済サービスから通知される入金成功、残高不足エラー、契約の開始や解約など、リアルタイムに発生したトランザクション履歴をイベントデータとして正確に受信・記録するためのデータ定義を行う。

---

## 記録専用原則 (Record-Only Principle)
- **決済ロジックの排除**:
  - `Payment Event` レコードは、外部決済プロバイダーから通知された客観的結果を記録するだけであり、**決済の再試行（Retry）要求や、顧客への請求処理・銀行振込要求などの実行ロジックは一切含んではならない。**

---

## 対象決済イベント (Payment Event Types)
本仕様において検知・記録の対象とする主要イベント。

- **Subscription Created (サブスクリプション作成)**:
  - 新たな課金契約が決済プロバイダー側で作成され、発効したイベント。
- **Payment Success (決済成功)**:
  - 月次または年次の定期請求が正常に支払完了したイベント。
- **Payment Failed (決済失敗)**:
  - 残高不足やカードの有効期限切れにより定期請求の引き落としに失敗したイベント。
- **Subscription Cancelled (サブスクリプション解約)**:
  - 契約期間が満了し、または顧客の明示的な操作により契約が正式に終了（失効）したイベント。

---

## 決済イベントデータ構造 (Payment Event Schema)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "PaymentEventRecord",
  "type": "object",
  "properties": {
    "eventId": { "type": "string" },
    "subscriptionId": { "type": "string" },
    "eventType": {
      "type": "string",
      "enum": ["SubscriptionCreated", "PaymentSuccess", "PaymentFailed", "SubscriptionCancelled"]
    },
    "amount": { "type": "number", "minimum": 0 },
    "currency": { "type": "string", "default": "JPY" },
    "timestamp": { "type": "string", "format": "date-time" },
    "failureReason": { "type": "string", "default": "" }
  },
  "required": ["eventId", "subscriptionId", "eventType", "amount", "currency", "timestamp"]
}
```
