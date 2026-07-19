# Security Audit 仕様書

## 概要
本仕様書は、プラットフォーム上のセキュリティイベント、認可判断、侵害検知などを不変元帳（Event Ledger）に記録・追跡するセキュリティ監査のログ形式を定義します。

## セキュリティ監査レコード (SecurityAuditRecord)
- `auditId`: 監査ログレコードの一意識別ID
- `runtimeId`: ログを記録した Runtime の識別ID
- `pluginId`: 違反や監査対象となったプラグインの識別ID（ある場合）
- `event`: 監査されたイベントの詳細内容
- `severity`: イベントの重要度レベル（INFO, WARNING, ERROR, CRITICAL）
- `timestamp`: 記録タイムスタンプ

## 重大違反の処理 (CRITICAL Exception Flow)
重要度が `CRITICAL` に分類されるセキュリティ違反（リソース制限の大幅超過、不正シークレットへのアクセス試行など）が検出された場合：
1. **緊急イベント発行**: `SecurityViolationDetected` が発行されます。
2. **自動是正連携**: `AutomationRuntime` の自己修復・緊急アクション機能と直ちに連動し、当該 `SandboxInstance` の強制破壊（DESTROYED）と通信ポート遮断が自動実行されます。
