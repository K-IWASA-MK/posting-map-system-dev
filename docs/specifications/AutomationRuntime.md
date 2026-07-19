# Automation Runtime 仕様書

## 概要
本仕様書は、Quality Runtime からの提案（Recommendation）を受け取り、安全ガードを監査した上で、自動対応を実行する「Automation Runtime」の仕様を定義します。

## 構成と責務
1. **承認判断モデル (Automation Decision)**:
   - アクションを実行する前に、Policy, Cooldown, Retry 制限, および有効期限の適合度をチェックし、`AutomationDecision` 記録を生成・保存します。
2. **優先度付きキュー (Prioritized Queue)**:
   - 提案の優先度（HIGH, MEDIUM, LOW）に基づき、実行キューの割り当てと順序制御を行います。
3. **安全ガード (Safety Guards)**:
   - 以下のいずれかに該当する場合、実行を拒否してその理由を記録します。
     - Policy FAIL
     - Runtime が UNHEALTHY
     - Cooldown 中
     - Retry 上限到達
     - アクションの有効期限切れ（expiresAt 経過）
4. **実行記録 (Action Result / Ledger Hook)**:
   - アクション実行後、その成否（AutomationCompleted）および元帳記録イベント（LedgerRecorded）を発行して不変監査ログに連結します。
