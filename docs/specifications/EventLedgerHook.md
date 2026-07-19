# Event Ledger Hook 仕様書

## 概要
本仕様書は、自動アクションの実行結果を追跡不可能な状態遷移として残さないための、Event Ledger への監査ログ連携スキーマを定義します。

## 連携スキーマ (Ledger Hook Schema)
`AutomationCompleted` および `LedgerRecorded` イベントにより、以下の情報が不変元帳にコミットされます。

- **actionId**: アクションの実行トランザクション一意ID。
- **runtimeId**: 実行を命令した Automation Runtime のID (`aios.automation`)。
- **executionId**: 個々のプロセス呼び出しの識別キー。
- **result**: 実行ステータス結果（`success` または `failed`）。
- **timestamp**: アクションが完了しコミットされた時刻。
- **error**: 失敗時の例外内容・詳細メッセージ。
