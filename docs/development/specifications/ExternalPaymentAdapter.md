# 外部決済アダプター仕様書 (External Payment Adapter Specification)

## 目的
AIOS（品質保証オペレーティングシステム）において、Stripe 等の外部決済代行サービスと AIOS 内部モデルの間のインターフェース境界を定義し、決済代行サービス側で発生したイベント（入金成功・解約等）を疎結合かつ安全に内部データベースへ反映するための「決済アダプター（External Payment Adapter）」を定義する。

---

## 接続境界と非実行原則 (Adapter Boundaries)
- **単方向の受信統制 (Incoming Event Only)**:
  - 外部決済アダプターの主たる責務は、外部サービスから送信される Webhook イベントを受信し、AIOS の `Payment Event` データ構造へ変換して状態同期（Status Sync）を行うことである。
- **決済判断および実行の完全排除 (No Transaction Execution)**:
  - アダプターは、AIの自律判断による返金処理の呼び出し、サブスクリプションの新規作成APIの実行、およびユーザーアカウントへの課金処理APIのコールなどの**「決済変更アクション（Write Actions on Provider）」を一切行わない（完全な Read-Only 受信境界）。**

---

## Webhook イベント同期マッピング (Stripe Webhook Event Mapping)
Stripe Webhook から受信する主要なイベントデータと、AIOS内部の `PaymentEvent` レコードへのマッピング。

| Stripe Webhook イベント名 | マッピング先 AIOS 決済イベント | 内部同期アクション |
|---|---|---|
| `customer.subscription.created` | `SubscriptionCreated` | サブスクリプション状態を `Trial` または `Active` で初期化。 |
| `invoice.payment_succeeded` | `PaymentSuccess` | ライセンス状態を `Active` に更新。有効期限日を更新。 |
| `invoice.payment_failed` | `PaymentFailed` | サブスクリプション状態を `Past Due` に更新。警告を発報。 |
| `customer.subscription.deleted` | `SubscriptionCancelled` | ライセンス状態を `Cancelled` に更新。アクセス制御を無効化。 |

---

## アダプター統合インターフェース (Adapter Interface Schema)
アダプターが外部から受け取った生データをパースして内部イベントに変換する処理のシグネチャ定義。

```typescript
interface ExternalPaymentAdapter {
  /**
   * Stripe等のWebhookリクエストボディと署名を受け取り、検証のうえ内部イベントへパースする。
   * 決済実行APIの呼び出しは一切行わず、パースした不変データを返すのみ。
   */
  parseWebhookEvent(payload: string, signature: string): Promise<PaymentEventRecord>;
}
```
