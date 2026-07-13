# サブスクリプション管理仕様書 (Subscription Management Specification)

## 目的
AIOS（品質保証オペレーティングシステム）において、顧客（ブランチ等）と外部決済サービスの間で継続する課金周期、支払いステータス、自動更新予定を決定論的に管理するための「サブスクリプション（Subscription）」データモデルを定義する。

---

## サブスクリプションモデル (Subscription Model)
サブスクリプション状態管理で保持される情報のスキーマ。

- **Subscription ID**: 決済サービス側（Stripe等）と同期する一意の識別子（例: `sub_1N23456789`）。
- **Plan**: サブスクリプションの種類・金額・制限（例: `Enterprise Plan`）。
- **Status (課金状態)**: 現在の支払いおよび更新周期に関する稼働状態。
- **Billing Cycle**: 請求サイクル（例: `Monthly` (月次) / `Yearly` (年次)）。
- **Renewal Date (次回更新予定日)**: 次回の請求または自動更新が走る日時（ISO 8601）。

---

## 課金ステータス定義 (Subscription Statuses)
サブスクリプションは、以下のいずれかの状態で管理される。

| サブスクリプションステータス | 状態解説 |
|---|---|
| **Trial (トライアル中)** | 評価目的等の無償お試し期間。支払い設定がなくても一時的に利用可能。 |
| **Active (有効)** | 正常に決済が行われ、利用権利が期間内で完全に有効である通常状態。 |
| **Past Due (支払遅延)** | クレジットカード決済のエラーなどにより請求が正常に完了しなかった警告状態。 |
| **Cancelled (解約済)** | 自動更新がオフにされ、現在の課金サイクルが終了した時点でライセンス失効予定の状態。 |

---

## サブスクリプションデータ構造 (Subscription Schema)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "SubscriptionRecord",
  "type": "object",
  "properties": {
    "subscriptionId": { "type": "string" },
    "plan": { "type": "string" },
    "status": {
      "type": "string",
      "enum": ["Trial", "Active", "Past Due", "Cancelled"]
    },
    "billingCycle": {
      "type": "string",
      "enum": ["Monthly", "Yearly"]
    },
    "renewalDate": { "type": "string", "format": "date-time" }
  },
  "required": ["subscriptionId", "plan", "status", "billingCycle", "renewalDate"]
}
```
