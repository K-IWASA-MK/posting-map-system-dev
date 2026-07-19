# Log Model 仕様書

## 概要
本仕様書は、分散実行環境で発生するログレコードの統一スキーマおよび重要度定義を規定します。

## ログスキーマ (Log Schema)
すべてのログは、共通の `ObservabilityRecord` を継承して構築されます。
- `recordId`: ログ行の一意識別子
- `timestamp`: ISO-8601 形式の発生時刻
- `runtimeId`: ログの発生元 Runtime
- `severity`: ログレベル（INFO, WARNING, ERROR, CRITICAL）
- `message`: ログメッセージ本文
- `executionId` / `sessionId`: 相関識別子
