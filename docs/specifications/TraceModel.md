# Trace Model 仕様書

## 概要
本仕様書は、プラットフォームの実行履歴を追跡・監査するための Trace データモデルを定義します。

## スキーマ定義 (Trace Schema)
- `traceId`: 実行の相関トレースID
- `ledgerId`: 関連する `ExecutionLedger` のコミットトランザクションID（連携用）
- `executionId`: 個々の呼び出し実行ID
- `runtimeId`: 実行対象 Runtime
- `timestamp`: トレース開始時刻
- `duration`: 処理に要したミリ秒数（ミリ秒精度）
- `status`: 実行結果状態（`success`, `failed`, `running`）
